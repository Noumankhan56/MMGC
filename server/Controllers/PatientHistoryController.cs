using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/patient-history")]
    public class PatientHistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PatientHistoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{patientId:int}")]
        public async Task<IActionResult> GetCompleteHistory(int patientId)
        {
            var patient = await _context.Patients
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == patientId);

            if (patient == null) return NotFound("Patient not found");

            var appointments = await _context.Appointments
                .Where(a => a.PatientId == patientId)
                .Include(a => a.Doctor)
                .OrderByDescending(a => a.Date)
                .Select(a => new {
                    a.Id,
                    a.Date,
                    a.Time,
                    a.Status,
                    a.Amount,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : "N/A"
                })
                .ToListAsync();

            var procedures = await _context.Procedures
                .Where(p => p.PatientId == patientId)
                .Include(p => p.Doctor)
                .OrderByDescending(p => p.PerformedAt)
                .Select(p => new {
                    p.Id,
                    p.ProcedureType,
                    p.PerformedAt,
                    p.Amount,
                    p.Notes,
                    p.Prescription,
                    p.ReportUrl,
                    DoctorName = p.Doctor != null ? p.Doctor.Name : "N/A"
                })
                .ToListAsync();

            var labTests = await _context.LabTests
                .Where(l => l.PatientId == patientId)
                .Include(l => l.TestType)
                .Include(l => l.ApprovedByDoctor)
                .OrderByDescending(l => l.OrderedAt)
                .Select(l => new {
                    l.Id,
                    TestName = l.TestType != null ? l.TestType.Name : "Unknown",
                    l.OrderedAt,
                    l.IsCompleted,
                    l.IsApproved,
                    l.ReportFilePath,
                    l.ReportFindings,
                    ApprovedBy = l.ApprovedByDoctor != null ? l.ApprovedByDoctor.Name : null
                })
                .ToListAsync();

            return Ok(new
            {
                patientInfo = new { patient.Id, patient.Name, patient.MRNumber, patient.Phone, patient.Email, patient.Gender, patient.DateOfBirth },
                appointments,
                procedures,
                labTests
            });
        }
    }
}
