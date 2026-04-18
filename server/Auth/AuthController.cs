using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;
using System.Security.Claims;
using System.Security.Cryptography;
using server.Data;
using server.Data.Models;

namespace server.Auth
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwt;
        private readonly EmailService _email;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, JwtService jwt, EmailService email, IConfiguration config)
        {
            _db = db;
            _jwt = jwt;
            _email = email;
            _config = config;
        }

        // ──────────────────────────────────────
        // POST /api/auth/register
        // ──────────────────────────────────────
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate role
            var validRoles = new[] { "Admin", "Doctor", "Patient" };
            if (!validRoles.Contains(dto.Role))
                return BadRequest(new { message = "Invalid role. Must be Admin, Doctor, or Patient." });

            // Check duplicate email
            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return Conflict(new { message = "An account with this email already exists." });

            // Create user
            var verificationToken = GenerateSecureToken();
            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                Phone = dto.Phone,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Create role-specific profile
            if (dto.Role == "Patient")
            {
                var mrNumber = $"MR-{(_db.Patients.Count() + 1).ToString("D4")}";
                DateOnly dob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-25));
                if (!string.IsNullOrEmpty(dto.DateOfBirth))
                    DateOnly.TryParse(dto.DateOfBirth, out dob);

                var patient = new Patient
                {
                    MRNumber = mrNumber,
                    Name = dto.Name,
                    Phone = dto.Phone,
                    Email = dto.Email.ToLower().Trim(),
                    DateOfBirth = dob,
                    Gender = dto.Gender ?? "Male",
                    BloodGroup = dto.BloodGroup,
                    Address = dto.Address,
                    EmergencyContactName = dto.EmergencyContactName,
                    EmergencyContactPhone = dto.EmergencyContactPhone,
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Patients.Add(patient);
                await _db.SaveChangesAsync();

                user.PatientProfileId = patient.Id;
                await _db.SaveChangesAsync();
            }
            else if (dto.Role == "Doctor")
            {
                var doctor = new Doctor
                {
                    Name = dto.Name,
                    Specialization = dto.Specialization,
                    Phone = dto.Phone,
                    Email = dto.Email.ToLower().Trim(),
                    IsActive = true,
                    WorkSchedule = dto.WorkSchedule?.Select(ws => new WorkSlot
                    {
                        Day = ws.Day,
                        Start = ws.Start,
                        End = ws.End
                    }).ToList() ?? new(),
                    UserId = user.Id
                };
                _db.Doctors.Add(doctor);
                await _db.SaveChangesAsync();

                user.DoctorProfileId = doctor.Id;
                await _db.SaveChangesAsync();
            }

            // Send verification email
            _ = _email.SendVerificationEmailAsync(user.Email, user.Name, verificationToken);

            // Generate tokens
            var accessToken = _jwt.GenerateAccessToken(user);
            var refreshToken = _jwt.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = _jwt.GetRefreshTokenExpiry();
            await _db.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsEmailVerified = user.IsEmailVerified,
                DoctorProfileId = user.DoctorProfileId,
                PatientProfileId = user.PatientProfileId,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

        // ──────────────────────────────────────
        // POST /api/auth/login
        // ──────────────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _db.Users.FirstOrDefaultAsync(
                u => u.Email.ToLower() == dto.Email.ToLower().Trim());

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            if (string.IsNullOrEmpty(user.PasswordHash))
                return Unauthorized(new { message = "This account uses Google sign-in. Please use 'Continue with Google'." });

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            // Generate tokens
            var accessToken = _jwt.GenerateAccessToken(user);
            var refreshToken = _jwt.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = _jwt.GetRefreshTokenExpiry();
            await _db.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsEmailVerified = user.IsEmailVerified,
                DoctorProfileId = user.DoctorProfileId,
                PatientProfileId = user.PatientProfileId,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

        // ──────────────────────────────────────
        // POST /api/auth/google
        // ──────────────────────────────────────
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            GoogleJsonWebSignature.Payload payload;
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _config["Google:ClientId"] }
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.Credential, settings);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = "Invalid Google token.", detail = ex.Message });
            }

            // Check if user exists
            var user = await _db.Users.FirstOrDefaultAsync(
                u => u.GoogleId == payload.Subject || u.Email.ToLower() == payload.Email.ToLower());

            if (user == null)
            {
                // New user — create account
                user = new User
                {
                    Name = payload.Name ?? payload.Email,
                    Email = payload.Email.ToLower(),
                    GoogleId = payload.Subject,
                    ProfilePictureUrl = payload.Picture,
                    Role = dto.Role ?? "Patient",
                    IsEmailVerified = payload.EmailVerified,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();

                // Create role-specific profile
                if (user.Role == "Patient")
                {
                    var mrNumber = $"MR-{(_db.Patients.Count() + 1).ToString("D4")}";
                    var patient = new Patient
                    {
                        MRNumber = mrNumber,
                        Name = user.Name,
                        Email = user.Email,
                        DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-25)),
                        Gender = "Male",
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.Patients.Add(patient);
                    await _db.SaveChangesAsync();
                    user.PatientProfileId = patient.Id;
                }
                else if (user.Role == "Doctor")
                {
                    var doctor = new Doctor
                    {
                        Name = user.Name,
                        Email = user.Email,
                        UserId = user.Id,
                        IsActive = true
                    };
                    _db.Doctors.Add(doctor);
                    await _db.SaveChangesAsync();
                    user.DoctorProfileId = doctor.Id;
                }

                await _db.SaveChangesAsync();
            }
            else
            {
                // Existing user — update Google info
                user.GoogleId ??= payload.Subject;
                user.ProfilePictureUrl ??= payload.Picture;
                if (payload.EmailVerified) user.IsEmailVerified = true;
            }

            // Generate tokens
            var accessToken = _jwt.GenerateAccessToken(user);
            var refreshToken = _jwt.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = _jwt.GetRefreshTokenExpiry();
            await _db.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsEmailVerified = user.IsEmailVerified,
                DoctorProfileId = user.DoctorProfileId,
                PatientProfileId = user.PatientProfileId,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

        // ──────────────────────────────────────
        // POST /api/auth/refresh
        // ──────────────────────────────────────
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(
                u => u.RefreshToken == dto.RefreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                return Unauthorized(new { message = "Invalid or expired refresh token." });

            var accessToken = _jwt.GenerateAccessToken(user);
            var newRefreshToken = _jwt.GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = _jwt.GetRefreshTokenExpiry();
            await _db.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsEmailVerified = user.IsEmailVerified,
                DoctorProfileId = user.DoctorProfileId,
                PatientProfileId = user.PatientProfileId,
                AccessToken = accessToken,
                RefreshToken = newRefreshToken
            });
        }

        // ──────────────────────────────────────
        // GET /api/auth/verify-email?token=xxx
        // ──────────────────────────────────────
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Token is required." });

            var user = await _db.Users.FirstOrDefaultAsync(
                u => u.EmailVerificationToken == token);

            if (user == null)
                return BadRequest(new { message = "Invalid verification token." });

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully!" });
        }

        // ──────────────────────────────────────
        // GET /api/auth/me
        // ──────────────────────────────────────
        [HttpGet("me")]
        [RoleAuthorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid token." });

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(new UserProfileDto
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Phone = user.Phone,
                ProfilePictureUrl = user.ProfilePictureUrl,
                IsEmailVerified = user.IsEmailVerified,
                DoctorProfileId = user.DoctorProfileId,
                PatientProfileId = user.PatientProfileId,
                CreatedAt = user.CreatedAt
            });
        }

        // ──────────────────────────────────────
        // POST /api/auth/logout
        // ──────────────────────────────────────
        [HttpPost("logout")]
        [RoleAuthorize]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && int.TryParse(userIdClaim, out var userId))
            {
                var user = await _db.Users.FindAsync(userId);
                if (user != null)
                {
                    user.RefreshToken = null;
                    user.RefreshTokenExpiry = null;
                    await _db.SaveChangesAsync();
                }
            }
            return Ok(new { message = "Logged out successfully." });
        }

        // ──────────────────────────────────────
        // POST /api/auth/change-password
        // ──────────────────────────────────────
        [HttpPost("change-password")]
        [RoleAuthorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid token." });

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Incorrect current password." });

            // Hash new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }

        // ── Helpers ──
        private static string GenerateSecureToken()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }
    }
}
