using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("Appointments")]
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        // Store as SQL "date" (no timezone) to avoid timestamptz Kind issues
        [Required]
        [Column(TypeName = "date")]
        public DateTime Date { get; set; }  // frontend sends "yyyy-MM-dd"

        // Store as SQL "interval"
        [Required]
        [Column(TypeName = "interval")]
        public TimeSpan Time { get; set; }  // frontend sends "HH:mm"

        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled";

        public decimal Amount { get; set; } = 500m;

        // Use UTC for audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey(nameof(PatientId))]
        public Patient? Patient { get; set; }

        [ForeignKey(nameof(DoctorId))]
        public Doctor? Doctor { get; set; }

        public Transaction? Transaction { get; set; }
    }
}
