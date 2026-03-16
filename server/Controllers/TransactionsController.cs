using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TransactionsController(AppDbContext db)
        {
            _db = db;
        }

        // -------------------------
        // GET ALL
        // -------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _db.Transactions
                .Include(t => t.Invoice)
                .Include(t => t.Patient)
                .ToListAsync();

            return Ok(result);
        }

        // -------------------------
        // GET BY ID
        // -------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var trx = await _db.Transactions
                .Include(t => t.Invoice)
                .Include(t => t.Patient)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trx == null) return NotFound();

            return Ok(trx);
        }

        // -------------------------
        // CREATE TRANSACTION + INVOICE
        // -------------------------
        [HttpPost]
        public async Task<IActionResult> Create(Transaction model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Transactions.Add(model);
            await _db.SaveChangesAsync();

            // Generate Invoice
            var invoice = new Invoice
            {
                TransactionId = model.Id,
                InvoiceNumber = "INV-" + DateTime.UtcNow.Ticks
            };

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            // Payment Confirmation (placeholder)
            SendPaymentConfirmation(model);

            return Ok(new { Transaction = model, Invoice = invoice });
        }

        // -------------------------
        // UPDATE
        // -------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Transaction model)
        {
            var trx = await _db.Transactions.FindAsync(id);
            if (trx == null) return NotFound();

            trx.Amount = model.Amount;
            trx.PaymentMethod = model.PaymentMethod;
            trx.ReferenceNumber = model.ReferenceNumber;
            trx.Type = model.Type;

            await _db.SaveChangesAsync();
            return Ok(trx);
        }

        // -------------------------
        // REFUND
        // -------------------------
        [HttpPost("{id}/refund")]
        public async Task<IActionResult> Refund(int id)
        {
            var trx = await _db.Transactions.FindAsync(id);
            if (trx == null) return NotFound();

            trx.IsRefunded = true;
            trx.RefundedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(trx);
        }

        // -------------------------
        // DELETE
        // -------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var trx = await _db.Transactions.FindAsync(id);
            if (trx == null) return NotFound();

            _db.Transactions.Remove(trx);
            await _db.SaveChangesAsync();

            return Ok("Deleted");
        }

        private void SendPaymentConfirmation(Transaction trx)
        {
            // Placeholder for SMS / Email
            Console.WriteLine($"Payment Confirmation sent to Patient {trx.PatientId}");
        }
    }
}
