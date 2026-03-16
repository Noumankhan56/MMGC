import { Badge } from "@/Patient/components/ui/badge";
import { Bell, Calendar, FileText, Receipt } from "lucide-react";

const notifications = [
  { id: 1, title: "Appointment Confirmed", desc: "Your appointment with Dr. Sarah Ahmed on Mar 5 at 10:00 AM has been confirmed.", time: "2 hours ago", icon: Calendar, read: false },
  { id: 2, title: "Lab Report Ready", desc: "Your blood test report has been uploaded and is ready for download.", time: "1 day ago", icon: FileText, read: false },
  { id: 3, title: "Invoice Generated", desc: "Invoice #INV-2026-042 for your consultation has been generated.", time: "2 days ago", icon: Receipt, read: true },
  { id: 4, title: "Appointment Reminder", desc: "Reminder: You have an appointment with Dr. Kamran Ali on Mar 12 at 2:30 PM.", time: "3 days ago", icon: Bell, read: true },
  { id: 5, title: "Ultrasound Report Ready", desc: "Your ultrasound report has been uploaded by Dr. Fatima Khan.", time: "5 days ago", icon: FileText, read: true },
];

const NotificationsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay updated with your healthcare alerts</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`bg-card rounded-xl p-5 shadow-soft border flex items-start gap-4 transition-all ${n.read ? "border-border" : "border-primary/30 bg-accent/30"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? "bg-accent" : "gradient-primary"}`}>
              <n.icon className={`h-5 w-5 ${n.read ? "text-accent-foreground" : "text-primary-foreground"}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-foreground">{n.title}</h3>
                {!n.read && <Badge className="gradient-primary text-primary-foreground border-transparent text-[10px]">New</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.desc}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
