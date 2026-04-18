import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Stethoscope,
  Search,
  Plus,
  Clock,
  User,
  Heart,
  Save,
  Activity,
  History,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { Label } from "@/Doctor/components/ui/label";
import { Textarea } from "@/Doctor/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface Procedure {
  id: number;
  procedureType: string;
  patientName: string;
  patientMRN: string;
  doctorName: string;
  performedAt: string;
  status: string;
}

export default function PatientCare() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  
  // Assistance Form
  const [assistanceNote, setAssistanceNote] = useState("");

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/procedures");
      const data = await res.json();
      setProcedures(data.map((p: any) => ({
        id: p.id,
        procedureType: p.procedureType,
        patientName: p.patient.name,
        patientMRN: p.patient.mrNumber,
        doctorName: p.doctor?.name || "N/A",
        performedAt: new Date(p.performedAt).toLocaleString(),
        status: p.status || "Completed"
      })));
    } catch {
      toast.error("Failed to load medical procedures");
    } finally {
      setLoading(false);
    }
  };

  const handleLogAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcedure || !assistanceNote.trim()) return;

    try {
      const res = await fetch("/api/nurses/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: procedures.find(p => p.id === selectedProcedure.id)?.id, // This is simplified for the mock
          nurseId: 1, // Mock current nurse
          noteContent: `Assisted in procedure (${selectedProcedure.procedureType}): ${assistanceNote}`,
          noteType: "Procedure",
          procedureId: selectedProcedure.id
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Procedural assistance logged");
      setAssistanceNote("");
      setSelectedProcedure(null);
    } catch {
      toast.error("Failed to log assistance");
    }
  };

  const filteredProcedures = procedures.filter(p => 
    p.procedureType.toLowerCase().includes(search.toLowerCase()) || 
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientMRN.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-primary" /> Nursing Assistance
            </h1>
            <p className="text-muted-foreground mt-1">
              Assist in surgeries, deliveries, and treatments, and record nursing tasks for each procedure.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm">
            <div className="relative w-full max-w-xl">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Search by Procedure, Patient, or MRN..." 
                 className="pl-10 h-12 rounded-2xl bg-background/50 border-0 shadow-inner font-medium"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Procedure Selection List (2/3) */}
            <div className="lg:col-span-2 space-y-4">
                {loading ? (
                    <div className="bg-card rounded-3xl p-20 text-center animate-pulse italic text-muted-foreground">
                        Fetching medical procedure logs...
                    </div>
                ) : filteredProcedures.length === 0 ? (
                    <div className="bg-card rounded-3xl p-20 text-center italic text-muted-foreground">
                        No procedures found matching your search.
                    </div>
                ) : (
                    filteredProcedures.map(p => (
                        <div key={p.id} className={cn("p-6 rounded-3xl border-2 transition-all cursor-pointer",
                            selectedProcedure?.id === p.id 
                                ? "bg-primary/5 border-primary shadow-xl shadow-primary/5" 
                                : "bg-card border-border/50 hover:border-primary/20 hover:bg-muted/10 shadow-sm")}
                            onClick={() => setSelectedProcedure(p)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground tracking-tight">{p.procedureType}</h3>
                                        <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-border">
                                            <span className="text-sm font-bold text-primary">{p.patientName}</span>
                                            <Badge variant="outline" className="text-[10px] font-black">{p.patientMRN}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <Badge className="bg-success text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl">
                                        {p.status}
                                    </Badge>
                                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {p.performedAt}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/10 flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> Lead: Dr. {p.doctorName}</span>
                                {selectedProcedure?.id === p.id && (
                                     <span className="text-primary flex items-center gap-1.5 ml-auto animate-pulse">
                                         <CheckCircle2 className="h-4 w-4" /> Selected for Logging Assistance
                                     </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Assistance Logging Form (1/3) */}
            <div className="space-y-6">
                {!selectedProcedure ? (
                    <div className="bg-card rounded-3xl border border-border/50 border-dashed p-10 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
                        <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-bold text-muted-foreground">Log Assistance</h4>
                        <p className="text-xs text-muted-foreground/60 max-w-[200px]">Select a procedure from the left to record your assistance notes and clinical tasks.</p>
                    </div>
                ) : (
                    <div className="bg-card rounded-3xl border border-border/50 shadow-2xl p-8 animate-in slide-in-from-right-4 duration-500">
                        <h4 className="text-xl font-black text-foreground mb-1">Logging Assistance</h4>
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-6">Assisting {selectedProcedure.doctorName}</p>
                        
                        <form onSubmit={handleLogAssistance} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Procedural Nursing Tasks</Label>
                                <Textarea 
                                   placeholder="Describe your role, instruments prepared, patient status during treatment, and tasks completed during this procedure..."
                                   className="min-h-[220px] rounded-2xl bg-muted/20 border-0 shadow-inner p-6 text-base font-medium resize-none"
                                   value={assistanceNote}
                                   onChange={(e) => setAssistanceNote(e.target.value)}
                                   required
                                />
                            </div>
                            
                            <Button className="w-full h-14 bg-primary hover:bg-primary/95 text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
                                <Save className="h-5 w-5" /> Log Tasks Complete
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              className="w-full h-12 text-muted-foreground hover:bg-muted/40 font-bold rounded-2xl"
                              onClick={() => setSelectedProcedure(null)}
                            >
                               Cancel Selection
                            </Button>
                        </form>
                    </div>
                )}
                
                {/* Secondary Info Card */}
                <div className="bg-sidebar p-8 rounded-3xl text-white shadow-xl">
                    <h5 className="font-black text-sm tracking-widest uppercase mb-4 opacity-70">Instructional Alert</h5>
                    <p className="text-sm font-medium leading-relaxed">
                        Nurses assist in all major gynaecological procedures and surgeries at MMGC. Ensure you log instruments used and procedural support provided for every file.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
