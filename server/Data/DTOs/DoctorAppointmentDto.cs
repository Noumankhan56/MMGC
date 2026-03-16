namespace server.Data.DTOs
{
    public class DoctorAppointmentDto
    {
        public int Id { get; set; }

        public string PatientName { get; set; } = "";
        public string Phone { get; set; } = "";

        public string Date { get; set; } = "";   // yyyy-MM-dd
        public string Time { get; set; } = "";   // HH:mm

        public string Status { get; set; } = "";
        public decimal Amount { get; set; }
    }
}
