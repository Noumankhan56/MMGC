import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  User,
  Filter,
  MoreVertical,
  Check,
  X,
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

type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "In-Progress"
  | "Completed"
  | "Canceled";

interface ApiAppointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  amount: number;
  patient: {
    id: number;
    name: string;
    phone: string;
  };
  doctor: {
    id: number;
    name: string;
  };
}

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;       // ✅ Added doctorId
  patientName: string;
  phone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  amount: number;
  doctorName: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  Scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  Confirmed: { label: "Confirmed", className: "bg-primary/10 text-primary" },
  "In-Progress": { label: "In Progress", className: "bg-warning/10 text-warning" },
  Completed: { label: "Completed", className: "bg-success/10 text-success" },
  Canceled: { label: "Canceled", className: "bg-destructive/10 text-destructive" },
};

export default function Appointments() {
  const doctorName = "Sarah Williams"; // 🔴 filter for this doctor
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");

      const data: ApiAppointment[] = await res.json();

      const mapped: Appointment[] = data
        .filter((a) => a.doctor?.name === doctorName)
        .map((a) => ({
          id: a.id,
          patientId: a.patientId,
          doctorId: a.doctorId,        // ✅ keep doctorId
          patientName: a.patient?.name || "N/A",
          phone: a.patient?.phone || "N/A",
          date: a.date,
          time: a.time,
          status: a.status,
          amount: a.amount,
          doctorName: a.doctor?.name || "N/A",
        }));

      setAppointments(mapped);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS UPDATE ================= */

  const updateStatus = async (id: number, status: AppointmentStatus) => {
    try {
      const appointment = appointments.find((a) => a.id === id);
      if (!appointment) throw new Error("Appointment not found");

      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId, // ✅ send number
          date: appointment.date,
          time: appointment.time,
          amount: appointment.amount,
          status,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Status updated successfully");
      fetchAppointments();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ================= FILTER ================= */

  const filteredAppointments = appointments.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Appointments for {doctorName}</h1>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In-Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Appointment Table */}
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Patient</th>
                <th className="p-2 text-left">Doctor</th>
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Fee</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="p-4 text-center">Loading...</td>
                </tr>
              )}

              {!loading && filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    No appointments found
                  </td>
                </tr>
              )}

              {filteredAppointments.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.patientName}</td>
                  <td className="p-2">{a.doctorName}</td>
                  <td className="p-2">{a.date}</td>
                  <td className="p-2">{a.time}</td>
                  <td className="p-2">Rs. {a.amount}</td>
                  <td className="p-2">
                    <Badge className={cn(statusConfig[a.status].className)}>
                      {statusConfig[a.status].label}
                    </Badge>
                  </td>
                  <td className="p-2 flex gap-2">
                    {a.status === "Scheduled" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(a.id, "Confirmed")}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, "Canceled")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {a.status === "Confirmed" && (
                      <Button size="sm" onClick={() => updateStatus(a.id, "In-Progress")}>
                        Start
                      </Button>
                    )}
                    {a.status === "In-Progress" && (
                      <Button size="sm" onClick={() => updateStatus(a.id, "Completed")}>
                        Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
