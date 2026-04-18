import { useState, useEffect } from "react";
import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import {
  Activity,
  Calendar,
  ClipboardList,
  Download,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  User,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

interface DashboardStats {
  totalAppointments: number;
  pendingReports: number;
  completedProcedures: number;
  nextAppointment: {
    date: string;
    time: string;
    doctorName: string;
  } | null;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/dashboard-summary`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
      });

    fetch(`/api/patients/${patientId}/reports`)
      .then(res => res.json())
      .then(data => {
        setRecentReports(data?.slice(0, 2) || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse text-lg font-medium">Loading your health dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Welcome back, {user?.name || "Patient"}</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's a quick look at your health status and upcoming activities.</p>
        </div>
        <Button className="gradient-primary text-primary-foreground shadow-lg shadow-primary/20 h-12 px-6 rounded-xl" asChild>
          <Link to="/dashboard/book" className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book New Service
          </Link>
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Bookings", value: stats?.totalAppointments || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending Reports", value: stats?.pendingReports || 0, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Procedures Done", value: stats?.completedProcedures || 0, icon: ClipboardList, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Next Appointment", value: stats?.nextAppointment ? "In 3 Days" : "None", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={stat.label} className="group bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                {i === 3 && stats?.nextAppointment && (
                   <span className="text-xs text-muted-foreground font-normal">Next: {new Date(stats.nextAppointment.date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next/Featured Appointment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-primary/10 duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-4">
                <Activity className="h-4 w-4" />
                Featured Appointment
              </div>
              {stats?.nextAppointment ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Follow-up with {stats.nextAppointment.doctorName}</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground">
                      <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">{new Date(stats.nextAppointment.date).toDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">{stats.nextAppointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-background/80 hover:bg-background h-12 px-6 rounded-xl border-primary/20 group" asChild>
                    <Link to="/dashboard/appointments" className="flex items-center gap-2">
                      Manage Appointment
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-xl text-muted-foreground">No upcoming appointments scheduled.</p>
                  <Button variant="link" className="text-primary p-0 h-auto mt-2 font-semibold flex items-center gap-2 text-lg" asChild>
                    <Link to="/dashboard/book">
                      Schedule your next visit
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-accent/10">
              <h2 className="font-bold text-foreground text-lg">Health Management Tools</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-collapse">
              {[
                { label: "Book Appointment", icon: Calendar, href: "/dashboard/book?type=appointment", desc: "Consult a specialist" },
                { label: "Lab Reports", icon: Download, href: "/dashboard/reports", desc: "View test results" },
                { label: "Medical Wallet", icon: Receipt, href: "/dashboard/invoices", desc: "Manage billing" },
                { label: "Profile Settings", icon: User, href: "/dashboard/profile", desc: "Update personal info" },
              ].map((action) => (
                <Link key={action.label} to={action.href} className="p-6 flex flex-col gap-3 hover:bg-accent/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column: Recent Activity & Reminders */}
        <div className="space-y-8">
           <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-foreground text-lg mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Latest Lab Results
              </h3>
               <div className="space-y-6">
                  {recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                           <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 border-b border-border/50 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{report.testName}</p>
                            {report.reportFilePath && (
                              <a href={report.reportFilePath} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-muted-foreground italic">No recent results found.</div>
                  )}
                  <Button variant="ghost" className="w-full text-xs font-semibold uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
                    <Link to="/dashboard/reports">View All Reports</Link>
                 </Button>
              </div>
           </div>

           <div className="bg-card rounded-2xl shadow-sm border border-border p-6 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-lg">Health Tips</h3>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "Staying hydrated is essential for your recovery. Aim for 8-10 glasses of water daily."
              </p>
              <div className="mt-6 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full gradient-primary" />
                 <span className="text-xs font-bold text-primary">Wellness Center</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
