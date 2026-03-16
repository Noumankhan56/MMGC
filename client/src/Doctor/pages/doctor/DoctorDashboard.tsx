import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import { StatsCard } from "@/Doctor/components/dashboard/StatsCard";
import {
  Users,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  User,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";

const upcomingAppointments = [
  { id: 1, patient: "Priya Sharma", time: "09:00 AM", type: "Prenatal Checkup", status: "confirmed" },
  { id: 2, patient: "Anita Patel", time: "10:30 AM", type: "Ultrasound", status: "confirmed" },
  { id: 3, patient: "Meera Gupta", time: "11:00 AM", type: "Follow-up", status: "pending" },
  { id: 4, patient: "Kavita Singh", time: "02:00 PM", type: "OPD Consultation", status: "confirmed" },
];

const recentProcedures = [
  { id: 1, patient: "Sunita Verma", procedure: "Normal Delivery", date: "Today, 06:30 AM" },
  { id: 2, patient: "Rekha Joshi", procedure: "C-Section", date: "Yesterday, 11:00 AM" },
  { id: 3, patient: "Geeta Rao", procedure: "Ultrasound Scan", date: "Yesterday, 03:00 PM" },
];

export default function DoctorDashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your appointments and patient care
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">View Schedule</Button>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              New Consultation
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Appointments"
            value={8}
            change="2 completed"
            icon={Calendar}
            iconColor="primary"
          />
          <StatsCard
            title="Patients Treated"
            value={156}
            change="This month"
            icon={Users}
            iconColor="secondary"
          />
          <StatsCard
            title="Pending Reports"
            value={5}
            change="Needs review"
            icon={FileText}
            iconColor="warning"
          />
          <StatsCard
            title="Avg. Wait Time"
            value="12 min"
            change="-3 min from avg"
            changeType="positive"
            icon={Clock}
            iconColor="success"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Upcoming Appointments</h3>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{apt.time}</p>
                    <Badge
                      variant="secondary"
                      className={apt.status === "confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Procedures */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Procedures</h3>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {recentProcedures.map((proc) => (
                <div key={proc.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{proc.patient}</p>
                    <p className="text-sm text-muted-foreground">{proc.procedure}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{proc.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
