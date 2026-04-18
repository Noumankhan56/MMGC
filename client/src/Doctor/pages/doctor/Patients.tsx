import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  User,
  Search,
  Plus,
  FileText,
  Calendar,
  Phone,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Input } from "@/Doctor/components/ui/input";
import { Badge } from "@/Doctor/components/ui/badge";
import { PatientHistoryModal } from "@/Doctor/components/doctor/PatientHistoryModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Patient {
  id: number;
  name: string;
  mrNumber: string;
  phone: string;
  email: string;
  gender: string;
  lastVisit: string;
  condition: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        const data = await res.json();
        // The API might return different fields, map them if necessary
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          mrNumber: p.mrNumber,
          phone: p.phone || "N/A",
          email: p.email || "N/A",
          gender: p.gender,
          lastVisit: "Recent", // This would normally come from a joined query
          condition: "N/A",
        }));
        setPatients(mapped);
      }
    } catch (e) {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.mrNumber.toLowerCase().includes(search.toLowerCase())
  );

  const openHistory = (id: number) => {
    setSelectedPatientId(id);
    setIsModalOpen(true);
  };

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
          <Link to="/doctor/reception/register">
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or MR number..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No patients found</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-card rounded-xl border border-border/50 shadow-card p-5 hover:shadow-card-hover transition-all duration-300 group cursor-pointer"
                onClick={() => openHistory(patient.id)}
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
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 capitalize">
                    {patient.gender}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Patient ID: {patient.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                     <FileText className="h-4 w-4 text-muted-foreground" />
                     <span className="text-muted-foreground">Click to view history</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">MRN: {patient.mrNumber}</span>
                  <Button variant="ghost" size="sm" className="text-primary group-hover:bg-primary/10">
                    View Records <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <PatientHistoryModal 
          patientId={selectedPatientId} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </MainLayout>
  );
}
