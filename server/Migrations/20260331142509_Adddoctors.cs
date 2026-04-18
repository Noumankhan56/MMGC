using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class Adddoctors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "LabTests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedByDoctorId",
                table: "LabTests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "LabTests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_ApprovedByDoctorId",
                table: "LabTests",
                column: "ApprovedByDoctorId");

            migrationBuilder.AddForeignKey(
                name: "FK_LabTests_Doctors_ApprovedByDoctorId",
                table: "LabTests",
                column: "ApprovedByDoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LabTests_Doctors_ApprovedByDoctorId",
                table: "LabTests");

            migrationBuilder.DropIndex(
                name: "IX_LabTests_ApprovedByDoctorId",
                table: "LabTests");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "LabTests");

            migrationBuilder.DropColumn(
                name: "ApprovedByDoctorId",
                table: "LabTests");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "LabTests");

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                });
        }
    }
}
