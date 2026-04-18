import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Scan,
  Search,
  Upload,
  Calendar,
  User,
  Activity,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface UltrasoundRecord {
  id: number;
  patientName: string;
  patientMRN: string;
  testName: string;
  doctorName: string;
  reportedAt: string;
  reportFilePath: string;
  isApproved: boolean;
}

export default function Ultrasound() {
  const [records, setRecords] = useState<UltrasoundRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUltrasoundRecords();
  }, []);

  const fetchUltrasoundRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laboratory/completed-reports");
      const data = await res.json();
      // Filter for ultrasound tests
      setRecords(data.filter((r: any) => r.testName.toLowerCase().includes("ultrasound")));
    } catch {
      toast.error("Failed to load imaging records");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.patientName.toLowerCase().includes(search.toLowerCase()) || 
    r.patientMRN.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Scan className="h-8 w-8 text-primary" /> Ultrasound & Imaging
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage specialized ultrasound reports and imaging diagnostics.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border/50 rounded-xl h-12 px-6 font-bold shadow-sm">
              <Printer className="h-4 w-4 mr-2" /> Recent Scans
            </Button>
          </div>
        </div>

        {/* Filters Header */}
        <div className="bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-xl">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search by Patient MRN or Name..." 
                 className="pl-10 h-12 rounded-2xl bg-background/50 border-0 shadow-inner font-medium text-lg"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="flex gap-4">
                <Button variant="ghost" className="h-12 px-6 rounded-2xl font-bold gap-2 hover:bg-muted/30 uppercase tracking-widest text-xs">
                    <Calendar className="h-4 w-4" /> Filter Date
                </Button>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {records.length === 0 && !loading ? (
                <div className="lg:col-span-2 bg-card rounded-3xl p-20 text-center italic text-muted-foreground border-2 border-dashed border-border/50">
                    No ultrasound imaging records found in the clinic database.
                </div>
            ) : filteredRecords.map(r => (
                <div key={r.id} className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 p-8 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/10 group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Scan className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-foreground tracking-tight">{r.patientName}</h3>
                                <p className="text-xs font-black text-primary uppercase tracking-widest mt-1 tracking-tighter flex items-center gap-2">
                                   <Badge variant="outline" className="text-[9px] font-black">{r.patientMRN}</Badge>
                                   <span className="opacity-30">|</span>
                                   <span className="text-muted-foreground/60">{r.testName}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <Badge className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest", r.isApproved ? "bg-success text-white" : "bg-warning text-warning-foreground")}>
                                {r.isApproved ? "Approved" : "Pending Approval"}
                            </Badge>
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                               <Clock className="h-3 w-3" /> Reported {r.reportedAt}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-transparent shadow-inner group-hover:bg-white group-hover:border-primary/10 transition-all">
                           <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Radiologist / Doctor</p>
                           <p className="text-sm font-bold text-foreground">Dr. {r.doctorName}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-transparent shadow-inner group-hover:bg-white group-hover:border-primary/10 transition-all">
                           <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Diagnostic System</p>
                           <p className="text-sm font-bold text-foreground">Imaging & Pathology</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-14 rounded-2xl shadow-xl shadow-primary/20 gap-3 group-hover:translate-x-1 transition-all">
                            <FileText className="h-5 w-5" /> View Full Report
                        </Button>
                        <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-muted/50 hover:bg-muted p-0 text-muted-foreground transition-all">
                            <Printer className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
