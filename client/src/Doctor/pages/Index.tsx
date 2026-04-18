import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import { StatsCard } from "@/Doctor/components/dashboard/StatsCard";
import { AppointmentsList } from "@/Doctor/components/dashboard/AppointmentsList";
import { RecentPatients } from "@/Doctor/components/dashboard/RecentPatients";
import { QuickActions } from "@/Doctor/components/dashboard/QuickActions";
import { PendingTasks } from "@/Doctor/components/dashboard/PendingTasks";
import { ActivityChart } from "@/Doctor/components/dashboard/ActivityChart";
import { useAuth } from "@/Auth/AuthContext";
import { AppointmentFormModal } from "@/Doctor/components/doctor/AppointmentFormModal";
import { ProcedureFormModal } from "@/Doctor/components/doctor/ProcedureFormModal";
import {
  Users,
  Calendar,
  Stethoscope,
  Activity,
  BedDouble,
  FlaskConical,
  Clock,
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user?.doctorProfileId) {
      fetchStats();
    }
  }, [user, refreshKey]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/doctors/${user?.doctorProfileId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch doctor stats", e);
    } finally {
      setLoading(false);
    }
  };

  const onAction = (title: string) => {
    if (title === "Book Appointment") setShowAppointmentModal(true);
    if (title === "Add Procedure") setShowProcedureModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, Dr. {user?.name?.split(' ')[0] || "Doctor"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your clinic today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Patients"
            value={loading ? "..." : stats?.todayAppointments || 0}
            change={loading ? "" : "Patients scheduled"}
            changeType="neutral"
            icon={Users}
            iconColor="primary"
          />
          <StatsCard
            title="Total Appointments"
            value={loading ? "..." : stats?.totalAppointments || 0}
            change={loading ? "" : "All time history"}
            changeType="neutral"
            icon={Calendar}
            iconColor="secondary"
          />
          <StatsCard
            title="Total Procedures"
            value={loading ? "..." : stats?.totalProcedures || 0}
            change={loading ? "" : "Successfully performed"}
            changeType="positive"
            icon={Stethoscope}
            iconColor="success"
          />
          <StatsCard
            title="Pending Reports"
            value={loading ? "..." : stats?.pendingReports || 0}
            change={loading ? "" : "Need your review"}
            changeType={stats?.pendingReports > 0 ? "negative" : "positive"}
            icon={FlaskConical}
            iconColor="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <AppointmentsList key={`appts-${refreshKey}`} />
            <ActivityChart />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <QuickActions onAction={onAction} />
            <PendingTasks pendingCount={stats?.pendingReports || 0} />
          </div>
        </div>

        {/* Recent Patients */}
        <RecentPatients key={`patients-${refreshKey}`} />
      </div>

      <AppointmentFormModal 
        isOpen={showAppointmentModal} 
        onClose={() => setShowAppointmentModal(false)} 
        onSuccess={() => {
           setRefreshKey(prev => prev + 1);
        }}
      />

      <ProcedureFormModal 
        isOpen={showProcedureModal} 
        onClose={() => setShowProcedureModal(false)} 
        onSuccess={() => {
           setRefreshKey(prev => prev + 1);
        }}
      />
    </MainLayout>
  );
};

export default Index;


