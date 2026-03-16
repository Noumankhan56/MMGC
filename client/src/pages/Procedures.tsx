import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope, FileText, Upload, Calendar, DollarSign, Trash2, Eye, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const procedureTypes = [
  "Normal Delivery",
  "C-Section",
  "Ultrasound",
  "Minor Surgery",
  "Major Surgery",
  "Dressing",
  "Stitching",
  "IV Cannulation",
  "Catheterization",
];

interface Patient {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
}

interface Nurse {
  id: number;
  name: string;
}

interface Procedure {
  id: number;
  procedureType: string;
  patientName: string;
  doctorName?: string;
  nurseName?: string;
  amount: number;
  invoiceId: number;
  reportAvailable: boolean;
  performedAt: string;
  treatmentNotes?: string;
  prescription?: string;
  status: string;
  reportFilePath?: string;
}

interface ProcedureStats {
  totalProcedures: number;
  thisMonth: number;
  totalRevenue: number;
  reportsUploaded: number;
}

const API_BASE = "/api/procedures";

const Procedures = () => {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProcedureId, setSelectedProcedureId] = useState<number | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [recentProcedures, setRecentProcedures] = useState<Procedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [stats, setStats] = useState<ProcedureStats>({
    totalProcedures: 0,
    thisMonth: 0,
    totalRevenue: 0,
    reportsUploaded: 0,
  });

  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedNurse, setSelectedNurse] = useState<string>("");
  const [procedureType, setProcedureType] = useState<string>("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [fee, setFee] = useState<number>(250);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchNurses();
    fetchProcedures();
    fetchStats();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get("/api/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("/api/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchNurses = async () => {
    try {
      const res = await axios.get("/api/nurses");
      setNurses(res.data);
    } catch (err) {
      console.error("Error fetching nurses:", err);
    }
  };

  const fetchProcedures = async () => {
    try {
      const res = await axios.get(`${API_BASE}`);
      setRecentProcedures(res.data);
    } catch (err) {
      console.error("Error fetching procedures:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const resetForm = () => {
    setSelectedPatient("");
    setSelectedDoctor("");
    setSelectedNurse("");
    setProcedureType("");
    setTreatmentNotes("");
    setPrescription("");
    setFee(250);
    setReportFile(null);
    setEditMode(false);
    setSelectedProcedureId(null);
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !procedureType) {
      toast.error("Patient & Procedure Type are required.");
      return;
    }

    const formData = new FormData();
    formData.append("PatientId", selectedPatient);
    if (selectedDoctor) formData.append("DoctorId", selectedDoctor);
    if (selectedNurse) formData.append("NurseId", selectedNurse);
    formData.append("ProcedureType", procedureType);
    formData.append("TreatmentNotes", treatmentNotes);
    formData.append("Prescription", prescription);
    formData.append("Amount", fee.toString());
    if (reportFile) formData.append("reportFile", reportFile);

    setLoading(true);
    try {
      if (editMode && selectedProcedureId) {
        await axios.put(`${API_BASE}/${selectedProcedureId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Procedure updated successfully!");
      } else {
        await axios.post(`${API_BASE}/record`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Procedure recorded & invoice generated!");
      }
      setOpen(false);
      resetForm();
      fetchProcedures();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving procedure");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: number) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      setSelectedProcedure(res.data);
      setViewOpen(true);
    } catch (err) {
      toast.error("Error loading procedure details");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      const proc = res.data;
      
      // Find patient, doctor, nurse IDs from the names
      const patient = patients.find(p => p.name === proc.patientName);
      const doctor = doctors.find(d => d.name === proc.doctorName);
      const nurse = nurses.find(n => n.name === proc.nurseName);

      setSelectedPatient(patient?.id.toString() || "");
      setSelectedDoctor(doctor?.id.toString() || "");
      setSelectedNurse(nurse?.id.toString() || "");
      setProcedureType(proc.procedureType);
      setTreatmentNotes(proc.treatmentNotes || "");
      setPrescription(proc.prescription || "");
      setFee(proc.amount);
      setEditMode(true);
      setSelectedProcedureId(id);
      setOpen(true);
    } catch (err) {
      toast.error("Error loading procedure for editing");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this procedure?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      toast.success("Procedure deleted successfully");
      fetchProcedures();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting procedure");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Procedures & Treatments
            </h1>
            <p className="mt-1 text-muted-foreground">
              Record procedures, assign medical team, add notes, upload reports & auto-invoice
            </p>
          </div>
          <Button onClick={() => { resetForm(); setOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Record Procedure
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Procedures</CardTitle>
              <Stethoscope className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProcedures}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reports Uploaded</CardTitle>
              <Upload className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reportsUploaded}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Procedures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Patient</th>
                    <th className="p-3 text-left font-medium">Procedure</th>
                    <th className="p-3 text-left font-medium">Doctor</th>
                    <th className="p-3 text-left font-medium">Nurse</th>
                    <th className="p-3 text-left font-medium">Fee</th>
                    <th className="p-3 text-left font-medium">Invoice</th>
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-left font-medium">Report</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProcedures.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No procedures recorded yet. Click "Record Procedure" to get started.
                      </td>
                    </tr>
                  ) : (
                    recentProcedures.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{p.patientName}</td>
                        <td className="p-3">{p.procedureType}</td>
                        <td className="p-3">{p.doctorName || "-"}</td>
                        <td className="p-3">{p.nurseName || "-"}</td>
                        <td className="p-3">${p.amount.toFixed(2)}</td>
                        <td className="p-3">
                          <Badge variant="outline">#{p.invoiceId}</Badge>
                        </td>
                        <td className="p-3 text-sm">{p.performedAt}</td>
                        <td className="p-3">{p.reportAvailable ? "✅" : "-"}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(p.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(p.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(p.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Record/Edit Procedure Dialog */}
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editMode ? "Edit Medical Procedure" : "Record New Medical Procedure"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Fill out procedure details, assign medical team, upload reports, and generate invoice.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Procedure Type *</Label>
                  <Select value={procedureType} onValueChange={setProcedureType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select procedure" />
                    </SelectTrigger>
                    <SelectContent>
                      {procedureTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assigned Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign doctor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned Nurse</Label>
                  <Select value={selectedNurse} onValueChange={setSelectedNurse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign nurse (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {nurses.map((n) => (
                        <SelectItem key={n.id} value={n.id.toString()}>
                          {n.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Treatment Notes</Label>
                <Textarea
                  rows={4}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder="Clinical findings, observations, treatment details..."
                />
              </div>

              <div>
                <Label>Prescription</Label>
                <Textarea
                  rows={4}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Medications, dosage, instructions..."
                />
              </div>

              <div>
                <Label>Upload Medical Report</Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                />
                {reportFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {reportFile.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Procedure Fee ($)</Label>
                  <Input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="pt-6">
                  <Badge variant="default">Auto Invoice on Save</Badge>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button className="gap-2" onClick={handleSubmit} disabled={loading}>
                  <FileText className="w-4 h-4" />
                  {loading ? "Saving..." : editMode ? "Update Procedure" : "Save & Generate Invoice"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Procedure Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Procedure Details</DialogTitle>
            </DialogHeader>
            {selectedProcedure && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Patient</Label>
                    <p className="font-medium">{selectedProcedure.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Procedure Type</Label>
                    <p className="font-medium">{selectedProcedure.procedureType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Doctor</Label>
                    <p className="font-medium">{selectedProcedure.doctorName || "Not assigned"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nurse</Label>
                    <p className="font-medium">{selectedProcedure.nurseName || "Not assigned"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fee</Label>
                    <p className="font-medium">${selectedProcedure.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Invoice ID</Label>
                    <Badge variant="outline">#{selectedProcedure.invoiceId}</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Performed At</Label>
                    <p className="font-medium">{selectedProcedure.performedAt}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge>{selectedProcedure.status}</Badge>
                  </div>
                </div>

                {selectedProcedure.treatmentNotes && (
                  <div>
                    <Label className="text-muted-foreground">Treatment Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {selectedProcedure.treatmentNotes}
                    </p>
                  </div>
                )}

                {selectedProcedure.prescription && (
                  <div>
                    <Label className="text-muted-foreground">Prescription</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {selectedProcedure.prescription}
                    </p>
                  </div>
                )}

                {selectedProcedure.reportAvailable && selectedProcedure.reportFilePath && (
                  <div>
                    <Label className="text-muted-foreground">Medical Report</Label>
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedProcedure.reportFilePath, "_blank")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Procedures;