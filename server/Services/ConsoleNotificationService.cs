namespace server.Services
{
    public class ConsoleNotificationService : INotificationService
    {
        public Task SendAsync(string phone, string message)
        {
            Console.WriteLine($"[SMS] To {phone}: {message}");
            return Task.CompletedTask;
        }

        public Task SendWhatsAppAsync(string phone, string message)
        {
            Console.WriteLine($"[WhatsApp] To {phone}: {message}");
            return Task.CompletedTask;
        }

        public Task SendEmailAsync(string email, string subject, string body)
        {
            Console.WriteLine($"[Email] To {email} (Subject: {subject}): {body}");
            return Task.CompletedTask;
        }
    }
}