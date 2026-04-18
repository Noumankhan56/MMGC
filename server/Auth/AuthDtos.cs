using System.ComponentModel.DataAnnotations;

namespace server.Auth
{
    // ── Register ──
    public class RegisterDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Patient"; // Admin | Doctor | Patient

        // Patient-specific
        public string? Phone { get; set; }
        public string? DateOfBirth { get; set; }   // ISO "yyyy-MM-dd"
        public string? Gender { get; set; }
        public string? BloodGroup { get; set; }
        public string? Address { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }

        // Doctor-specific
        public string? Specialization { get; set; }
        public List<WorkSlotDto>? WorkSchedule { get; set; }
    }

    public class WorkSlotDto
    {
        public string Day { get; set; } = "";
        public string Start { get; set; } = "";
        public string End { get; set; } = "";
    }

    // ── Login ──
    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    // ── Google Login ──
    public class GoogleLoginDto
    {
        [Required]
        public string Credential { get; set; } = string.Empty; // Google ID token

        public string Role { get; set; } = "Patient"; // Used only on first login
    }

    // ── Refresh Token ──
    public class RefreshTokenDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    // ── Auth Response ──
    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public bool IsEmailVerified { get; set; }
        public int? DoctorProfileId { get; set; }
        public int? PatientProfileId { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    // ── User Profile Response ──
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public bool IsEmailVerified { get; set; }
        public int? DoctorProfileId { get; set; }
        public int? PatientProfileId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ── Change Password ──
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
