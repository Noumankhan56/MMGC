import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  CreditCard,
  Search,
  Plus,
  ArrowRight,
  User,
  Activity,
  History,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Input } from "@/Doctor/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface Transaction {
  id: number;
  type: string;
  typeDisplay: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  isRefunded: boolean;
  refundedAt: string | null;
  paidAt: string;
  patient: { id: number; name: string; mrNumber: string } | null;
}

export default function Payments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalRevenue: 0, todayCollection: 0 });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch {
      toast.error("Failed to load financial records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/transactions/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      console.error("Failed to load stats");
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm("Are you sure you want to refund this transaction?")) return;
    
    try {
      const res = await fetch(`/api/transactions/${id}/refund`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();
      toast.success("Refund processed successfully");
      fetchTransactions();
      fetchStats();
    } catch {
      toast.error("Error processing refund");
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.patient?.name.toLowerCase().includes(search.toLowerCase()) || 
    t.patient?.mrNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.referenceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-primary" /> Payment Operations (FR15.1)
            </h1>
            <p className="text-muted-foreground mt-1">
              Collect payments, manage refunds, and track financial reconciliations.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-success/5 border border-success/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-success/10 text-success">
                   <DollarSign className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-success/60 tracking-widest leading-none">Today's Collection</p>
                   <p className="text-lg font-black text-success tracking-tight">Rs. {stats.todayCollection.toLocaleString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Filters Header */}
        <div className="bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-xl group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search by Patient MRN, Name, or Ref #..." 
                 className="pl-10 h-12 rounded-2xl bg-background/50 border-0 shadow-inner font-medium text-lg ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="flex gap-4">
               <Button onClick={fetchTransactions} variant="outline" className="h-12 w-12 rounded-2xl p-0 border-border/50">
                  <RotateCcw className="h-5 w-5" />
               </Button>
               <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/95 font-bold shadow-lg shadow-primary/20">
                  New Cash Entry
               </Button>
            </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-card rounded-[32px] border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
          <div className="p-6 bg-muted/20 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <History className="h-4 w-4" /> Transaction Archive
              </h3>
              <Badge variant="outline" className="rounded-xl font-bold uppercase text-[9px] tracking-widest">Audited Records</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/10 text-muted-foreground font-black uppercase tracking-widest text-[9px] border-b border-sidebar-border">
                <tr>
                  <th className="p-6">Entity / Source</th>
                  <th className="p-6">Transaction Type</th>
                  <th className="p-6">Final Amount</th>
                  <th className="p-6">Method / Reference</th>
                  <th className="p-6 text-center">Status Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center animate-pulse italic text-muted-foreground">Reconciling financial logs...</td>
                    </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-muted-foreground italic">No payment transactions found.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-primary/[0.01] transition-all group border-l-4 border-l-transparent hover:border-l-primary/40">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl">
                              {trx.patient?.name.charAt(0) || <Briefcase className="h-5 w-5" />}
                           </div>
                           <div>
                              <p className="font-bold text-foreground text-base tracking-tight leading-tight">{trx.patient?.name || "Corporate / Clinic"}</p>
                              <p className="text-[10px] font-black uppercase text-muted-foreground mt-1 flex items-center gap-2">
                                 <span className="text-primary">{trx.patient?.mrNumber || "GL-ACCT"}</span>
                                 <span className="opacity-30">|</span>
                                 <span>{trx.paidAt}</span>
                              </p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-foreground">
                        <Badge variant="outline" className="px-3 py-1 rounded-xl text-[10px] uppercase font-black tracking-widest text-primary/80 border-primary/20">
                           {trx.typeDisplay}
                        </Badge>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col">
                            <span className={cn("text-xl font-black tracking-tighter", trx.isRefunded ? "text-muted-foreground line-through" : "text-foreground")}>
                               Rs. {trx.amount.toLocaleString()}
                            </span>
                            {trx.isRefunded && (
                               <span className="text-[10px] font-black uppercase text-destructive tracking-widest flex items-center gap-1 -mt-1">
                                  <RotateCcw className="h-3 w-3" /> Refunded on {trx.refundedAt}
                               </span>
                            )}
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-muted/40 text-muted-foreground">
                               <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-foreground/80">{trx.paymentMethod}</p>
                               <p className="text-[9px] font-black text-muted-foreground tracking-widest">{trx.referenceNumber || "#NO-REF"}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center justify-center gap-2">
                           {trx.isRefunded ? (
                             <Badge className="bg-muted text-muted-foreground text-[10px] font-black px-4 py-1.5 rounded-2xl uppercase border-2">REVERSED</Badge>
                           ) : (
                             <Button 
                               onClick={() => handleRefund(trx.id)}
                               className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-white font-bold h-11 px-6 rounded-2xl transition-all gap-2 border-2 border-destructive/20"
                             >
                                <RotateCcw className="h-4 w-4" /> Refund
                             </Button>
                           )}
                           <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-primary hover:bg-primary/5">
                              <CheckCircle2 className="h-5 w-5" />
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
