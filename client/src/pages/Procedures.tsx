import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
  Activity,
  User,
  Stethoscope,
  ClipboardList,
  Calendar,
  FileText,
  Link as LinkIcon,
  HeartPulse,
  Pill,
  StickyNote,
} from "lucide-react";

/* ────────────────────────────── types ── */

interface Patient {
  id: number;
  name: string;
  mrNumber: string;
}
interface Doctor {
  id: number;
  name: string;
}
interface Nurse {
  id: number;
  name: string;
}

interface ProcedureRecord {
  id: number;
  procedureType: string;
  amount: number;
  performedAt: string;
  patient: { id: number; name: string; mrNumber: string };
  doctor: { id: number; name: string } | null;
  nurse: { id: number; name: string } | null;
  notes: string | null;
  prescription: string | null;
  reportUrl: string | null;
  createdAt: string;
}

const API = "/api/procedures";

/* FR5.1 – common procedure types for quick selection */
const PROCEDURE_TYPES = [
  "Normal Delivery",
  "C-Section",
  "Ultrasound",
  "Surgery",
  "Physical Exam",
  "X-Ray",
  "Blood Test",
  "MRI Scan",
  "CT Scan",
  "ECG",
  "Endoscopy",
  "Biopsy",
  "Vaccination",
  "Dressing / Wound Care",
  "Consultation",
];

/* ────────────────────────────── component ── */

