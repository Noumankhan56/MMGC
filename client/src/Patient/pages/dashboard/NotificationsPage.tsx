import { useState, useEffect } from "react";
import { Badge } from "@/Patient/components/ui/badge";
import { Button } from "@/Patient/components/ui/button";
import { 
  Bell, 
  Calendar, 
  FileText, 
  Download, 
  Receipt, 
  Mail, 
  CheckCircle2, 
  Clock,
  Trash2,
  Settings as SettingsIcon,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientProfileId) return;

    const patientId = user.patientProfileId; 
    fetch(`/api/patients/${patientId}/notifications`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching notifications:", err);
        setLoading(false);
      });
  }, [user?.patientProfileId]);

  const markAsRead = async (id: number) => {
    if (!user?.patientProfileId) return;
    const patientId = user.patientProfileId;
    try {
      const res = await fetch(`/api/patients/${patientId}/notifications/${id}/read`, { method: "PUT" });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const deleteNotification = (id: number) => {
    // In a real app, call DELETE /api/notifications/${id}
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "report": return FileText;
      case "appointment": return Calendar;
      case "payment": return Receipt;
      default: return Bell;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse text-lg font-medium">Fetching messages...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Updates on your appointments, lab results, and clinic announcements.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl h-11 px-6 border-border hover:bg-accent transition-all">
              Mark all as read
           </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <div 
                key={notif.id} 
                className={cn(
                  "group relative bg-card rounded-2xl border transition-all duration-300 p-6 pl-16 overflow-hidden",
                  !notif.isRead ? "border-primary/30 shadow-md shadow-primary/5 bg-primary/[0.02]" : "border-border shadow-sm opacity-90"
                )}
              >
                {!notif.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-r-full" />
                )}
                
                <div className={cn(
                  "absolute left-4 top-6 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  !notif.isRead ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground"
                )}>
                   <Icon className="h-5 w-5" />
                </div>

                <div className="flex justify-between items-start gap-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <h3 className={cn("font-bold text-foreground", !notif.isRead ? "text-lg" : "text-base")}>{notif.title}</h3>
                         {!notif.isRead && <Badge className="gradient-primary text-primary-foreground text-[8px] h-4 px-1.5 rounded-full uppercase tracking-tighter">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">{notif.body}</p>
                      <div className="flex items-center gap-3 mt-4">
                         <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(notif.createdAt).toLocaleString()}
                         </span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      {!notif.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 p-0 shadow-sm border border-primary/10 bg-background">
                           <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteNotification(notif.id)} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 p-0 shadow-sm border border-destructive/10 bg-background">
                         <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card rounded-2xl border border-border border-dashed p-20 text-center animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center mx-auto mb-6">
                <Bell className="h-10 w-10 text-muted-foreground/20" />
             </div>
             <h3 className="text-xl font-bold text-foreground">Nothing to see here</h3>
             <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Your notification history is empty. We'll alert you as soon as something important happens.</p>
          </div>
        )}

        <div className="pt-8">
           <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <SettingsIcon className="h-24 w-24 rotate-12" />
              </div>
              <h4 className="font-bold text-base mb-6 flex items-center gap-2">
                 <SettingsIcon className="h-4 w-4 text-primary" />
                 Alert Preferences
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { label: "WhatsApp Alerts", active: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                   { label: "SMS Notifications", active: true, color: "text-blue-500", bg: "bg-blue-500/10" },
                   { label: "Email Updates", active: false, color: "text-muted-foreground", bg: "bg-muted" },
                   { label: "App Push", active: true, color: "text-primary", bg: "bg-primary/10" },
                 ].map((channel, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs", channel.bg, channel.color)}>
                            {channel.label[0]}
                         </div>
                         <span className="text-xs font-bold text-foreground">{channel.label}</span>
                      </div>
                      <Badge className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border-none", 
                        channel.active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted text-muted-foreground")}>
                        {channel.active ? "On" : "Off"}
                      </Badge>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
