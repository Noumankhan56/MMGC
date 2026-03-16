import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  User,
  Search,
  Plus,
  FileText,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Badge } from "@/Doctor/components/ui/badge";

interface Patient {
  id: string;
  name: string;
  mrNumber: string;
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  condition: string;
  status: "active" | "inactive" | "critical";
}

const patients: Patient[] = [
  {
    id: "1",
    name: "Priya Sharma",
    mrNumber: "MR-2024-001",
    age: 28,
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    lastVisit: "Today",
    condition: "Pregnancy Care - Week 28",
    status: "active",
  },
  {
    id: "2",
    name: "Anita Patel",
    mrNumber: "MR-2024-015",
    age: 32,
    phone: "+91 98765 43211",
    email: "anita.patel@email.com",
    lastVisit: "Yesterday",
    condition: "PCOS Treatment",
    status: "active",
  },
  {
    id: "3",
    name: "Meera Gupta",
    mrNumber: "MR-2024-023",
    age: 35,
    phone: "+91 98765 43212",
    email: "meera.gupta@email.com",
    lastVisit: "2 days ago",
    condition: "Post-delivery Care",
    status: "active",
  },
  {
    id: "4",
    name: "Kavita Singh",
    mrNumber: "MR-2024-042",
    age: 30,
    phone: "+91 98765 43213",
    email: "kavita.singh@email.com",
    lastVisit: "1 week ago",
    condition: "Fertility Consultation",
    status: "active",
  },
  {
    id: "5",
    name: "Sunita Verma",
    mrNumber: "MR-2024-056",
    age: 27,
    phone: "+91 98765 43214",
    email: "sunita.verma@email.com",
    lastVisit: "Today",
    condition: "High-risk Pregnancy",
    status: "critical",
  },
];

const statusColors = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  critical: "bg-destructive/10 text-destructive",
};

export default function Patients() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Patient Records
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage patient medical records
            </p>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, MR number, or condition..." className="pl-10 bg-card" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Patients Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-card rounded-xl border border-border/50 shadow-card p-5 hover:shadow-card-hover transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">{patient.mrNumber}</p>
                  </div>
                </div>
                <Badge className={statusColors[patient.status]}>
                  {patient.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Visit: {patient.lastVisit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Age: {patient.age} yrs</span>
                <Button variant="ghost" size="sm" className="text-primary group-hover:bg-primary/10">
                  View Records <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
