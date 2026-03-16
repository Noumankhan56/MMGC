import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import { Input } from "@/Patient/components/ui/input";
import { Label } from "@/Patient/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Patient/components/ui/select";
import { Calendar, Clock, Plus, Stethoscope, FlaskConical, Microscope, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const appointments = [
  { id: 1, doctor: "Dr. Sarah Ahmed", service: "Consultation", date: "2026-03-05", time: "10:00 AM", status: "approved" as const },
  { id: 2, doctor: "Dr. Kamran Ali", service: "Follow-up", date: "2026-03-12", time: "2:30 PM", status: "pending" as const },
  { id: 3, doctor: "Dr. Fatima Khan", service: "Ultrasound", date: "2026-02-20", time: "11:00 AM", status: "completed" as const },
  { id: 4, doctor: "Dr. Ahmed Hassan", service: "Surgery Consult", date: "2026-02-15", time: "9:00 AM", status: "cancelled" as const },
];

const statusColors: Record<string, string> = {
  approved: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const serviceTypes = [
  { icon: Stethoscope, label: "Doctor Appointment" },
  { icon: FlaskConical, label: "Laboratory Test" },
  { icon: Microscope, label: "Ultrasound" },
  { icon: Heart, label: "Gynaecological Procedure" },
];

const AppointmentsPage = () => {
  const [showBooking, setShowBooking] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Appointment request submitted! You'll receive a confirmation shortly.");
    setShowBooking(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">Book and manage your healthcare appointments</p>
        </div>
        <Button variant="hero" onClick={() => setShowBooking(!showBooking)}>
          <Plus className="h-4 w-4" /> Book New
        </Button>
      </div>

      {/* Booking Form */}
      {showBooking && (
        <form onSubmit={handleBook} className="bg-card rounded-xl p-6 shadow-soft border border-border space-y-5 animate-fade-in">
          <h2 className="font-heading font-semibold text-foreground">New Appointment</h2>

          {/* Service Type Selection */}
          <div>
            <Label className="mb-3 block">Select Service</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {serviceTypes.map((svc) => (
                <label key={svc.label} className="cursor-pointer">
                  <input type="radio" name="service" className="sr-only peer" required />
                  <div className="rounded-xl border-2 border-border p-4 text-center peer-checked:border-primary peer-checked:bg-accent transition-all hover:bg-accent/50">
                    <svc.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                    <span className="text-xs font-medium">{svc.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Doctor</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-sarah">Dr. Sarah Ahmed - Gynaecologist</SelectItem>
                  <SelectItem value="dr-kamran">Dr. Kamran Ali - General Physician</SelectItem>
                  <SelectItem value="dr-fatima">Dr. Fatima Khan - Radiologist</SelectItem>
                  <SelectItem value="dr-ahmed">Dr. Ahmed Hassan - Surgeon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input type="date" required />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select a slot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="9am">9:00 AM</SelectItem>
                  <SelectItem value="10am">10:00 AM</SelectItem>
                  <SelectItem value="11am">11:00 AM</SelectItem>
                  <SelectItem value="2pm">2:00 PM</SelectItem>
                  <SelectItem value="3pm">3:00 PM</SelectItem>
                  <SelectItem value="4pm">4:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input placeholder="Any special requests or symptoms..." />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="hero" type="submit">Submit Booking</Button>
            <Button variant="outline" type="button" onClick={() => setShowBooking(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Appointments List */}
      <div className="bg-card rounded-xl shadow-soft border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Doctor</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Service</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Date & Time</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="p-4 font-medium text-sm text-foreground">{apt.doctor}</td>
                  <td className="p-4 text-sm text-muted-foreground">{apt.service}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> {apt.date}
                      <Clock className="h-3.5 w-3.5 ml-2" /> {apt.time}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[apt.status]}>{apt.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
