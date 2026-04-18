import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Activity,
  Search,
  Plus,
  Thermometer,
  Wind,
  Droplets,
  Clock,
  User,
  Heart,
  Save,
  ChevronRight,
  Phone,
  Calendar,
  Hash,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { Label } from "@/Doctor/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Doctor/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface Patient {
  id: number;
  name: string;
  mrNumber: string;
  phone: string;
}

interface VitalRecord {
  id: number;
  bloodPressure: string;
  temperature: number;
  pulse: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  capturedAt: string;
  notes: string;
}

export default function VitalsRecording() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    bloodPressure: "",
    temperature: "",
    pulse: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    notes: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch {
      toast.error("Failed to load patients");
    }
  };

  const fetchVitals = async (patientId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nurses/vitals/${patientId}`);
      const data = await res.json();
      setVitalsHistory(data);
    } catch {
      toast.error("Failed to load vitals history");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    fetchVitals(p.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const res = await fetch("/api/nurses/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          nurseId: 1, // Mock current nurse
          bloodPressure: formData.bloodPressure,
          temperature: parseFloat(formData.temperature),
          pulse: parseInt(formData.pulse),
          respiratoryRate: parseInt(formData.respiratoryRate),
          oxygenSaturation: parseInt(formData.oxygenSaturation),
          notes: formData.notes,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Vitals recorded successfully");
      setIsModalOpen(false);
      fetchVitals(selectedPatient.id);
      setFormData({
        bloodPressure: "",
        temperature: "",
        pulse: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        notes: "",
      });
    } catch {
      toast.error("Failed to record vitals");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.mrNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-120px)] overflow-hidden">
        {/* Patient Selection (1/3) */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 flex flex-col overflow-hidden">
           <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                 <User className="h-5 w-5 text-primary" /> Select Patient
              </h2>
              <div className="relative mt-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search name or MRN..." 
                   className="pl-10 rounded-xl bg-muted/40 border-0 shadow-inner"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPatient(p)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all duration-300 border-2",
                    selectedPatient?.id === p.id 
                      ? "bg-primary/5 border-primary ring-4 ring-primary/5" 
                      : "bg-white border-transparent hover:bg-muted/40"
                  )}
                >
                  <p className="font-bold text-foreground leading-tight tracking-tight">{p.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                     <Badge variant="outline" className="text-[10px] font-black tracking-widest">{p.mrNumber}</Badge>
                     {selectedPatient?.id === p.id && <ChevronRight className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* Vitals Dashboard (2/3) */}
        <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
            {!selectedPatient ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-3xl border border-border/50 border-dashed animate-in fade-in duration-700">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                     <Activity className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold text-muted-foreground">No Patient Selected</h3>
                  <p className="text-sm text-muted-foreground/60">Choose a patient from the left to record or view vitals history.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-6">
                 {/* Header Info */}
                 <div className="bg-primary p-8 rounded-3xl text-white shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Recording History For</p>
                          <h2 className="text-3xl font-extrabold tracking-tight">{selectedPatient.name}</h2>
                          <p className="text-sm font-medium text-white/80 mt-1 flex items-center gap-2">
                             <Hash className="h-3 w-3" /> {selectedPatient.mrNumber} 
                             <span className="opacity-40">|</span>
                             <Phone className="h-3 w-3" /> {selectedPatient.phone}
                          </p>
                       </div>
                       <Button 
                         onClick={() => setIsModalOpen(true)}
                         className="bg-white text-primary hover:bg-white/90 h-12 px-6 rounded-2xl font-bold shadow-xl shadow-black/10"
                       >
                         <Plus className="h-5 w-5 mr-2" /> New Vitals Record
                       </Button>
                    </div>
                    {/* Background abstract decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                 </div>

                 {/* History Cards */}
                 <div className="flex-1 bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 overflow-hidden flex flex-col">
                    <div className="p-6 bg-muted/20 border-b border-border/50 flex items-center justify-between">
                       <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Vitals History
                       </h3>
                       <Badge variant="outline" className="rounded-xl font-bold">{vitalsHistory.length} Checks</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                       {loading ? (
                         <div className="p-20 text-center italic text-muted-foreground">Loading patient history...</div>
                       ) : vitalsHistory.length === 0 ? (
                         <div className="text-center p-20 text-muted-foreground italic">No vitals recorded for this patient yet.</div>
                       ) : (
                         vitalsHistory.map((v) => (
                           <div key={v.id} className="p-6 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300">
                             <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                                <div className="flex items-center gap-3 text-muted-foreground font-bold text-xs uppercase tracking-tighter">
                                   <Calendar className="h-4 w-4" /> 
                                   <span>{new Date(v.capturedAt).toLocaleString()}</span>
                                </div>
                                <Activity className="h-5 w-5 text-primary opacity-40" />
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black text-muted-foreground uppercase">Blood Pressure</Label>
                                   <div className="font-black text-lg text-foreground flex items-center gap-2">
                                      <Activity className="h-4 w-4 text-destructive" /> {v.bloodPressure}
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black text-muted-foreground uppercase">Temp</Label>
                                   <div className="font-black text-lg text-foreground flex items-center gap-2">
                                      <Thermometer className="h-4 w-4 text-warning" /> {v.temperature}°C
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black text-muted-foreground uppercase">Pulse</Label>
                                   <div className="font-black text-lg text-foreground flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-primary" /> {v.pulse} bpm
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black text-muted-foreground uppercase">Resp. Rate</Label>
                                   <div className="font-black text-lg text-foreground flex items-center gap-2">
                                      <Wind className="h-4 w-4 text-info" /> {v.respiratoryRate}/m
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-black text-muted-foreground uppercase">O2 Sat</Label>
                                   <div className="font-black text-lg text-foreground flex items-center gap-2">
                                      <Droplets className="h-4 w-4 text-success" /> {v.oxygenSaturation}%
                                   </div>
                                </div>
                             </div>
                             {v.notes && (
                               <div className="mt-4 pt-4 border-t border-border/20 text-sm text-muted-foreground italic font-medium leading-relaxed">
                                  "{v.notes}"
                               </div>
                             )}
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* Recording Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
           <DialogHeader className="p-8 bg-primary text-white">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                 <Activity className="h-6 w-6" /> Record New Vitals
              </DialogTitle>
              <p className="text-primary-foreground/70 text-sm">Update {selectedPatient?.name}'s current stability status</p>
           </DialogHeader>
           
           <form onSubmit={handleSubmit} className="p-8 bg-white">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">BP (mmHg)</Label>
                    <Input 
                      placeholder="120/80" 
                      required
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                      className="h-12 rounded-xl bg-muted/30 border-0 shadow-inner font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Temp (°C)</Label>
                    <Input 
                      placeholder="37.0" 
                      type="number" step="0.1" 
                      required
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      className="h-12 rounded-xl bg-muted/30 border-0 shadow-inner font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Pulse (BPM)</Label>
                    <Input 
                      placeholder="72" 
                      type="number" 
                      required
                      value={formData.pulse}
                      onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                      className="h-12 rounded-xl bg-muted/30 border-0 shadow-inner font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">O2 Sat (%)</Label>
                    <Input 
                      placeholder="98" 
                      type="number" 
                      required
                      value={formData.oxygenSaturation}
                      onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                      className="h-12 rounded-xl bg-muted/30 border-0 shadow-inner font-bold"
                    />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nursing Notes</Label>
                    <Input 
                      placeholder="Observations about the patient's current state..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="h-12 rounded-xl bg-muted/30 border-0 shadow-inner font-medium"
                    />
                 </div>
              </div>

              <DialogFooter className="mt-8 gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="h-12 px-6 rounded-xl font-bold">
                    Cancel
                 </Button>
                 <Button type="submit" className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 gap-2">
                    <Save className="h-5 w-5" /> Save Vitals Record
                 </Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

