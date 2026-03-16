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

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  color: "primary" | "secondary" | "success" | "warning";
  href: string;
}

const actions: QuickAction[] = [
  {
    title: "New Patient",
    description: "Register a new patient",
    icon: UserPlus,
    color: "primary",
    href: "/reception/register",
  },
  {
    title: "Book Appointment",
    description: "Schedule consultation",
    icon: CalendarPlus,
    color: "secondary",
    href: "/reception/appointments",
  },
  {
    title: "Add Procedure",
    description: "Record treatment",
    icon: Stethoscope,
    color: "success",
    href: "/doctor/procedures",
  },
  {
    title: "Lab Test",
    description: "Order diagnostics",
    icon: FlaskConical,
    color: "warning",
    href: "/laboratory/samples",
  },
];

const colorClasses = {
  primary: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
  secondary: "bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground",
  success: "bg-success/10 text-success hover:bg-success hover:text-success-foreground",
  warning: "bg-warning/10 text-warning hover:bg-warning hover:text-warning-foreground",
};

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 group",
              colorClasses[action.color]
            )}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">{action.title}</span>
            <span className="text-xs opacity-70 hidden sm:block">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
