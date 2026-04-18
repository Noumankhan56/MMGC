import {
  UserPlus,
  CalendarPlus,
  FileText,
  FlaskConical,
  Receipt,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/Doctor/components/ui/button";
import { cn } from "@/Doctor/lib/utils";

interface QuickActionsProps {
  onAction?: (title: string) => void;
}

const colorClasses: Record<string, string> = {
  primary: "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10",
  secondary: "bg-secondary/5 text-secondary border-secondary/20 hover:bg-secondary/10",
  success: "bg-success/5 text-success border-success/20 hover:bg-success/10",
  warning: "bg-warning/5 text-warning border-warning/20 hover:bg-warning/10",
  info: "bg-info/5 text-info border-info/20 hover:bg-info/10",
  destructive: "bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10",
};

const actions = [
  {
    title: "Book Appointment",
    description: "Schedule visits",
    icon: CalendarPlus,
    color: "primary",
  },
  {
    title: "Add Procedure",
    description: "Record treatment",
    icon: Stethoscope,
    color: "success",
  },
  {
    title: "New Lab Test",
    description: "Order diagnostics",
    icon: FlaskConical,
    color: "warning",
  },
  {
    title: "Patient History",
    description: "View records",
    icon: FileText,
    color: "info",
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card p-5 h-full flex flex-col">
      <h3 className="font-bold text-foreground mb-4 uppercase text-[10px] tracking-widest pl-1 border-l-2 border-primary/50">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => onAction?.(action.title)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-xl border text-center",
              colorClasses[action.color]
            )}
          >
            <action.icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold tracking-tight">{action.title}</span>
            <span className="text-[9px] opacity-70 hidden sm:block font-medium group-hover:opacity-100 mt-0.5">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


