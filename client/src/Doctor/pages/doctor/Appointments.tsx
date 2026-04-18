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
import { useAuth } from "@/Auth/AuthContext";
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
  patientName: string;
  phone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  amount: number;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  Scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  Confirmed: { label: "Confirmed", className: "bg-primary/10 text-primary" },
  "In-Progress": { label: "In Progress", className: "bg-warning/10 text-warning" },
  Completed: { label: "Completed", className: "bg-success/10 text-success" },
  Canceled: { label: "Canceled", className: "bg-destructive/10 text-destructive" },
};

export default function Appointments() {
  const { user } = useAuth();
  const doctorProfileId = user?.doctorProfileId;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [doctorName, setDoctorName] = useState(user?.name || "Doctor");
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    if (doctorProfileId) {
      fetchAppointments();
      fetchDoctorInfo();
    }
  }, [doctorProfileId]);


  const fetchDoctorInfo = async () => {
    try {
      const res = await fetch(`/api/doctors/${doctorProfileId}`);
      if (res.ok) {
        const data = await res.json();
        setDoctorName(data.name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/appointments/${doctorProfileId}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");

      const data = await res.json();
      setAppointments(data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}/status?status=${status}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Appointments for Dr. {doctorName}
            </h1>
            <p className="text-muted-foreground group flex items-center gap-1">
              All appointments
              <Badge variant="outline" className="ml-2 font-normal"></Badge>
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-0 shadow-inner"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] h-10 bg-background/50 border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="In-Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Appointment Table */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-md overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-xs border-b border-border">
                <tr>
                  <th className="p-5">Patient Details</th>
                  <th className="p-5">Schedule</th>
                  <th className="p-5">Fee / Amount</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground animate-pulse">
                      Updating records...
                    </td>
                  </tr>
                )}

                {!loading && filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      No appointments found. Use 'New Appointment' to add one.
                    </td>
                  </tr>
                )}

                {filteredAppointments.map((a) => (
                  <tr key={a.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {a.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{a.patientName}</p>
                          <p className="text-xs text-muted-foreground">{a.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 capitalize">
                      <div className="flex flex-col">
                        <span className="font-medium">{a.date}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Check className="h-3 w-3" /> {a.time}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 font-bold text-foreground">
                      Rs. {a.amount}
                    </td>
                    <td className="p-5">
                      <Badge className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight", statusConfig[a.status].className)}>
                        {statusConfig[a.status].label}
                      </Badge>
                    </td>
                    <td className="p-5 pl-0">
                      <div className="flex items-center justify-center gap-1.5 translate-x-3">
                        {a.status === "Scheduled" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90 text-white h-7 px-3 rounded-lg text-[10px] font-bold shadow-md shadow-success/10"
                              onClick={() => updateStatus(a.id, "Confirmed")}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 rounded-lg text-[10px] font-bold border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => updateStatus(a.id, "Canceled")}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {a.status === "Confirmed" && (
                          <Button
                            size="sm"
                            className="bg-warning hover:bg-warning/80 text-warning-foreground h-8 px-4 rounded-xl shadow-sm text-xs font-bold"
                            onClick={() => updateStatus(a.id, "In-Progress")}
                          >
                            Start Visit
                          </Button>
                        )}
                        {a.status === "In-Progress" && (
                          <Button
                            size="sm"
                            className="bg-primary hover:opacity-90 text-primary-foreground h-8 px-4 rounded-xl shadow-lg shadow-primary/10 text-xs font-bold"
                            onClick={() => updateStatus(a.id, "Completed")}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
