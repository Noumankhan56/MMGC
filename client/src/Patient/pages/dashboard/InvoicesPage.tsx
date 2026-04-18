import { useState, useEffect } from "react";
import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import { 
  Download, 
  CreditCard, 
  Search, 
  Receipt,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

interface Invoice {
  id: number;
  invoiceNumber: string;
  generatedAt: string;
  amount: number;
  status: string;
}

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/invoices`)
      .then(res => res.json())
      .then(data => {
        setInvoices(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching invoices:", err);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse text-lg font-medium">Loading financial history...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage your payments, download invoices, and track outstanding balances.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Paid</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">Rs. {invoices.filter(i=>i.status==="Paid").reduce((acc, curr)=>acc+curr.amount, 0)}</span>
              <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Lifetime
              </span>
            </div>
         </div>
         <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Last Payment</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Rs. {invoices.length > 0 ? invoices[0].amount : 0}</span>
              <span className="text-xs text-muted-foreground">{invoices.length > 0 ? new Date(invoices[0].generatedAt).toLocaleDateString() : ""}</span>
            </div>
         </div>
         <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-2">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">Rs. 0.00</span>
              <Button variant="link" className="text-white p-0 h-auto font-bold underline underline-offset-4 hover:text-emerald-100">Add Funds</Button>
            </div>
         </div>
      </div>

      {/* Invoice List */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between gap-4 bg-accent/5">
           <h3 className="font-bold text-lg">Transaction History</h3>
           <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl w-full md:w-64">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search Invoices..." className="bg-transparent border-none text-xs focus:ring-0 w-full outline-none" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] uppercase font-bold text-muted-foreground bg-accent/10 border-b border-border">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-accent/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <Badge className={cn("px-2.5 py-1 font-bold rounded-full text-[10px] border-none uppercase tracking-widest", 
                          inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                          {inv.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                       #{inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                       {new Date(inv.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                       Rs. {inv.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 px-1">
                          <Button variant="outline" size="sm" className="h-8 rounded-lg text-primary border-primary/20 hover:bg-primary/5">
                             <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                             Details
                             <ExternalLink className="ml-1.5 h-3 w-3" />
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                     <div className="flex flex-col items-center justify-center opacity-40">
                        <Receipt className="h-12 w-12 mb-3" />
                        <p className="font-medium">No invoices generated yet.</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
