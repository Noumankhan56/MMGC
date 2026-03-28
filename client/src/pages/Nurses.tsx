// client/src/pages/Nurses.tsx
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  User
} from "lucide-react";

const API = "/api/nurses";

interface Nurse {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  department: string | null;
  isActive: boolean; // ✅ added
  status: "Active" | "Inactive";
}

export default function Nurses() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Nurse | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
    isActive: true,
  });

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();

      // ✅ FIXED mapping
      setNurses(
        data.map((n: any) => ({
          ...n,
          isActive: n.status === "Active"
        }))
      );

    } catch {
      toast.error("Failed to load nurses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Nurse name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      department: form.department || null,
      isActive: form.isActive,
    };

    const method = editing ? "PUT" : "POST";
    const url = editing ? `${API}/${editing.id}` : API;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success(editing ? "Nurse updated" : "Nurse added");
      fetchNurses();
      setOpen(false);
    } catch {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this nurse?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    toast.success("Nurse deleted");
    fetchNurses();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      department: "",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (n: Nurse) => {
    setEditing(n);

    // ✅ FIXED (no fragile status check)
    setForm({
      name: n.name,
      phone: n.phone || "",
      email: n.email || "",
      department: n.department || "",
      isActive: n.isActive,
    });

    setOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Nurses Management</h1>
            <p className="text-muted-foreground">Manage nursing staff efficiently</p>
          </div>

          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Nurse
          </Button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nurses.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10">
              No nurses found. Click "Add Nurse" to get started.
            </p>
          ) : (
            nurses.map(n => (
              <Card key={n.id} className="hover:shadow-lg transition-shadow">

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-primary" />
                        {n.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {n.department || "General Department"}
                      </p>
                    </div>

                    {/* ✅ FIXED Badge */}
                    <Badge variant={n.isActive ? "default" : "destructive"}>
                      {n.status}
                    </Badge>

                  </div>
                </CardHeader>

                <CardContent className="space-y-3">

                  <div className="text-sm space-y-2">

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {n.phone || "No phone"}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {n.email || "No email"}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {n.department || "Not assigned"}
                    </div>

                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={() => openEdit(n)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(n.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Nurse" : "Add Nurse"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              <div>
                <Label>Name *</Label>
                <Input
                  placeholder="Enter nurse name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="nurse@hospital.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <Label>Department</Label>
                <Input
                  placeholder="Emergency / ICU / OPD"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={form.isActive ? "Active" : "Inactive"}
                  onChange={e => setForm({ ...form, isActive: e.target.value === "Active" })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editing ? "Update Nurse" : "Create Nurse"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
