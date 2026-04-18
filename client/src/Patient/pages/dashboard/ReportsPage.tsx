import { useState, useEffect } from "react";
import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import { 
  Download, 
  FileText, 
  FlaskConical, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Filter
} from "lucide-react";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

interface LabReport {
  id: number;
  testName: string;
  category: string;
  createdAt: string;
  reportFilePath: string | null;
  isCompleted: boolean;
  isApproved: boolean;
}

const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/reports`)
      .then(res => res.json())
      .then(data => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports:", err);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  const filteredReports = reports.filter(rep => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return rep.isCompleted && rep.isApproved;
    if (activeTab === "pending") return !rep.isCompleted || !rep.isApproved;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse text-lg font-medium">Loading medical reports...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnostic Reports</h1>
          <p className="text-muted-foreground mt-1">Access your laboratory results, ultrasound scans, and clinical findings.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-accent/5 space-y-6">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["all", "completed", "pending"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border shrink-0",
                    activeTab === tab 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {tab} Reports
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
           {filteredReports.length > 0 ? (
             filteredReports.map((report) => (
               <div key={report.id} className="relative bg-background rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                 {/* Status Indicator */}
                 <div className={cn(
                   "absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest",
                   report.isCompleted && report.isApproved ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                 )}>
                   {report.isCompleted && report.isApproved ? "Ready" : "In Progress"}
                 </div>

                 <div className="flex items-start gap-4 mb-6 pt-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                       <FlaskConical className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                       <h3 className="font-bold text-foreground leading-tight">{report.testName}</h3>
                       <p className="text-xs text-muted-foreground mt-1">{report.category}</p>
                    </div>
                 </div>

                 <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Clock className="h-3.5 w-3.5" />
                       Ordered: {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <CheckCircle2 className={cn("h-3.5 w-3.5", report.isCompleted ? "text-emerald-500" : "text-muted")} />
                       {report.isCompleted ? "Process Complete" : "Pending Processing"}
                    </div>
                 </div>

                 <div className="flex gap-2">
                    {report.reportFilePath ? (
                      <>
                        <Button variant="default" className="flex-1 gradient-primary text-primary-foreground h-10 rounded-xl" asChild>
                           <a href={report.reportFilePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              <Download className="h-4 w-4" /> Download
                           </a>
                        </Button>
                        <Button variant="outline" className="h-10 w-10 rounded-xl border-border" asChild>
                           <a href={report.reportFilePath} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                           </a>
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" disabled className="w-full h-10 rounded-xl border-dashed border-border opacity-60">
                        <Clock className="mr-2 h-4 w-4" /> Processing Report
                      </Button>
                    )}
                 </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-muted-foreground">Empty Vault</h3>
                <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">Reports appear here as soon as they are approved by the medical officer.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
