using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoicesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/invoices
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _context.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Transaction)
                .OrderByDescending(i => i.GeneratedAt)
                .Select(i => new
                {
                    i.Id,
                    i.InvoiceNumber,
                    GeneratedAt = i.GeneratedAt.ToString("yyyy-MM-dd HH:mm"),
                    PatientName = i.Patient != null ? i.Patient.Name : "N/A",
                    Amount = i.Transaction != null ? i.Transaction.Amount : 0,
                    IsPaid = i.Transaction != null && !i.Transaction.IsRefunded,
                    IsRefunded = i.Transaction != null && i.Transaction.IsRefunded,
                    PaymentMethod = i.Transaction != null ? i.Transaction.PaymentMethod : "N/A"
                })
                .ToListAsync();

            return Ok(invoices);
        }

        // GET: api/invoices/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Patient)
                .Include(i => i.Transaction)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return NotFound();

            return Ok(invoice);
        }

        // DELETE: api/invoices/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return NotFound();

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Invoice deleted" });
        }
    }
}
