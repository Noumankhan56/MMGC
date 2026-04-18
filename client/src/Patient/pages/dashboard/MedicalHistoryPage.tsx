import { useState, useEffect } from "react";
import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import {
  ClipboardList,
  Calendar,
  User,
  ExternalLink,
  Search,
  CheckCircle2,
  Stethoscope,
  Info,
} from "lucide-react";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

interface MedicalRecord {
  id: number;
  procedureType: string;
  performedAt: string;
  status: string;
  notes: string;
  prescription: string;
  reportUrl: string;
  doctorName: string;
}

const MedicalHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/history`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse text-lg font-medium font-sans">Processing your medical history...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
        <p className="text-muted-foreground mt-1">A comprehensive record of your past procedures, treatments, and prescriptions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.length > 0 ? (
          history.map((record) => (
            <div key={record.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
                {/* Left Section: Main Info */}
                <div className="p-6 md:w-1/3 bg-accent/5">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-3">
                    <Stethoscope className="h-4 w-4" />
                    {record.procedureType}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{record.procedureType}</h3>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Calendar className="h-4 w-4" />
                       {new Date(record.performedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <User className="h-4 w-4" />
                       Performed by {record.doctorName}
                    </div>
                  </div>
                  <Badge className="mt-4 px-3 py-1 font-bold rounded-full bg-emerald-500/10 text-emerald-500 border-none">
                    {record.status}
                  </Badge>
                </div>

                {/* Middle Section: Notes & Prescriptions */}
                <div className="p-6 flex-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                       <Info className="h-3.5 w-3.5" />
                       Clinical Notes
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                      {record.notes || "No additional clinical notes recorded for this procedure."}
                    </p>
                  </div>
                  {record.prescription && (
                    <div className="bg-accent/30 p-4 rounded-xl border border-border/50">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Prescription / Medications</h4>
                       <p className="text-sm font-medium">{record.prescription}</p>
                    </div>
                  )}
                </div>

                {/* Right Section: Actions */}
                <div className="p-6 md:w-64 flex flex-col justify-center gap-3">
                   {record.reportUrl && (
                      <Button variant="outline" className="w-full h-11 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-semibold" asChild>
                         <a href={record.reportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                           View Digital Report
                           <ExternalLink className="h-4 w-4" />
                         </a>
                      </Button>
                   )}
                   <Button variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground text-sm font-medium">
                      Request Details
                   </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
             <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-bold">No Medical Records</h3>
             <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Your past procedures and diagnostic history will appear here once recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryPage;
