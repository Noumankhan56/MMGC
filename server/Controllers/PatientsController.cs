using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using System.Linq;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PatientsController(AppDbContext context)
        {
            _context = context;
        }

        // ------------------------------------------
        // GET ALL / SEARCH
        // ------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.Patients
                .Include(p => p.Appointments)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(p => 
                    p.Name.ToLower().Contains(s) || 
                    p.MRNumber.ToLower().Contains(s) || 
                    (p.Phone != null && p.Phone.Contains(s))
                );
            }

            var list = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.MRNumber,
                    p.Name,
                    p.Phone,
                    p.Email,
                    p.Gender,
                    dateOfBirth = p.DateOfBirth.ToString("yyyy-MM-dd"),
                    IsRegistered = p.UserId != null,
                    Age = DateTime.Today.Year - p.DateOfBirth.Year,
                    TotalVisits = p.Appointments.Count,
                    TotalSpent = p.Appointments.Sum(a => a.Amount)
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
            var p = await _context.Patients.FindAsync(id);
            if (p == null) return NotFound();
            return Ok(p);
        }

        // ------------------------------------------
        // CREATE
        // ------------------------------------------
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Patient p)
        {
            // Auto-generate MR Number: MR-0001, etc.
            var last = await _context.Patients
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();
            
            int nextId = (last?.Id ?? 0) + 1;
            p.MRNumber = $"MR-{nextId:D4}";
            p.CreatedAt = DateTime.UtcNow;

            _context.Patients.Add(p);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Patient created", id = p.Id, mrNumber = p.MRNumber });
        }

        // ------------------------------------------
        // UPDATE
        // ------------------------------------------
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Patient incoming)
        {
            var p = await _context.Patients.FindAsync(id);
            if (p == null) return NotFound();

            p.Name = incoming.Name;
            p.Phone = incoming.Phone;
            p.Email = incoming.Email;
            p.DateOfBirth = incoming.DateOfBirth;
            p.Gender = incoming.Gender;
            p.Address = incoming.Address;
            p.BloodGroup = incoming.BloodGroup;
            p.EmergencyContactName = incoming.EmergencyContactName;
            p.EmergencyContactPhone = incoming.EmergencyContactPhone;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Patient updated" });
        }

        // ------------------------------------------
        // DELETE
        // ------------------------------------------
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var p = await _context.Patients
                .Include(x => x.Appointments)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (p == null) return NotFound();

            if (p.Appointments.Any())
                return BadRequest("Cannot delete patient with appointment history.");

            _context.Patients.Remove(p);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Patient deleted" });
        }

        // FR17.1: Get current patient profile
        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var patient = await _context.Patients
                .Select(p => new {
                    p.Id,
                    p.MRNumber,
                    p.Name,
                    p.Phone,
                    p.Email,
                    p.DateOfBirth,
                    p.Gender,
                    p.Address,
                    p.BloodGroup,
                    p.EmergencyContactName,
                    p.EmergencyContactPhone,
                    p.ProfilePictureUrl
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null) return NotFound("Patient not found.");
            return Ok(patient);
        }

        // FR17.1: Update patient profile
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] Patient updatedInfo)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound("Patient not found.");

            patient.Name = updatedInfo.Name;
            patient.Phone = updatedInfo.Phone;
            patient.Email = updatedInfo.Email;
            patient.Address = updatedInfo.Address;
            patient.BloodGroup = updatedInfo.BloodGroup;
            patient.EmergencyContactName = updatedInfo.EmergencyContactName;
            patient.EmergencyContactPhone = updatedInfo.EmergencyContactPhone;
            patient.ProfilePictureUrl = updatedInfo.ProfilePictureUrl;

            await _context.SaveChangesAsync();
            return Ok(patient);
        }

        // FR17.2: Get appointment history
        [HttpGet("{id}/appointments")]
        public async Task<IActionResult> GetAppointments(int id)
        {
            var appointments = await _context.Appointments
                .Where(a => a.PatientId == id)
                .Include(a => a.Doctor)
                .OrderByDescending(a => a.Date)
                .ThenByDescending(a => a.Time)
                .Select(a => new {
                    a.Id,
                    a.Date,
                    a.Time,
                    a.Status,
                    a.Amount,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : "N/A"
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // FR17.3: Get medical procedure history
        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetHistory(int id)
        {
            var history = await _context.Procedures
                .Where(p => p.PatientId == id)
                .Include(p => p.Doctor)
                .OrderByDescending(p => p.PerformedAt)
                .Select(p => new {
                    p.Id,
                    p.ProcedureType,
                    p.PerformedAt,
                    p.Status,
                    p.Notes,
                    p.Prescription,
                    p.ReportUrl,
                    DoctorName = p.Doctor != null ? p.Doctor.Name : "N/A"
                })
                .ToListAsync();

            return Ok(history);
        }

        // FR17.4 & FR19.2: Get lab and ultrasound reports
        [HttpGet("{id}/reports")]
        public async Task<IActionResult> GetReports(int id)
        {
            var reports = await _context.LabTests
                .Where(l => l.PatientId == id)
                .Include(l => l.TestType)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    l.Id,
                    TestName = l.TestType != null ? l.TestType.Name : "N/A",
                    Category = l.TestType != null ? l.TestType.Category : "General",
                    l.CreatedAt,
                    l.ReportFilePath,
                    l.IsCompleted,
                    l.IsApproved
                })
                .ToListAsync();

            return Ok(reports);
        }

        // FR17.4 & FR19.3: Get invoices
        [HttpGet("{id}/invoices")]
        public async Task<IActionResult> GetInvoices(int id)
        {
            var invoices = await _context.Invoices
                .Where(i => i.PatientId == id)
                .Include(i => i.Transaction)
                .OrderByDescending(i => i.GeneratedAt)
                .Select(i => new {
                    i.Id,
                    i.InvoiceNumber,
                    i.GeneratedAt,
                    Amount = i.Transaction != null ? i.Transaction.Amount : 0,
                    Status = i.Transaction != null && i.Transaction.PaidAt != null ? "Paid" : "Unpaid"
                })
                .ToListAsync();

            return Ok(invoices);
        }

        // FR17: Dashboard Summary
        [HttpGet("{id}/dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary(int id)
        {
            var totalAppointments = await _context.Appointments.CountAsync(a => a.PatientId == id);
            var pendingReports = await _context.LabTests.CountAsync(l => l.PatientId == id && !l.IsCompleted);
            var completedProcedures = await _context.Procedures.CountAsync(p => p.PatientId == id && p.Status == "Completed");
            
            var nextAppointment = await _context.Appointments
                .Where(a => a.PatientId == id && a.Date >= DateTime.Today && a.Status == "Scheduled")
                .Include(a => a.Doctor)
                .OrderBy(a => a.Date)
                .FirstOrDefaultAsync();

            return Ok(new {
                TotalAppointments = totalAppointments,
                PendingReports = pendingReports,
                CompletedProcedures = completedProcedures,
                NextAppointment = nextAppointment != null ? new {
                    nextAppointment.Date,
                    nextAppointment.Time,
                    DoctorName = nextAppointment.Doctor?.Name
                } : null
            });
        }
        // FR19.1: Get notifications
        [HttpGet("{id}/notifications")]
        public async Task<IActionResult> GetNotifications(int id)
        {
            var notifications = await _context.Notifications
                .Where(n => n.PatientId == id)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // FR19.1: Mark notification as read
        [HttpPut("{id}/notifications/{notifId}/read")]
        public async Task<IActionResult> MarkNotificationRead(int id, int notifId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notifId && n.PatientId == id);

            if (notification == null) return NotFound("Notification not found.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // FR: Upload Profile Picture
        [HttpPost("{id}/upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(int id, IFormFile file)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound("Patient not found");

            if (file == null || file.Length == 0) return BadRequest("No file uploaded");

            try
            {
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"profile_{id}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                patient.ProfilePictureUrl = $"/uploads/profiles/{fileName}";

                // Sync to User record for global AuthContext/Navbar update
                if (patient.UserId.HasValue)
                {
                    var userAccount = await _context.Users.FindAsync(patient.UserId.Value);
                    if (userAccount != null)
                    {
                        userAccount.ProfilePictureUrl = patient.ProfilePictureUrl;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { url = patient.ProfilePictureUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }
    }
}
