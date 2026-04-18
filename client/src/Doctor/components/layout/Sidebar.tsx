import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  UserCog,
  ClipboardList,
  TestTube,
  CreditCard,
  ChevronDown,
  Activity,
} from "lucide-react";
import { cn } from "@/Doctor/lib/utils";
import { Button } from "@/Doctor/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/Doctor/components/ui/collapsible";
import { useAuth } from "@/Auth/AuthContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Doctor Module",
    href: "/doctor",
    icon: Stethoscope,
    children: [
      { title: "My Dashboard", href: "/doctor/dashboard" },
      { title: "Appointments", href: "/doctor/appointments" },
      { title: "Procedures", href: "/doctor/procedures" },
      { title: "Patient Records", href: "/doctor/patients" },
    ],
  },
  {
    title: "Nursing Staff",
    href: "/doctor/nursing",
    icon: Heart,
    children: [
      { title: "Patient Care", href: "/doctor/nursing/care" },
      { title: "Vitals Recording", href: "/doctor/nursing/vitals" },
      { title: "Progress Notes", href: "/doctor/nursing/notes" },
    ],
  },
  {
    title: "Reception",
    href: "/doctor/reception",
    icon: UserCog,
    children: [
      { title: "Patient Registration", href: "/doctor/reception/register" },
      { title: "Appointments", href: "/doctor/reception/appointments" },
      { title: "MR Numbers", href: "/doctor/reception/mr-numbers" },
    ],
  },
  {
    title: "Laboratory",
    href: "/doctor/laboratory",
    icon: FlaskConical,
    children: [
      { title: "Sample Management", href: "/doctor/laboratory/samples" },
      { title: "Test Reports", href: "/doctor/laboratory/reports" },
      { title: "Ultrasound", href: "/doctor/laboratory/ultrasound" },
    ],
  },
  {
    title: "Accounts",
    href: "/doctor/accounts",
    icon: CreditCard,
    children: [
      { title: "Invoices", href: "/doctor/accounts/invoices" },
      { title: "Payments", href: "/doctor/accounts/payments" },
      { title: "Financial Reports", href: "/doctor/accounts/reports" },
    ],
  },
  {
    title: "Settings",
    href: "/doctor/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Doctor Module"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  useEffect(() => {
    // Find section that contains current active child
    const currentSection = navItems.find((item) =>
      item.children?.some((child) => location.pathname === child.href)
    );

    if (currentSection && !openSections.includes(currentSection.title)) {
      setOpenSections((prev) => [...prev, currentSection.title]);
    }
  }, [location.pathname]);

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

  // Get user initials for the avatar
  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "DR";

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary">
            <Activity className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">MMGC</h1>
            <p className="text-xs text-sidebar-foreground/70">Medical Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <Collapsible
                  open={openSections.includes(item.title)}
                  onOpenChange={() => toggleSection(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-sidebar-accent",
                        isActiveRoute(item.href) && "bg-sidebar-accent"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSections.includes(item.title) && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 pt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "block px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-sidebar-accent",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground/80"
                          )
                        }
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <NavLink
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary overflow-hidden flex items-center justify-center shrink-0">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-sidebar-primary-foreground">{userInitials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Doctor"}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email || "doctor@mmgc.com"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign Out"
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
