import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  MoreVertical,
  Download,
  Printer,
  Eye,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Badge } from "@/Doctor/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Doctor/components/ui/select";
import { ProcedureFormModal } from "@/Doctor/components/doctor/ProcedureFormModal";
import { toast } from "sonner";

interface Procedure {
  id: number;
  procedureType: string;
  patient: { name: string; mrNumber: string };
  amount: number;
  performedAt: string;
  notes: string;
  prescription: string;
}

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  "in-progress": { label: "In Progress", className: "bg-warning/10 text-warning" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
};

export default function Procedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/procedures");
      if (res.ok) {
        const data = await res.json();
        setProcedures(data);
      }
    } catch (e) {
      toast.error("Failed to load procedures");
    } finally {
      setLoading(false);
    }
  };

  const printSummary = (p: Procedure) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Treatment Summary - ${p.patient.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; color: #666; font-size: 0.9em; margin-bottom: 5px; display: block; }
            .content { font-size: 1.1em; line-height: 1.6; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .prescription { background: #f9f9f9; padding: 20px; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MMGC Medical Center</h1>
            <p>Treatment Summary</p>
          </div>
          <div class="section grid">
            <div>
              <span class="label">Patient Name</span>
              <div class="content">${p.patient.name}</div>
            </div>
            <div>
              <span class="label">MR Number</span>
              <div class="content">${p.patient.mrNumber}</div>
            </div>
          </div>
          <div class="section">
            <span class="label">Procedure / Treatment</span>
            <div class="content"><strong>${p.procedureType}</strong></div>
          </div>
          <div class="section">
            <span class="label">Performed At</span>
            <div class="content">${p.performedAt}</div>
          </div>
          <div class="section">
            <span class="label">Clinical Notes</span>
            <div class="content">${p.notes || "None recorded"}</div>
          </div>
          <div class="section prescription">
            <span class="label">Prescription / Recommendations</span>
            <div class="content">${p.prescription || "None"}</div>
          </div>
          <div style="margin-top: 60px; text-align: right;">
            <p style="border-top: 1px solid #ccc; display: inline-block; padding-top: 10px; width: 200px;">Doctor's Signature</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredProcedures = procedures.filter((p) =>
    p.patient.name.toLowerCase().includes(search.toLowerCase()) ||
    p.procedureType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Medical Procedures
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track medical procedures and treatments
            </p>
          </div>
          <Button 
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Procedure
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Procedures", value: procedures.length, color: "primary" },
            { label: "Completed", value: procedures.length, color: "success" },
            { label: "Revenue (Rs)", value: procedures.reduce((acc, p) => acc + p.amount, 0), color: "warning" },
            { label: "Active Team", value: 4, color: "accent" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border/50 p-4 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by patient name or procedure..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Procedure Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Procedures</SelectItem>
              <SelectItem value="delivery">Normal Delivery</SelectItem>
              <SelectItem value="csection">C-Section</SelectItem>
              <SelectItem value="ultrasound">Ultrasound Scan</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Procedures List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Loading procedures...</div>
          ) : filteredProcedures.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No procedures recorded</div>
          ) : (
            filteredProcedures.map((procedure) => (
              <div
                key={procedure.id}
                className="bg-card rounded-xl border border-border/50 shadow-card p-5 hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{procedure.procedureType}</h3>
                        <Badge className={statusConfig.completed.className}>
                          {statusConfig.completed.label}
                        </Badge>
                        <span className="text-sm font-bold text-success ml-auto lg:ml-0">Rs. {procedure.amount}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          {procedure.patient.name} (${procedure.patient.mrNumber})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {procedure.performedAt}
                        </span>
                      </div>
                      {(procedure.notes || procedure.prescription) && (
                        <div className="mt-3 grid sm:grid-cols-2 gap-4">
                          {procedure.notes && (
                            <div className="text-xs p-2 bg-muted/30 rounded border-l-2 border-primary/30 truncate max-w-xs">
                              <strong>Notes:</strong> {procedure.notes}
                            </div>
                          )}
                          {procedure.prescription && (
                            <div className="text-xs p-2 bg-success/5 rounded border-l-2 border-success/30 truncate max-w-xs">
                              <strong>RX:</strong> {procedure.prescription}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto lg:ml-0 self-end lg:self-center">
                    <Button variant="outline" size="sm" className="gap-1 shadow-sm" onClick={() => printSummary(procedure)}>
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <ProcedureFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchProcedures} 
        />
      </div>
    </MainLayout>
  );
}
