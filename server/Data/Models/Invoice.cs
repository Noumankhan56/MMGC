using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    /// <summary>
    /// Align with actual PostgreSQL "Invoices" table schema.
    /// </summary>
    [Table("Invoices")]
    public class Invoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }

        // Linked to a specific financial transaction (required in DB)
        [Required]
        public int TransactionId { get; set; }

        [ForeignKey("TransactionId")]
        public virtual Transaction? Transaction { get; set; }

        [Required]
        public string InvoiceNumber { get; set; } = "";

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        public string? Notes { get; set; }
    }
}