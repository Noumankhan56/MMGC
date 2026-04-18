using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PublicController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/public/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetPublicStats()
        {
            try
            {
                var totalPatients = await _context.Patients.CountAsync();
                var totalDoctors = await _context.Doctors.Where(d => d.IsActive).CountAsync();
                var totalAppointments = await _context.Appointments.CountAsync();
                var totalProcedures = await _context.Procedures.CountAsync();

                return Ok(new
                {
                    PatientsServed = totalPatients + 15000, // Basing on existing baseline
                    ExpertDoctors = totalDoctors + 10,     // Baseline
                    TotalAppointments = totalAppointments,
                    ProceduresDone = totalProcedures,
                    SuccessRate = "98%"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching public stats", error = ex.Message });
            }
        }

        // POST: api/public/contact
        [HttpPost("contact")]
        public async Task<IActionResult> SubmitContactForm([FromBody] ContactMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                message.SubmittedAt = DateTime.UtcNow;
                _context.ContactMessages.Add(message);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Inquiry received successfully. Our team will contact you soon." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving contact inquiry", error = ex.Message });
            }
        }
        
        // GET: api/public/services
        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            // Derive available specializations from registered doctors
            var specializations = await _context.Doctors
                .Where(d => d.IsActive && d.Specialization != null)
                .Select(d => d.Specialization)
                .Distinct()
                .ToListAsync();

            return Ok(specializations);
        }
    }
}
