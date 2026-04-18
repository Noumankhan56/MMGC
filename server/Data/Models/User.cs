using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Data.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? PasswordHash { get; set; }

        [MaxLength(50)]
        public string Role { get; set; } = "Patient"; // Admin, Doctor, Patient

        [MaxLength(200)]
        public string? GoogleId { get; set; }

        public bool IsEmailVerified { get; set; } = false;

        [MaxLength(500)]
        public string? EmailVerificationToken { get; set; }

        [MaxLength(500)]
        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiry { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        public string? ProfilePictureUrl { get; set; }

        // Links to existing Doctor/Patient tables when applicable
        public int? DoctorProfileId { get; set; }
        [ForeignKey("DoctorProfileId")]
        public Doctor? DoctorProfile { get; set; }

        public int? PatientProfileId { get; set; }
        [ForeignKey("PatientProfileId")]
        public Patient? PatientProfile { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
