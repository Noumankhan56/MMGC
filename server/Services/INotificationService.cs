namespace server.Services
{
    public interface INotificationService
    {
        Task SendAsync(string phone, string message);
    }
}