using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using OfficeOpenXml;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ReportsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/reports/types
        [HttpGet("types")]
        public IActionResult GetReportTypes() => Ok(new[]
        {
            new { Id = "revenue", Name = "Monthly Revenue Report", Type = "Financial" },
            new { Id = "patient-history", Name = "Patient Treatment History", Type = "PatientHistory" },
            new { Id = "lab-summary", Name = "Lab Tests Summary", Type = "Medical" },
            new { Id = "appointments", Name = "Appointments Report", Type = "Medical" }
        });

        // POST: api/reports/generate
        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateReportDto dto)
        {
            var fileName = $"{dto.Type}_{DateTime.Now:yyyyMMdd_HHmmss}";
            var folder = Path.Combine(_env.ContentRootPath, "wwwroot", "reports");
            Directory.CreateDirectory(folder);

            string filePath;

            if (dto.Format == "PDF")
            {
                filePath = Path.Combine(folder, $"{fileName}.pdf");
                GeneratePdfReport(dto, filePath);
            }
            else
            {
                filePath = Path.Combine(folder, $"{fileName}.xlsx");
                await GenerateExcelReport(dto, filePath);
            }

            var report = new Report
            {
                Title = dto.Title,
                ReportType = dto.Type,
                Format = dto.Format,
                FilePath = $"/reports/{Path.GetFileName(filePath)}",
                ParametersJson = System.Text.Json.JsonSerializer.Serialize(dto.Parameters),
                GeneratedByUserId = 1 // Replace with actual user later
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                report.Id,
                report.Title,
                DownloadUrl = report.FilePath,
                Message = "Report generated successfully!"
            });
        }

        // GET: api/reports
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _context.Reports
                .Include(r => r.GeneratedBy)
                .OrderByDescending(r => r.GeneratedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Title,
                    r.ReportType,
                    r.Format,
                    r.GeneratedAt,
                    GeneratedBy = r.GeneratedBy != null ? r.GeneratedBy.Name : "System",
                    DownloadUrl = r.FilePath
                })
                .Take(50)
                .ToListAsync();

            return Ok(reports);
        }

        private void GeneratePdfReport(GenerateReportDto dto, string filePath)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.Header().Text(dto.Title).FontSize(20).Bold().AlignCenter();
                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Item().Text($"Generated: {DateTime.Now:dd MMM yyyy HH:mm}").FontSize(10);
                        col.Item().PaddingTop(20).Text("This is a sample report. Full data will be populated based on type.").Italic();
                        if (dto.Type == "revenue")
                        {
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });
                                table.Header(header =>
                                {
                                    header.Cell().Text("Month").Bold();
                                    header.Cell().Text("Revenue").Bold();
                                });
                                table.Cell().Text("Jan 2025");
                                table.Cell().Text("₹2,45,000");
                                table.Cell().Text("Feb 2025");
                                table.Cell().Text("₹2,89,500");
                            });
                        }
                    });
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
            }).GeneratePdf(filePath);
        }

        private async Task GenerateExcelReport(GenerateReportDto dto, string filePath)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Report");

            ws.Cells[1, 1].Value = dto.Title;
            ws.Cells[1, 1].Style.Font.Size = 16;
            ws.Cells[1, 1].Style.Font.Bold = true;

            ws.Cells[3, 1].Value = "Generated On";
            ws.Cells[3, 2].Value = DateTime.Now.ToString("dd MMM yyyy HH:mm");

            if (dto.Type == "revenue")
            {
                ws.Cells[5, 1].Value = "Month";
                ws.Cells[5, 2].Value = "Revenue (₹)";
                ws.Cells[6, 1].Value = "January 2025";
                ws.Cells[6, 2].Value = 245000;
                ws.Cells[7, 1].Value = "February 2025";
                ws.Cells[7, 2].Value = 289500;
            }

            ws.Cells.AutoFitColumns();
            await package.SaveAsAsync(new FileInfo(filePath));
        }
    }

    public class GenerateReportDto
    {
        public string Title { get; set; } = "Report";
        public string Type { get; set; } = "revenue"; // revenue, patient-history, lab-summary
        public string Format { get; set; } = "PDF";   // PDF or Excel
        public object? Parameters { get; set; }       // FromDate, ToDate, PatientId, etc.
    }
}