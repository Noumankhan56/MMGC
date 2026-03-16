using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    public class Procedure
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; } = null!;

        public int? DoctorId { get; set; }

        [ForeignKey("DoctorId")]
        public virtual Doctor? Doctor { get; set; }

        public int? NurseId { get; set; }

        [ForeignKey("NurseId")]
        public virtual Nurse? Nurse { get; set; }

        [Required]
        [StringLength(100)]
        public string ProcedureType { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string? TreatmentNotes { get; set; }

        [Column(TypeName = "text")]
        public string? Prescription { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        public string? ReportFilePath { get; set; }

        public bool ReportAvailable { get; set; } = false;

        public int? InvoiceId { get; set; }

        [ForeignKey("InvoiceId")]
        public virtual Invoice? Invoice { get; set; }

        public int? TransactionId { get; set; }

        [ForeignKey("TransactionId")]
        public virtual Transaction? Transaction { get; set; }

        [Required]
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Completed";
    }

    // DTO for creating procedures
    public class CreateProcedureDto
    {
        [Required]
        public int PatientId { get; set; }

        public int? DoctorId { get; set; }

        public int? NurseId { get; set; }

        [Required]
        public string ProcedureType { get; set; } = string.Empty;

        public string? TreatmentNotes { get; set; }

        public string? Prescription { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime? PerformedAt { get; set; }
    }

    // DTO for procedure responses
    public class ProcedureResponseDto
    {
        public int Id { get; set; }
        public string ProcedureType { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string? DoctorName { get; set; }
        public string? NurseName { get; set; }
        public decimal Amount { get; set; }
        public int? InvoiceId { get; set; }
        public bool ReportAvailable { get; set; }
        public string PerformedAt { get; set; } = string.Empty;
        public string? TreatmentNotes { get; set; }
        public string? Prescription { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReportFilePath { get; set; }
    }
}