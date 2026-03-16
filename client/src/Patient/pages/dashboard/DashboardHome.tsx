import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import {
  Activity,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const upcomingAppointments = [
  { id: 1, doctor: "Dr. Sarah Ahmed", type: "Checkup", date: "Mar 5, 2026", time: "10:00 AM", status: "approved" },
  { id: 2, doctor: "Dr. Kamran Ali", type: "Follow-up", date: "Mar 12, 2026", time: "2:30 PM", status: "pending" },
];

const recentActivity = [
  { text: "Lab report uploaded", time: "2 hours ago", icon: FileText },
  { text: "Appointment confirmed with Dr. Ahmed", time: "1 day ago", icon: Calendar },
  { text: "Invoice generated for consultation", time: "3 days ago", icon: Download },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Welcome back, Patient</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your health dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Upcoming Appointments", value: "2", icon: Calendar, color: "bg-primary/10 text-primary" },
          { label: "Pending Reports", value: "3", icon: FileText, color: "bg-secondary/10 text-secondary" },
          { label: "Procedures Done", value: "5", icon: ClipboardList, color: "bg-success/10 text-success" },
          { label: "Health Score", value: "92%", icon: TrendingUp, color: "bg-warning/10 text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-soft border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-heading text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-card rounded-xl shadow-soft border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Upcoming Appointments</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/appointments">View all</Link>
            </Button>
          </div>
          <div className="p-5 space-y-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="font-medium text-sm text-foreground">{apt.doctor}</p>
                  <p className="text-xs text-muted-foreground">{apt.type} · {apt.date} at {apt.time}</p>
                </div>
                <Badge variant={apt.status === "approved" ? "default" : "outline"} className={apt.status === "approved" ? "gradient-primary text-primary-foreground border-transparent" : ""}>
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl shadow-soft border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="p-5 space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <act.icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{act.text}</p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-5 shadow-soft border border-border">
        <h2 className="font-heading font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Book Appointment", icon: Calendar, href: "/dashboard/appointments" },
            { label: "View Reports", icon: Download, href: "/dashboard/reports" },
            { label: "Medical History", icon: ClipboardList, href: "/dashboard/history" },
            { label: "Update Profile", icon: Activity, href: "/dashboard/profile" },
          ].map((action) => (
            <Button key={action.label} variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to={action.href}>
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
