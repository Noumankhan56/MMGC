import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  Loader2, AlertCircle, ArrowLeft, ShieldCheck
} from "lucide-react";

const AdminSignupPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "Admin",
        phone: form.phone || undefined,
      });
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Registration" subtitle="Full system access for clinic management and operations">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/auth/signup" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            Admin Sign Up
          </h2>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-sm dark:bg-violet-950/30 dark:border-violet-800 dark:text-violet-300">
          <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Admin accounts have full access to manage staff, billing, reports, and all clinic operations.</span>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-name" className="block text-sm font-medium mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="admin-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Admin Name" required className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="admin-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="admin@mmgc.com" required className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="admin-phone" className="block text-sm font-medium mb-1.5">Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="admin-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="03XX-XXXXXXX" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 6 characters"
                required
                className={`${inputClass} pr-12`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="admin-confirm" className="block text-sm font-medium mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="admin-confirm" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" required className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default AdminSignupPage;
