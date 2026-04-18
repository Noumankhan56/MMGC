using System.Net;
using System.Net.Mail;

namespace server.Auth
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendVerificationEmailAsync(string toEmail, string userName, string verificationToken)
        {
            var baseUrl = _config["App:BaseUrl"] ?? "http://localhost:5080";
            var verifyUrl = $"{baseUrl}/auth/verify-email?token={Uri.EscapeDataString(verificationToken)}";

            var subject = "Verify your MMGC account";
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Inter', Arial, sans-serif; background: #f0fdfa; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
        .header {{ background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 32px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; font-size: 24px; letter-spacing: -0.5px; }}
        .body {{ padding: 32px; }}
        .body p {{ color: #334155; line-height: 1.6; margin: 0 0 16px; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #0d9488, #14b8a6); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }}
        .footer {{ padding: 20px 32px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 13px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✉️ MMGC Email Verification</h1>
        </div>
        <div class=""body"">
            <p>Hello <strong>{userName}</strong>,</p>
            <p>Thank you for creating your MMGC account! Please verify your email address by clicking the button below:</p>
            <p style=""text-align:center"">
                <a href=""{verifyUrl}"" class=""btn"">Verify My Email</a>
            </p>
            <p style=""font-size:13px;color:#94a3b8"">If the button doesn't work, copy and paste this link:<br/>{verifyUrl}</p>
        </div>
        <div class=""footer"">
            &copy; {DateTime.Now.Year} MMGC — Medical & Gynae Clinic
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody);
        }

        private async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                var host = _config["Email:Host"] ?? "smtp.gmail.com";
                var port = int.Parse(_config["Email:Port"] ?? "587");
                var user = _config["Email:User"] ?? "";
                var pass = _config["Email:Pass"] ?? "";
                var fromName = _config["Email:FromName"] ?? "MMGC";

                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(user, pass),
                    EnableSsl = true
                };

                var message = new MailMessage
                {
                    From = new MailAddress(user, fromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                message.To.Add(to);

                await client.SendMailAsync(message);
                _logger.LogInformation("Verification email sent to {Email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
                // Don't throw — email failure shouldn't block registration
            }
        }
    }
}
