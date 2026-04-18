namespace server.Services
{
    public interface INotificationService
    {
        Task SendAsync(string phone, string message);
        Task SendWhatsAppAsync(string phone, string message);
        Task SendEmailAsync(string email, string subject, string body);
    }
}