import React, { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, Stethoscope, ShieldCheck, User, ArrowLeft } from "lucide-react";

type LoginRole = "Patient" | "Doctor" | "Admin";

const roleTabs: { role: LoginRole; label: string; icon: React.ElementType; color: string }[] = [
  { role: "Patient", label: "Patient", icon: User, color: "bg-emerald-500" },
  { role: "Doctor", label: "Doctor", icon: Stethoscope, color: "bg-blue-500" },
  { role: "Admin", label: "Admin", icon: ShieldCheck, color: "bg-purple-500" },
];

const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine initial role from query param
  const queryRole = searchParams.get("role") as LoginRole | null;
  const validRoles: LoginRole[] = ["Patient", "Doctor", "Admin"];
  const initialRole: LoginRole = queryRole && validRoles.includes(queryRole) ? queryRole : "Patient";

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [selectedRole, setSelectedRole] = useState<LoginRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const redirectAfterLogin = (role: string) => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      const routes: Record<string, string> = {
        Admin: "/admin/appointments",
        Doctor: "/doctor/",
        Patient: "/dashboard",
      };
      navigate(routes[role] || "/", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem("mmgc_user") || "{}");
      redirectAfterLogin(user.role);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await googleLogin(credential, selectedRole);
      const user = JSON.parse(localStorage.getItem("mmgc_user") || "{}");
      redirectAfterLogin(user.role);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const currentTab = roleTabs.find((t) => t.role === selectedRole)!;

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to manage your healthcare journey">
      <div className="animate-fade-in relative">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
        
        <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
          Sign In
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select your role and enter your credentials
        </p>

        {/* ── Role Selector Tabs ── */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-6">
          {roleTabs.map((tab) => {
            const isSelected = selectedRole === tab.role;
            return (
              <button
                key={tab.role}
                type="button"
                onClick={() => setSelectedRole(tab.role)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isSelected ? "text-primary" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Role Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentTab.color}/10 border border-current/5 mb-6`}>
          <div className={`w-2 h-2 rounded-full ${currentTab.color}`} />
          <span className="text-xs font-medium text-foreground/70">
            Signing in as <span className="font-semibold text-foreground">{selectedRole}</span>
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Login */}
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in was cancelled.")}
          disabled={isGoogleLoading || isLoading}
          label={isGoogleLoading ? "Signing in..." : "Continue with Google"}
        />

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="block text-sm font-medium text-foreground">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              `Sign In as ${selectedRole}`
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-primary font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
