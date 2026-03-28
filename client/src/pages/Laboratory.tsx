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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  Search,
  Activity,
  User,
  Stethoscope,
  ClipboardList,
  Calendar,
  FileText,
  Link as LinkIcon,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Dna,
  Microscope,
  Radiation,
  Waves,
  Trash2,
} from "lucide-react";

/* ────────────────────────────── types ── */

interface Patient { id: number; name: string; mrNumber: string; }
interface Nurse { id: number; name: string; }
interface TestType { id: number; name: string; category: string; defaultPrice: number; }

interface LabTestRecord {
  id: number;
  patientId: number;
  patientName: string;
  patientMRN: string;
  testName: string;
  category: string;
  orderedAt: string;
  sampleCollectedAt: string | null;
  reportedAt: string | null;
  staffName: string;
  isUrgent: boolean;
  isCompleted: boolean;
  reportFilePath: string | null;
  doctorNotes: string | null;
  reportFindings: string | null;
}

const API = "/api/laboratory";

/* ────────────────────────────── component ── */

export default function Laboratory() {
  const [tests, setTests] = useState<LabTestRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTestRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    testTypeId: "",
    assignedStaffId: "",
    doctorNotes: "",
    isUrgent: false,
  });

  const [reportForm, setReportForm] = useState({
    reportFindings: "",
    reportFilePath: "",
  });

  /* ─── data fetching ──────────────────────── */

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [testRes, patRes, typeRes, nurRes] = await Promise.all([
        fetch(API),
        fetch("/api/patients"),
        fetch(`${API}/types`),
        fetch("/api/nurses"),
      ]);

      if (testRes.ok) setTests(await testRes.json());
      if (patRes.ok) setPatients(await patRes.json());
      if (typeRes.ok) setTestTypes(await typeRes.json());
      if (nurRes.ok) setNurses(await nurRes.json());
    } catch {
      toast.error("Failed to load laboratory data");
    } finally {
      setLoading(false);
    }
  };

  const reloadTests = async () => {
    const res = await fetch(API);
    if (res.ok) setTests(await res.json());
  };

  /* ─── Handlers ───────────────────────────── */

  const handleOrderTest = async () => {
    if (!form.patientId || !form.testTypeId) {
      toast.error("Please select both a patient and a test type");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: Number(form.patientId),
          labTestTypeId: Number(form.testTypeId),
          assignedToStaffId: form.assignedStaffId ? Number(form.assignedStaffId) : null,
          doctorNotes: form.doctorNotes,
          isUrgent: form.isUrgent,
        }),
      });

      if (res.ok) {
        toast.success("Lab test ordered successfully");
        setOpen(false);
        reloadTests();
        setForm({ patientId: "", testTypeId: "", assignedStaffId: "", doctorNotes: "", isUrgent: false });
      } else {
        toast.error("Failed to order test");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleCollectSample = async (id: number) => {
    try {
      const res = await fetch(`${API}/${id}/collect-sample`, { method: "PUT" });
      if (res.ok) {
        toast.success("Sample marked as collected");
        reloadTests();
      }
    } catch {
      toast.error("Failed to update sample status");
    }
  };

  const handleUploadReport = async () => {
    if (!selectedTest) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/${selectedTest.id}/upload-report`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });

      if (res.ok) {
        toast.success("Lab report updated successfully");
        setReportOpen(false);
        reloadTests();
        setReportForm({ reportFindings: "", reportFilePath: "" });
      }
    } catch {
      toast.error("Failed to upload report");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this lab test record?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Record deleted");
        reloadTests();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ─── Helpers ────────────────────────────── */

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "blood": return <Dna className="h-4 w-4 text-red-500" />;
      case "radiology": return <Radiation className="h-4 w-4 text-orange-500" />;
      case "pathology": return <Microscope className="h-4 w-4 text-green-500" />;
      case "ultrasound": return <Waves className="h-4 w-4 text-blue-500" />;
      default: return <FlaskConical className="h-4 w-4 text-gray-500" />;
    }
  };

  const filtered = tests.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.patientName?.toLowerCase() ?? "").includes(q) ||
      (t.testName?.toLowerCase() ?? "").includes(q) ||
      (t.patientMRN?.toLowerCase() ?? "").includes(q) ||
      (t.category?.toLowerCase() ?? "").includes(q)
    );
  });

  const activeTests = filtered.filter(t => !t.isCompleted);
  const completedTests = filtered.filter(t => t.isCompleted);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-primary" />
              Laboratory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage test categories, sample bookings, and patient lab results
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full md:w-auto shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Order New Test
          </Button>
        </div>

        {/* Stats & Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">Total Active</p>
                  <p className="text-2xl font-bold">{activeTests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 border-amber-100">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase">Need Sample</p>
                  <p className="text-2xl font-bold">{activeTests.filter(t => !t.sampleCollectedAt).length}</p>
                </div>
                <FlaskConical className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase">Urgent Cases</p>
                  <p className="text-2xl font-bold text-red-600">{activeTests.filter(t => t.isUrgent).length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-600 uppercase">Completed Today</p>
                  <p className="text-2xl font-bold">{completedTests.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by patient, test name, MRN, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl shadow-sm border-2 focus:border-primary/50"
            />
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="active" className="rounded-lg px-8">Active Orders</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-8">Completed Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activeTests.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-muted/20 border-2 border-dashed rounded-3xl">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">No active lab orders</p>
                  </div>
                ) : (
                  activeTests.map((t) => (
                    <Card key={t.id} className="overflow-hidden border-2 hover:border-primary/30 transition-all shadow-sm">
                      <div className="flex h-full">
                        <div className={`w-2 ${t.isUrgent ? 'bg-red-500' : 'bg-blue-400'}`} />
                        <CardContent className="flex-1 p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getCategoryIcon(t.category)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg leading-tight">{t.testName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                    {t.category}
                                  </Badge>
                                  {t.isUrgent && <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-none text-[10px] font-bold">URGENT</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Order Date</p>
                              <p className="text-sm font-medium">{t.orderedAt}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div className="overflow-hidden">
                                <p className="text-xs text-muted-foreground">Patient</p>
                                <p className="text-sm font-bold truncate">{t.patientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <div className="overflow-hidden">
                                <p className="text-xs text-muted-foreground">Staff Assigned</p>
                                <p className="text-sm font-bold truncate text-primary">{t.staffName}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                              {!t.sampleCollectedAt ? (
                                <Button size="sm" onClick={() => handleCollectSample(t.id)} className="bg-amber-600 hover:bg-amber-700">
                                  <FlaskConical className="mr-2 h-4 w-4" /> Collect Sample
                                </Button>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Sample Collected
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => { setSelectedTest(t); setReportOpen(true); }}>
                                <FileText className="mr-2 h-4 w-4" /> Final Report
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              <div className="rounded-2xl border overflow-hidden shadow-sm bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Patient details</th>
                      <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Test Type</th>
                      <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Staff</th>
                      <th className="p-4 text-center font-bold text-muted-foreground uppercase text-[10px]">Completed At</th>
                      <th className="p-4 text-center font-bold text-muted-foreground uppercase text-[10px]">Report</th>
                      <th className="p-4 text-right font-bold text-muted-foreground uppercase text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {completedTests.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <div className="font-bold">{t.patientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{t.patientMRN}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(t.category)}
                            <span className="font-semibold">{t.testName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground italic">{t.staffName}</td>
                        <td className="p-4 text-center">{t.reportedAt}</td>
                        <td className="p-4 text-center">
                          {t.reportFilePath ? (
                            <Button variant="link" asChild className="text-blue-600 h-auto p-0">
                              <a href={t.reportFilePath} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                <LinkIcon className="h-3 w-3" /> View PDF
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Text Record Only</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                           <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {completedTests.length === 0 && (
                  <div className="p-20 text-center opacity-40">
                    <CheckCircle2 className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-medium">No completed reports yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ORDER DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-8 text-white">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Plus className="h-7 w-7" /> Order Lab Investigation
              </DialogTitle>
              <p className="text-primary-foreground/80 mt-1">Book a new test sample and assign it to lab staff</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Patient <span className="text-red-500">*</span></Label>
                  <Select value={form.patientId} onValueChange={(v) => setForm({...form, patientId: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.mrNumber})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Investigation / Test <span className="text-red-500">*</span></Label>
                  <Select value={form.testTypeId} onValueChange={(v) => setForm({...form, testTypeId: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map(t => <SelectItem key={t.id} value={String(t.id)}>[{t.category}] {t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Assign Staff</Label>
                  <Select value={form.assignedStaffId} onValueChange={(v) => setForm({...form, assignedStaffId: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Assign technician/nurse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Auto-Assign Later</SelectItem>
                      {nurses.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input 
                    type="checkbox" 
                    id="urgent" 
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={form.isUrgent}
                    onChange={(e) => setForm({...form, isUrgent: e.target.checked})}
                  />
                  <Label htmlFor="urgent" className="text-sm font-bold text-red-600 cursor-pointer">Mark as Urgent (STAT)</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Specific Doctor Notes</Label>
                <Textarea 
                  placeholder="Reason for test, clinical history, precautions..." 
                  className="rounded-xl min-h-[100px]"
                  value={form.doctorNotes}
                  onChange={(e) => setForm({...form, doctorNotes: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter className="p-8 bg-muted/50">
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleOrderTest} disabled={saving} className="rounded-xl px-10 shadow-lg shadow-primary/20">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Lab Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* REPORT DIALOG */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-purple-600 p-8 text-white">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7" /> Process Lab Results
              </DialogTitle>
              <p className="text-purple-100 mt-1">Finalize findings and upload documentation for {selectedTest?.testName}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Report Findings (FR6.3)</Label>
                <Textarea 
                  placeholder="Detailed observations and clinical findings here..." 
                  className="rounded-xl min-h-[150px]"
                  value={reportForm.reportFindings}
                  onChange={(e) => setReportForm({...reportForm, reportFindings: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Document / Report Link (PDF/Image)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="E.g. https://storage.mmgc.com/report_001.pdf" 
                    className="pl-10 rounded-xl h-11"
                    value={reportForm.reportFilePath}
                    onChange={(e) => setReportForm({...reportForm, reportFilePath: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> Enter the URL where the scanned report is stored
                </p>
              </div>
            </div>

            <DialogFooter className="p-8 bg-muted/50">
              <Button variant="ghost" onClick={() => setReportOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleUploadReport} disabled={saving} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-10 shadow-lg shadow-purple-600/20 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete & Sign Off
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}