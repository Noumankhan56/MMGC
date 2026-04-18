using System.ComponentModel.DataAnnotations;

namespace server.Data.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Body { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string Type { get; set; } = "General"; // Appointment, Report, Payment, Reminder

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
