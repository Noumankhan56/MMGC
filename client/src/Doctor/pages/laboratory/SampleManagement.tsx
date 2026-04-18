import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  User,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface SampleRecord {
  id: number;
  patientName: string;
  patientMRN: string;
  testName: string;
  orderedAt: string;
  isUrgent: boolean;
}

export default function SampleManagement() {
  const [pendingSamples, setPendingSamples] = useState<SampleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPendingSamples();
  }, []);

  const fetchPendingSamples = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laboratory/pending-samples");
      const data = await res.json();
      setPendingSamples(data);
    } catch {
      toast.error("Failed to load pending samples");
    } finally {
      setLoading(false);
    }
  };

  const collectSample = async (id: number) => {
    try {
      const res = await fetch(`/api/laboratory/${id}/collect-sample`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();
      toast.success("Sample marked as collected");
      fetchPendingSamples();
    } catch {
      toast.error("Error marking sample collection");
    }
  };

  const filteredSamples = pendingSamples.filter(s => 
    s.patientName.toLowerCase().includes(search.toLowerCase()) || 
    s.testName.toLowerCase().includes(search.toLowerCase()) ||
    s.patientMRN.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-primary" /> Sample Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Book, collect, and track patient test samples for diagnostic services.
            </p>
          </div>
          <div className="flex gap-4 p-4 rounded-2xl bg-warning/5 border border-warning/20">
             <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="text-sm font-bold text-warning-foreground">{pendingSamples.filter(s => s.isUrgent).length} Urgent Samples Pending</span>
             </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-xl">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search by Patient, MRN, or Test ID..." 
                 className="pl-10 h-12 rounded-2xl bg-background/50 border-0 shadow-inner font-medium text-lg ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="flex gap-4">
                <Button variant="ghost" className="h-12 px-6 rounded-2xl font-bold gap-2 hover:bg-muted/30">
                    <Calendar className="h-4 w-4" /> Filter Date
                </Button>
                <Button onClick={fetchPendingSamples} variant="ghost" className="h-12 w-12 rounded-2xl p-0">
                    <Activity className="h-5 w-5" />
                </Button>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-6 bg-muted/20 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Pending Collections</h3>
              <Badge variant="outline" className="rounded-xl font-bold">{pendingSamples.length} To Process</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/10 text-muted-foreground font-bold uppercase tracking-widest text-[10px] border-b border-border">
                <tr>
                  <th className="p-6">Patient Details</th>
                  <th className="p-6">Requested Diagnostics</th>
                  <th className="p-6">Priority / Timeline</th>
                  <th className="p-6 text-center">Collection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-muted-foreground font-medium animate-pulse">
                        Retrieving lab test orders...
                      </td>
                    </tr>
                ) : filteredSamples.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-muted-foreground italic">
                      No samples pending collection.
                    </td>
                  </tr>
                ) : (
                  filteredSamples.map((s) => (
                    <tr key={s.id} className="hover:bg-primary/[0.01] transition-all group border-l-4 border-l-transparent hover:border-l-primary/40">
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-lg">
                               {s.patientName.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-foreground text-base tracking-tight leading-tight">{s.patientName}</p>
                               <p className="text-xs text-muted-foreground font-black uppercase mt-1 tracking-tighter">
                                  <span className="text-primary">{s.patientMRN}</span>
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                               <FlaskConical className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-foreground/80 text-base">{s.testName}</span>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                               {s.isUrgent ? (
                                   <Badge className="bg-destructive text-white rounded-xl text-[9px] font-black uppercase tracking-widest px-3 py-1 animate-pulse">URGENT</Badge>
                               ) : (
                                   <Badge variant="outline" className="rounded-xl text-[9px] font-black uppercase tracking-widest px-3 py-1">NORMAL</Badge>
                               )}
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                               <Clock className="h-3 w-3" /> Ordered {s.orderedAt}
                            </span>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center justify-center">
                            <Button 
                              onClick={() => collectSample(s.id)}
                              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-11 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3"
                            >
                               <Activity className="h-4 w-4" /> Collect Sample
                            </Button>
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
    </MainLayout>
  );
}
