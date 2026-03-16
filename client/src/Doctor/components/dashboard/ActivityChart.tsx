import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", patients: 24, procedures: 8 },
  { name: "Tue", patients: 32, procedures: 12 },
  { name: "Wed", patients: 28, procedures: 10 },
  { name: "Thu", patients: 38, procedures: 15 },
  { name: "Fri", patients: 42, procedures: 18 },
  { name: "Sat", patients: 35, procedures: 14 },
  { name: "Sun", patients: 18, procedures: 6 },
];

export function ActivityChart() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Weekly Activity</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(178, 47%, 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(178, 47%, 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProcedures" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(177, 50%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(177, 50%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(177, 20%, 88%)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0, 0%, 40%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0, 0%, 40%)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(177, 20%, 88%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px hsl(178, 47%, 32%, 0.1)",
              }}
              labelStyle={{ color: "hsl(0, 0%, 12%)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="patients"
              stroke="hsl(178, 47%, 32%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPatients)"
              name="Patients"
            />
            <Area
              type="monotone"
              dataKey="procedures"
              stroke="hsl(177, 50%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProcedures)"
              name="Procedures"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Patients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">Procedures</span>
        </div>
      </div>
    </div>
  );
}