export default function Procedures() {
  const [procedures, setProcedures] = useState<ProcedureRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] =
    useState<ProcedureRecord | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const blankForm = {
    procedureType: "",
    amount: "500",
    patientId: "",
    doctorId: "",
    nurseId: "",
    performedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: "",
    prescription: "",
    reportUrl: "",
  };
  const [form, setForm] = useState(blankForm);

  /* ─── data fetching ──────────────────────── */

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [procRes, patRes, docRes, nurRes] = await Promise.all([
        fetch(API),
        fetch("/api/patients"),
        fetch("/api/doctors"),
        fetch("/api/nurses"),
      ]);

      if (procRes.ok) setProcedures(await procRes.json());
      if (patRes.ok) setPatients(await patRes.json());
      if (docRes.ok) setDoctors(await docRes.json());
      if (nurRes.ok) setNurses(await nurRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const reloadProcedures = async () => {
    try {
      const res = await fetch(API);
      if (res.ok) setProcedures(await res.json());
    } catch {
      toast.error("Failed to refresh procedures");
    }
  };

  /* ─── open / close ───────────────────────── */

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...blankForm,
      performedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    setOpen(true);
  };

  const handleOpenEdit = (p: ProcedureRecord) => {
    setEditingId(p.id);
    setForm({
      procedureType: p.procedureType,
      amount: String(p.amount),
      patientId: String(p.patient.id),
      doctorId: p.doctor ? String(p.doctor.id) : "",
      nurseId: p.nurse ? String(p.nurse.id) : "",
      performedAt: p.performedAt.replace(" ", "T"),
      notes: p.notes || "",
      prescription: p.prescription || "",
      reportUrl: p.reportUrl || "",
    });
    setOpen(true);
  };

  const handleOpenDetail = (p: ProcedureRecord) => {
    setSelectedProcedure(p);
    setDetailOpen(true);
  };

  /* ─── submit (create / update) ─────────── */

  const handleSubmit = async () => {
    if (!form.procedureType.trim()) {
      toast.error("Procedure type is required");
      return;
    }
    if (!form.patientId) {
      toast.error("Patient is required");
      return;
    }
    if (Number(form.amount) < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    const payload = {
      procedureType: form.procedureType.trim(),
      amount: Number(form.amount),
      patientId: Number(form.patientId),
      doctorId:
        form.doctorId && form.doctorId !== "none"
          ? Number(form.doctorId)
          : null,
      nurseId:
        form.nurseId && form.nurseId !== "none" ? Number(form.nurseId) : null,
      performedAt: new Date(form.performedAt).toISOString(),
      notes: form.notes.trim() || null,
      prescription: form.prescription.trim() || null,
      reportUrl: form.reportUrl.trim() || null,
    };

    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/${editingId}` : API;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editingId
            ? "Procedure updated successfully"
            : "Procedure recorded successfully"
        );
        setOpen(false);
        reloadProcedures();
      } else {
        const errText = await res.text();
        toast.error(errText || "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── delete ─────────────────────────────── */

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this procedure record?"))
      return;

    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Procedure deleted");
        reloadProcedures();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  /* ─── filter ─────────────────────────────── */

  const filtered = procedures.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.procedureType.toLowerCase().includes(q) ||
      p.patient.name.toLowerCase().includes(q) ||
      p.patient.mrNumber.toLowerCase().includes(q) ||
      (p.doctor?.name || "").toLowerCase().includes(q)
    );
  });

  /* ─── loading state ──────────────────────── */

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  /* ─── render ──────────────────────────────── */

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* ────────── HEADER ────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Procedures & Treatments
            </h1>
            <p className="text-muted-foreground mt-1">
              Record medical procedures, assign staff, and manage treatment
              documentation
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> New Procedure
          </Button>
        </div>

        {/* ────────── SEARCH BAR ────────── */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by procedure, patient name, MR#, or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <Activity className="h-4 w-4" />
            <span>
              {filtered.length} of {procedures.length} records
            </span>
          </div>
        </div>

        {/* ────────── TABLE ────────── */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Procedure</th>
                <th className="p-3 text-left font-semibold">Patient</th>
                <th className="p-3 text-left font-semibold">Doctor</th>
                <th className="p-3 text-left font-semibold">Nurse</th>
                <th className="p-3 text-center font-semibold">Date</th>
                <th className="p-3 text-right font-semibold">Amount</th>
                <th className="p-3 text-center font-semibold">Info</th>
                <th className="p-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList className="h-10 w-10 text-muted-foreground opacity-40" />
                      <p className="text-lg font-medium text-muted-foreground">
                        No procedure records found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click "New Procedure" to add the first record
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(p)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium">{p.procedureType}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <span className="font-medium">{p.patient.name}</span>
                        <br />
                        <span className="text-xs text-muted-foreground font-mono">
                          {p.patient.mrNumber}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                        {p.doctor ? (
                          p.doctor.name
                        ) : (
                          <span className="text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-green-500" />
                        {p.nurse ? (
                          p.nurse.name
                        ) : (
                          <span className="text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {p.performedAt}
                    </td>
                    <td className="p-3 text-right font-semibold whitespace-nowrap">
                      Rs. {p.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        {p.notes && (
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-0.5"
                          >
                            <StickyNote className="h-3 w-3" /> Notes
                          </Badge>
                        )}
                        {p.reportUrl && (
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-0.5"
                          >
                            <FileText className="h-3 w-3" /> Report
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-2"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ────────── DETAIL DIALOG ────────── */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <HeartPulse className="h-5 w-5 text-primary" />
                Procedure Details
              </DialogTitle>
            </DialogHeader>

            {selectedProcedure && (
              <div className="space-y-5 py-2">
                {/* Procedure info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Procedure Type
                    </span>
                    <p className="font-semibold text-lg mt-1">
                      {selectedProcedure.procedureType}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Amount
                    </span>
                    <p className="font-semibold text-lg mt-1">
                      Rs. {selectedProcedure.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Patient & staff */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Patient
                    </span>
                    <p className="font-medium mt-1">
                      {selectedProcedure.patient.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {selectedProcedure.patient.mrNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Doctor
                    </span>
                    <p className="font-medium mt-1 flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                      {selectedProcedure.doctor?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Nurse
                    </span>
                    <p className="font-medium mt-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-green-500" />
                      {selectedProcedure.nurse?.name || "Not assigned"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Performed At
                    </span>
                    <p className="font-medium">
                      {selectedProcedure.performedAt}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedProcedure.notes && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <StickyNote className="h-4 w-4 text-amber-500" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                        Treatment Notes
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedProcedure.notes}
                    </p>
                  </div>
                )}

                {/* Prescription */}
                {selectedProcedure.prescription && (
                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                        Prescription
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedProcedure.prescription}
                    </p>
                  </div>
                )}

                {/* Report link */}
                {selectedProcedure.reportUrl && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <a
                      href={selectedProcedure.reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline hover:no-underline"
                    >
                      View Uploaded Report
                    </a>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setDetailOpen(false);
                  if (selectedProcedure) handleOpenEdit(selectedProcedure);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ────────── CREATE / EDIT DIALOG ────────── */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                {editingId ? "Edit Procedure Record" : "Record New Procedure"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* ── LEFT: Core Info ── */}
              <div className="space-y-5">
                {/* FR5.1 – Procedure Type */}
                <div className="space-y-2">
                  <Label>
                    Procedure Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={
                      PROCEDURE_TYPES.includes(form.procedureType)
                        ? form.procedureType
                        : "__custom__"
                    }
                    onValueChange={(v) => {
                      if (v !== "__custom__") {
                        setForm({ ...form, procedureType: v });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select procedure type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCEDURE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">
                        Other (type below)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {(!PROCEDURE_TYPES.includes(form.procedureType) ||
                    form.procedureType === "") && (
                    <Input
                      placeholder="Type custom procedure name..."
                      value={
                        PROCEDURE_TYPES.includes(form.procedureType)
                          ? ""
                          : form.procedureType
                      }
                      onChange={(e) =>
                        setForm({ ...form, procedureType: e.target.value })
                      }
                    />
                  )}
                </div>

                {/* Patient */}
                <div className="space-y-2">
                  <Label>
                    Patient <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.patientId}
                    onValueChange={(v) => setForm({ ...form, patientId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} ({p.mrNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FR5.2 – Assign Doctor + Nurse team */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assign Doctor</Label>
                    <Select
                      value={form.doctorId || "none"}
                      onValueChange={(v) =>
                        setForm({ ...form, doctorId: v === "none" ? "" : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Nurse</Label>
                    <Select
                      value={form.nurseId || "none"}
                      onValueChange={(v) =>
                        setForm({ ...form, nurseId: v === "none" ? "" : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {nurses.map((n) => (
                          <SelectItem key={n.id} value={String(n.id)}>
                            {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amount + Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Amount (Rs) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Performed At</Label>
                    <Input
                      type="datetime-local"
                      value={form.performedAt}
                      onChange={(e) =>
                        setForm({ ...form, performedAt: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Clinical Documentation (FR5.3) ── */}
              <div className="space-y-5">
                {/* Treatment Notes */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5 text-amber-500" />
                    Treatment Notes
                  </Label>
                  <Textarea
                    placeholder="Enter observations, clinical findings, procedure notes..."
                    className="min-h-[110px]"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                {/* Prescriptions */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-blue-500" />
                    Prescription
                  </Label>
                  <Textarea
                    placeholder="List medications, dosages, and post-procedure instructions..."
                    className="min-h-[90px]"
                    value={form.prescription}
                    onChange={(e) =>
                      setForm({ ...form, prescription: e.target.value })
                    }
                  />
                </div>

                {/* Report URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-primary" />
                    Report / Document Link
                  </Label>
                  <Input
                    placeholder="Paste URL to uploaded report (Dropbox, Drive, etc.)"
                    value={form.reportUrl}
                    onChange={(e) =>
                      setForm({ ...form, reportUrl: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Update Record" : "Save Procedure"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
