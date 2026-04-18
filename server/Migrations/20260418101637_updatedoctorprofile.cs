using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class updatedoctorprofile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Doctors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AppointmentReminders",
                table: "Doctors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Doctors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicAddress",
                table: "Doctors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicName",
                table: "Doctors",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicPhone",
                table: "Doctors",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicTimings",
                table: "Doctors",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ConsultationFee",
                table: "Doctors",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "EmailAlerts",
                table: "Doctors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "FollowUpFee",
                table: "Doctors",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "LabResultNotifications",
                table: "Doctors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "Doctors",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PatientMessageNotifications",
                table: "Doctors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "Doctors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SmsAlerts",
                table: "Doctors",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SystemUpdateNotifications",
                table: "Doctors",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "AppointmentReminders",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ClinicAddress",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ClinicName",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ClinicPhone",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ClinicTimings",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ConsultationFee",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "EmailAlerts",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "FollowUpFee",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LabResultNotifications",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "PatientMessageNotifications",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "SmsAlerts",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "SystemUpdateNotifications",
                table: "Doctors");
        }
    }
}
