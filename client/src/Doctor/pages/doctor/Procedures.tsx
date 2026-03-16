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

interface Procedure {
  id: string;
  type: string;
  patientName: string;
  mrNumber: string;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed";
  notes?: string;
}

const procedures: Procedure[] = [
  {
    id: "1",
    type: "Normal Delivery",
    patientName: "Sunita Verma",
    mrNumber: "MR-2024-056",
    date: "Today",
    time: "06:30 AM",
    status: "completed",
    notes: "Successful delivery - Baby boy, 3.2 kg",
  },
  {
    id: "2",
    type: "C-Section",
    patientName: "Rekha Joshi",
    mrNumber: "MR-2024-061",
    date: "Yesterday",
    time: "11:00 AM",
    status: "completed",
    notes: "Emergency C-section - Baby girl, 2.8 kg",
  },
  {
    id: "3",
    type: "Ultrasound Scan",
    patientName: "Anita Patel",
    mrNumber: "MR-2024-015",
    date: "Today",
    time: "10:30 AM",
    status: "in-progress",
    notes: "3D/4D scan - Week 24",
  },
  {
    id: "4",
    type: "Gynaecological Surgery",
    patientName: "Meera Gupta",
    mrNumber: "MR-2024-023",
    date: "Tomorrow",
    time: "09:00 AM",
    status: "scheduled",
    notes: "Laparoscopic procedure",
  },
  {
    id: "5",
    type: "OPD Consultation",
    patientName: "Kavita Singh",
    mrNumber: "MR-2024-042",
    date: "Today",
    time: "11:30 AM",
    status: "scheduled",
    notes: "Fertility consultation",
  },
];

const procedureTypes = [
  "All Procedures",
  "Normal Delivery",
  "C-Section",
  "Ultrasound Scan",
  "Gynaecological Surgery",
  "OPD Consultation",
  "IPD Treatment",
];

const statusConfig = {
  scheduled: { label: "Scheduled", className: "bg-accent text-accent-foreground" },
  "in-progress": { label: "In Progress", className: "bg-warning/10 text-warning" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
};

export default function Procedures() {
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
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            New Procedure
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Today", value: 8, color: "primary" },
            { label: "Scheduled", value: 3, color: "accent" },
            { label: "In Progress", value: 1, color: "warning" },
            { label: "Completed", value: 4, color: "success" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search procedures..." className="pl-10 bg-card" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[200px] bg-card">
              <SelectValue placeholder="Procedure Type" />
            </SelectTrigger>
            <SelectContent>
              {procedureTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase().replace(/\s/g, "-")}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Procedures List */}
        <div className="space-y-4">
          {procedures.map((procedure) => (
            <div
              key={procedure.id}
              className="bg-card rounded-xl border border-border/50 shadow-card p-5 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{procedure.type}</h3>
                      <Badge className={statusConfig[procedure.status].className}>
                        {statusConfig[procedure.status].label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {procedure.patientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {procedure.mrNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {procedure.date} at {procedure.time}
                      </span>
                    </div>
                    {procedure.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{procedure.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
