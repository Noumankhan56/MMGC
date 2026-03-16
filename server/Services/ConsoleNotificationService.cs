namespace server.Services
{
    public class ConsoleNotificationService : INotificationService
    {
        public Task SendAsync(string phone, string message)
        {
            // For now just write to console – replace later with Twilio/WhatsApp
            Console.WriteLine($"[SMS] To {phone}: {message}");
            return Task.CompletedTask;
        }
    }
}