using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;

namespace server.Services
{
    public class AlertService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notifier;
        private readonly ILogger<AlertService> _logger;

        public AlertService(AppDbContext context, INotificationService notifier, ILogger<AlertService> logger)
        {
            _context = context;
            _notifier = notifier;
            _logger = logger;
        }

        public async Task NotifyPatientAsync(int patientId, string title, string body, string type = "General")
        {
            try
            {
                // 1. Log to Database for in-app dashboard
                var notification = new Notification
                {
                    PatientId = patientId,
                    Title = title,
                    Body = body,
                    Type = type,
                    CreatedAt = DateTime.UtcNow,
                    Date = DateTime.UtcNow,
                    IsRead = false
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                // 2. Fetch Patient contact info for external delivery
                var patient = await _context.Patients.FindAsync(patientId);
                if (patient != null)
                {
                    // Trigger WhatsApp (Mock)
                    if (!string.IsNullOrEmpty(patient.Phone))
                    {
                        await _notifier.SendWhatsAppAsync(patient.Phone, $"[{title}] {body}");
                    }

                    // Trigger Email (Mock)
                    if (!string.IsNullOrEmpty(patient.Email))
                    {
                        string emailBody = $@"
                            <html>
                                <body>
                                    <h2>{title}</h2>
                                    <p>{body}</p>
                                    <hr />
                                    <p>MMGC Healthcare Team</p>
                                </body>
                            </html>";
                        await _notifier.SendEmailAsync(patient.Email, title, emailBody);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending automated notification to patient {PatientId}", patientId);
            }
        }
    }
}
