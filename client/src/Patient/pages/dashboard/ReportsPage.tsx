import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import { Download, FileText, FlaskConical, Microscope, Receipt } from "lucide-react";
import { toast } from "sonner";

const reports = [
  { id: 1, name: "Blood Test Report", type: "Lab", date: "2026-02-18", icon: FlaskConical },
  { id: 2, name: "Ultrasound Report", type: "Ultrasound", date: "2026-02-20", icon: Microscope },
  { id: 3, name: "Prescription - Feb 2026", type: "Prescription", date: "2026-02-22", icon: FileText },
  { id: 4, name: "Invoice #INV-2026-042", type: "Invoice", date: "2026-02-22", icon: Receipt },
  { id: 5, name: "Thyroid Panel Report", type: "Lab", date: "2026-02-18", icon: FlaskConical },
  { id: 6, name: "Invoice #INV-2026-038", type: "Invoice", date: "2026-02-15", icon: Receipt },
];

const typeColors: Record<string, string> = {
  Lab: "bg-primary/10 text-primary border-primary/30",
  Ultrasound: "bg-secondary/10 text-secondary border-secondary/30",
  Prescription: "bg-success/10 text-success border-success/30",
  Invoice: "bg-warning/10 text-warning border-warning/30",
};

const ReportsPage = () => {
  const handleDownload = (name: string) => {
    toast.success(`Downloading ${name}...`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">Download prescriptions, lab reports, ultrasound reports, and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-card rounded-xl p-5 shadow-soft border border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <report.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground truncate">{report.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${typeColors[report.type]} text-xs`}>{report.type}</Badge>
                <span className="text-xs text-muted-foreground">{report.date}</span>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => handleDownload(report.name)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
