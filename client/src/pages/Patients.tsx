import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, Search, User, Phone, Mail, Calendar, DollarSign } from "lucide-react";

const API = "/api/patients";

interface Patient {
  id: number;
  mrNumber: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  isRegistered: boolean;
  age: number;
  totalVisits: number;
  totalSpent: number;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", dateOfBirth: "", gender: "Male"
  });

  useEffect(() => { fetchPatients(); }, [search]);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API}?search=${search}`);
      const data = await res.json();
      setPatients(data);
    } catch { toast.error("Failed to load patients"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender
    };

    const method = editing ? "PUT" : "POST";
    const url = editing ? `${API}/${editing.id}` : API;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();
      await fetchPatients();
      toast.success(editing ? "Patient updated" : "Patient added");
      setOpen(false);
      setEditing(null);
    } catch { toast.error("Operation failed"); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", phone: "", email: "", dateOfBirth: format(new Date(), "yyyy-MM-dd"), gender: "Male" });
    setOpen(true);
  };

  const openEdit = (p: Patient) => {
    setEditing(p);
    setForm({
      name: p.name,
      phone: p.phone,
      email: p.email,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender
    });
    setOpen(true);
  };

  if (loading) return <Layout><div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients Management</h1>
            <p className="mt-1 text-muted-foreground">View and manage patient records</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Patient</Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, MR number, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(p => (
            <Card key={p.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelected(p)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{p.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{p.mrNumber}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge>{p.gender}</Badge>
                    {p.isRegistered && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Registered
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{p.phone || "No phone"}</span></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{p.email || "No email"}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{p.age} years old</span></div>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>{p.totalVisits} visits</span>
                  <span className="font-medium">${p.totalSpent}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); openEdit(p); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive"
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                        fetch(`${API}/${p.id}`, { method: "DELETE" })
                          .then(async res => {
                            if (res.ok) {
                              toast.success("Patient deleted");
                              fetchPatients();
                            } else {
                              const err = await res.text();
                              toast.error(err || "Failed to delete");
                            }
                          })
                          .catch(() => toast.error("Network error"));
                      }
                    }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Patient</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
              <div><Label>Gender</Label>
                <select className="w-full px-3 py-2 border rounded-md" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}