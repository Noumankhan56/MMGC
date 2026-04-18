import { useState, useEffect } from "react";
import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  amount: number;
  doctorName: string;
}

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/appointments`)
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  const filteredAppointments = appointments.filter(apt => {
    if (filter === "all") return true;
    return apt.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
      case "approved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
      case "approved":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "pending":
        return <Clock3 className="h-3 w-3 mr-1" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse text-lg font-medium">Fetching appointments...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your consultations and track booking status.</p>
        </div>
        <Button className="gradient-primary text-primary-foreground h-11 px-6 rounded-xl shadow-lg shadow-primary/20" asChild>
          <Link to="/dashboard/book?type=appointment" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-accent/5">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl w-full md:w-80">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search doctor or date..." className="bg-transparent border-none text-sm focus:ring-0 w-full outline-none" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["all", "pending", "approved", "completed", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                  filter === f 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase font-bold text-muted-foreground bg-accent/10 border-b border-border">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-accent/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={cn("px-3 py-1 font-semibold rounded-full", getStatusColor(apt.status))}>
                        {getStatusIcon(apt.status)}
                        {apt.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {apt.doctorName.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span className="font-bold text-foreground">{apt.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                       <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {new Date(apt.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 mt-1">
                            <Clock className="h-3.5 w-3.5 text-primary/60" />
                            {apt.time}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      Rs. {apt.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-primary px-3 rounded-lg">
                          Details
                       </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    No appointments found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
