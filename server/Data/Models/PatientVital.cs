using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("PatientVitals")]
    public class PatientVital
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string? BloodPressure { get; set; } // e.g., "120/80"

        public float? Temperature { get; set; } // in Celsius

        public int? Pulse { get; set; } // beats per minute

        public int? RespiratoryRate { get; set; } // breaths per minute

        public int? OxygenSaturation { get; set; } // SpO2 percentage

        public int? RecordedByNurseId { get; set; }

        [ForeignKey("RecordedByNurseId")]
        public Nurse? RecordedBy { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
