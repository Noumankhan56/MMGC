using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    public enum TransactionType
    {
        Appointment,
        LabTest,
        Procedure,
        Treatment,
        PharmacySale
    }

    [Table("Transactions")]
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash";
        // Cash, Bank Transfer, Card, Online Payment

        [MaxLength(150)]
        public string? ReferenceNumber { get; set; }

        public bool IsRefunded { get; set; } = false;
        public DateTime? RefundedAt { get; set; }

        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys (Polymorphic transaction source)
        public int? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public int? LabTestId { get; set; }
        public LabTest? LabTest { get; set; }

        public int? ProcedureId { get; set; }
        public Procedure? Procedure { get; set; }

        public int? PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Invoice? Invoice { get; set; }
    }
}
