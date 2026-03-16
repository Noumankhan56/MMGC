using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProceduresController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProceduresController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/procedures
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProcedureResponseDto>>> GetProcedures()
        {
            var procedures = await _context.Procedures
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Include(p => p.Nurse)
                .Include(p => p.Invoice)
                .OrderByDescending(p => p.PerformedAt)
                .Select(p => new ProcedureResponseDto
                {
                    Id = p.Id,
                    ProcedureType = p.ProcedureType,
                    PatientName = p.Patient.Name,
                    DoctorName = p.Doctor != null ? p.Doctor.Name : null,
                    NurseName = p.Nurse != null ? p.Nurse.Name : null,
                    Amount = p.Amount,
                    InvoiceId = p.InvoiceId,
                    ReportAvailable = p.ReportAvailable,
                    PerformedAt = p.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                    TreatmentNotes = p.TreatmentNotes,
                    Prescription = p.Prescription,
                    Status = p.Status,
                    ReportFilePath = p.ReportFilePath
                })
                .ToListAsync();

            return Ok(procedures);
        }

        // GET: api/procedures/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProcedureResponseDto>> GetProcedure(int id)
        {
            var procedure = await _context.Procedures
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Include(p => p.Nurse)
                .Include(p => p.Invoice)
                .Where(p => p.Id == id)
                .Select(p => new ProcedureResponseDto
                {
                    Id = p.Id,
                    ProcedureType = p.ProcedureType,
                    PatientName = p.Patient.Name,
                    DoctorName = p.Doctor != null ? p.Doctor.Name : null,
                    NurseName = p.Nurse != null ? p.Nurse.Name : null,
                    Amount = p.Amount,
                    InvoiceId = p.InvoiceId,
                    ReportAvailable = p.ReportAvailable,
                    PerformedAt = p.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                    TreatmentNotes = p.TreatmentNotes,
                    Prescription = p.Prescription,
                    Status = p.Status,
                    ReportFilePath = p.ReportFilePath
                })
                .FirstOrDefaultAsync();

            if (procedure == null)
            {
                return NotFound(new { message = "Procedure not found" });
            }

            return Ok(procedure);
        }

        // GET: api/procedures/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<ProcedureResponseDto>>> GetPatientProcedures(int patientId)
        {
            var procedures = await _context.Procedures
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Include(p => p.Nurse)
                .Where(p => p.PatientId == patientId)
                .OrderByDescending(p => p.PerformedAt)
                .Select(p => new ProcedureResponseDto
                {
                    Id = p.Id,
                    ProcedureType = p.ProcedureType,
                    PatientName = p.Patient.Name,
                    DoctorName = p.Doctor != null ? p.Doctor.Name : null,
                    NurseName = p.Nurse != null ? p.Nurse.Name : null,
                    Amount = p.Amount,
                    InvoiceId = p.InvoiceId,
                    ReportAvailable = p.ReportAvailable,
                    PerformedAt = p.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                    TreatmentNotes = p.TreatmentNotes,
                    Prescription = p.Prescription,
                    Status = p.Status
                })
                .ToListAsync();

            return Ok(procedures);
        }

        // POST: api/procedures/record
        [HttpPost("record")]
        public async Task<ActionResult<ProcedureResponseDto>> RecordProcedure([FromForm] CreateProcedureDto dto, IFormFile? reportFile)
        {
            // Validate patient exists
            var patient = await _context.Patients.FindAsync(dto.PatientId);
            if (patient == null)
            {
                return BadRequest(new { message = "Patient not found" });
            }

            // Validate doctor if provided
            if (dto.DoctorId.HasValue)
            {
                var doctor = await _context.Doctors.FindAsync(dto.DoctorId.Value);
                if (doctor == null)
                {
                    return BadRequest(new { message = "Doctor not found" });
                }
            }

            // Validate nurse if provided
            if (dto.NurseId.HasValue)
            {
                var nurse = await _context.Nurses.FindAsync(dto.NurseId.Value);
                if (nurse == null)
                {
                    return BadRequest(new { message = "Nurse not found" });
                }
            }

            // Create procedure
            var procedure = new Procedure
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                NurseId = dto.NurseId,
                ProcedureType = dto.ProcedureType,
                TreatmentNotes = dto.TreatmentNotes,
                Prescription = dto.Prescription,
                Amount = dto.Amount,
                PerformedAt = dto.PerformedAt ?? DateTime.UtcNow,
                Status = "Completed"
            };

            // Handle file upload
            if (reportFile != null && reportFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "reports");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{reportFile.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await reportFile.CopyToAsync(fileStream);
                }

                procedure.ReportFilePath = $"/uploads/reports/{uniqueFileName}";
                procedure.ReportAvailable = true;
            }

            _context.Procedures.Add(procedure);
            await _context.SaveChangesAsync();

            // Auto-generate invoice
            var invoice = new Invoice
            {
                PatientId = dto.PatientId,
                Amount = dto.Amount,
                Status = "Pending",
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                Description = $"Invoice for {dto.ProcedureType}",
                CreatedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            // Link invoice to procedure
            procedure.InvoiceId = invoice.Id;
            await _context.SaveChangesAsync();

            // Return response
            var response = new ProcedureResponseDto
            {
                Id = procedure.Id,
                ProcedureType = procedure.ProcedureType,
                PatientName = patient.Name,
                DoctorName = dto.DoctorId.HasValue ? (await _context.Doctors.FindAsync(dto.DoctorId.Value))?.Name : null,
                NurseName = dto.NurseId.HasValue ? (await _context.Nurses.FindAsync(dto.NurseId.Value))?.Name : null,
                Amount = procedure.Amount,
                InvoiceId = invoice.Id,
                ReportAvailable = procedure.ReportAvailable,
                PerformedAt = procedure.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                TreatmentNotes = procedure.TreatmentNotes,
                Prescription = procedure.Prescription,
                Status = procedure.Status,
                ReportFilePath = procedure.ReportFilePath
            };

            return CreatedAtAction(nameof(GetProcedure), new { id = procedure.Id }, response);
        }

        // PUT: api/procedures/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProcedure(int id, [FromForm] CreateProcedureDto dto, IFormFile? reportFile)
        {
            var procedure = await _context.Procedures.FindAsync(id);
            if (procedure == null)
            {
                return NotFound(new { message = "Procedure not found" });
            }

            // Validate patient
            var patient = await _context.Patients.FindAsync(dto.PatientId);
            if (patient == null)
            {
                return BadRequest(new { message = "Patient not found" });
            }

            // Update fields
            procedure.PatientId = dto.PatientId;
            procedure.DoctorId = dto.DoctorId;
            procedure.NurseId = dto.NurseId;
            procedure.ProcedureType = dto.ProcedureType;
            procedure.TreatmentNotes = dto.TreatmentNotes;
            procedure.Prescription = dto.Prescription;
            procedure.Amount = dto.Amount;
            procedure.UpdatedAt = DateTime.UtcNow;

            if (dto.PerformedAt.HasValue)
            {
                procedure.PerformedAt = dto.PerformedAt.Value;
            }

            // Handle new file upload
            if (reportFile != null && reportFile.Length > 0)
            {
                // Delete old file if exists
                if (!string.IsNullOrEmpty(procedure.ReportFilePath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, procedure.ReportFilePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "reports");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{reportFile.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await reportFile.CopyToAsync(fileStream);
                }

                procedure.ReportFilePath = $"/uploads/reports/{uniqueFileName}";
                procedure.ReportAvailable = true;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/procedures/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProcedure(int id)
        {
            var procedure = await _context.Procedures.FindAsync(id);
            if (procedure == null)
            {
                return NotFound(new { message = "Procedure not found" });
            }

            // Delete associated file if exists
            if (!string.IsNullOrEmpty(procedure.ReportFilePath))
            {
                var filePath = Path.Combine(_environment.WebRootPath, procedure.ReportFilePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Procedures.Remove(procedure);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/procedures/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetProcedureStats()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var totalProcedures = await _context.Procedures.CountAsync();
            var thisMonth = await _context.Procedures.CountAsync(p => p.PerformedAt >= startOfMonth);
            var totalRevenue = await _context.Procedures.SumAsync(p => (decimal?)p.Amount) ?? 0;
            var reportsUploaded = await _context.Procedures.CountAsync(p => p.ReportAvailable);

            return Ok(new
            {
                totalProcedures,
                thisMonth,
                totalRevenue,
                reportsUploaded
            });
        }
    }
}