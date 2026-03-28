import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Search,
  DollarSign,
  CreditCard,
  Building,
  Globe,
  Wallet,
  FileText,
  Printer,
  History,
  RotateCcw,
  TrendingUp,
  Receipt,
  Download,
  MoreVertical,
  Trash2,
  Calendar,
  User,
  ArrowRightLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ────────────────────────────── types ── */

interface Patient { id: number; name: string; mrNumber: string; }

interface TransactionRecord {
  id: number;
  type: number;
  typeDisplay: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  isRefunded: boolean;
  refundedAt: string | null;
  paidAt: string;
  createdAt: string;
  patient: { id: number; name: string; mrNumber: string } | null;
  invoice: { id: number; invoiceNumber: string; generatedAt: string } | null;
}

interface Stats {
  totalRevenue: number;
  todayCollection: number;
  modeBreakdown: { method: string; total: number }[];
}

const API = "/api/transactions";

/* ────────────────────────────── component ── */

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<TransactionRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    amount: "0",
    paymentMethod: "Cash",
    referenceNumber: "",
    type: "4", // Default to PharmacySale (enum value 4)
  });

  /* ─── data fetching ──────────────────────── */

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [trxRes, patRes, statsRes] = await Promise.all([
        fetch(API),
        fetch("/api/patients"),
        fetch(`${API}/stats`),
      ]);

      if (trxRes.ok) setTransactions(await trxRes.json());
      if (patRes.ok) setPatients(await patRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      toast.error("Failed to load financial records");
    } finally {
      setLoading(false);
    }
  };

  const reloadData = async () => {
    const [trxRes, statsRes] = await Promise.all([
      fetch(API),
      fetch(`${API}/stats`),
    ]);
    if (trxRes.ok) setTransactions(await trxRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
  };

  /* ─── Handlers ───────────────────────────── */

  const handleCreate = async () => {
    if (!form.patientId || Number(form.amount) <= 0) {
      toast.error("Valid patient and amount are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: Number(form.patientId),
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod,
          referenceNumber: form.referenceNumber,
          type: Number(form.type),
        }),
      });

      if (res.ok) {
        toast.success("Transaction recorded and invoice generated");
        setOpen(false);
        reloadData();
        setForm({ patientId: "", amount: "0", paymentMethod: "Cash", referenceNumber: "", type: "4" });
      } else {
        toast.error("Failed to save transaction");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm("Are you sure you want to refund this transaction?")) return;
    try {
      const res = await fetch(`${API}/${id}/refund`, { method: "POST" });
      if (res.ok) {
        toast.success("Transaction refunded successfully");
        reloadData();
      }
    } catch {
      toast.error("Refund failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("This will permanently remove the financial record. Continue?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Record deleted");
        reloadData();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ─── UI Helpers ────────────────────────── */

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card": return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "bank transfer": return <Building className="h-4 w-4 text-orange-500" />;
      case "online payment": return <Globe className="h-4 w-4 text-purple-500" />;
      default: return <Wallet className="h-4 w-4 text-green-500" />;
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toLowerCase()) {
      case "card": return "bg-blue-100 text-blue-700 border-blue-200";
      case "bank transfer": return "bg-orange-100 text-orange-700 border-orange-200";
      case "online payment": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.patient?.name?.toLowerCase() ?? "").includes(q) ||
      (t.invoice?.invoiceNumber?.toLowerCase() ?? "").includes(q) ||
      (t.paymentMethod?.toLowerCase() ?? "").includes(q) ||
      (t.typeDisplay?.toLowerCase() ?? "").includes(q)
    );
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              Financial Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track revenue, manage transactions, and generate patient invoices
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full md:w-auto shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> New Transaction
          </Button>
        </div>

        {/* Dashboard Stats (FR7.1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/10 shadow-sm relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary font-semibold uppercase text-xs tracking-wider">Total Revenue</CardDescription>
              <CardTitle className="text-4xl font-black">Rs. {stats?.totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <TrendingUp className="absolute right-4 bottom-4 h-12 w-12 text-primary/10" />
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Cumulative since deployment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 border-emerald-100 shadow-sm relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-600 font-semibold uppercase text-xs tracking-wider">Today's Collection</CardDescription>
              <CardTitle className="text-4xl font-black text-emerald-700">Rs. {stats?.todayCollection.toLocaleString()}</CardTitle>
            </CardHeader>
            <History className="absolute right-4 bottom-4 h-12 w-12 text-emerald-200/50" />
            <CardContent>
               <p className="text-xs text-muted-foreground">Transactions since midnight UTC</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-dashed border-2 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="font-semibold uppercase text-xs tracking-wider">Payment Breakdown</CardDescription>
                <CardTitle className="text-sm">By Payment Mode</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
               <div className="flex gap-2 flex-wrap">
                  {stats?.modeBreakdown.map(m => (
                    <Badge key={m.method} variant="outline" className={`px-2 py-1 gap-1.5 ${getMethodBadgeClass(m.method)} border-none shadow-none`}>
                      {getMethodIcon(m.method)}
                      {m.method}: {m.total.toLocaleString()}
                    </Badge>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by invoice #, patient, type, or method..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-xl shadow-sm border-2 focus:border-primary/50"
                />
             </div>
             <Button variant="outline" className="h-11 rounded-xl gap-2">
                <Download className="h-4 w-4" /> Export Report
             </Button>
          </div>

          <div className="rounded-2xl border overflow-hidden shadow-sm bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Invoice / Date</th>
                  <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Patient details</th>
                  <th className="p-4 text-left font-bold text-muted-foreground uppercase text-[10px]">Category</th>
                  <th className="p-4 text-center font-bold text-muted-foreground uppercase text-[10px]">Payment Method</th>
                  <th className="p-4 text-right font-bold text-muted-foreground uppercase text-[10px]">Amount (Rs)</th>
                  <th className="p-4 text-center font-bold text-muted-foreground uppercase text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((t) => (
                  <tr key={t.id} className={`hover:bg-muted/20 transition-colors ${t.isRefunded && 'bg-red-50/30'}`}>
                    <td className="p-4">
                      <div className="font-black text-primary flex items-center gap-1.5">
                        <Receipt className="h-3.5 w-3.5" />
                        {t.invoice?.invoiceNumber || "No Invoice"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{t.paidAt}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-1.5">
                         <User className="h-3.5 w-3.5 text-muted-foreground" />
                         {t.patient?.name || "Unknown Patient"}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{t.patient?.mrNumber || "N/A"}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-muted/50 border-none font-bold text-[10px] py-0 h-5">
                        {t.typeDisplay}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={`gap-1.5 ${getMethodBadgeClass(t.paymentMethod)} font-bold text-[10px]`}>
                        {getMethodIcon(t.paymentMethod)}
                        {t.paymentMethod}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`font-black text-base ${t.isRefunded ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {t.amount.toLocaleString()}
                      </div>
                      {t.isRefunded && <div className="text-[10px] text-red-600 font-bold uppercase tracking-tighter italic">Refunded</div>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-lg shadow-sm"
                          onClick={() => { setSelectedTrx(t); setInvoiceOpen(true); }}
                          title="View Invoice"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRefund(t.id)} disabled={t.isRefunded} className="gap-2 text-orange-600 font-medium">
                              <RotateCcw className="h-4 w-4" /> Request Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-primary font-medium">
                              <Printer className="h-4 w-4" /> Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(t.id)} className="gap-2 text-red-600 font-medium border-t mt-1">
                              <Trash2 className="h-4 w-4" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-20 text-center opacity-40">
                <Receipt className="mx-auto h-12 w-12" />
                <p className="mt-4 font-medium">No financial records found</p>
              </div>
            )}
          </div>
        </div>

        {/* CREATE TRANSACTION DIALOG (FR7.1, FR7.2) */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-8 text-white">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <ArrowRightLeft className="h-7 w-7" /> New Financial Transaction
              </DialogTitle>
              <p className="text-primary-foreground/80 mt-1">Record manual payments or pharmacy sales</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Patient <span className="text-red-500">*</span></Label>
                  <Select value={form.patientId} onValueChange={(v) => setForm({...form, patientId: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.mrNumber})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Transaction Category</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">Pharmacy Sale</SelectItem>
                      <SelectItem value="2">Medical Procedure</SelectItem>
                      <SelectItem value="1">Laboratory Test</SelectItem>
                      <SelectItem value="0">Appointment Fee</SelectItem>
                      <SelectItem value="3">General Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Amount (Rs) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    className="rounded-xl h-11 font-black text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(v) => setForm({...form, paymentMethod: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Debit / Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Online Payment">Online / JazzCash / EasyPaisa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Reference / Check Number (Optional)</Label>
                <Input 
                  placeholder="E.g. Bank Transaction ID or Receipt No" 
                  className="rounded-xl h-11"
                  value={form.referenceNumber}
                  onChange={(e) => setForm({...form, referenceNumber: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter className="p-8 bg-muted/50">
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleCreate} disabled={saving} className="rounded-xl px-10 shadow-lg shadow-primary/20">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* INVOICE VIEW DIALOG (FR7.3) */}
<Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
  <DialogContent className="w-full max-w-xl md:max-w-2xl rounded-lg p-4 md:p-6 shadow-2xl overflow-hidden">
    <div className="bg-white flex flex-col min-h-[100px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-primary pb-6 md:pb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary italic uppercase tracking-tighter">MMGC CLINIC</h2>
          <p className="text-xs text-muted-foreground uppercase font-bold">Medicinal Management & Gynae Center</p>
          <div className="mt-2 md:mt-4 text-sm font-medium">
            <p>Islamabad, Pakistan</p>
            <p>Phone: +92 51 0000000</p>
          </div>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <h1 className="text-3xl md:text-5xl font-black text-muted-foreground/20 leading-none mb-2 md:mb-4">INVOICE</h1>
          <p className="text-sm font-bold text-primary">{selectedTrx?.invoice?.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">{selectedTrx?.paidAt}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 md:py-10">
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase mb-1 md:mb-2">Billed To</p>
          <p className="text-lg font-black">{selectedTrx?.patient?.name}</p>
          <p className="text-sm text-muted-foreground font-mono">MRN: {selectedTrx?.patient?.mrNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-muted-foreground uppercase mb-1 md:mb-2">Payment Info</p>
          <p className="text-sm font-bold">{selectedTrx?.paymentMethod}</p>
          <p className="text-xs text-muted-foreground">{selectedTrx?.referenceNumber || "Direct Payment"}</p>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm md:text-base">
          <thead className="bg-primary text-white text-[10px] md:text-xs">
            <tr>
              <th className="p-2 md:p-3 font-bold uppercase">Description</th>
              <th className="p-2 md:p-3 font-bold uppercase text-right">Qty</th>
              <th className="p-2 md:p-3 font-bold uppercase text-right">Price</th>
              <th className="p-2 md:p-3 font-bold uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b">
            <tr>
              <td className="p-2 md:p-4">
                <p className="font-bold">{selectedTrx?.typeDisplay}</p>
                <p className="text-xs text-muted-foreground italic">Professional health services/Consultation</p>
              </td>
              <td className="p-2 md:p-4 text-right">1</td>
              <td className="p-2 md:p-4 text-right">{selectedTrx?.amount.toLocaleString()}</td>
              <td className="p-2 md:p-4 text-right font-black">{selectedTrx?.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end pt-6 md:pt-10 border-t-2 border-dashed">
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold">Rs. {selectedTrx?.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax / Surcharge</span>
            <span className="font-bold">Rs. 0</span>
          </div>
          <div className="flex justify-between items-center bg-primary text-white p-2 md:p-3 rounded-lg mt-3 md:mt-4">
            <span className="text-xs font-black uppercase">Grand Total</span>
            <span className="text-lg md:text-xl font-black italic">Rs. {selectedTrx?.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 md:pt-10 text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest italic">
        Thank you for choosing MMGC Clinic • Computer Generated Invoice
      </div>
    </div>

    <div className="bg-muted p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 border-t">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
        <Calendar className="h-3 w-3" /> Auto-Confirmed on {selectedTrx?.paidAt}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2 h-8 md:h-9 text-xs font-bold" onClick={() => setInvoiceOpen(false)}>Close</Button>
        <Button className="gap-2 h-8 md:h-9 text-xs font-bold shadow-lg shadow-primary/20">
          <Printer className="h-4 w-4" /> Print PDF
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

      </div>
    </Layout>
  );
}