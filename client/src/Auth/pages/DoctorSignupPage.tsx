import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import GoogleLoginButton from "../components/GoogleLoginButton";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope,
  Loader2, AlertCircle, ArrowLeft, Clock, Plus, Trash2
} from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface WorkSlot {
  day: string;
  start: string;
  end: string;
}

const DoctorSignupPage: React.FC = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "",
  });

  const [workSchedule, setWorkSchedule] = useState<WorkSlot[]>([
    { day: "Monday", start: "09:00", end: "17:00" },
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addSlot = () => {
    const usedDays = workSchedule.map((s) => s.day);
    const nextDay = days.find((d) => !usedDays.includes(d)) || "Monday";
    setWorkSchedule([...workSchedule, { day: nextDay, start: "09:00", end: "17:00" }]);
  };

  const removeSlot = (index: number) => {
    setWorkSchedule(workSchedule.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof WorkSlot, value: string) => {
    const newSchedule = [...workSchedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setWorkSchedule(newSchedule);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "Doctor",
        phone: form.phone || undefined,
        specialization: form.specialization || undefined,
        workSchedule: workSchedule.length > 0 ? workSchedule : undefined,
      });
      navigate("/doctor", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError("");
    setIsLoading(true);
    try {
      await googleLogin(credential, "Doctor");
      navigate("/doctor", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Google sign-up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-sm";

  return (
    <AuthLayout title="Doctor Registration" subtitle="Join our medical team and start managing your practice">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/auth/signup" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            Doctor Sign Up
          </h2>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`} />
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <>
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-up was cancelled.")}
              disabled={isLoading}
            />
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="doc-name" className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="doc-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Dr. Jane Smith" required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="doc-email" className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="doc-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="doctor@email.com" required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="doc-password" className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="doc-password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 6 characters" required className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="doc-confirm" className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="doc-confirm" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" required className={inputClass} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!form.name || !form.email || !form.password || !form.confirmPassword) { setError("Please fill all required fields."); return; }
                  if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
                  setError(""); setStep(2);
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="doc-phone" className="block text-sm font-medium mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="doc-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="03XX-XXXXXXX" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="doc-spec" className="block text-sm font-medium mb-1.5">Specialization</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="doc-spec" type="text" value={form.specialization} onChange={(e) => update("specialization", e.target.value)} placeholder="e.g. Gynecology" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Work Schedule */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Work Schedule
                  </label>
                  {workSchedule.length < 7 && (
                    <button type="button" onClick={addSlot} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> Add Day
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {workSchedule.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30">
                      <select
                        value={slot.day}
                        onChange={(e) => updateSlot(i, "day", e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:border-primary"
                      >
                        {days.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input type="time" value={slot.start} onChange={(e) => updateSlot(i, "start", e.target.value)} className="w-24 px-2 py-1.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input type="time" value={slot.end} onChange={(e) => updateSlot(i, "end", e.target.value)} className="w-24 px-2 py-1.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={() => removeSlot(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border-2 border-border text-foreground font-semibold text-sm hover:bg-muted transition-all">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Doctor Account"}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default DoctorSignupPage;
