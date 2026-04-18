using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace server.Data.Models
{
    [Table("Doctors")]
    public class Doctor
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Specialization { get; set; }

        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }

        [EmailAddress]
        [StringLength(150)]
        public string? Email { get; set; }

        public bool IsActive { get; set; } = true;
        
        [StringLength(50)]
        public string? LicenseNumber { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        public string? Bio { get; set; }

        public string? ProfilePictureUrl { get; set; }

        // Clinic Info
        [StringLength(150)]
        public string? ClinicName { get; set; }

        [StringLength(20)]
        public string? ClinicPhone { get; set; }

        [StringLength(500)]
        public string? ClinicAddress { get; set; }

        [StringLength(200)]
        public string? ClinicTimings { get; set; }

        [Column(TypeName = "numeric")]
        public decimal ConsultationFee { get; set; }

        [Column(TypeName = "numeric")]
        public decimal FollowUpFee { get; set; }

        // Notification Preferences
        public bool EmailAlerts { get; set; } = true;
        public bool SmsAlerts { get; set; } = false;
        public bool AppointmentReminders { get; set; } = true;
        public bool LabResultNotifications { get; set; } = true;
        public bool PatientMessageNotifications { get; set; } = true;
        public bool SystemUpdateNotifications { get; set; } = false;
        
        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? UserAccount { get; set; }

        // This will be stored as JSON in PostgreSQL (owned collection)
        public List<WorkSlot> WorkSchedule { get; set; } = new();

        public virtual List<Appointment> Appointments { get; set; } = new();
    }

    // Owned type - automatically stored as JSON column in PostgreSQL when using Npgsql.EntityFrameworkCore.PostgreSQL
    [Owned]
    public class WorkSlot
    {
        public string Day { get; set; } = "";

        public string Start { get; set; } = "";

        public string End { get; set; } = "";
    }
}