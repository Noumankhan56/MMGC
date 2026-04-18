import { useEffect, useState } from "react";
import { User, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { useAuth } from "@/Auth/AuthContext";
import { PatientHistoryModal } from "../doctor/PatientHistoryModal";

export function RecentPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.doctorProfileId) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      const res = await fetch(`/api/doctors/${user?.doctorProfileId}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.recentPatients || []);
      }
    } catch (e) {
      console.error("Failed to fetch recent patients", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border bg-muted/5">
        <div>
          <h3 className="font-bold text-foreground">Recent Cases</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Latest Diagnostics</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-bold">
          View All Patients
        </Button>
      </div>
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[140px]">
        {loading ? (
          <div className="col-span-full p-10 text-center animate-pulse text-muted-foreground italic">Syncing patient records...</div>
        ) : patients.length === 0 ? (
          <div className="col-span-full p-10 text-center text-muted-foreground italic">No recent patient history.</div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.patientId || patient.id}
              onClick={() => setSelectedPatientId(patient.patientId || patient.id)}
              className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 hover:bg-white hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer border border-transparent hover:border-primary/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground line-clamp-1">{patient.patientName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Last: {patient.date}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {selectedPatientId && (
        <PatientHistoryModal 
          patientId={selectedPatientId} 
          isOpen={!!selectedPatientId} 
          onClose={() => setSelectedPatientId(null)} 
        />
      )}
    </div>
  );
}

