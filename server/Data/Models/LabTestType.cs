using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("LabTestTypes")]
    public class LabTestType
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;           // e.g. "CBC", "Ultrasound Abdomen"

        [Required, MaxLength(50)]
        public string Category { get; set; } = null!;       // Blood, Radiology, Pathology, Ultrasound, etc.

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "numeric(10,2)")]
        public decimal DefaultPrice { get; set; } = 0m;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}