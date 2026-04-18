using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("NursingNotes")]
    public class NursingNote
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        [Required]
        public int NurseId { get; set; }

        [ForeignKey("NurseId")]
        public Nurse? Nurse { get; set; }

        [Required]
        [MaxLength(1000)]
        public string NoteContent { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? NoteType { get; set; } // e.g., "Progress", "Procedure", "General"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relation to procedure if applicable (FR12.1)
        public int? ProcedureId { get; set; }

        [ForeignKey("ProcedureId")]
        public Procedure? Procedure { get; set; }
    }
}
