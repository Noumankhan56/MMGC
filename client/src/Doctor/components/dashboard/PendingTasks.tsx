import { CheckCircle2, Circle, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/Doctor/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueTime?: string;
  type?: string;
}

interface PendingTasksProps {
  pendingCount?: number;
}

const priorityClasses = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function PendingTasks({ pendingCount = 0 }: PendingTasksProps) {
  const tasks: Task[] = [];

  if (pendingCount > 0) {
    tasks.push({
      id: "reports",
      title: `Review ${pendingCount} pending lab report${pendingCount > 1 ? 's' : ''}`,
      priority: "high",
      completed: false,
      dueTime: "Urgent",
      type: "report"
    });
  }

  tasks.push(
    {
      id: "2",
      title: "Complete daily check-up records",
      priority: "medium",
      completed: false,
    },
    {
      id: "3",
      title: "Update medical guidelines",
      priority: "low",
      completed: true,
    }
  );

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border bg-muted/5">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground">Pending Tasks</h3>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-destructive/10 text-destructive rounded-full uppercase">
              Action Required
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2 min-h-[120px]">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border border-transparent",
              task.completed
                ? "bg-muted/30 opacity-60"
                : task.type === 'report' 
                  ? "bg-destructive/5 border-destructive/10 hover:bg-destructive/10" 
                  : "hover:bg-muted/50 hover:border-border/50"
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            ) : task.priority === "high" ? (
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5 scale-110" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-bold tracking-tight",
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}
              >
                {task.title}
              </p>
              {task.dueTime && !task.completed && (
                <p className={cn("text-[10px] mt-0.5 font-black uppercase tracking-widest", priorityClasses[task.priority])}>
                  Priority: {task.dueTime}
                </p>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8">
             <CheckCircle2 className="h-8 w-8 text-success/20 mx-auto mb-2" />
             <p className="text-muted-foreground text-xs italic">All tasks completed!</p>
          </div>
        )}
      </div>
    </div>
  );
}

