import { User, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";

interface Patient {
  id: string;
  name: string;
  mrNumber: string;
  lastVisit: string;
  condition: string;
}

const patients: Patient[] = [
  {
    id: "1",
    name: "Priya Sharma",
    mrNumber: "MR-2024-001",
    lastVisit: "Today",
    condition: "Pregnancy Care",
  },
  {
    id: "2",
    name: "Anita Patel",
    mrNumber: "MR-2024-015",
    lastVisit: "Yesterday",
    condition: "PCOS Treatment",
  },
  {
    id: "3",
    name: "Meera Gupta",
    mrNumber: "MR-2024-023",
    lastVisit: "2 days ago",
    condition: "Post-delivery Care",
  },
  {
    id: "4",
    name: "Kavita Singh",
    mrNumber: "MR-2024-042",
    lastVisit: "3 days ago",
    condition: "Fertility Consultation",
  },
];

export function RecentPatients() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-semibold text-foreground">Recent Patients</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          View All
        </Button>
      </div>
      <div className="p-4 space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{patient.name}</p>
                <p className="text-xs text-muted-foreground">{patient.mrNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <Badge variant="outline" className="text-xs mb-1">
                  {patient.condition}
                </Badge>
                <p className="text-xs text-muted-foreground">{patient.lastVisit}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
