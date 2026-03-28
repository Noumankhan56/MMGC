using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Data.Models;
using server.Services;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// 1. Add Services
// ======================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // THIS LINE FIXES EVERYTHING
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        // Optional: Use camelCase if you want (not required)
        // options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<INotificationService, ConsoleNotificationService>();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ======================================================
// 2. Pipeline
// ======================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MMGC API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// ======================================================
// 3. Migrate + Seed
// ======================================================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("Applying migrations...");
        db.Database.Migrate();
        Console.WriteLine("Database migrated successfully!");

        // Your existing seeding code (unchanged)
        var labTests = new[]
        {
            ("Complete Blood Count (CBC)", "Blood", "Full blood panel", 1200m),
            ("Lipid Profile", "Blood", "Cholesterol & triglycerides", 1800m),
            ("Liver Function Test (LFT)", "Blood", "Liver enzymes & function", 2000m),
            ("Kidney Function Test (KFT)", "Blood", "Creatinine, urea, electrolytes", 2200m),
            ("Thyroid Function Test", "Blood", "TSH, T3, T4 levels", 2500m),
            ("HbA1c", "Blood", "Diabetes monitoring", 1500m),
            ("Urine Routine & Microscopy", "Pathology", "Urine analysis", 800m),
            ("Stool Routine", "Pathology", "Stool examination", 900m),
            ("X-Ray Chest PA", "Radiology", "Chest X-ray", 1500m),
            ("Ultrasound Whole Abdomen", "Ultrasound", "Abdominal scan", 3500m),
            ("Ultrasound Obstetrics", "Ultrasound", "Pregnancy scan", 4000m),
            ("ECG", "Cardiology", "Heart rhythm test", 1000m)
        };

        int added = 0;
        foreach (var (name, cat, desc, price) in labTests)
        {
            if (!await db.LabTestTypes.AnyAsync(t => t.Name == name))
            {
                db.LabTestTypes.Add(new LabTestType
                {
                    Name = name,
                    Category = cat,
                    Description = desc,
                    DefaultPrice = price,
                    IsActive = true
                });
                added++;
            }
        }
        if (added > 0) await db.SaveChangesAsync();
        Console.WriteLine(added > 0 ? $"Seeded {added} lab tests." : "Lab tests already exist.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB Error: {ex.Message}\n{ex.StackTrace}");
    }
}

app.Run();