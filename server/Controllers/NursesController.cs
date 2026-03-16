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

        public NursesController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var nurses = await _context.Nurses
                .Select(n => new
                {
                    id = n.Id,
                    name = n.Name
                })
                .ToListAsync();

            return Ok(nurses);
        }
    }
}