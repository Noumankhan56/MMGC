import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
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
    href: "/nursing",
    icon: Heart,
    children: [
      { title: "Patient Care", href: "/nursing/care" },
      { title: "Vitals Recording", href: "/nursing/vitals" },
      { title: "Progress Notes", href: "/nursing/notes" },
    ],
  },
  {
    title: "Reception",
    href: "/reception",
    icon: UserCog,
    children: [
      { title: "Patient Registration", href: "/reception/register" },
      { title: "Appointments", href: "/reception/appointments" },
      { title: "MR Numbers", href: "/reception/mr-numbers" },
    ],
  },
  {
    title: "Laboratory",
    href: "/laboratory",
    icon: FlaskConical,
    children: [
      { title: "Sample Management", href: "/laboratory/samples" },
      { title: "Test Reports", href: "/laboratory/reports" },
      { title: "Ultrasound", href: "/laboratory/ultrasound" },
    ],
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: CreditCard,
    children: [
      { title: "Invoices", href: "/accounts/invoices" },
      { title: "Payments", href: "/accounts/payments" },
      { title: "Financial Reports", href: "/accounts/reports" },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Doctor Module"]);
  const location = useLocation();

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

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
            <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-primary-foreground">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Dr. Sarah Wilson</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">Gynecologist</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
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
