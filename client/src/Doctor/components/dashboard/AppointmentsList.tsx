import { Clock, User, MoreVertical } from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { cn } from "@/Doctor/lib/utils";

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

const appointments: Appointment[] = [
  {
    id: "1",
    patientName: "Priya Sharma",
    time: "09:00 AM",
    type: "OPD Consultation",
    status: "completed",
  },
  {
    id: "2",
    patientName: "Anita Patel",
    time: "10:30 AM",
    type: "Ultrasound",
    status: "in-progress",
  },
  {
    id: "3",
    patientName: "Meera Gupta",
    time: "11:00 AM",
    type: "Follow-up",
    status: "scheduled",
  },
  {
    id: "4",
    patientName: "Kavita Singh",
    time: "11:30 AM",
    type: "Prenatal Checkup",
    status: "scheduled",
  },
  {
    id: "5",
    patientName: "Sunita Verma",
    time: "02:00 PM",
    type: "C-Section Prep",
    status: "scheduled",
  },
];

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  "in-progress": { label: "In Progress", className: "bg-warning/10 text-warning" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

export function AppointmentsList() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-semibold text-foreground">Today's Appointments</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          View All
        </Button>
      </div>
      <div className="divide-y divide-border">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <User className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{appointment.patientName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{appointment.time}</span>
                  <span>•</span>
                  <span>{appointment.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={cn("font-medium", statusConfig[appointment.status].className)}
              >
                {statusConfig[appointment.status].label}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
