using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Text.Json;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(AppDbContext context, IWebHostEnvironment env, ILogger<ReportsController> logger)
        {
            _context = context;
            _env = env;
            _logger = logger;
        }

        // GET: api/reports/types
        [HttpGet("types")]
        public IActionResult GetReportTypes() => Ok(new[]
        {
            new { Id = "revenue", Name = "Financial: Revenue & Invoices", Type = "Financial", Icon = "DollarSign" },
            new { Id = "medical-summary", Name = "Medical: Procedures & Surgeries", Type = "Medical", Icon = "Activity" },
            new { Id = "patient-history", Name = "Clinical: Patient Full History", Type = "PatientHistory", Icon = "Users" },
            new { Id = "lab-summary", Name = "Medical: Laboratory Summary", Type = "Medical", Icon = "FlaskConical" }
        });

        // POST: api/reports/generate (FR8.1-FR8.4)
        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateReportDto dto)
        {
            _logger.LogInformation("Generating report: {Title} ({Type})", dto.Title, dto.Type);

            try 
            {
                var fileName = $"{dto.Type}_{DateTime.UtcNow:yyyyMMdd_HHmmss}";
                var folder = Path.Combine(_env.ContentRootPath, "wwwroot", "reports");
                Directory.CreateDirectory(folder);

                string filePath;
                var reportData = await FetchDataForReport(dto);

                if (dto.Format == "PDF")
                {
                    filePath = Path.Combine(folder, $"{fileName}.pdf");
                    GeneratePdfReport(dto, reportData, filePath);
                }
                else
                {
                    filePath = Path.Combine(folder, $"{fileName}.xlsx");
                    await GenerateExcelReport(dto, reportData, filePath);
                }

                var report = new Report
                {
                    Title = dto.Title,
                    ReportType = dto.Type,
                    Format = dto.Format,
                    FilePath = $"/reports/{Path.GetFileName(filePath)}",
                    ParametersJson = JsonSerializer.Serialize(dto.Parameters),
                    GeneratedByUserId = null 
                };

                _context.Reports.Add(report);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    report.Id,
                    report.Title,
                    DownloadUrl = report.FilePath,
                    Message = "Report generated and archived successfully!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate report {Type}", dto.Type);
                return StatusCode(500, $"Generation error: {ex.Message}");
            }
        }

        // GET: api/reports
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _context.Reports
                .AsNoTracking()
                .OrderByDescending(r => r.GeneratedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Title,
                    r.ReportType,
                    r.Format,
                    GeneratedAt = r.GeneratedAt.ToString("yyyy-MM-dd HH:mm"),
                    DownloadUrl = r.FilePath
                })
                .Take(50)
                .ToListAsync();

            return Ok(reports);
        }

        // DELETE: api/reports/{id} (FR8.1-FR8.4 New Manage Feature)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null) return NotFound();

            try 
            {
                // Delete actual file
                if (!string.IsNullOrEmpty(report.FilePath))
                {
                    var fullPath = Path.Combine(_env.ContentRootPath, "wwwroot", report.FilePath.TrimStart('/'));
                    if (System.IO.File.Exists(fullPath)) 
                        System.IO.File.Delete(fullPath);
                }

                _context.Reports.Remove(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Report record and file deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Delete error: {ex.Message}");
            }
        }

        /* ─── Data Fetching ────────────────────────────────── */

        private async Task<ReportDataWrapper> FetchDataForReport(GenerateReportDto dto)
        {
            var fromDate = DateTime.MinValue;
            var toDate = DateTime.MaxValue;

            if (dto.Parameters is JsonElement el && el.ValueKind == JsonValueKind.Object)
            {
                if (el.TryGetProperty("fromDate", out var f) && f.ValueKind == JsonValueKind.String) 
                    DateTime.TryParse(f.GetString(), out fromDate);
                
                if (el.TryGetProperty("toDate", out var t) && t.ValueKind == JsonValueKind.String) 
                {
                    if (DateTime.TryParse(t.GetString(), out var parsedTo))
                        toDate = parsedTo.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                }
            }

            // Ensure UTC for Postgres
            fromDate = DateTime.SpecifyKind(fromDate, DateTimeKind.Utc);
            toDate = DateTime.SpecifyKind(toDate, DateTimeKind.Utc);

            var wrapper = new ReportDataWrapper();

            switch (dto.Type)
            {
                case "revenue":
                    wrapper.RevenueData = await _context.Transactions
                        .Where(t => t.CreatedAt >= fromDate && t.CreatedAt <= toDate)
                        .Select(t => new RevenueRow { Id = t.Id, Amount = t.Amount, Method = t.PaymentMethod, Date = t.CreatedAt })
                        .ToListAsync();
                    _logger.LogInformation("Fetched {Count} revenue records", wrapper.RevenueData.Count);
                    break;

                case "medical-summary":
                    wrapper.MedicalData = await _context.Procedures
                        .Where(p => p.CreatedAt >= fromDate && p.CreatedAt <= toDate)
                        .Include(p => p.Patient)
                        .Select(p => new MedicalRow { Id = p.Id, ProcedureType = p.ProcedureType, Patient = p.Patient != null ? p.Patient.Name : "N/A", Date = p.CreatedAt, Findings = p.Notes ?? "N/A" })
                        .ToListAsync();
                    _logger.LogInformation("Fetched {Count} medical summaries", wrapper.MedicalData.Count);
                    break;

                case "patient-history":
                    int patientId = 0;
                    if (dto.Parameters is JsonElement pel && pel.TryGetProperty("patientId", out var pId)) int.TryParse(pId.GetString(), out patientId);
                    
                    var labs = await _context.LabTests.Where(l => l.PatientId == patientId).Include(l => l.TestType).ToListAsync();
                    var procs = await _context.Procedures.Where(p => p.PatientId == patientId).ToListAsync();
                    var patient = await _context.Patients.FindAsync(patientId);

                    wrapper.PatientName = patient?.Name ?? "Unknown";
                    wrapper.Labs = labs;
                    wrapper.Procedures = procs;
                    _logger.LogInformation("Fetched history for {Name}: {Labs} labs, {Procs} procedures", wrapper.PatientName, labs.Count, procs.Count);
                    break;

                case "lab-summary":
                    wrapper.LabData = await _context.LabTests
                        .Where(l => l.CreatedAt >= fromDate && l.CreatedAt <= toDate)
                        .Include(l => l.TestType)
                        .Include(l => l.Patient)
                        .Select(l => new LabRow { Id = l.Id, Test = l.TestType != null ? l.TestType.Name : "Unknown", Patient = l.Patient != null ? l.Patient.Name : "Unknown", IsCompleted = l.IsCompleted, Date = l.CreatedAt })
                        .ToListAsync();
                    _logger.LogInformation("Fetched {Count} lab summaries", wrapper.LabData.Count);
                    break;
            }

            return wrapper;
        }

        /* ─── Export Logic (PDF) ───────────────────────────── */

        private void GeneratePdfReport(GenerateReportDto dto, ReportDataWrapper data, string filePath)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.Header().Text(dto.Title).FontSize(24).Bold().FontColor(Colors.Blue.Medium).AlignCenter();
                    
                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Item().Text($"Summary Report - Generated on {DateTime.Now:dd MMM yyyy}").FontSize(10);
                        col.Item().PaddingVertical(5).LineHorizontal(1);

                        if (dto.Type == "revenue" && data.RevenueData != null && data.RevenueData.Any())
                        {
                            col.Item().Table(table => {
                                table.ColumnsDefinition(c => { c.RelativeColumn(2); c.RelativeColumn(2); c.RelativeColumn(2); });
                                table.Header(h => { 
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Date").Bold(); 
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Method").Bold(); 
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Amount (Rs)").Bold(); 
                                });
                                decimal total = 0;
                                foreach(var r in data.RevenueData) {
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(r.Date.ToString("dd-MMM-yyyy"));
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(r.Method);
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(r.Amount.ToString("N0"));
                                    total += r.Amount;
                                }
                                table.Cell().Padding(5).Text("GRAND TOTAL").Bold(); 
                                table.Cell().Padding(5).Text(""); 
                                table.Cell().Padding(5).Text(total.ToString("N0")).Bold().FontColor(Colors.Green.Medium);
                            });
                        }
                        else if (dto.Type == "medical-summary" && data.MedicalData != null && data.MedicalData.Any())
                        {
                             col.Item().Table(table => {
                                table.ColumnsDefinition(c => { c.RelativeColumn(2); c.RelativeColumn(3); c.RelativeColumn(4); });
                                table.Header(h => { 
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Date").Bold();
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Patient").Bold(); 
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("Procedure").Bold(); 
                                });
                                foreach(var r in data.MedicalData) {
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(r.Date.ToString("dd-MM-yyyy"));
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(r.Patient);
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(r.ProcedureType);
                                }
                            });
                        }
                        else if (dto.Type == "patient-history" && (data.Labs != null || data.Procedures != null))
                        {
                            col.Item().Text($"Patient: {data.PatientName}").FontSize(16).Bold();
                            
                            if (data.Labs != null && data.Labs.Any()) {
                                col.Item().PaddingTop(10).Text("Laboratory Test History").Bold().Underline();
                                col.Item().Table(table => {
                                    table.ColumnsDefinition(c => { c.RelativeColumn(3); c.RelativeColumn(2); c.RelativeColumn(2); });
                                    table.Header(h => { h.Cell().Text("Test Name").Bold(); h.Cell().Text("Status").Bold(); h.Cell().Text("Date").Bold(); });
                                    foreach(var l in data.Labs) {
                                        table.Cell().Text(l.TestType?.Name ?? "N/A");
                                        table.Cell().Text(l.IsCompleted ? "Completed" : "Pending");
                                        table.Cell().Text(l.CreatedAt.ToString("dd-MMM-yyyy"));
                                    }
                                });
                            }

                            if (data.Procedures != null && data.Procedures.Any()) 
                            {
                                col.Item().PaddingTop(20).Text("Clinical Procedures History").Bold().Underline();
                                col.Item().Table(table => {
                                    table.ColumnsDefinition(c => { c.RelativeColumn(4); c.RelativeColumn(2); });
                                    table.Header(h => { h.Cell().Text("Procedure Type").Bold(); h.Cell().Text("Date").Bold(); });
                                    foreach(var p in data.Procedures) {
                                        table.Cell().Text(p.ProcedureType);
                                        table.Cell().Text(p.CreatedAt.ToString("dd-MMM-yyyy"));
                                    }
                                });
                            }
                        }
                        else {
                            col.Item().Text("No data found for the selected criteria.").FontColor(Colors.Red.Medium).Italic();
                        }
                    });

                    page.Footer().AlignCenter().Text(x => { x.Span("MMGC CLINIC • Confidential • Page "); x.CurrentPageNumber(); });
                });
            }).GeneratePdf(filePath);
        }

        /* ─── Export Logic (Excel) ─────────────────────────── */

        private async Task GenerateExcelReport(GenerateReportDto dto, ReportDataWrapper data, string filePath)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Report");

            ws.Cells[1, 1].Value = dto.Title;
            ws.Cells[1, 1].Style.Font.Size = 18;
            ws.Cells[1, 1, 1, 4].Merge = true;
            ws.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Cells[1, 1].Style.Font.Bold = true;

            int rowIdx = 3;

            if (dto.Type == "revenue" && data.RevenueData != null)
            {
                ws.Cells[rowIdx, 1].Value = "Date"; ws.Cells[rowIdx, 2].Value = "Method"; ws.Cells[rowIdx, 3].Value = "Amount (Rs)";
                ws.Row(rowIdx).Style.Font.Bold = true;
                rowIdx++;
                foreach(var item in data.RevenueData) {
                    ws.Cells[rowIdx, 1].Value = item.Date.ToString("yyyy-MM-dd");
                    ws.Cells[rowIdx, 2].Value = item.Method;
                    ws.Cells[rowIdx, 3].Value = item.Amount;
                    rowIdx++;
                }
            }
            else if (dto.Type == "medical-summary" && data.MedicalData != null)
            {
                ws.Cells[rowIdx, 1].Value = "Date"; ws.Cells[rowIdx, 2].Value = "Patient"; ws.Cells[rowIdx, 3].Value = "Procedure"; ws.Cells[rowIdx, 4].Value = "Findings";
                ws.Row(rowIdx).Style.Font.Bold = true;
                rowIdx++;
                foreach(var item in data.MedicalData) {
                    ws.Cells[rowIdx, 1].Value = item.Date.ToString("yyyy-MM-dd");
                    ws.Cells[rowIdx, 2].Value = item.Patient;
                    ws.Cells[rowIdx, 3].Value = item.ProcedureType;
                    ws.Cells[rowIdx, 4].Value = item.Findings;
                    rowIdx++;
                }
            }
            else if (dto.Type == "lab-summary" && data.LabData != null) 
            {
                ws.Cells[rowIdx, 1].Value = "Date"; ws.Cells[rowIdx, 2].Value = "Patient"; ws.Cells[rowIdx, 3].Value = "Test Name"; ws.Cells[rowIdx, 4].Value = "Status";
                ws.Row(rowIdx).Style.Font.Bold = true;
                rowIdx++;
                foreach(var item in data.LabData) {
                    ws.Cells[rowIdx, 1].Value = item.Date.ToString("yyyy-MM-dd");
                    ws.Cells[rowIdx, 2].Value = item.Patient;
                    ws.Cells[rowIdx, 3].Value = item.Test;
                    ws.Cells[rowIdx, 4].Value = item.IsCompleted ? "Completed" : "Pending";
                    rowIdx++;
                }
            }
            else if (dto.Type == "patient-history")
            {
                ws.Cells[rowIdx, 1].Value = "PATIENT:"; ws.Cells[rowIdx, 2].Value = data.PatientName; rowIdx += 2;
                
                if(data.Labs != null) {
                    ws.Cells[rowIdx, 1].Value = "LABORATORY TESTS"; ws.Cells[rowIdx, 1].Style.Font.Bold = true; rowIdx++;
                    ws.Cells[rowIdx, 1].Value = "Date"; ws.Cells[rowIdx, 2].Value = "Test"; ws.Cells[rowIdx, 3].Value = "Status"; rowIdx++;
                    foreach(var l in data.Labs) {
                        ws.Cells[rowIdx, 1].Value = l.CreatedAt.ToString("yyyy-MM-dd");
                        ws.Cells[rowIdx, 2].Value = l.TestType?.Name;
                        ws.Cells[rowIdx, 3].Value = l.IsCompleted ? "Done" : "Pending";
                        rowIdx++;
                    }
                }
            }

            ws.Cells.AutoFitColumns();
            await package.SaveAsAsync(new FileInfo(filePath));
        }
    }

    public class GenerateReportDto
    {
        public string Title { get; set; } = "Report";
        public string Type { get; set; } = "revenue";
        public string Format { get; set; } = "PDF";
        public object? Parameters { get; set; }
    }

    public class ReportDataWrapper {
        public List<RevenueRow>? RevenueData { get; set; }
        public List<MedicalRow>? MedicalData { get; set; }
        public List<LabRow>? LabData { get; set; }
        public string? PatientName { get; set; }
        public List<LabTest>? Labs { get; set; }
        public List<Procedure>? Procedures { get; set; }
    }

    public class RevenueRow {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Method { get; set; } = "";
        public DateTime Date { get; set; }
    }

    public class MedicalRow {
        public int Id { get; set; }
        public string ProcedureType { get; set; } = "";
        public string Patient { get; set; } = "";
        public DateTime Date { get; set; }
        public string Findings { get; set; } = "";
    }

    public class LabRow {
        public int Id { get; set; }
        public string Test { get; set; } = "";
        public string Patient { get; set; } = "";
        public bool IsCompleted { get; set; }
        public DateTime Date { get; set; }
    }
}