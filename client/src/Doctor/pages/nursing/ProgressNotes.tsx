import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  FileText,
  Search,
  Plus,
  Clock,
  User,
  Save,
  MessageSquare,
  History,
  Activity,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { Label } from "@/Doctor/components/ui/label";
import { Textarea } from "@/Doctor/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface Patient {
  id: number;
  name: string;
  mrNumber: string;
}

interface Note {
  id: number;
  noteContent: string;
  noteType: string;
  createdAt: string;
  nurse: { name: string };
}

export default function ProgressNotes() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Note Form
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("Progress");

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

  const fetchNotes = async (patientId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nurses/notes/${patientId}`);
      const data = await res.json();
      setNotes(data);
    } catch {
      toast.error("Failed to load progress notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    fetchNotes(p.id);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !noteContent.trim()) return;

    try {
      const res = await fetch("/api/nurses/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          nurseId: 1, // Mock current nurse
          noteContent: noteContent.trim(),
          noteType: noteType,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Progress note added");
      setNoteContent("");
      fetchNotes(selectedPatient.id);
    } catch {
      toast.error("Failed to add note");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.mrNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="grid lg:grid-cols-4 gap-8 h-[calc(100vh-140px)] overflow-hidden">
        {/* Patient Sidebar (1/4) */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden flex flex-col">
           <div className="p-6 border-b border-border/50">
              <h2 className="text-lg font-black tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                 <User className="h-4 w-4" /> Patients
              </h2>
              <div className="relative mt-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                 <Input 
                   placeholder="Search..." 
                   className="pl-9 h-10 rounded-xl bg-muted/40 border-0 shadow-inner text-sm"
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
                    "w-full text-left p-4 rounded-2xl transition-all duration-300",
                    selectedPatient?.id === p.id 
                      ? "bg-primary text-white shadow-xl shadow-primary/30" 
                      : "bg-white hover:bg-muted/50 border border-transparent shadow-sm"
                  )}
                >
                  <p className="font-bold text-sm leading-tight tracking-tight">{p.name}</p>
                  <p className={cn("text-[10px] font-black uppercase mt-1", selectedPatient?.id === p.id ? "text-white/60" : "text-muted-foreground/60")}>
                     {p.mrNumber}
                  </p>
                </button>
              ))}
           </div>
        </div>

        {/* Notes Entry & History (3/4) */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
            {!selectedPatient ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-[3rem] border border-border border-dashed">
                  <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                     <FileText className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">Select a Patient</h3>
                  <p className="text-muted-foreground/60 mt-2 max-w-xs text-center">Please choose a patient to view or record nursing progress notes and treatment updates.</p>
               </div>
            ) : (
               <>
                 {/* New Note Entry */}
                 <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-8 animate-in slide-in-from-top-6 duration-500">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                          <MessageSquare className="h-6 w-6 text-primary" /> Record Progress Note
                       </h3>
                       <div className="flex items-center gap-3">
                          <Label className="text-xs font-bold text-muted-foreground uppercase">Note Category</Label>
                          <Select value={noteType} onValueChange={setNoteType}>
                             <SelectTrigger className="w-[180px] h-10 rounded-xl bg-muted/40 border-0 shadow-inner font-bold">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl">
                                <SelectItem value="Progress">General Progress</SelectItem>
                                <SelectItem value="Procedure">Procedure Update</SelectItem>
                                <SelectItem value="Emergency">Urgent Note</SelectItem>
                                <SelectItem value="Observation">Special Observation</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                    
                    <form onSubmit={handleAddNote} className="space-y-4">
                       <Textarea 
                         placeholder="Describe the patient's state, treatments administered, surgery assistance notes, or general health progress during hospitalization (FR12.3)..."
                         className="min-h-[120px] rounded-2xl bg-muted/20 border-0 shadow-inner p-6 text-base font-medium resize-none focus-visible:ring-primary/20"
                         value={noteContent}
                         onChange={(e) => setNoteContent(e.target.value)}
                         required
                       />
                       <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={!noteContent.trim()}
                            className="bg-primary hover:bg-primary/90 h-14 px-10 rounded-2xl font-black shadow-2xl shadow-primary/20 gap-3"
                          >
                            <Save className="h-5 w-5" /> Submit Progress Note
                          </Button>
                       </div>
                    </form>
                 </div>

                 {/* Note History */}
                 <div className="flex-1 bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-700">
                    <div className="p-6 bg-muted/20 border-b border-border/50 flex items-center justify-between">
                       <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <History className="h-4 w-4" /> Nursing Logs for {selectedPatient.name}
                       </h4>
                       <Badge className="bg-primary/10 text-primary border-primary/20 rounded-xl font-bold">
                          {notes.length} Logged Entries
                       </Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                       {loading ? (
                         <div className="text-center p-20 animate-pulse text-muted-foreground italic">Syncing with medical files...</div>
                        ) : notes.length === 0 ? (
                         <div className="text-center p-20 text-muted-foreground/60 flex flex-col items-center gap-4">
                            <Activity className="h-10 w-10 opacity-20" />
                            <p className="italic font-medium">No progress notes have been recorded for this patient yet.</p>
                         </div>
                       ) : (
                         notes.map((n) => (
                           <div key={n.id} className="relative pl-10 border-l-2 border-primary/10 transition-colors hover:border-primary/40 group">
                              {/* Timeline Point */}
                              <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary group-hover:scale-125 transition-transform" />
                              
                              <div className="bg-muted/30 p-6 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/5">
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                       <Badge className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider", 
                                          n.noteType === "Emergency" ? "bg-destructive text-white" : "bg-accent text-accent-foreground")}>
                                          {n.noteType}
                                       </Badge>
                                       <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                                          <Clock className="h-3 w-3" /> {new Date(n.createdAt).toLocaleString()}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                       <User className="h-3 w-3" /> Nurse {n.nurse.name}
                                    </div>
                                 </div>
                                 <p className="text-foreground leading-relaxed font-medium whitespace-pre-wrap">
                                    {n.noteContent}
                                 </p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
               </>
            )}
        </div>
      </div>
    </MainLayout>
  );
}
