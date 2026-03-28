using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<TransactionsController> _logger;

        public TransactionsController(AppDbContext db, ILogger<TransactionsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // -------------------------
        // GET ALL
        // -------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _db.Transactions
                    .Include(t => t.Invoice)
                    .Include(t => t.Patient)
                    .AsNoTracking()
                    .OrderByDescending(t => t.PaidAt)
                    .Select(t => new
                    {
                        t.Id,
                        t.Type,
                        TypeDisplay = t.Type.ToString(),
                        t.Amount,
                        t.PaymentMethod,
                        t.ReferenceNumber,
                        t.IsRefunded,
                        t.RefundedAt,
                        PaidAt = t.PaidAt.ToString("yyyy-MM-dd HH:mm"),
                        CreatedAt = t.CreatedAt.ToString("yyyy-MM-dd"),
                        Patient = t.Patient != null ? new { t.Patient.Id, t.Patient.Name, t.Patient.MRNumber } : null,
                        Invoice = t.Invoice != null ? new { t.Invoice.Id, t.Invoice.InvoiceNumber, t.Invoice.GeneratedAt } : null
                    })
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET /api/transactions failed");
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }

        // -------------------------
        // GET STATS
        // -------------------------
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.UtcNow.Date;
            var totalRevenue = await _db.Transactions.Where(t => !t.IsRefunded).SumAsync(t => t.Amount);
            var todayCollection = await _db.Transactions.Where(t => !t.IsRefunded && t.PaidAt >= today).SumAsync(t => t.Amount);
            
            var modeBreakdown = await _db.Transactions
                .Where(t => !t.IsRefunded)
                .GroupBy(t => t.PaymentMethod)
                .Select(g => new { Method = g.Key, Total = g.Sum(x => x.Amount) })
                .ToListAsync();

            return Ok(new { totalRevenue, todayCollection, modeBreakdown });
        }

        // -------------------------
        // GET BY ID
        // -------------------------
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var trx = await _db.Transactions
                .Include(t => t.Invoice)
                .Include(t => t.Patient)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trx == null) return NotFound();

            return Ok(trx);
        }

        // -------------------------
        // CREATE TRANSACTION + INVOICE (FR7.3)
        // -------------------------
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TransactionCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            using var dbTransaction = await _db.Database.BeginTransactionAsync();
            try
            {
                // 1. Create Transaction
                var trx = new Transaction
                {
                    Type = dto.Type,
                    Amount = dto.Amount,
                    PaymentMethod = dto.PaymentMethod,
                    ReferenceNumber = dto.ReferenceNumber,
                    PatientId = (dto.PatientId > 0) ? dto.PatientId : null,
                    PaidAt = DateTime.SpecifyKind(dto.PaidAt ?? DateTime.UtcNow, DateTimeKind.Utc),
                    CreatedAt = DateTime.UtcNow,
                    AppointmentId = dto.AppointmentId,
                    LabTestId = dto.LabTestId,
                    ProcedureId = dto.ProcedureId
                };

                _db.Transactions.Add(trx);
                await _db.SaveChangesAsync();

                // 2. Generate Professional Invoice (FR7.3)
                var invoice = new Invoice
                {
                    PatientId = trx.PatientId ?? 0,
                    TransactionId = trx.Id,
                    InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMM}-{trx.Id:D4}",
                    GeneratedAt = DateTime.UtcNow,
                    Notes = $"Invoice for {dto.Type}"
                };

                _db.Invoices.Add(invoice);
                await _db.SaveChangesAsync();

                await dbTransaction.CommitAsync();

                // 3. Simulated Notification (FR7.4)
                _logger.LogInformation("Sending Payment Confirmation to Patient {Id} for Transaction {TrxId}", trx.PatientId, trx.Id);

                return Ok(new { trx.Id, invoice.InvoiceNumber, message = "Transaction and Invoice created successfully" });
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                _logger.LogError(ex, "Transaction creation failed");
                return StatusCode(500, $"Save failed: {ex.Message}");
            }
        }

        // -------------------------
        // UPDATE (PRICES / METHODS)
        // -------------------------
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TransactionCreateDto dto)
        {
            var trx = await _db.Transactions.FindAsync(id);
            if (trx == null) return NotFound();

            try
            {
                trx.Amount = dto.Amount;
                trx.PaymentMethod = dto.PaymentMethod;
                trx.ReferenceNumber = dto.ReferenceNumber;
                trx.Type = dto.Type;
                trx.PaidAt = DateTime.SpecifyKind(dto.PaidAt ?? trx.PaidAt, DateTimeKind.Utc);

                await _db.SaveChangesAsync();
                return Ok(trx);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // -------------------------
        // REFUND (FR7.1)
        // -------------------------
        [HttpPost("{id:int}/refund")]
        public async Task<IActionResult> Refund(int id)
        {
            var trx = await _db.Transactions.FindAsync(id);
            if (trx == null) return NotFound();

            trx.IsRefunded = true;
            trx.RefundedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Transaction refunded successfully", refundedAt = trx.RefundedAt });
        }

        // -------------------------
        // DELETE
        // -------------------------
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var trx = await _db.Transactions.FindAsync(id);
            if (trx == null) return NotFound();

            _db.Transactions.Remove(trx);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Transaction deleted" });
        }
    }

    public class TransactionCreateDto
    {
        [Required]
        public TransactionType Type { get; set; }
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
        public decimal Amount { get; set; }
        [Required]
        public string PaymentMethod { get; set; } = "Cash";
        public string? ReferenceNumber { get; set; }
        public int? PatientId { get; set; }
        public DateTime? PaidAt { get; set; }
        public int? AppointmentId { get; set; }
        public int? LabTestId { get; set; }
        public int? ProcedureId { get; set; }
    }
}
