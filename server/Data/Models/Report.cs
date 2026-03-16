using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("Reports")]
    public class Report
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string ReportType { get; set; } = string.Empty; 
        // Medical, Financial, PatientHistory

        [Required]
        public string Format { get; set; } = "PDF"; // PDF or Excel

        public string? FilePath { get; set; } // Generated file location

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        public int? GeneratedByUserId { get; set; }

        // Optional parameters (stored as JSON for flexibility)
        public string? ParametersJson { get; set; } // e.g., { "From": "2025-01-01", "To": "2025-01-31", "PatientId": 5 }

        [ForeignKey("GeneratedByUserId")]
        public User? GeneratedBy { get; set; }
    }
}