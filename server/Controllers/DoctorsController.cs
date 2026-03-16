using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using System.ComponentModel.DataAnnotations;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(AppDbContext context, ILogger<DoctorsController> logger)
        {
            _context = context;
            _logger = logger;

            _logger.LogInformation(
                "DoctorsController initialized | DB Connected: {Status}",
                _context.Database.CanConnect() ? "YES" : "NO"
            );
        }

        // ---------------------------------------------------
        // GET All Doctors
        // ---------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var doctors = await _context.Doctors
                    .Include(d => d.Appointments) // REQUIRED for Count() and Sum()
                    .AsNoTracking()
                    .Select(d => new
                    {
                        d.Id,
                        d.Name,
                        Specialization = d.Specialization ?? "General Physician",
                        d.Phone,
                        d.Email,
                        Status = d.IsActive ? "Active" : "Inactive",

                        TotalAppointments = d.Appointments.Count,
                        TotalRevenue = d.Appointments.Sum(a => a.Amount),

                        WorkSchedule = d.WorkSchedule.Select(w => new
                        {
                            w.Day,
                            w.Start,
                            w.End
                        }).ToList()
                    })
                    .OrderBy(d => d.Name)
                    .ToListAsync();

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET /api/doctors failed");
                return StatusCode(500, "Failed to load doctors");
            }
        }

        // ---------------------------------------------------
        // GET Doctor by ID
        // ---------------------------------------------------
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.Appointments)
                        .ThenInclude(a => a.Patient)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (doctor == null)
                    return NotFound("Doctor not found");

                return Ok(new
                {
                    doctor.Id,
                    doctor.Name,
                    Specialization = doctor.Specialization ?? "General Physician",
                    doctor.Phone,
                    doctor.Email,
                    Status = doctor.IsActive ? "Active" : "Inactive",
                    TotalAppointments = doctor.Appointments.Count,
                    TotalRevenue = doctor.Appointments.Sum(a => a.Amount),

                    WorkSchedule = doctor.WorkSchedule
                        .Select(w => new { w.Day, w.Start, w.End })
                        .ToList(),

                    RecentPatients = doctor.Appointments
                        .OrderByDescending(a => a.Date)
                        .Take(10)
                        .Select(a => new
                        {
                            PatientName = a.Patient?.Name ?? "Unknown",
                            Date = a.Date.ToString("dd MMM yyyy"),

                            // If Time is DateTime keep this; if TimeSpan we will fix after you show me that model
                            Time = a.Time.ToString("hh:mm tt"),

                            a.Amount
                        })
                        .ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GET /api/doctors/{Id} failed", id);
                return StatusCode(500, "Failed to load doctor profile");
            }
        }

        // ---------------------------------------------------
        // CREATE Doctor
        // ---------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DoctorCreateDto dto)
        {
            _logger.LogInformation("Creating doctor: {@Doctor}", dto);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var doctor = new Doctor
                {
                    Name = dto.Name.Trim(),
                    Specialization = string.IsNullOrWhiteSpace(dto.Specialization) ? null : dto.Specialization.Trim(),
                    Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
                    Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
                    IsActive = dto.IsActive,

                    WorkSchedule = dto.WorkSchedule?
                        .Where(s => !string.IsNullOrEmpty(s.Start) && !string.IsNullOrEmpty(s.End))
                        .Select(s => new WorkSlot
                        {
                            Day = s.Day,
                            Start = s.Start,
                            End = s.End
                        })
                        .ToList() ?? new List<WorkSlot>()
                };

                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Doctor created successfully! ID: {Id}, Name: {Name}", doctor.Id, doctor.Name);

                return CreatedAtAction(nameof(Get), new { id = doctor.Id }, new
                {
                    message = "Doctor created",
                    id = doctor.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FAILED to create doctor: {@Dto}", dto);
                return StatusCode(500, $"Save failed: {ex.Message}");
            }
        }

        // ---------------------------------------------------
        // UPDATE Doctor
        // ---------------------------------------------------
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] DoctorCreateDto dto)
        {
            _logger.LogInformation("Updating doctor ID {Id}: {@Dto}", id, dto);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
                return NotFound("Doctor not found");

            try
            {
                doctor.Name = dto.Name.Trim();
                doctor.Specialization = string.IsNullOrWhiteSpace(dto.Specialization) ? null : dto.Specialization.Trim();
                doctor.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
                doctor.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
                doctor.IsActive = dto.IsActive;

                doctor.WorkSchedule = dto.WorkSchedule?
                    .Where(s => !string.IsNullOrEmpty(s.Start) && !string.IsNullOrEmpty(s.End))
                    .Select(s => new WorkSlot
                    {
                        Day = s.Day,
                        Start = s.Start,
                        End = s.End
                    })
                    .ToList() ?? new List<WorkSlot>();

                await _context.SaveChangesAsync();

                _logger.LogInformation("Doctor {Id} updated successfully", id);

                return Ok(new { message = "Doctor updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FAILED to update doctor {Id}", id);
                return StatusCode(500, $"Update failed: {ex.Message}");
            }
        }

        // ---------------------------------------------------
        // DELETE Doctor
        // ---------------------------------------------------
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.Appointments)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (doctor == null)
                return NotFound();

            if (doctor.Appointments?.Any() == true)
                return BadRequest("Cannot delete doctor with existing appointments.");

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Doctor {Id} deleted", id);

            return NoContent();
        }
    }

    // ---------------------------------------------------
    // DTOs (Moved inside namespace)
    // ---------------------------------------------------
    public class DoctorCreateDto
    {
        [Required(ErrorMessage = "Doctor name is required")]
        [StringLength(100, MinimumLength = 3)]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Specialization { get; set; }

        [Phone]
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public bool IsActive { get; set; } = true;

        public List<WorkSlotDto>? WorkSchedule { get; set; }
    }

    public class WorkSlotDto
    {
        public string Day { get; set; } = "";
        public string Start { get; set; } = "";
        public string End { get; set; } = "";
    }
}
