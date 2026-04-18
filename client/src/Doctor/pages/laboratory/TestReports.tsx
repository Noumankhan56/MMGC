import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  FlaskConical,
  Search,
  Upload,
  Filter,
  FileText,
  User,
  Calendar,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Activity,
  Bell,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Badge } from "@/Doctor/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";
import { UploadReportModal } from "@/Doctor/components/laboratory/UploadReportModal";

interface Report {
  id: number;
  testName: string;
  patientName: string;
  patientMRN: string;
  doctorNotes: string;
  orderedAt: string;
  reportedAt: string | null;
  isCompleted: boolean;
  isApproved: boolean;
  reportFilePath: string | null;
}

export default function TestReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTest, setActiveTest] = useState<{id: number, patientName: string, testName: string} | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laboratory");
      const data = await res.json();
      setReports(data.map((r: any) => ({
        id: r.id,
        testName: r.testName,
        patientName: r.patientName,
        patientMRN: r.patientMRN,
        doctorNotes: r.doctorNotes || "N/A",
        orderedAt: r.orderedAt,
        reportedAt: r.reportedAt,
        isCompleted: r.isCompleted,
        isApproved: r.isApproved || false,
        reportFilePath: r.reportFilePath
      })));
    } catch {
      toast.error("Failed to load laboratory reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      r.testName.toLowerCase().includes(searchLower) || 
      r.patientName.toLowerCase().includes(searchLower) || 
      r.patientMRN.toLowerCase().includes(searchLower);
    
    if (filter === "completed") return matchesSearch && r.isCompleted;
    if (filter === "pending") return matchesSearch && !r.isCompleted;
    return matchesSearch;
  });

  const openUploadModal = (id: number, patientName: string, testName: string) => {
    setActiveTest({ id, patientName, testName });
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-primary" /> Diagnostic Test Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage results, upload findings, and notify doctors.
            </p>
          </div>
          <Button 
            onClick={() => setActiveTest(null)} // Or pick first pending if wanted
            className="bg-primary hover:bg-primary/95 text-primary-foreground h-12 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2"
          >
            <Bell className="h-5 w-5" /> Recent Activity
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Tests", value: reports.length, icon: FlaskConical, color: "text-primary" },
            { label: "Pending Upload", value: reports.filter(r => !r.isCompleted).length, icon: Clock, color: "text-warning" },
            { label: "Completed Today", value: reports.filter(r => r.isCompleted).length, icon: CheckCircle2, color: "text-success" },
            { label: "Doctor Approved", value: reports.filter(r => r.isApproved).length, icon: Activity, color: "text-info" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-3xl border border-border/50 p-6 flex items-center justify-center flex-col transition-all hover:scale-[1.02] shadow-sm shadow-black/5 group">
              <div className="p-3 rounded-2xl bg-muted/30 group-hover:bg-muted/50 mb-3 transition-colors">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-black tracking-tight text-foreground">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm items-center">
            <div className="relative flex-1 w-full max-w-xl group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search by Patient MRN, Name, or Test..." 
                 className="pl-10 h-12 rounded-2xl bg-background/50 border-0 shadow-inner font-medium text-lg ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px] h-12 bg-background/50 border-0 rounded-2xl font-bold shadow-inner">
                   <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl">
                   <SelectItem value="all" className="rounded-xl">All Diagnostics</SelectItem>
                   <SelectItem value="pending" className="rounded-xl">Pending Upload</SelectItem>
                   <SelectItem value="completed" className="rounded-xl">Finalized Reports</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="outline" className="h-12 w-12 rounded-2x p-0 border-border/50">
               <Filter className="h-5 w-5" />
            </Button>
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-[32px] border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground font-black uppercase tracking-widest text-[10px] border-b border-sidebar-border">
                <tr>
                  <th className="p-6">Patient Diagnostics</th>
                  <th className="p-6">Ordered On</th>
                  <th className="p-6">Report File</th>
                  <th className="p-6">Status / Tags</th>
                  <th className="p-6 text-center">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center animate-pulse italic text-muted-foreground">Synchronizing lab logs...</td>
                    </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted-foreground italic">No lab reports matched your current criteria.</td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-primary/[0.01] transition-all group border-l-4 border-l-transparent hover:border-l-primary/40">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl">
                              {report.patientName.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-foreground text-base tracking-tight leading-tight">{report.testName}</p>
                              <p className="text-[10px] font-black uppercase text-muted-foreground mt-1 flex items-center gap-2">
                                 <span className="text-primary">{report.patientMRN}</span>
                                 <span className="opacity-30">|</span>
                                 <span>{report.patientName}</span>
                              </p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col gap-1">
                            <span className="font-bold text-foreground flex items-center gap-2"><Calendar className="h-3 w-3 text-muted-foreground" /> {report.orderedAt}</span>
                            {report.reportedAt && <span className="text-[10px] font-black text-success uppercase tracking-tighter">Uploaded: {report.reportedAt}</span>}
                         </div>
                      </td>
                      <td className="p-6">
                         {report.isCompleted ? (
                           <div className="flex items-center gap-2 text-primary font-bold hover:underline cursor-pointer">
                              <FileText className="h-4 w-4" /> Result.pdf
                           </div>
                         ) : (
                           <span className="text-xs font-bold text-muted-foreground/40 italic">Waiting...</span>
                         )}
                      </td>
                      <td className="p-6 space-y-2">
                         <Badge className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border-2", 
                            report.isCompleted ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30")}>
                            {report.isCompleted ? "Finalized" : "Pending Log"}
                         </Badge>
                         {report.isApproved && (
                           <div className="flex items-center gap-1.5 text-info text-[9px] font-black uppercase ml-1 animate-in fade-in zoom-in slide-in-from-left duration-700">
                             <CheckCircle2 className="h-3 w-3" /> Dr. Approved
                           </div>
                         )}
                      </td>
                      <td className="p-6">
                         <div className="flex items-center justify-center gap-2">
                           {!report.isCompleted ? (
                             <Button 
                               onClick={() => openUploadModal(report.id, report.patientName, report.testName)}
                               className="bg-primary hover:bg-primary/95 text-primary-foreground h-11 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20"
                             >
                                <Upload className="h-4 w-4" /> Upload
                             </Button>
                           ) : (
                             <>
                               <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-xl">
                                  <Eye className="h-5 w-5" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-xl">
                                  <Download className="h-5 w-5" />
                               </Button>
                             </>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeTest && (
        <UploadReportModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchReports}
          testId={activeTest.id}
          patientName={activeTest.patientName}
          testName={activeTest.testName}
        />
      )}
    </MainLayout>
  );
}
