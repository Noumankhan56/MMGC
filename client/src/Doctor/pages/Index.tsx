import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import { StatsCard } from "@/Doctor/components/dashboard/StatsCard";
import { AppointmentsList } from "@/Doctor/components/dashboard/AppointmentsList";
import { RecentPatients } from "@/Doctor/components/dashboard/RecentPatients";
import { QuickActions } from "@/Doctor/components/dashboard/QuickActions";
import { PendingTasks } from "@/Doctor/components/dashboard/PendingTasks";
import { ActivityChart } from "@/Doctor/components/dashboard/ActivityChart";
import {
  Users,
  Calendar,
  Stethoscope,
  Activity,
  BedDouble,
  FlaskConical,
} from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, Dr. Sarah
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your clinic today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Patients"
            value={42}
            change="+12% from yesterday"
            changeType="positive"
            icon={Users}
            iconColor="primary"
          />
          <StatsCard
            title="Appointments"
            value={18}
            change="5 pending"
            changeType="neutral"
            icon={Calendar}
            iconColor="secondary"
          />
          <StatsCard
            title="Procedures"
            value={6}
            change="2 scheduled"
            changeType="neutral"
            icon={Stethoscope}
            iconColor="success"
          />
          <StatsCard
            title="IPD Patients"
            value={12}
            change="3 discharges today"
            changeType="positive"
            icon={BedDouble}
            iconColor="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <AppointmentsList />
            <ActivityChart />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <QuickActions />
            <PendingTasks />
          </div>
        </div>

        {/* Recent Patients */}
        <RecentPatients />
      </div>
    </MainLayout>
  );
};

export default Index;
