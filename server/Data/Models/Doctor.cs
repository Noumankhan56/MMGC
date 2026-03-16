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