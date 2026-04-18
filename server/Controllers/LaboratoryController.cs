using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using server.Services;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LaboratoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<LaboratoryController> _logger;
        private readonly AlertService _alertService;

        public LaboratoryController(AppDbContext context, ILogger<LaboratoryController> logger, AlertService alertService)
        {
            _context = context;
            _logger = logger;
            _alertService = alertService;
        }

        // GET: api/laboratory
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var tests = await _context.LabTests
                    .Include(t => t.Patient)
                    .Include(t => t.TestType)
                    .Include(t => t.AssignedToStaff)
                    .AsNoTracking()
                    .OrderByDescending(t => t.OrderedAt)
                    .Select(t => new
                    {
                        t.Id,
                        PatientId = t.PatientId,
                        PatientName = t.Patient != null ? t.Patient.Name : "Unknown",
                        PatientMRN = t.Patient != null ? t.Patient.MRNumber : "N/A",
                        TestName = t.TestType != null ? t.TestType.Name : "N/A",
                        Category = t.TestType != null ? t.TestType.Category : "N/A",
                        OrderedAt = t.OrderedAt.ToString("yyyy-MM-dd HH:mm"),
                        SampleCollectedAt = t.SampleCollectedAt.HasValue ? t.SampleCollectedAt.Value.ToString("yyyy-MM-dd HH:mm") : null,
                        ReportedAt = t.ReportedAt.HasValue ? t.ReportedAt.Value.ToString("yyyy-MM-dd HH:mm") : null,
                        StaffName = t.AssignedToStaff != null ? t.AssignedToStaff.Name : "Not Assigned",
                        t.IsUrgent,
                        t.IsCompleted,
                        t.ReportFilePath,
                        t.DoctorNotes,
                        t.ReportFindings
                    })
                    .ToListAsync();

                return Ok(tests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET /api/laboratory failed");
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }

        // GET: api/laboratory/patient/{patientId} (FR6.4 - linked to medical history)
        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var history = await _context.LabTests
                .Where(t => t.PatientId == patientId)
                .Include(t => t.TestType)
                .OrderByDescending(t => t.OrderedAt)
                .Select(t => new
                {
                    t.Id,
                    TestName = t.TestType != null ? t.TestType.Name : "N/A",
                    Category = t.TestType != null ? t.TestType.Category : "N/A",
                    OrderedAt = t.OrderedAt.ToString("yyyy-MM-dd"),
                    t.IsCompleted,
                    t.ReportFilePath,
                    t.ReportFindings
                })
                .ToListAsync();

            return Ok(history);
        }

        // GET: api/laboratory/types (FR6.1 - categorization)
        [HttpGet("types")]
        public async Task<IActionResult> GetTestTypes()
            => Ok(await _context.LabTestTypes
                .Where(t => t.IsActive)
                .OrderBy(t => t.Category)
                .ThenBy(t => t.Name)
                .Select(t => new { t.Id, t.Name, t.Category, t.DefaultPrice })
                .ToListAsync());

        // POST: api/laboratory (FR6.2 - book test sample)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLabTestDto dto)
        {
            _logger.LogInformation("Creating lab test: {@Dto}", dto);

            if (!await _context.Patients.AnyAsync(p => p.Id == dto.PatientId))
                return BadRequest("Patient not found.");

            if (!await _context.LabTestTypes.AnyAsync(t => t.Id == dto.LabTestTypeId))
                return BadRequest("Test type not found.");

            try
            {
                var labTest = new LabTest
                {
                    PatientId = dto.PatientId,
                    LabTestTypeId = dto.LabTestTypeId,
                    AssignedToStaffId = (dto.AssignedToStaffId > 0) ? dto.AssignedToStaffId : null,
                    DoctorNotes = dto.DoctorNotes?.Trim(),
                    IsUrgent = dto.IsUrgent,
                    OrderedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.LabTests.Add(labTest);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAll), new { id = labTest.Id }, new { labTest.Id, Message = "Lab test ordered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create lab test");
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }

        // PUT: api/laboratory/{id}/collect-sample (FR6.2)
        [HttpPut("{id:int}/collect-sample")]
        public async Task<IActionResult> CollectSample(int id)
        {
            var test = await _context.LabTests.FindAsync(id);
            if (test == null) return NotFound();

            test.SampleCollectedAt = DateTime.UtcNow;
            test.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Sample marked as collected", SampleCollectedAt = test.SampleCollectedAt });
        }

        // PUT: api/laboratory/{id}/upload-report (FR6.3)
        [HttpPut("{id:int}/upload-report")]
        public async Task<IActionResult> UploadReport(int id, [FromBody] UploadReportDto dto)
        {
            var test = await _context.LabTests.FindAsync(id);
            if (test == null) return NotFound();

            test.ReportFilePath = dto.ReportFilePath?.Trim();
            test.ReportFindings = dto.ReportFindings?.Trim();
            test.ReportedAt = DateTime.UtcNow;
            test.IsCompleted = true;
            test.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Trigger Automated Notification
            await _alertService.NotifyPatientAsync(
                test.PatientId,
                "Lab Report Ready",
                $"Your diagnostic report for {test.TestType?.Name ?? "Laboratory Test"} is now available in your medical vault.",
                "Report"
            );

            return Ok(new { Message = "Report saved and test completed" });
        }

        // DELETE: api/laboratory/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var test = await _context.LabTests.FindAsync(id);
            if (test == null) return NotFound();

            _context.LabTests.Remove(test);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Deleted" });
        }

        // -------------------------
        // HELPERS (Dashboard support)
        // -------------------------
        [HttpGet("pending-samples")]
        public async Task<IActionResult> GetPendingSamples()
        {
            var pending = await _context.LabTests
                .Include(l => l.Patient)
                .Include(l => l.TestType)
                .Where(l => l.SampleCollectedAt == null)
                .OrderBy(l => l.OrderedAt)
                .Select(l => new {
                    l.Id,
                    PatientName = l.Patient!.Name,
                    PatientMRN = l.Patient.MRNumber,
                    TestName = l.TestType!.Name,
                    OrderedAt = l.OrderedAt.ToString("yyyy-MM-dd HH:mm"),
                    l.IsUrgent
                })
                .ToListAsync();
            return Ok(pending);
        }

        [HttpGet("completed-reports")]
        public async Task<IActionResult> GetCompletedReports()
        {
            var completed = await _context.LabTests
                .Include(l => l.Patient)
                .Include(l => l.TestType)
                .Where(l => l.IsCompleted)
                .OrderByDescending(l => l.ReportedAt)
                .Select(l => new {
                    l.Id,
                    PatientName = l.Patient!.Name,
                    TestName = l.TestType!.Name,
                    ReportedAt = l.ReportedAt.HasValue ? l.ReportedAt.Value.ToString("yyyy-MM-dd HH:mm") : "N/A"
                })
                .ToListAsync();
            return Ok(completed);
        }
    }

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
        public string? ReportFilePath { get; set; }
        public string? ReportFindings { get; set; }
    }
}