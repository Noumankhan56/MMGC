import { useEffect, useState } from "react";
import { Clock, User, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { cn } from "@/Doctor/lib/utils";
import { useAuth } from "@/Auth/AuthContext";
import { format } from "date-fns";

const statusConfig: any = {
  Scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  "In-Progress": { label: "In Progress", className: "bg-warning/10 text-warning" },
  Completed: { label: "Completed", className: "bg-success/10 text-success" },
  Cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

export function AppointmentsList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.doctorProfileId) {
      fetchTodayAppointments();
    }
  }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(`/api/appointments?doctorId=${user?.doctorProfileId}&date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error("Failed to fetch today's appointments", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="font-bold text-foreground">Today's Appointments</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Schedule</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-bold">
          View All
        </Button>
      </div>
      <div className="divide-y divide-border min-h-[200px]">
        {loading ? (
          <div className="p-10 text-center animate-pulse text-muted-foreground italic">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
             <Calendar className="h-10 w-10 text-muted-foreground/20" />
             <p className="text-muted-foreground italic">No appointments for today.</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="h-5 w-5 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{appointment.patient?.name || "Unknown Patient"}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{appointment.time}</span>
                    <span className="text-muted-foreground/30">|</span>
                    <span className="font-bold text-primary/70">Routine Visit</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={cn("font-bold text-[10px] h-6 px-3", statusConfig[appointment.status]?.className || "bg-muted text-muted-foreground")}
                >
                  {appointment.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

