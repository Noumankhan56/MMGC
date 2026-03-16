import { Badge } from "@/Patient/components/ui/badge";
import { ClipboardList } from "lucide-react";

const procedures = [
  { id: 1, type: "Delivery", date: "2025-08-15", doctor: "Dr. Sarah Ahmed", notes: "Normal delivery, no complications", status: "completed" },
  { id: 2, type: "C-Section", date: "2024-03-20", doctor: "Dr. Ahmed Hassan", notes: "Emergency C-section, mother and baby healthy", status: "completed" },
  { id: 3, type: "Ultrasound", date: "2026-02-20", doctor: "Dr. Fatima Khan", notes: "Routine prenatal ultrasound", status: "completed" },
  { id: 4, type: "Lab Test", date: "2026-02-18", doctor: "Dr. Kamran Ali", notes: "Complete blood count, thyroid panel", status: "completed" },
  { id: 5, type: "Surgery", date: "2024-11-10", doctor: "Dr. Ahmed Hassan", notes: "Appendectomy, successful recovery", status: "completed" },
];

const MedicalHistoryPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground text-sm mt-1">View your complete medical procedure history</p>
      </div>

      <div className="space-y-4">
        {procedures.map((proc) => (
          <div key={proc.id} className="bg-card rounded-xl p-5 shadow-soft border border-border flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-foreground">{proc.type}</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">{proc.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{proc.doctor} · {proc.date}</p>
              <p className="text-sm text-muted-foreground/80 mt-1">{proc.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalHistoryPage;
