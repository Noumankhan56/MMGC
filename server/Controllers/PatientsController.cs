using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PatientsController(AppDbContext context) => _context = context;

        // GET: api/patients?search=ali
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.Patients.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(search) ||
                    p.MRNumber.Contains(search) ||
                    (p.Phone != null && p.Phone.Contains(search)));
            }

            var patients = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    id = p.Id,
                    mrNumber = p.MRNumber,
                    name = p.Name,
                    phone = p.Phone ?? "",
                    email = p.Email ?? "",
                    gender = p.Gender,
                    dateOfBirth = p.DateOfBirth.ToString("yyyy-MM-dd"),
                    age = CalculateAge(p.DateOfBirth),
                    totalVisits = p.Appointments.Count,
                    totalSpent = p.Invoices.Sum(i => i.Transaction != null ? i.Transaction.Amount : 0)
                })
                .ToListAsync();

            return Ok(patients);
        }

        // GET: api/patients/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var patient = await _context.Patients
                .Include(p => p.Appointments)
                    .ThenInclude(a => a.Doctor)
                .Include(p => p.Invoices)
                    .ThenInclude(i => i.Transaction)
                .Include(p => p.LabTests)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null) return NotFound();

            var age = CalculateAge(patient.DateOfBirth);

            return Ok(new
            {
                id = patient.Id,
                mrNumber = patient.MRNumber,
                name = patient.Name,
                phone = patient.Phone,
                email = patient.Email,
                gender = patient.Gender,
                dateOfBirth = patient.DateOfBirth.ToString("yyyy-MM-dd"),
                age,
                createdAt = patient.CreatedAt.ToString("yyyy-MM-dd"),
                visits = patient.Appointments.Select(a => new
                {
                    date = a.Date.ToString("yyyy-MM-dd"),
                    time = a.Time,
                    doctor = a.Doctor != null ? a.Doctor.Name : "N/A",
                    status = a.Status
                }).ToList(),
                totalSpent = patient.Invoices.Sum(i => i.Transaction != null ? i.Transaction.Amount : 0)
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PatientCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Patient name is required.");

            var lastPatient = await _context.Patients
                .OrderByDescending(p => p.Id)
                .FirstOrDefaultAsync();

            var nextId = (lastPatient?.Id ?? 0) + 1;
            var mrNumber = $"MR-{nextId:D4}";

            var patient = new Patient
            {
                MRNumber = mrNumber,
                Name = dto.Name.Trim(),
                Phone = dto.Phone?.Trim(),
                Email = dto.Email?.Trim(),
                DateOfBirth = DateOnly.Parse(dto.DateOfBirth),
                Gender = dto.Gender
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return Created($"/api/patients/{patient.Id}", new
            {
                patient.Id,
                patient.MRNumber,
                patient.Name
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PatientCreateDto dto)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            patient.Name = dto.Name.Trim();
            patient.Phone = dto.Phone?.Trim();
            patient.Email = dto.Email?.Trim();
            patient.DateOfBirth = DateOnly.Parse(dto.DateOfBirth);
            patient.Gender = dto.Gender;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Helper method — works perfectly with DateOnly
        private static int CalculateAge(DateOnly dateOfBirth)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - dateOfBirth.Year;
            if (today < dateOfBirth.AddYears(age))
                age--;
            return age;
        }
    }

    public class PatientCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string DateOfBirth { get; set; } = DateTime.Today.ToString("yyyy-MM-dd");
        public string Gender { get; set; } = "Male";
    }
}
