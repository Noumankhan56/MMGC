import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, Stethoscope, Users, IndianRupee } from "lucide-react";

interface WorkSlot {
  day: string;
  start: string;
  end: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string | null;
  email: string | null;
  status: "Active" | "Inactive";
  isRegistered: boolean;
  totalAppointments: number;
  totalRevenue: number;
  workSchedule: WorkSlot[];
}

const API = "/api/doctors";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    isActive: true,
  });

  const [schedule, setSchedule] = useState<{ day: string; start: string; end: string }[]>(() =>
    DAYS.map(day => ({
      day,
      start: ["Saturday", "Sunday"].includes(day) ? "" : "09:00",
      end: ["Saturday", "Sunday"].includes(day) ? "" : "17:00",
    }))
  );

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Doctor name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      specialization: form.specialization.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      isActive: form.isActive,
      workSchedule: schedule
        .filter(s => s.start && s.end)
        .map(s => ({
          day: s.day,      // <-- FIXED
          start: s.start,  // <-- FIXED
          end: s.end,      // <-- FIXED
        })),
    };

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API}/${editing.id}` : API;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Save failed");
      }

      toast.success(editing ? "Doctor updated successfully!" : "Doctor added successfully!");
      fetchDoctors();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save doctor");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Doctor deleted");
        fetchDoctors();
      } else {
        const msg = await res.text();
        toast.error(msg || "Cannot delete: Doctor has appointments");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", specialization: "", phone: "", email: "", isActive: true });
    setSchedule(
      DAYS.map(day => ({
        day,
        start: ["Saturday", "Sunday"].includes(day) ? "" : "09:00",
        end: ["Saturday", "Sunday"].includes(day) ? "" : "17:00",
      }))
    );
    setOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({
      name: doc.name,
      specialization: doc.specialization,
      phone: doc.phone || "",
      email: doc.email || "",
      isActive: doc.status === "Active",
    });

    const scheduleMap = new Map(doc.workSchedule.map(s => [s.day, s]));
    setSchedule(
      DAYS.map(day => {
        const slot = scheduleMap.get(day);
        return {
          day,
          start: slot?.start || "",
          end: slot?.end || "",
        };
      })
    );
    setOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Doctors Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage doctor profiles and schedules</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Doctor
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-10">
              No doctors found. Click "Add Doctor" to get started.
            </p>
          ) : (
            doctors.map(doc => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        Dr. {doc.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{doc.specialization}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Badge variant={doc.status === "Active" ? "default" : "secondary"}>
                        {doc.status}
                      </Badge>
                      {doc.isRegistered && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                          <Plus className="h-3 w-3" /> Portal Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {doc.totalAppointments}
                      </span>
                      <span className="flex items-center gap-1">
                        <b>$</b> {doc.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(doc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div>
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Dr. Sarah Johnson"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Specialization</Label>
                <Input
                  placeholder="Cardiologist"
                  value={form.specialization}
                  onChange={e => setForm({ ...form, specialization: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={form.isActive ? "Active" : "Inactive"}
                  onChange={e => setForm({ ...form, isActive: e.target.value === "Active" })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <Label>Work Schedule</Label>
                <p className="text-xs text-muted-foreground mb-3">Leave blank for day off</p>
                <div className="space-y-3">
                  {schedule.map((slot, i) => (
                    <div key={slot.day} className="flex items-center gap-3 text-sm">
                      <span className="w-20 font-medium text-muted-foreground">
                        {slot.day.slice(0, 3)}
                      </span>
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={e => {
                          const updated = [...schedule];
                          updated[i].start = e.target.value;
                          setSchedule(updated);
                        }}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={e => {
                          const updated = [...schedule];
                          updated[i].end = e.target.value;
                          setSchedule(updated);
                        }}
                        className="w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editing ? "Update Doctor" : "Create Doctor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
