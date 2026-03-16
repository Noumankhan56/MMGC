using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/dashboard/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var endOfLastMonth = startOfMonth.AddDays(-1);

            // Current Month Counts
            var currentMonthAppointments = await _context.Appointments
                .Where(a => a.CreatedAt >= startOfMonth)
                .CountAsync();

            var currentMonthPatients = await _context.Patients
                .Where(p => p.CreatedAt >= startOfMonth)
                .CountAsync();

            var currentMonthProcedures = await _context.Procedures
                .Where(p => p.PerformedAt >= startOfMonth)
                .CountAsync();

            var currentMonthLabTests = await _context.LabTests
                .Where(l => l.CreatedAt >= startOfMonth)
                .CountAsync();

            var currentMonthRevenue = await _context.Transactions
                .Where(t => t.PaidAt >= startOfMonth && !t.IsRefunded)
                .SumAsync(t => t.Amount);

            // Last Month for Comparison
            var lastMonthAppointments = await _context.Appointments
                .Where(a => a.CreatedAt >= startOfLastMonth && a.CreatedAt < startOfMonth)
                .CountAsync();

            var lastMonthRevenue = await _context.Transactions
                .Where(t => t.PaidAt >= startOfLastMonth && t.PaidAt < startOfMonth && !t.IsRefunded)
                .SumAsync(t => t.Amount);

            // Total Counts (All Time)
            var totalAppointments = await _context.Appointments.CountAsync();
            var totalPatients = await _context.Patients.CountAsync();
            var totalProcedures = await _context.Procedures.CountAsync();
            var totalLabReports = await _context.LabTests.CountAsync();
            var totalRevenue = await _context.Transactions
                .Where(t => !t.IsRefunded)
                .SumAsync(t => t.Amount);

            // Today's Appointments - Fixed: No more DateDiffDay!
            var todayAppointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.CreatedAt.Date == today) // This is the correct EF Core way
                .OrderBy(a => a.CreatedAt)
                .Take(10)
                .Select(a => new
                {
                    a.Id,
                    Time = a.CreatedAt.ToString("hh:mm tt"),
                    PatientName = a.Patient.Name,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : "Not Assigned",
                    a.Status
                })
                .ToListAsync();

            // Monthly Revenue Trend
            var monthlyRevenue = await _context.Transactions
                .Where(t => t.PaidAt.Year == today.Year && !t.IsRefunded)
                .GroupBy(t => t.PaidAt.Month)
                .Select(g => new
                {
                    Month = System.Globalization.DateTimeFormatInfo.CurrentInfo.GetAbbreviatedMonthName(g.Key),
                    Revenue = g.Sum(t => t.Amount)
                })
                .OrderBy(x => x.Month)
                .ToListAsync();

            return Ok(new
            {
                Overview = new[]
                {
                    new { name = "Total Appointments", value = totalAppointments.ToString("N0"), change = PercentChange(lastMonthAppointments, currentMonthAppointments), icon = "Calendar" },
                    new { name = "Total Patients", value = totalPatients.ToString("N0"), change = PercentChange(0, currentMonthPatients), icon = "Users" },
                    new { name = "Procedures Done", value = totalProcedures.ToString("N0"), change = PercentChange(0, currentMonthProcedures), icon = "Activity" },
                    new { name = "Lab Reports", value = totalLabReports.ToString("N0"), change = PercentChange(0, currentMonthLabTests), icon = "FileText" },
                    new { name = "Total Revenue", value = $"₹{totalRevenue:N0}", change = PercentChange(lastMonthRevenue, currentMonthRevenue), icon = "DollarSign" }
                },
                TodayAppointments = todayAppointments,
                MonthlyRevenue = monthlyRevenue
            });
        }

        private string PercentChange(int last, int current)
        {
            if (last == 0) return current > 0 ? "+100%" : "0%";
            var change = ((double)(current - last) / last) * 100;
            return change > 0 ? $"+{change:F0}%" : $"{change:F0}%";
        }

        private string PercentChange(decimal last, decimal current)
        {
            if (last == 0) return current > 0 ? "+100%" : "0%";
            var change = ((current - last) / last) * 100;
            return change > 0 ? $"+{change:F0}%" : $"{change:F0}%";
        }
    }
}