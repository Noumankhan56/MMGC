using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using server.Data.Models;

namespace server.Auth
{
    public class JwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateAccessToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("doctorProfileId", user.DoctorProfileId?.ToString() ?? ""),
                new Claim("patientProfileId", user.PatientProfileId?.ToString() ?? "")
            };

            var expiry = _config["Jwt:ExpiresIn"] ?? "1h";
            var expiresIn = ParseDuration(expiry);

            var token = new JwtSecurityToken(
                issuer: "MMGC",
                audience: "MMGC",
                claims: claims,
                expires: DateTime.UtcNow.Add(expiresIn),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public DateTime GetRefreshTokenExpiry()
        {
            var expiry = _config["Jwt:RefreshExpiresIn"] ?? "7d";
            return DateTime.UtcNow.Add(ParseDuration(expiry));
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));

            var handler = new JwtSecurityTokenHandler();
            try
            {
                return handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = "MMGC",
                    ValidateAudience = true,
                    ValidAudience = "MMGC",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);
            }
            catch
            {
                return null;
            }
        }

        private static TimeSpan ParseDuration(string duration)
        {
            if (duration.EndsWith('h'))
                return TimeSpan.FromHours(int.Parse(duration[..^1]));
            if (duration.EndsWith('d'))
                return TimeSpan.FromDays(int.Parse(duration[..^1]));
            if (duration.EndsWith('m'))
                return TimeSpan.FromMinutes(int.Parse(duration[..^1]));
            return TimeSpan.FromHours(1); // fallback
        }
    }
}
