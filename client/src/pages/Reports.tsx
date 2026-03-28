import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  Loader2,
  FileText,
  Download,
  Search,
  Calendar,
  DollarSign,
  Activity,
  Users,
  FlaskConical,
  Filter,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  FileIcon,
  Plus,
  Eye,
} from "lucide-react";

/* ────────────────────────────── types ── */

interface Patient { id: number; name: string; mrNumber: string; }

interface ReportRecord {
  id: number;
  title: string;
  reportType: string;
  format: string;
  generatedAt: string;
  downloadUrl: string;
}

interface ReportType {
  id: string;
  name: string;
  type: string;
  icon: string;
}

const API = "/api/reports";

/* ────────────────────────────── component ── */

export default function Reports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [types, setTypes] = useState<ReportType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUrl, setViewUrl] = useState("");
  
  const [form, setForm] = useState({
    title: "Monthly Summary " + new Date().toLocaleDateString(),
    type: "revenue",
    format: "PDF",
    fromDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First of month
    toDate: new Date().toISOString().split('T')[0],
    patientId: "",
  });

  /* ─── data fetching ──────────────────────── */

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reportsRes, typesRes, patientsRes] = await Promise.all([
        fetch(API),
        fetch(`${API}/types`),
        fetch("/api/patients"),
      ]);

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (typesRes.ok) setTypes(await typesRes.json());
      if (patientsRes.ok) setPatients(await patientsRes.json());
    } catch {
      toast.error("Failed to load reporting data");
    } finally {
      setLoading(false);
    }
  };

  const reloadReports = async () => {
    const res = await fetch(API);
    if (res.ok) setReports(await res.json());
  };

  /* ─── Handlers ───────────────────────────── */

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this report? This will also remove the file from the server.")) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Report deleted successfully");
        reloadReports();
      } else {
        toast.error("Failed to delete report");
      }
    } catch {
      toast.error("Network error during deletion");
    }
  };

  const handleGenerate = async () => {
    if (!form.title) {
      toast.error("Please provide a report title");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          format: form.format,
          parameters: {
            fromDate: form.fromDate,
            toDate: form.toDate,
            patientId: form.patientId,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Report generated successfully!");
        setOpen(false);
        reloadReports();
        
        // Auto-download or redirect?
        // window.open(data.downloadUrl, '_blank');
      } else {
        toast.error("Report generation failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGenerating(false);
    }
  };

  /* ─── Helpers ────────────────────────────── */

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "DollarSign": return <DollarSign className="h-5 w-5" />;
      case "Activity": return <Activity className="h-5 w-5" />;
      case "Users": return <Users className="h-5 w-5" />;
      case "FlaskConical": return <FlaskConical className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

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
        {/* Header (FR8.4 export logic here) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileIcon className="h-8 w-8 text-primary" />
              Reporting & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate PDF or Excel summaries for medical, financial, and patient-wise histories
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full md:w-auto shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Generate New Report
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Medical Reports" count={reports.filter(r => r.reportType !== 'revenue').length} icon={<Activity />} color="blue" />
          <StatsCard title="Financial Reports" count={reports.filter(r => r.reportType === 'revenue').length} icon={<DollarSign />} color="emerald" />
          <StatsCard title="This Month" count={reports.length} icon={<Calendar />} color="purple" />
          <StatsCard title="Archived Reports" count="100+" icon={<History />} color="orange" />
        </div>

        {/* Reports Inbox (FR8.1-FR8.4) */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Generated Reports Archive
            </CardTitle>
            <CardDescription>Click on any file to download your generated insight</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="bg-muted/50 border-b">
                   <tr>
                     <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Title / Category</th>
                     <th className="p-4 text-center font-bold text-muted-foreground uppercase text-[10px]">Format</th>
                     <th className="p-4 text-center font-bold text-muted-foreground uppercase text-[10px]">Generated At</th>
                     <th className="p-4 text-right font-bold text-muted-foreground uppercase text-[10px]">Download Link</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {reports.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="p-20 text-center opacity-40">
                           <FileText className="mx-auto h-12 w-12" />
                           <p className="mt-4 font-medium italic">No reports generated yet</p>
                        </td>
                     </tr>
                    ) : (
                      reports.map(r => (
                        <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                             <div className="font-bold flex items-center gap-2">
                               {r.format === 'PDF' ? <FileText className="h-4 w-4 text-red-500" /> : <FileSpreadsheet className="h-4 w-4 text-green-600" />}
                               {r.title}
                             </div>
                             <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{r.reportType}</div>
                          </td>
                          <td className="p-4 text-center">
                             <Badge variant="outline" className={`font-bold border-none text-[10px] ${r.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                               {r.format}
                             </Badge>
                          </td>
                          <td className="p-4 text-center text-muted-foreground font-mono italic">{r.generatedAt}</td>
                          <td className="p-4 text-right">
                             <div className="flex justify-end gap-1">
                                {r.format === 'PDF' && (
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className="h-9 px-3 gap-2 font-bold text-primary border-primary/20 hover:bg-primary/5"
                                     onClick={() => { setViewUrl(r.downloadUrl); setViewOpen(true); }}
                                   >
                                      <Eye className="h-4 w-4" /> View
                                   </Button>
                                )}
                                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 font-bold h-9 bg-muted/30 hover:bg-muted/50" asChild title="Click to download report">
                                  <a href={r.downloadUrl} target="_blank" rel="noreferrer" download>
                                    <Download className="h-4 w-4" /> Download
                                  </a>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0" 
                                  onClick={() => handleDelete(r.id)}
                                  title="Delete Report"
                                >
                                  <Trash2 className="h-4 w-4" />
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

        {/* GENERATOR DIALOG (FR8.1-FR8.4) */}
        <Dialog open={open} onOpenChange={setOpen}>
           <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-8 text-white">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <TrendingUp className="h-7 w-7" /> Generate Detailed Insight
                </DialogTitle>
                <p className="text-primary-foreground/80 mt-1">Configure reporting parameters for clinical or financial summaries</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-sm">Report Title <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="E.g. Monthly Revenue Summary" 
                        className="rounded-xl h-11"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-sm">Report Category</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                               <div className="flex items-center gap-2 font-medium">
                                 {getIcon(t.icon)}
                                 {t.name}
                               </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-sm">Target Format (FR8.4)</Label>
                      <Select value={form.format} onValueChange={(v) => setForm({...form, format: v})}>
                        <SelectTrigger className="rounded-xl h-11 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-bold">
                          <SelectItem value="PDF">PDF (Digital Document)</SelectItem>
                          <SelectItem value="Excel">Excel (Data Spreadsheet)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      {form.type === 'patient-history' ? (
                        <>
                          <Label className="font-bold text-sm">Target Patient (FR8.3)</Label>
                          <Select value={form.patientId} onValueChange={(v) => setForm({...form, patientId: v})}>
                            <SelectTrigger className="rounded-xl h-11">
                              <SelectValue placeholder="Search patient..." />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Label className="font-bold text-sm">Date Range Filter</Label>
                          <div className="flex gap-2">
                             <Input type="date" className="rounded-xl h-11" value={form.fromDate} onChange={(e) => setForm({...form, fromDate: e.target.value})} />
                             <Input type="date" className="rounded-xl h-11" value={form.toDate} onChange={(e) => setForm({...form, toDate: e.target.value})} />
                          </div>
                        </>
                      )}
                   </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl border-2 border-dashed">
                   <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Filter className="h-6 w-6 text-primary" />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm">Advanced Filter Active</h4>
                      <p className="text-xs text-muted-foreground">The report will only aggregate data within selected date boundaries</p>
                   </div>
                </div>
              </div>

              <DialogFooter className="p-8 bg-muted/50">
                 <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Close</Button>
                 <Button onClick={handleGenerate} disabled={generating} className="rounded-xl px-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Insight
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        {/* VIEW PREVIEW DIALOG */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
           <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
              <div className="flex flex-col h-full bg-slate-900">
                 <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold">
                       <FileText className="h-5 w-5 text-red-400" />
                       Report Preview Mode
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                          <a href={viewUrl} download className="flex items-center gap-2">
                             <Download className="h-4 w-4" /> Download Original
                          </a>
                       </Button>
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className="font-bold bg-white text-slate-900"
                         onClick={() => setViewOpen(false)}
                       >
                          Close Preview
                       </Button>
                    </div>
                 </div>
                 <div className="flex-1 bg-white">
                    <iframe 
                      src={`${viewUrl}#toolbar=0`} 
                      className="w-full h-full border-none"
                      title="PDF Preview"
                    />
                 </div>
                 <div className="p-3 bg-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                    Secure Document Viewing System • MMGC Digital Platform
                 </div>
              </div>
           </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}

function StatsCard({ title, count, icon, color }: { title: string, count: number|string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
  };

  return (
    <Card className={`${colorMap[color]} shadow-none border-2 border-dashed`}>
      <CardHeader className="p-4 flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest">{title}</CardTitle>
        <div className="opacity-20">{icon}</div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-3xl font-black">{count}</div>
      </CardContent>
    </Card>
  );
}