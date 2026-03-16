using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(AppDbContext context, ILogger<AppointmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ------------------------------------------
        // GET ALL
        // ------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .OrderByDescending(a => a.Date)
                .ThenBy(a => a.Time)
                .Select(a => new
                {
                    a.Id,
                    a.PatientId,
                    a.DoctorId,
                    date = a.Date.ToString("yyyy-MM-dd"),
                    time = a.Time.ToString(@"hh\:mm"),
                    patient = new { a.Patient!.Id, a.Patient.Name, a.Patient.Phone },
                    doctor = new { a.Doctor!.Id, a.Doctor.Name },
                    a.Status,
                    a.Amount
                })
                .ToListAsync();

            return Ok(list);
        }

        // ------------------------------------------
        // GET ONE
        // ------------------------------------------
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var a = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (a == null) return NotFound();

            return Ok(new
            {
                a.Id,
                a.PatientId,
                a.DoctorId,
                date = a.Date.ToString("yyyy-MM-dd"),
                time = a.Time.ToString(@"hh\:mm"),
                patient = a.Patient?.Name,
                doctor = a.Doctor?.Name,
                a.Status,
                a.Amount
            });
        }

        // ------------------------------------------
        // CREATE
        // ------------------------------------------
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Appointment appointment)
        {
            _logger.LogInformation("Incoming Appointment: {@appointment}", appointment);

            // Validate basic FK existence
            if (!await _context.Patients.AnyAsync(p => p.Id == appointment.PatientId))
                return BadRequest("Invalid Patient");

            if (!await _context.Doctors.AnyAsync(d => d.Id == appointment.DoctorId))
                return BadRequest("Invalid Doctor");

            // Normalize Date -> only date component (strip any time)
            appointment.Date = appointment.Date.Date;

            // Prevent double-booking for same doctor/date/time
            bool exists = await _context.Appointments.AnyAsync(a =>
                a.DoctorId == appointment.DoctorId &&
                a.Date == appointment.Date &&
                a.Time == appointment.Time
            );

            if (exists)
                return Conflict("Doctor already booked at this date and time.");

            // Set audit timestamps (UTC)
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.UpdatedAt = null;

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = appointment.Id }, new { message = "Appointment created", id = appointment.Id });
        }

        // ------------------------------------------
        // UPDATE
        // ------------------------------------------
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Appointment incoming)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null) return NotFound();

            if (!await _context.Patients.AnyAsync(p => p.Id == incoming.PatientId))
                return BadRequest("Invalid Patient");

            if (!await _context.Doctors.AnyAsync(d => d.Id == incoming.DoctorId))
                return BadRequest("Invalid Doctor");

            // Normalize incoming date
            var newDate = incoming.Date.Date;
            var newTime = incoming.Time;

            // Check double booking excluding current appointment
            bool conflict = await _context.Appointments.AnyAsync(a =>
                a.DoctorId == incoming.DoctorId &&
                a.Date == newDate &&
                a.Time == newTime &&
                a.Id != id
            );

            if (conflict)
                return Conflict("Doctor already booked at this date and time.");

            appt.PatientId = incoming.PatientId;
            appt.DoctorId = incoming.DoctorId;
            appt.Date = newDate;
            appt.Time = newTime;
            appt.Status = incoming.Status ?? appt.Status;
            appt.Amount = incoming.Amount;
            appt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment updated" });
        }

        // ------------------------------------------
        // DELETE
        // ------------------------------------------
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null) return NotFound();

            _context.Appointments.Remove(appt);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment deleted" });
        }
    }
}
