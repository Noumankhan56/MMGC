import { Layout } from "@/components/Layout";
import { DashboardStats } from "@/components/DashboardStats";
import { AppointmentsList } from "@/components/AppointmentsList";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="mt-1 text-muted-foreground">Welcome to MMGC Admin Panel</p>
        </div>

        <DashboardStats />

        <AppointmentsList />
      </div>
    </Layout>
  );
};

export default Index;
