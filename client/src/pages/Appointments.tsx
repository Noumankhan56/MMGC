import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

interface Patient { id: number; name: string; phone: string; }
interface Doctor { id: number; name: string; }

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  status: string;
  amount: number;
  patient?: Patient;
  doctor?: Doctor;
}

const API_BASE = "/api/appointments";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    status: "Scheduled",
    amount: "500",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    Promise.all([
      fetch(API_BASE).then(r => r.json()),
      fetch("/api/patients").then(r => r.json()),
      fetch("/api/doctors").then(r => r.json()),
    ])
      .then(([appts, pats, docs]) => {
        setAppointments(appts);
        setPatients(pats);
        setDoctors(docs);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setForm({
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
      status: "Scheduled",
      amount: "500",
    });
    setErrors({});
    setEditingId(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.patientId) newErrors.patientId = "Patient is required";
    if (!form.doctorId) newErrors.doctorId = "Doctor is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

// inside handleSubmit()
const payload = {
  patientId: Number(form.patientId),
  doctorId: Number(form.doctorId),
  date: form.date,            // "YYYY-MM-DD" — OK
  time: form.time + ":00",    // send "HH:mm:ss" which maps safely to TimeSpan
  status: form.status,
  amount: Number(form.amount),
};


    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Appointment updated" : "Appointment booked successfully");
        fetchData();
        setOpen(false);
        resetForm();
      } else {
        const err = await res.text();
        if (res.status === 409) toast.error("Doctor already booked at this time");
        else toast.error(err || "Save failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Cancel this appointment?")) return;

    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    toast.success("Appointment canceled");
    fetchData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments Management</h1>
            <p className="text-muted-foreground">Book and manage appointments</p>
          </div>

          <Button onClick={() => { resetForm(); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>

        {/* TABLE */}
        <div className="rounded-lg border">
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
              {appointments.map(appt => (
                <tr key={appt.id} className="border-t">
                  <td className="p-2">{appt.patient?.name}</td>
                  <td className="p-2">{appt.doctor?.name}</td>
                  <td className="p-2">{appt.date}</td>
                  <td className="p-2">{appt.time}</td>
                  <td className="p-2">Rs. {appt.amount}</td>
                  <td className="p-2">{appt.status}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" onClick={() => {
                      setEditingId(appt.id);
                      setForm({
                        patientId: appt.patientId.toString(),
                        doctorId: appt.doctorId.toString(),
                        date: appt.date,
                        time: appt.time,
                        status: appt.status,
                        amount: String(appt.amount),
                      });
                      setOpen(true);
                    }}>
                      Edit
                    </Button>

                    <Button size="sm" variant="destructive"
                      onClick={() => handleDelete(appt.id)}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FORM DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "New"} Appointment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              {/* PATIENT / DOCTOR */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient *</Label>
                  <Select value={form.patientId} onValueChange={v => setForm({ ...form, patientId: v })}>
                    <SelectTrigger className={errors.patientId && "border-red-500"}>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} ({p.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Doctor *</Label>
                  <Select value={form.doctorId} onValueChange={v => setForm({ ...form, doctorId: v })}>
                    <SelectTrigger className={errors.doctorId && "border-red-500"}>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* DATE TIME */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>

                <div>
                  <Label>Time *</Label>
                  <Input type="time" value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>

              {/* AMOUNT + STATUS */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Consultation Fee (Rs.)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                <div className="self-end">
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Update Appointment" : "Book Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
