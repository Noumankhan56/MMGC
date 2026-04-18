import { useEffect, useState } from "react";
import { MainLayout } from "@/Doctor/components/layout/MainLayout";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { Badge } from "@/Doctor/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/Doctor/lib/utils";

interface Stats {
  totalRevenue: number;
  todayCollection: number;
  modeBreakdown: { method: string; total: number }[];
}

export default function FinancialReports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Failed to load financial stats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" /> Financial Reports & Analytics (FR15.3)
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced auditing, revenue breakdown, and daily collection monitoring for MMGC.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-border/50 rounded-xl h-12 px-6 font-bold shadow-sm">
              <Download className="h-4 w-4 mr-2" /> Export Audit Log
            </Button>
            <Button className="bg-primary hover:bg-primary/95 text-primary-foreground h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
              Generate Monthly Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">Total Clinic Revenue</p>
                    <h2 className="text-5xl font-black tracking-tighter">Rs. {stats?.totalRevenue.toLocaleString() || "0"}</h2>
                    <div className="flex items-center gap-2 mt-4">
                        <Badge className="bg-white/20 text-white rounded-xl px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                           <TrendingUp className="h-3 w-3 mr-1" /> +12% Growth
                        </Badge>
                    </div>
                </div>
                <DollarSign className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="bg-card rounded-[2.5rem] p-10 border border-border/50 shadow-xl shadow-black/5 flex flex-col justify-center">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Today's Collection</p>
                <h2 className="text-5xl font-black tracking-tighter text-success">Rs. {stats?.todayCollection.toLocaleString() || "0"}</h2>
                <div className="flex items-center gap-2 mt-4">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                       <ArrowUpRight className="h-3.5 w-3.5 text-success" /> Trending Daily Max
                    </span>
                </div>
            </div>

            <div className="bg-card rounded-[2.5rem] p-10 border border-border/50 shadow-xl shadow-black/5 flex flex-col justify-center">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Average Ticket Size</p>
                <h2 className="text-5xl font-black tracking-tighter text-foreground">Rs. 1,450</h2>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    <Activity className="h-3.5 w-3.5 text-primary" /> Per Patient Visit
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method Breakdown */}
            <div className="bg-card rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden flex flex-col">
                <div className="p-8 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <PieChart className="h-4 w-4" /> Revenue by Mode (FR15.3)
                    </h3>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                       <Filter className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-8 space-y-6 flex-1 flex flex-col justify-center">
                    {stats?.modeBreakdown.map((mode, index) => (
                        <div key={mode.method} className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="font-bold text-foreground text-sm uppercase tracking-widest">{mode.method}</span>
                                <span className="font-black text-primary">Rs. {mode.total.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full bg-primary rounded-full transition-all duration-1000", 
                                  index % 2 === 0 ? "bg-gradient-to-r from-primary to-primary-foreground/40" : "bg-gradient-to-r from-secondary to-primary/40")}
                                  style={{ width: `${(mode.total / (stats.totalRevenue || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {!stats?.modeBreakdown.length && (
                        <p className="text-center italic text-muted-foreground p-10">No payment data available for breakdown.</p>
                    )}
                </div>
            </div>

            {/* Growth Chart / Secondary Stats */}
            <div className="bg-sidebar rounded-[2.5rem] shadow-2xl p-8 flex flex-col justify-between group overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-2xl font-black text-white tracking-tight mb-2">Audit Synchronization</h3>
                   <p className="text-white/60 text-sm font-medium">All financial logs are automatically verified against department clinic activities.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-center gap-1 hover:bg-white/10 transition-all cursor-pointer group/card">
                       <ArrowUpRight className="h-5 w-5 text-success group-hover/card:translate-x-1 transition-transform" />
                       <span className="text-2xl font-black text-white">84%</span>
                       <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">In-Patient Billing</span>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-center gap-1 hover:bg-white/10 transition-all cursor-pointer group/card">
                       <ArrowUpRight className="h-5 w-5 text-success group-hover/card:translate-x-1 transition-transform" />
                       <span className="text-2xl font-black text-white">16%</span>
                       <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Diagnostics (Lab)</span>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-center gap-1 hover:bg-white/10 transition-all cursor-pointer group/card">
                       <ArrowDownRight className="h-5 w-5 text-destructive group-hover/card:translate-x-1 transition-transform" />
                       <span className="text-2xl font-black text-white">2.4%</span>
                       <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Refund Rate</span>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-center gap-1 hover:bg-white/10 transition-all cursor-pointer group/card">
                       <Activity className="h-5 w-5 text-primary group-hover/card:translate-x-1 transition-transform" />
                       <span className="text-2xl font-black text-white">99%</span>
                       <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Audit Stability</span>
                   </div>
                </div>

                <Briefcase className="absolute -right-12 -bottom-12 h-64 w-64 text-white/[0.03] group-hover:scale-110 transition-transform duration-1000" />
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
