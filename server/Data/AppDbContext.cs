using Microsoft.EntityFrameworkCore;
using server.Data.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Doctor> Doctors { get; set; } = null!;
        public DbSet<Patient> Patients { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<Nurse> Nurses { get; set; } = null!;
        public DbSet<LabTest> LabTests { get; set; } = null!;
        public DbSet<LabTestType> LabTestTypes { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;
        public DbSet<Report> Reports { get; set; } = null!;
        public DbSet<Procedure> Procedures { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------------------------
            // USERS
            // -------------------------
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Id).ValueGeneratedOnAdd();
                entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

// -------------------------
// DOCTORS (JSON work schedule)
// -------------------------
modelBuilder.Entity<Doctor>(entity =>
{
    entity.ToTable("Doctors");
    entity.HasKey(d => d.Id);
    entity.Property(d => d.Id).ValueGeneratedOnAdd();
    entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
    entity.Property(d => d.IsActive).HasDefaultValue(true);

    // Correctly map WorkSchedule as JSON owned type
    entity.OwnsMany(d => d.WorkSchedule, ws =>
    {
        ws.ToJson(); // <-- ensures it's stored as a JSON column in PostgreSQL
        ws.Property(w => w.Day).HasMaxLength(20);
        ws.Property(w => w.Start).HasMaxLength(10);
        ws.Property(w => w.End).HasMaxLength(10);
    });

    // Appointments relationship
    entity.HasMany(d => d.Appointments)
          .WithOne(a => a.Doctor)
          .HasForeignKey(a => a.DoctorId)
          .OnDelete(DeleteBehavior.Restrict);
});


            // -------------------------
            // NURSES
            // -------------------------
            modelBuilder.Entity<Nurse>(entity =>
            {
                entity.ToTable("Nurses");
                entity.HasKey(n => n.Id);
                entity.Property(n => n.Id).ValueGeneratedOnAdd();
                entity.Property(n => n.Name).IsRequired().HasMaxLength(100);
            });

            // -------------------------
            // PATIENTS
            // -------------------------
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.ToTable("Patients");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).ValueGeneratedOnAdd();
                entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
                entity.Property(p => p.Phone).HasMaxLength(20);
                entity.Property(p => p.Email).HasMaxLength(150);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasMany(p => p.Appointments)
                      .WithOne(a => a.Patient)
                      .HasForeignKey(a => a.PatientId);

                entity.HasMany(p => p.LabTests)
                      .WithOne(l => l.Patient)
                      .HasForeignKey(l => l.PatientId);
            });

            // -------------------------
            // APPOINTMENTS (UPDATED)
            // -------------------------
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.ToTable("Appointments");
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Id).ValueGeneratedOnAdd();
                entity.Property(a => a.Amount).HasColumnType("numeric(10,2)").HasDefaultValue(0.0m);
                entity.Property(a => a.Status).HasMaxLength(50).HasDefaultValue("Scheduled");
                entity.Property(a => a.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(a => a.Patient)
                      .WithMany(p => p.Appointments)
                      .HasForeignKey(a => a.PatientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Doctor)
                      .WithMany(d => d.Appointments)
                      .HasForeignKey(a => a.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);

                // FIX one-to-one (NO double FK)
                entity.HasOne(a => a.Transaction)
                      .WithOne(t => t.Appointment)
                      .HasForeignKey<Transaction>(t => t.AppointmentId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // -------------------------
            // TRANSACTIONS
            // -------------------------
            // -------------------------
// TRANSACTIONS (UPDATED)
// -------------------------
modelBuilder.Entity<Transaction>(entity =>
{
    entity.ToTable("Transactions");
    entity.HasKey(t => t.Id);

    entity.Property(t => t.Amount).HasColumnType("numeric(12,2)");
    entity.Property(t => t.PaymentMethod).HasMaxLength(50);

    entity.HasOne(t => t.Patient)
          .WithMany()
          .HasForeignKey(t => t.PatientId)
          .OnDelete(DeleteBehavior.SetNull);

    entity.HasOne(t => t.Appointment)
          .WithOne(a => a.Transaction)
          .HasForeignKey<Transaction>(t => t.AppointmentId)
          .OnDelete(DeleteBehavior.SetNull);

    entity.HasOne(t => t.LabTest)
          .WithOne()
          .HasForeignKey<Transaction>(t => t.LabTestId)
          .OnDelete(DeleteBehavior.SetNull);

    entity.HasOne(t => t.Procedure)
          .WithOne()
          .HasForeignKey<Transaction>(t => t.ProcedureId)
          .OnDelete(DeleteBehavior.SetNull);
});

            // -------------------------
            // PROCEDURES
            // -------------------------
            modelBuilder.Entity<Procedure>(entity =>
            {
                entity.ToTable("Procedures");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).ValueGeneratedOnAdd();
                entity.Property(p => p.ProcedureType).IsRequired().HasMaxLength(150);
                entity.Property(p => p.Amount).HasColumnType("numeric(12,2)");
                entity.Property(p => p.PerformedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(p => p.Patient)
                      .WithMany()
                      .HasForeignKey(p => p.PatientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.Doctor)
                      .WithMany()
                      .HasForeignKey(p => p.DoctorId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.Transaction)
                      .WithOne()
                      .HasForeignKey<Procedure>(p => p.TransactionId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // -------------------------
            // LAB TEST TYPES
            // -------------------------
            modelBuilder.Entity<LabTestType>(entity =>
            {
                entity.ToTable("LabTestTypes");
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Id).ValueGeneratedOnAdd();
                entity.Property(t => t.Name).IsRequired().HasMaxLength(100);
                entity.Property(t => t.Category).IsRequired().HasMaxLength(50);
                entity.Property(t => t.DefaultPrice).HasColumnType("numeric(10,2)");
                entity.Property(t => t.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // -------------------------
            // LAB TESTS
            // -------------------------
            modelBuilder.Entity<LabTest>(entity =>
            {
                entity.ToTable("LabTests");
                entity.HasKey(l => l.Id);
                entity.Property(l => l.Id).ValueGeneratedOnAdd();
                entity.Property(l => l.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(l => l.Patient)
                      .WithMany(p => p.LabTests)
                      .HasForeignKey(l => l.PatientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(l => l.TestType)
                      .WithMany()
                      .HasForeignKey(l => l.LabTestTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.AssignedToStaff)
                      .WithMany()
                      .HasForeignKey(l => l.AssignedToStaffId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // -------------------------
            // REPORTS
            // -------------------------
            modelBuilder.Entity<Report>(entity =>
            {
                entity.ToTable("Reports");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Id).ValueGeneratedOnAdd();
                entity.Property(r => r.Title).IsRequired().HasMaxLength(100);
                entity.Property(r => r.ReportType).IsRequired();
                entity.Property(r => r.Format).HasDefaultValue("PDF");
                entity.Property(r => r.GeneratedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(r => r.ParametersJson).HasColumnType("jsonb");

                entity.HasOne(r => r.GeneratedBy)
                      .WithMany()
                      .HasForeignKey(r => r.GeneratedByUserId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Indexes
            modelBuilder.Entity<Appointment>().HasIndex(a => a.CreatedAt);
            modelBuilder.Entity<Transaction>().HasIndex(t => t.PaidAt);
            modelBuilder.Entity<Procedure>().HasIndex(p => p.PerformedAt);
        }
    }
}
