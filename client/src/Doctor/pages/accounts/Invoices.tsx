import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Receipt,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Printer,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  MoreVertical,
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
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface Invoice {
  id: number;
  invoiceNumber: string;
  generatedAt: string;
  patientName: string;
  amount: number;
  isPaid: boolean;
  isRefunded: boolean;
  paymentMethod: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch {
      toast.error("Failed to load invoice records");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch = 
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
      i.patientName.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "paid") return matchesSearch && i.isPaid && !i.isRefunded;
    if (filter === "refunded") return matchesSearch && i.isRefunded;
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Receipt className="h-8 w-8 text-primary" /> Invoice Management (FR15.1)
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate, track, and manage all patient billing records and fiscal history.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/95 text-primary-foreground h-12 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-5 w-5" /> New Billable Entry
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Invoices", value: invoices.length, icon: FileText, color: "text-primary" },
            { label: "Pending Payment", value: invoices.filter(i => !i.isPaid).length, icon: Clock, color: "text-warning" },
            { label: "Refunded Bills", value: invoices.filter(i => i.isRefunded).length, icon: History, color: "text-destructive" },
            { label: "Rejuvenated", value: "+18%", icon: TrendingUp, color: "text-success" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-muted/30 group-hover:bg-muted/50 flex items-center justify-center mb-3 transition-colors">
                 <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <p className="text-2xl font-black text-foreground tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-xl group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search by Invoice # or Patient Name..." 
                 className="pl-10 h-12 rounded-2xl bg-background/50 border-0 shadow-inner font-medium text-lg ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px] h-12 bg-background/50 border-0 rounded-2xl font-bold shadow-inner">
                   <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                   <SelectItem value="all">All Invoices</SelectItem>
                   <SelectItem value="paid">Paid & Cleared</SelectItem>
                   <SelectItem value="refunded">Refunded Records</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="outline" className="h-12 w-12 rounded-2x p-0 border-border/50">
               <Filter className="h-5 w-5" />
            </Button>
        </div>

        {/* Invoice Records */}
        <div className="bg-card rounded-[32px] border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
           <div className="p-6 bg-muted/20 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Recent Invoices (FR15.1)</h3>
              <Badge variant="outline" className="rounded-xl font-bold uppercase text-[9px] tracking-widest">Live Audit</Badge>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-muted/10 text-muted-foreground font-black uppercase tracking-widest text-[9px] border-b border-sidebar-border">
                  <tr>
                    <th className="p-6">Invoice Identifier</th>
                    <th className="p-6">Patient Entity</th>
                    <th className="p-6">Generation Date</th>
                    <th className="p-6">Fiscal Status</th>
                    <th className="p-6 text-center">Interactive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                   {loading ? (
                       <tr><td colSpan={5} className="p-20 text-center animate-pulse italic text-muted-foreground">Accessing billing ledger...</td></tr>
                   ) : filteredInvoices.length === 0 ? (
                       <tr><td colSpan={5} className="p-20 text-center text-muted-foreground italic">No invoice records found.</td></tr>
                   ) : (
                     filteredInvoices.map((inv) => (
                       <tr key={inv.id} className="hover:bg-primary/[0.01] transition-all group border-l-4 border-l-transparent hover:border-l-primary/40">
                          <td className="p-6">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                   <Receipt className="h-5 w-5" />
                                </div>
                                <span className="font-black text-foreground text-lg uppercase tracking-tighter">{inv.invoiceNumber}</span>
                             </div>
                          </td>
                          <td className="p-6 font-bold text-foreground/80 tracking-tight text-base">
                             {inv.patientName}
                          </td>
                          <td className="p-6">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                <Clock className="h-3 w-3" /> {inv.generatedAt}
                             </span>
                          </td>
                          <td className="p-6">
                             <div className="flex flex-col gap-1">
                                <span className={cn("text-lg font-black tracking-tighter", inv.isRefunded && "line-through opacity-40")}>
                                   Rs. {inv.amount.toLocaleString()}
                                </span>
                                {inv.isRefunded ? (
                                   <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit">REFUNDED</Badge>
                                ) : inv.isPaid ? (
                                   <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit">CLEARED</Badge>
                                ) : (
                                   <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit">PENDING</Badge>
                                )}
                             </div>
                          </td>
                          <td className="p-6 text-center">
                             <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary">
                                   <Eye className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary">
                                   <Printer className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary">
                                   <Download className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                   <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                             </div>
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
