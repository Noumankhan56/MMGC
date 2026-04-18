import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  User,
  Filter,
  MoreVertical,
  Check,
  X,
  Search,
  Plus,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { cn } from "@/Doctor/lib/utils";
import { toast } from "sonner";
import { AppointmentFormModal } from "@/Doctor/components/doctor/AppointmentFormModal";

type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "In-Progress"
  | "Completed"
  | "Canceled";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  patient: { id: number; name: string; phone: string };
  doctor: { id: number; name: string };
  date: string;
  time: string;
  status: AppointmentStatus;
  amount: number;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  Scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  Confirmed: { label: "Confirmed", className: "bg-primary/10 text-primary border-primary/20" },
  "In-Progress": { label: "In Progress", className: "bg-warning/10 text-warning border-warning/20" },
  Completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
  Canceled: { label: "Canceled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function ReceptionAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ...appointments.find(a => a.id === id),
            status: status 
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments();
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    const searchLower = search.toLowerCase();
    return (
      a.patient.name.toLowerCase().includes(searchLower) ||
      a.doctor.name.toLowerCase().includes(searchLower) ||
      a.patient.phone.includes(search)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Reception Appointments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage patient flow, scheduling, and doctor availability.
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2 h-12 px-6 rounded-xl font-bold"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Schedule New
          </Button>
        </div>

        {/* Filters Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/60 backdrop-blur-md p-5 rounded-3xl border border-border/50 shadow-sm">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Patient, Doctor, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-0 shadow-inner rounded-xl"
            />
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-11 bg-background/50 border-0 rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In-Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-11 border-border/50 rounded-xl gap-2 font-medium">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Appointment Cards / Table */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-widest text-[10px] border-b border-border">
                <tr>
                  <th className="p-6">Patient</th>
                  <th className="p-6">Assigned Doctor</th>
                  <th className="p-6">Schedule Details</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted-foreground italic animate-pulse text-lg">
                      Synchronizing with clinic records...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted-foreground italic text-lg">
                      No matching appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-primary/[0.01] transition-all group border-l-4 border-l-transparent hover:border-l-primary/40">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-lg">
                            {a.patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base tracking-tight">{a.patient.name}</p>
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                              <User className="h-3 w-3" /> {a.patient.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                              <User className="h-4 w-4" />
                           </div>
                           <span className="font-bold text-foreground/80">Dr. {a.doctor.name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5 text-primary" /> {a.date}
                          </span>
                          <span className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" /> {a.time}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge variant="outline" className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2", statusConfig[a.status].className)}>
                          {statusConfig[a.status].label}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {a.status === "Scheduled" && (
                            <Button
                              size="sm"
                              className="bg-primary/95 hover:bg-primary font-bold rounded-xl h-9 px-4 shadow-lg shadow-primary/20"
                              onClick={() => updateStatus(a.id, "Confirmed")}
                            >
                              Confirm
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <X className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AppointmentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAppointments} 
      />
    </MainLayout>
  );
}
