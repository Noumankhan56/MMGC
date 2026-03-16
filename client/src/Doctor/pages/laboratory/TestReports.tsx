import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  FlaskConical,
  Search,
  Upload,
  Filter,
  FileText,
  User,
  Calendar,
  Download,
  Eye,
  Bell,
  CheckCircle2,
  Clock,
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

interface Report {
  id: string;
  testName: string;
  patientName: string;
  mrNumber: string;
  doctorName: string;
  requestDate: string;
  status: "pending" | "processing" | "completed" | "approved";
  reportFile?: string;
}

const reports: Report[] = [
  {
    id: "1",
    testName: "Complete Blood Count (CBC)",
    patientName: "Priya Sharma",
    mrNumber: "MR-2024-001",
    doctorName: "Dr. Sarah Wilson",
    requestDate: "Today, 09:00 AM",
    status: "completed",
    reportFile: "CBC_Report.pdf",
  },
  {
    id: "2",
    testName: "Ultrasound - Pregnancy",
    patientName: "Anita Patel",
    mrNumber: "MR-2024-015",
    doctorName: "Dr. Sarah Wilson",
    requestDate: "Today, 10:30 AM",
    status: "processing",
  },
  {
    id: "3",
    testName: "Thyroid Profile",
    patientName: "Meera Gupta",
    mrNumber: "MR-2024-023",
    doctorName: "Dr. Sarah Wilson",
    requestDate: "Yesterday",
    status: "approved",
    reportFile: "Thyroid_Report.pdf",
  },
  {
    id: "4",
    testName: "Urine Routine",
    patientName: "Kavita Singh",
    mrNumber: "MR-2024-042",
    doctorName: "Dr. Sarah Wilson",
    requestDate: "Today, 11:00 AM",
    status: "pending",
  },
  {
    id: "5",
    testName: "HbA1c",
    patientName: "Sunita Verma",
    mrNumber: "MR-2024-056",
    doctorName: "Dr. Sarah Wilson",
    requestDate: "Yesterday",
    status: "completed",
    reportFile: "HbA1c_Report.pdf",
  },
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground", icon: Clock },
  processing: { label: "Processing", className: "bg-warning/10 text-warning", icon: FlaskConical },
  completed: { label: "Completed", className: "bg-success/10 text-success", icon: CheckCircle2 },
  approved: { label: "Approved", className: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

export default function TestReports() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Laboratory Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and upload test reports
            </p>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Pending", value: 12, color: "text-muted-foreground" },
            { label: "Processing", value: 5, color: "text-warning" },
            { label: "Ready for Approval", value: 8, color: "text-success" },
            { label: "Approved Today", value: 15, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by test name, patient, or MR number..." className="pl-10 bg-card" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[160px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Test Name</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Patient</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Doctor</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => {
                  const StatusIcon = statusConfig[report.status].icon;
                  return (
                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FlaskConical className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{report.testName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-foreground">{report.patientName}</p>
                          <p className="text-xs text-muted-foreground">{report.mrNumber}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                        {report.doctorName}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground">
                        {report.requestDate}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={statusConfig[report.status].className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[report.status].label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {report.reportFile && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {report.status === "completed" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                              <Bell className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status === "pending" && (
                            <Button size="sm" variant="outline">
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
