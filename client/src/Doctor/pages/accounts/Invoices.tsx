import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  Receipt,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Printer,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  mrNumber: string;
  date: string;
  amount: number;
  paidAmount: number;
  status: "paid" | "partial" | "pending" | "overdue";
  services: string[];
}

const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0156",
    patientName: "Priya Sharma",
    mrNumber: "MR-2024-001",
    date: "Today",
    amount: 15000,
    paidAmount: 15000,
    status: "paid",
    services: ["OPD Consultation", "Ultrasound"],
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0155",
    patientName: "Sunita Verma",
    mrNumber: "MR-2024-056",
    date: "Today",
    amount: 85000,
    paidAmount: 50000,
    status: "partial",
    services: ["C-Section", "Hospital Stay (3 days)"],
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-0154",
    patientName: "Anita Patel",
    mrNumber: "MR-2024-015",
    date: "Yesterday",
    amount: 5500,
    paidAmount: 0,
    status: "pending",
    services: ["Lab Tests", "Ultrasound"],
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-0150",
    patientName: "Kavita Singh",
    mrNumber: "MR-2024-042",
    date: "3 days ago",
    amount: 3500,
    paidAmount: 0,
    status: "overdue",
    services: ["OPD Consultation"],
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-0153",
    patientName: "Meera Gupta",
    mrNumber: "MR-2024-023",
    date: "Yesterday",
    amount: 12000,
    paidAmount: 12000,
    status: "paid",
    services: ["Lab Tests", "Consultation", "Medicines"],
  },
];

const statusConfig = {
  paid: { label: "Paid", className: "bg-success/10 text-success", icon: CheckCircle2 },
  partial: { label: "Partial", className: "bg-warning/10 text-warning", icon: Clock },
  pending: { label: "Pending", className: "bg-muted text-muted-foreground", icon: Clock },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive", icon: XCircle },
};

export default function Invoices() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Invoices & Billing
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage patient invoices and payments
            </p>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹2.4L</p>
                <p className="text-sm text-muted-foreground">Today's Collection</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹85K</p>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹12K</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹18.5L</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." className="pl-10 bg-card" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[160px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const StatusIcon = statusConfig[invoice.status].icon;
            const balance = invoice.amount - invoice.paidAmount;

            return (
              <div
                key={invoice.id}
                className="bg-card rounded-xl border border-border/50 shadow-card p-5 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{invoice.invoiceNumber}</h3>
                        <Badge className={statusConfig[invoice.status].className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.patientName} • {invoice.mrNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {invoice.services.join(" • ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(invoice.amount)}
                      </p>
                      {invoice.status === "partial" && (
                        <p className="text-sm text-warning">
                          Balance: {formatCurrency(balance)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{invoice.date}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== "paid" && (
                        <Button size="sm" variant="default" className="bg-success hover:bg-success/90">
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
