import { useEffect, useState } from "react";
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
  Activity,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DoctorProfileModal } from "@/Doctor/components/doctor/DoctorProfileModal";
import { useAuth } from "@/Auth/AuthContext";
import { cn } from "@/Doctor/lib/utils";

interface DashboardStats {
  todayAppointments: number;
  totalAppointments: number;
  totalPatients: number;
  totalProcedures: number;
  pendingReports: number;
  avgWaitTime: string;
}

interface Appointment {
  id: number;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface Procedure {
  id: number;
  patientName: string;
  procedure: string;
  date: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorProfileId = user?.doctorProfileId;
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalAppointments: 0,
    totalPatients: 0,
    totalProcedures: 0,
    pendingReports: 0,
    avgWaitTime: "0 min",
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentProcedures, setRecentProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [doctorName, setDoctorName] = useState("Doctor");

  useEffect(() => {
    if (doctorProfileId) {
      fetchDashboardData();
    }
  }, [doctorProfileId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`/api/doctors/${doctorProfileId}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Doctor Info (for name)
      const drRes = await fetch(`/api/doctors/${doctorProfileId}`);
      if (drRes.ok) {
        const drData = await drRes.json();
        setDoctorName(drData.name);
      }

      // 3. Fetch Upcoming Appointments
      const aptRes = await fetch(`/api/doctor/appointments/${doctorProfileId}`);
      if (aptRes.ok) {
        const aptData = await aptRes.json();
        const mappedApts = (Array.isArray(aptData) ? aptData : [])
          .filter((a: any) => a.status !== "Completed" && a.status !== "Canceled")
          .slice(0, 4)
          .map((a: any) => ({
            id: a.id,
            patientName: a.patientName || "Unknown Patient",
            time: a.time || "--:--",
            type: "Consultation",
            status: (a.status || "Scheduled").toLowerCase(),
          }));
        setUpcomingAppointments(mappedApts);
      }

      // 4. Fetch Recent Procedures
      const procRes = await fetch("/api/procedures");
      if (procRes.ok) {
        const procData = await procRes.json();
        const mappedProcs = (Array.isArray(procData) ? procData : [])
          .filter((p: any) => p.doctor?.id === doctorProfileId)
          .slice(0, 3)
          .map((p: any) => ({
            id: p.id,
            patientName: p.patient?.name || "Unknown Patient",
            procedure: p.procedureType || "Treatment",
            date: p.performedAt ? new Date(p.performedAt).toLocaleDateString() : "Recent",
          }));
        setRecentProcedures(mappedProcs);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* New Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white shadow-2xl shadow-primary/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-md">
                  Welcome Back, Dr. {doctorName?.split(' ')[0] || "Doctor"} 👋
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Doctor Dashboard
              </h1>
              <p className="text-primary-foreground/80 mt-2 max-w-md font-medium">
                Manage your appointments, patients, and health procedures efficiently with real-time analytics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 h-11 px-6 rounded-xl"
                onClick={() => setIsProfileModalOpen(true)}
              >
                Edit Profile
              </Button>
              <Link to="/doctor/appointments">
                <Button className="bg-white text-primary hover:bg-white/90 h-11 px-6 rounded-xl font-bold shadow-lg shadow-black/10">
                  New Appointment
                </Button>
              </Link>
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Appointments"
            value={stats.totalAppointments}
            change={`${stats.todayAppointments} scheduled today`}
            icon={Calendar}
            iconColor="primary"
            className="hover:scale-[1.03] transition-transform duration-300"
          />
          <StatsCard
            title="Total Patients"
            value={stats.totalPatients}
            change="Life-time total"
            icon={Users}
            iconColor="secondary"
            className="hover:scale-[1.03] transition-transform duration-300"
          />
          <StatsCard
            title="Total Procedures"
            value={stats.totalProcedures}
            change="Successful surgeries"
            icon={Stethoscope}
            iconColor="info"
            className="hover:scale-[1.03] transition-transform duration-300"
          />
          <StatsCard
            title="Avg. Wait Time"
            value={stats.avgWaitTime}
            change="Current hospital status"
            changeType="positive"
            icon={Clock}
            iconColor="success"
            className="hover:scale-[1.03] transition-transform duration-300"
          />
        </div>

        {/* Content Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments (2/3 width) */}
          <div className="lg:col-span-2 bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden group">
            <div className="flex items-center justify-between p-6 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Upcoming Schedule</h3>
              </div>
              <Link to="/doctor/appointments">
                <Button variant="ghost" size="sm" className="text-primary font-medium hover:bg-primary/5">
                  View Schedule <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground italic">Updating schedule...</div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
                  <div className="p-4 rounded-full bg-muted/50">
                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">No pending appointments for today.</p>
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-5 hover:bg-primary/[0.02] transition-colors group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent/80 flex items-center justify-center text-accent-foreground font-bold text-lg shadow-sm">
                        {apt.patientName?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover/item:text-primary transition-colors">{apt.patientName || "Unknown Patient"}</p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{apt.time}</p>
                      <Badge
                        className={cn(
                          "mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          apt.status === "confirmed" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                        )}
                        variant="secondary"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Procedures (1/3 width) */}
          <div className="bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 flex flex-col">
            <div className="p-6 bg-muted/20 border-b border-border/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <div className="p-2 rounded-xl bg-info/10 text-info">
                  <Stethoscope className="h-5 w-5" />
                </div>
                Recent Care
              </h3>
              <Badge className="bg-warning/10 text-warning border-warning/20">
                {stats.pendingReports} pending reports
              </Badge>
            </div>
            <div className="p-5 space-y-4 flex-1">
              {loading ? (
                <div className="p-10 text-center text-muted-foreground italic">Fetching history...</div>
              ) : recentProcedures.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">No recent procedures</div>
              ) : (
                recentProcedures.map((proc) => (
                  <div key={proc.id} className="relative flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-info/20 to-info/5 flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-info" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground leading-tight">{proc.patientName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{proc.procedure}</p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        {proc.date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-border/50">
              <Link to="/doctor/procedures">
                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold group">
                  View All Procedures
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DoctorProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
    </MainLayout>
  );
}
