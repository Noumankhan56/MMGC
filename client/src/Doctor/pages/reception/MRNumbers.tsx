import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Search,
  Hash,
  User,
  Phone,
  Calendar,
  FileText,
  Printer,
  ChevronRight,
  Scan,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface PatientRecord {
  id: number;
  mrNumber: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  totalVisits: number;
}

export default function MRNumbers() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      setPatients(data);
    } catch {
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.mrNumber.toLowerCase().includes(searchLower) ||
      p.phone.includes(search)
    );
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Scan className="h-8 w-8 text-primary" /> MR Number Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Issue, manage, and verify patient Medical Record numbers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border/50 rounded-xl h-12 px-6 font-bold shadow-sm">
              <Printer className="h-4 w-4 mr-2" /> Print Bulk Cards
            </Button>
            <Link to="/doctor/reception/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                New Registration
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Header */}
        <div className="bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center justify-center">
            <div className="relative w-full max-w-2xl group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="Search by MR Number or Patient Name..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-12 h-14 bg-background/50 border-0 shadow-inner rounded-2xl text-lg font-medium ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
               />
            </div>
            <div className="mt-4 flex gap-6">
               <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" /> {patients.length} Total Records
               </div>
               <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" /> Synchronized with DB
               </div>
            </div>
        </div>

        {/* Records Table */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl shadow-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-widest text-[10px] border-b border-border">
                <tr>
                  <th className="p-6">MR Number</th>
                  <th className="p-6 text-center">QR Scan</th>
                  <th className="p-6">Patient Name</th>
                  <th className="p-6">Details</th>
                  <th className="p-6 text-center">Care Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-muted-foreground font-medium animate-pulse">
                        Retrieving secure records...
                      </td>
                    </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted-foreground italic">
                      No records found matching "{search}"
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-primary/[0.01] transition-all group border-l-4 border-l-transparent hover:border-l-primary/40">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                              <Hash className="h-5 w-5" />
                           </div>
                           <span className="font-black text-foreground text-lg tracking-tight uppercase">{p.mrNumber}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                         <div className="w-12 h-12 mx-auto rounded-lg bg-muted text-muted-foreground flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                            <Scan className="h-6 w-6" />
                         </div>
                      </td>
                      <td className="p-6">
                         <div>
                            <p className="font-bold text-foreground text-base leading-tight tracking-tight">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1 uppercase tracking-tighter">
                               <Phone className="h-3 w-3 text-primary" /> {p.phone}
                            </p>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-4">
                            <Badge variant="outline" className="rounded-xl border-border px-3 py-1 font-bold text-[10px] uppercase">
                               {p.gender}
                            </Badge>
                            <Badge variant="outline" className="rounded-xl border-border px-3 py-1 font-bold text-[10px] uppercase">
                               {p.age} Yrs
                            </Badge>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-primary hover:bg-primary/5 transition-all group-hover:translate-x-1">
                            Patient File <ChevronRight className="h-4 w-4 ml-1" />
                         </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
