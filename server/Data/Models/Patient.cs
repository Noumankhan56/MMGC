using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("Patients")]
    public class Patient
    {
        [Key]
        public int Id { get; set; }

        // MR Number = Medical Record Number (auto-generated as MR-0001, MR-0002...)
        [Required, MaxLength(20)]
        public string MRNumber { get; set; } = null!;

        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [EmailAddress, MaxLength(150)]
        public string? Email { get; set; }

        public DateOnly DateOfBirth { get; set; }

        [MaxLength(10)]
        public string Gender { get; set; } = "Male"; // Male, Female, Other

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(10)]
        public string? BloodGroup { get; set; }  // A+, B-, O+, AB+, etc.

        [MaxLength(100)]
        public string? EmergencyContactName { get; set; }

        [MaxLength(20)]
        public string? EmergencyContactPhone { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? UserAccount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public List<Appointment> Appointments { get; set; } = new();
        public List<Invoice> Invoices { get; set; } = new();
        public List<LabTest> LabTests { get; set; } = new();
    }
}