using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LaboratoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        public LaboratoryController(AppDbContext context) => _context = context;

        // GET: api/laboratory
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tests = await _context.LabTests
                .Include(t => t.Patient)
                .Include(t => t.TestType)
                .Include(t => t.AssignedToStaff)
                .Select(t => new
                {
                    t.Id,
                    PatientId = t.PatientId,
                    PatientName = t.Patient != null ? t.Patient.Name : "Unknown",
                    TestName = t.TestType != null ? t.TestType.Name : "N/A",
                    Category = t.TestType != null ? t.TestType.Category : "N/A",
                    t.OrderedAt,
                    t.SampleCollectedAt,
                    t.ReportedAt,
                    StaffName = t.AssignedToStaff != null ? t.AssignedToStaff.Name : "Not Assigned",
                    t.IsUrgent,
                    t.IsCompleted,
                    t.ReportFilePath,
                    t.DoctorNotes,
                    t.ReportFindings
                })
                .OrderByDescending(t => t.OrderedAt)
                .ToListAsync();

            return Ok(tests);
        }

        // GET: api/laboratory/types
        [HttpGet("types")]
        public async Task<IActionResult> GetTestTypes()
            => Ok(await _context.LabTestTypes
                .Where(t => t.IsActive)
                .OrderBy(t => t.Category)
                .ThenBy(t => t.Name)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Category,
                    t.DefaultPrice
                })
                .ToListAsync());

        // POST: api/laboratory
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLabTestDto dto)
        {
            if (!await _context.Patients.AnyAsync(p => p.Id == dto.PatientId))
                return BadRequest("Patient not found.");

            if (!await _context.LabTestTypes.AnyAsync(t => t.Id == dto.LabTestTypeId))
                return BadRequest("Test type not found.");

            var labTest = new LabTest
            {
                PatientId = dto.PatientId,
                LabTestTypeId = dto.LabTestTypeId,
                AssignedToStaffId = dto.AssignedToStaffId,
                DoctorNotes = dto.DoctorNotes?.Trim(),
                IsUrgent = dto.IsUrgent,
                OrderedAt = DateTime.UtcNow
            };

            _context.LabTests.Add(labTest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = labTest.Id }, new
            {
                labTest.Id,
                Message = "Lab test ordered successfully"
            });
        }

        // PUT: api/laboratory/{id}/upload-report
        [HttpPut("{id:int}/upload-report")]
        public async Task<IActionResult> UploadReport(int id, [FromBody] UploadReportDto dto)
        {
            var test = await _context.LabTests.FindAsync(id);
            if (test == null) return NotFound();

            test.ReportFilePath = dto.ReportFilePath;
            test.ReportFindings = dto.ReportFindings?.Trim();
            test.ReportedAt = DateTime.UtcNow;
            test.IsCompleted = true;
            test.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Report uploaded successfully" });
        }
    }

    // DTOs
    public class CreateLabTestDto
    {
        public int PatientId { get; set; }
        public int LabTestTypeId { get; set; }
        public int? AssignedToStaffId { get; set; }
        public string? DoctorNotes { get; set; }
        public bool IsUrgent { get; set; } = false;
    }

    public class UploadReportDto
    {
        public string ReportFilePath { get; set; } = null!;
        public string? ReportFindings { get; set; }
    }
}