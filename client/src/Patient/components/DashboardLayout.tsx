import { NavLink } from "../components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";
import {
  Bell,
  Calendar,
  ClipboardList,
  Download,
  Home,
  LogOut,
  Settings,
  Activity,
  User,
  Receipt,
  Stethoscope,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/Patient/lib/utils";
import { useAuth } from "@/Auth/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Appointments", url: "/dashboard/appointments", icon: Calendar },
  { title: "Book Service", url: "/dashboard/book", icon: Stethoscope },
  { title: "Medical History", url: "/dashboard/history", icon: ClipboardList },
  { title: "Reports", url: "/dashboard/reports", icon: Download },
  { title: "Invoices", url: "/dashboard/invoices", icon: Receipt },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-white text-foreground">
      <SidebarContent className="bg-white">
        <div className="p-6 flex items-center gap-3 border-b border-border/50 bg-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Activity className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-none text-foreground">MMGC</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">Patient Portal</span>
            </div>
          )}
        </div>

        <SidebarGroup className="px-3 pt-4">
          {!collapsed && <SidebarGroupLabel className="text-foreground/60 text-[10px] uppercase font-bold tracking-widest px-4 mb-2">Main Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title} 
                    className={cn(
                      "h-11 w-full px-4 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "!bg-primary !text-white shadow-md translate-x-1" 
                        : "!bg-transparent text-foreground/70 hover:!bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-3 text-sm font-medium">
                      <item.icon className={cn(
                        "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-white" : "text-foreground/40 group-hover:text-primary"
                      )} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-11">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 rounded-xl text-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors font-medium w-full"
                >
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span className="text-sm">Sign Out</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout = () => {
  const { user } = useAuth();

  // Get user initials for avatar
  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PT";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background font-sans">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary" />
              <div className="h-5 w-[1px] bg-border hidden md:block" />
              <h2 className="text-sm font-semibold text-muted-foreground hidden md:block">
                Welcome back, <span className="text-primary font-bold">{user?.name || "Patient"}</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all group border border-primary/10">
                <Bell className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
              </button>
              <div className="flex items-center gap-3 pl-2 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none text-foreground">{user?.name || "Patient"}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{user?.role || "Patient"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 ring-2 ring-background ring-offset-2 ring-offset-primary/10 overflow-hidden">
                  {user?.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 bg-accent/5 overflow-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
