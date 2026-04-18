using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    /// <summary>
    /// FR5: Medical Procedures and Treatments
    /// Aligned with actual PostgreSQL "Procedures" table schema.
    /// </summary>
    [Table("Procedures")]
    public class Procedure
    {
        [Key]
        public int Id { get; set; }

        // FR5.1 - Procedure type (Normal Delivery, C-Section, Ultrasound, Surgery, etc.)
        [Required]
        [MaxLength(150)]
        public string ProcedureType { get; set; } = "";

        [Column(TypeName = "numeric")]
        public decimal Amount { get; set; }

        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

        // FR5.2 - Doctor + Nurse team assignment
        public int? DoctorId { get; set; }
        public Doctor? Doctor { get; set; }

        public int? NurseId { get; set; }
        public Nurse? Nurse { get; set; }

        // Patient (required)
        [Required]
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }

        // Optional Appointment link (exists in DB)
        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        // FR5.3 - Treatment notes, prescriptions, and reports
        // COLUMN NAMES match actual DB: TreatmentNotes, Prescription, ReportFilePath
        [Column("TreatmentNotes")]
        public string? Notes { get; set; }

        public string? Prescription { get; set; }

        [Column("ReportFilePath")]
        public string? ReportUrl { get; set; }

        // Transaction link (for payment tracking)
        public int? TransactionId { get; set; }
        public Transaction? Transaction { get; set; }

        // FR18.4 - Status tracking for patient requests
        [MaxLength(50)]
        public string Status { get; set; } = "Performed";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
