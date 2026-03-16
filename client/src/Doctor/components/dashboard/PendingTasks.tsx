import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/Doctor/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueTime?: string;
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Review lab reports for Priya Sharma",
    priority: "high",
    completed: false,
    dueTime: "11:00 AM",
  },
  {
    id: "2",
    title: "Complete discharge summary - Room 204",
    priority: "high",
    completed: false,
    dueTime: "12:00 PM",
  },
  {
    id: "3",
    title: "Sign prescription refills (3 pending)",
    priority: "medium",
    completed: false,
  },
  {
    id: "4",
    title: "Update patient vitals - IPD Ward",
    priority: "medium",
    completed: true,
  },
  {
    id: "5",
    title: "Review ultrasound images",
    priority: "low",
    completed: false,
    dueTime: "03:00 PM",
  },
];

const priorityClasses = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function PendingTasks() {
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Pending Tasks</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive rounded-full">
            {pendingCount}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
              task.completed
                ? "bg-muted/30 opacity-60"
                : "hover:bg-muted/50"
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            ) : task.priority === "high" ? (
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </p>
              {task.dueTime && !task.completed && (
                <p className={cn("text-xs mt-0.5", priorityClasses[task.priority])}>
                  Due: {task.dueTime}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
