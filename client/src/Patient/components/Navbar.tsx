import { Button } from "@/Patient/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Patient/components/ui/dropdown-menu";

import {
  Activity,
  Menu,
  X,
  Stethoscope,
  ShieldCheck,
  ChevronDown,
  User,
} from "lucide-react";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Doctors", href: "/doctors" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handlePatientPortal = () => {
    if (isAuthenticated && user?.role === "Patient") {
      navigate("/dashboard");
    } else {
      navigate("/auth/login?role=Patient");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto grid grid-cols-3 items-center h-16 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-white" />
          </div>

          <div className="leading-tight">
            <span className="font-heading font-bold text-lg">MMGC</span>
            <p className="text-[10px] text-muted-foreground">
              Medical Management
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition duration-200 hover:text-primary ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex justify-end gap-3 items-center">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 hover:bg-primary hover:text-white transition"
              >
                Log In
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44 rounded-lg shadow-lg"
            >
              <DropdownMenuItem asChild>
                <Link
                  to="/auth/login?role=Doctor"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor Login
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/auth/login?role=Admin"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Login
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Patient Portal Button */}
          <button
            onClick={handlePatientPortal}
            className="px-5 py-2 rounded-lg font-medium bg-primary text-white border border-primary transition hover:bg-white hover:text-primary"
          >
            Patient Portal
          </button>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden justify-self-end p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="flex flex-col p-4 gap-3">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t pt-4 flex flex-col gap-3">

              <Button variant="outline" asChild>
                <Link to="/auth/login?role=Doctor" onClick={() => setMobileOpen(false)}>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Doctor Login
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link to="/auth/login?role=Admin" onClick={() => setMobileOpen(false)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin Login
                </Link>
              </Button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handlePatientPortal();
                }}
                className="px-4 py-2 rounded-lg font-medium text-center bg-primary text-white border border-primary hover:bg-white hover:text-primary transition"
              >
                Patient Portal
              </button>

            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
