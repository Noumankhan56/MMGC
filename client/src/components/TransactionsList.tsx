import { DollarSign, User, Calendar, CreditCard, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransactionDialog } from "./modals/TransactionDialog";

const transactions = [
  {
    id: 1,
    invoiceNo: "INV-001234",
    patient: "Sarah Johnson",
    type: "Appointment",
    amount: "$150",
    paymentMode: "Card",
    date: "2025-11-05",
    status: "paid",
  },
  {
    id: 2,
    invoiceNo: "INV-001235",
    patient: "James Wilson",
    type: "Lab Test",
    amount: "$85",
    paymentMode: "Cash",
    date: "2025-11-05",
    status: "paid",
  },
  {
    id: 3,
    invoiceNo: "INV-001236",
    patient: "Maria Garcia",
    type: "Procedure",
    amount: "$2,500",
    paymentMode: "Bank Transfer",
    date: "2025-11-05",
    status: "pending",
  },
  {
    id: 4,
    invoiceNo: "INV-001237",
    patient: "Robert Brown",
    type: "Pharmacy",
    amount: "$45",
    paymentMode: "Online Payment",
    date: "2025-11-04",
    status: "paid",
  },
];

const statusColors = {
  paid: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const paymentModeColors = {
  Cash: "bg-primary/10 text-primary",
  Card: "bg-secondary/10 text-secondary",
  "Bank Transfer": "bg-success/10 text-success",
  "Online Payment": "bg-warning/10 text-warning",
};

export function TransactionsList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Financial Transactions</h2>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Invoice No</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Patient</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Type</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Amount</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Payment Mode</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border last:border-0 hover:bg-accent transition-colors">
                  <td className="py-4">
                    <span className="font-mono text-sm text-muted-foreground">{transaction.invoiceNo}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <User className="h-4 w-4" />
                      <span>{transaction.patient}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{transaction.type}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-sm font-semibold text-success">
                      <DollarSign className="h-4 w-4" />
                      <span>{transaction.amount}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge className={paymentModeColors[transaction.paymentMode as keyof typeof paymentModeColors]}>
                      <CreditCard className="h-3 w-3 mr-1" />
                      {transaction.paymentMode}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{transaction.date}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTransaction}
      />
    </>
  );
}
