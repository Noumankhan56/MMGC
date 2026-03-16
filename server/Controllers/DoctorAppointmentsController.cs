using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using System.Linq;

namespace server.Controllers
{
    [ApiController]
    [Route("api/doctor/appointments")]
    public class DoctorAppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorAppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // ----------------------------------------------------
        // GET: Doctor's Appointments
        // GET: api/doctor/appointments/{doctorId}
        // ----------------------------------------------------
        [HttpGet("{doctorId:int}")]
        public async Task<IActionResult> GetDoctorAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Include(a => a.Patient)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .Select(a => new
                {
                    id = a.Id,
                    patientName = a.Patient!.Name,
                    phone = a.Patient.Phone,
                    date = a.Date.ToString("yyyy-MM-dd"),
                    time = a.Time.ToString(@"hh\:mm"),
                    status = a.Status,
                    amount = a.Amount
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // ----------------------------------------------------
        // UPDATE STATUS
        // PUT: api/doctor/appointments/{id}/status?status=Confirmed
        // ----------------------------------------------------
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromQuery] string status)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null)
                return NotFound("Appointment not found");

            var allowed = new[]
            {
                "Scheduled",
                "Confirmed",
                "In-Progress",
                "Completed",
                "Canceled"
            };

            if (!allowed.Contains(status))
                return BadRequest("Invalid status");

            appt.Status = status;
            appt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated" });
        }
    }
}
