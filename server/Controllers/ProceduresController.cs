using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using server.Services;
using System.ComponentModel.DataAnnotations;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProceduresController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProceduresController> _logger;
        private readonly AlertService _alertService;

        public ProceduresController(AppDbContext context, ILogger<ProceduresController> logger, AlertService alertService)
        {
            _context = context;
            _logger = logger;
            _alertService = alertService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _context.Procedures
                    .Include(p => p.Patient)
                    .Include(p => p.Doctor)
                    .Include(p => p.Nurse)
                    .AsNoTracking()
                    .OrderByDescending(p => p.PerformedAt)
                    .Select(p => new
                    {
                        p.Id,
                        p.ProcedureType,
                        p.Amount,
                        PerformedAt = p.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                        Patient = new { p.Patient!.Id, p.Patient.Name, p.Patient.MRNumber },
                        Doctor = p.Doctor != null ? new { p.Doctor.Id, p.Doctor.Name } : null,
                        Nurse = p.Nurse != null ? new { p.Nurse.Id, p.Nurse.Name } : null,
                        p.Notes,
                        p.Prescription,
                        p.ReportUrl,
                        p.TransactionId,
                        CreatedAt = p.CreatedAt.ToString("yyyy-MM-dd")
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET /api/procedures failed");
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var p = await _context.Procedures
                    .Include(p => p.Patient)
                    .Include(p => p.Doctor)
                    .Include(p => p.Nurse)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (p == null) return NotFound();

                return Ok(new
                {
                    p.Id,
                    p.ProcedureType,
                    p.Amount,
                    PerformedAt = p.PerformedAt.ToString("yyyy-MM-dd HH:mm"),
                    Patient = new { p.Patient!.Id, p.Patient.Name, p.Patient.MRNumber },
                    Doctor = p.Doctor != null ? new { p.Doctor.Id, p.Doctor.Name } : null,
                    Nurse = p.Nurse != null ? new { p.Nurse.Id, p.Nurse.Name } : null,
                    p.Notes,
                    p.Prescription,
                    p.ReportUrl,
                    p.TransactionId,
                    CreatedAt = p.CreatedAt.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProcedureCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Create Procedure
                var procedure = new Procedure
                {
                    ProcedureType = dto.ProcedureType,
                    Amount = dto.Amount,
                    PatientId = dto.PatientId,
                    DoctorId = (dto.DoctorId > 0) ? dto.DoctorId : null,
                    NurseId = (dto.NurseId > 0) ? dto.NurseId : null,
                    PerformedAt = dto.PerformedAt.HasValue 
                        ? DateTime.SpecifyKind(dto.PerformedAt.Value, DateTimeKind.Utc) 
                        : DateTime.UtcNow,
                    Notes = dto.Notes,
                    Prescription = dto.Prescription,
                    ReportUrl = dto.ReportUrl,
                    Status = string.IsNullOrEmpty(dto.Status) ? "Performed" : dto.Status,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Procedures.Add(procedure);
                await _context.SaveChangesAsync();

                // 2. FR5.4 - Create Transaction
                var financeTransaction = new Transaction
                {
                    Type = TransactionType.Procedure,
                    Amount = dto.Amount,
                    PatientId = dto.PatientId,
                    ProcedureId = procedure.Id,
                    PaymentMethod = "Cash", // Default
                    PaidAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(financeTransaction);
                await _context.SaveChangesAsync();

                // 3. FR5.4 - Create Invoice (linked to Transaction)
                var invoice = new Invoice
                {
                    PatientId = dto.PatientId,
                    TransactionId = financeTransaction.Id,
                    InvoiceNumber = $"INV-PROC-{procedure.Id:D5}",
                    GeneratedAt = DateTime.UtcNow,
                    Notes = $"Invoice for {dto.ProcedureType}"
                };

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                // 4. Notify Patient
                await _alertService.NotifyPatientAsync(
                    procedure.PatientId,
                    "Procedure Updated",
                    $"A new medical procedure '{procedure.ProcedureType}' has been recorded for you with status: {procedure.Status}.",
                    "Procedure"
                );

                // 5. Update Procedure with TransactionId (for convenience)
                procedure.TransactionId = financeTransaction.Id;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(Get), new { id = procedure.Id }, new { id = procedure.Id, message = "Saved with Transaction and Invoice" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Save failed");
                return StatusCode(500, $"Failed to save: {ex.InnerException?.Message ?? ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProcedureCreateDto dto)
        {
            var p = await _context.Procedures.FindAsync(id);
            if (p == null) return NotFound();

            try
            {
                p.ProcedureType = dto.ProcedureType;
                p.Amount = dto.Amount;
                p.PatientId = dto.PatientId;
                p.DoctorId = (dto.DoctorId > 0) ? dto.DoctorId : null;
                p.NurseId = (dto.NurseId > 0) ? dto.NurseId : null;
                p.PerformedAt = dto.PerformedAt.HasValue 
                    ? DateTime.SpecifyKind(dto.PerformedAt.Value, DateTimeKind.Utc) 
                    : p.PerformedAt;
                p.Notes = dto.Notes;
                p.Prescription = dto.Prescription;
                p.ReportUrl = dto.ReportUrl;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var p = await _context.Procedures.FindAsync(id);
            if (p == null) return NotFound();

            _context.Procedures.Remove(p);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }
    }

    public class ProcedureCreateDto
    {
        [Required]
        public string ProcedureType { get; set; } = "";
        public decimal Amount { get; set; }
        [Required]
        public int PatientId { get; set; }
        public int? DoctorId { get; set; }
        public int? NurseId { get; set; }
        public DateTime? PerformedAt { get; set; }
        public string? Notes { get; set; }
        public string? Prescription { get; set; }
        public string? ReportUrl { get; set; }
        public string? Status { get; set; }
    }
}
