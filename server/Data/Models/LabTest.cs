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
        public int? AssignedToStaffId { get; set; }

        // Test Details
        public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SampleCollectedAt { get; set; }
        public DateTime? ReportedAt { get; set; }

        [MaxLength(500)]
        public string? DoctorNotes { get; set; }

        [MaxLength(3000)]
        public string? ReportFindings { get; set; }

        public string? ReportFilePath { get; set; }

        public bool IsUrgent { get; set; } = false;
        public bool IsCompleted { get; set; } = false;

        // FR11.2 & FR11.3 - Approval for Reports
        public bool IsApproved { get; set; } = false;
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedByDoctorId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        [ForeignKey("LabTestTypeId")]
        public LabTestType? TestType { get; set; }

        [ForeignKey("AssignedToStaffId")]
        public Nurse? AssignedToStaff { get; set; }

        [ForeignKey("ApprovedByDoctorId")]
        public Doctor? ApprovedByDoctor { get; set; }
    }
}