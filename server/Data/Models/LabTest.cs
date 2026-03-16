using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("LabTests")]
    public class LabTest
    {
        [Key]
        public int Id { get; set; }

        public int PatientId { get; set; }

        // FR6.1 – Test catalog reference (instead of free text)
        public int LabTestTypeId { get; set; }

        // FR6.2 – Staff assignment
        public int? AssignedToStaffId { get; set; }  // Links to a future LabTechnician or Nurse

        // Test Details
        public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SampleCollectedAt { get; set; }
        public DateTime? ReportedAt { get; set; }

        [MaxLength(500)]
        public string? DoctorNotes { get; set; }      // Notes from requesting doctor

        [MaxLength(3000)]
        public string? ReportFindings { get; set; }   // Text findings (optional)

        public string? ReportFilePath { get; set; }   // PDF / Image path (FR6.3)

        public bool IsUrgent { get; set; } = false;
        public bool IsCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties (FR6.4 – linked to patient history)
        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        [ForeignKey("LabTestTypeId")]
        public LabTestType? TestType { get; set; }

        [ForeignKey("AssignedToStaffId")]
        public Nurse? AssignedToStaff { get; set; }   // Reusing Nurse for now (or create LabTechnician later)
    }
}