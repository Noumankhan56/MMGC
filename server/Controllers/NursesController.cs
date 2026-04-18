// server/Controllers/NursesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NursesController(AppDbContext context)
        {
            _context = context;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var nurses = await _context.Nurses
                .Select(n => new
                {
                    n.Id,
                    n.Name,
                    n.Phone,
                    n.Email,
                    n.Department,
                    Status = n.IsActive ? "Active" : "Inactive"
                })
                .OrderBy(n => n.Name)
                .ToListAsync();

            return Ok(nurses);
        }

// GET ONE (UPDATED)
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var nurse = await _context.Nurses.FindAsync(id);
    if (nurse == null) return NotFound();

    return Ok(new
    {
        nurse.Id,
        nurse.Name,
        nurse.Phone,
        nurse.Email,
        nurse.Department,
        nurse.IsActive,
        Status = nurse.IsActive ? "Active" : "Inactive"
    });
}


        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Nurse nurse)
        {
            if (string.IsNullOrWhiteSpace(nurse.Name))
                return BadRequest("Name is required");

            _context.Nurses.Add(nurse);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nurse created" });
        }

[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, [FromBody] Nurse updated)
{
    var nurse = await _context.Nurses.FindAsync(id);
    if (nurse == null) return NotFound();

    // ✅ validation
    if (string.IsNullOrWhiteSpace(updated.Name))
        return BadRequest("Name is required");

    // ✅ safe update
    nurse.Name = updated.Name ?? nurse.Name;
    nurse.Phone = updated.Phone;
    nurse.Email = updated.Email;
    nurse.Department = updated.Department;
    nurse.IsActive = updated.IsActive;

    await _context.SaveChangesAsync();

    return Ok(new { message = "Nurse updated" });
}

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var nurse = await _context.Nurses.FindAsync(id);
            if (nurse == null) return NotFound();

            _context.Nurses.Remove(nurse);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nurse deleted" });
        }

        // -------------------------
        // VITALS (FR12.2)
        // -------------------------
        [HttpPost("vitals")]
        public async Task<IActionResult> RecordVitals([FromBody] PatientVital vitals)
        {
            if (vitals.PatientId <= 0) return BadRequest("PatientId required");
            
            vitals.CapturedAt = DateTime.UtcNow;
            _context.PatientVitals.Add(vitals);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Vitals recorded", id = vitals.Id });
        }

        [HttpGet("vitals/{patientId:int}")]
        public async Task<IActionResult> GetPatientVitals(int patientId)
        {
            var list = await _context.PatientVitals
                .Where(v => v.PatientId == patientId)
                .Include(v => v.RecordedBy)
                .OrderByDescending(v => v.CapturedAt)
                .ToListAsync();
            return Ok(list);
        }

        // -------------------------
        // NURSING NOTES (FR12.2, FR12.3)
        // -------------------------
        [HttpPost("notes")]
        public async Task<IActionResult> AddNote([FromBody] NursingNote note)
        {
            if (note.PatientId <= 0 || note.NurseId <= 0) 
                return BadRequest("PatientId and NurseId required");

            note.CreatedAt = DateTime.UtcNow;
            _context.NursingNotes.Add(note);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Note added", id = note.Id });
        }

        [HttpGet("notes/{patientId:int}")]
        public async Task<IActionResult> GetPatientNotes(int patientId)
        {
            var list = await _context.NursingNotes
                .Where(n => n.PatientId == patientId)
                .Include(n => n.Nurse)
                .Include(n => n.Procedure)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(list);
        }

        [HttpPut("notes/{id:int}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] NursingNote updated)
        {
            var note = await _context.NursingNotes.FindAsync(id);
            if (note == null) return NotFound();

            note.NoteContent = updated.NoteContent;
            note.NoteType = updated.NoteType ?? note.NoteType;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Note updated" });
        }
    }
}
