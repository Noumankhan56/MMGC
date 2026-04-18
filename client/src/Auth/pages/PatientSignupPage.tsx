import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import GoogleLoginButton from "../components/GoogleLoginButton";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Calendar,
  MapPin, Heart, Loader2, AlertCircle, ArrowLeft, UserRound, Shield
} from "lucide-react";

const genderOptions = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PatientSignupPage: React.FC = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    bloodGroup: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = account, 2 = personal

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
        role: "Patient",
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup || undefined,
        address: form.address || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
      });
      navigate("/", { replace: true });
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
      await googleLogin(credential, "Patient");
      navigate("/", { replace: true });
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
    <AuthLayout title="Patient Registration" subtitle="Create your patient account to book and manage appointments">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/auth/signup"
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <UserRound className="w-4 h-4 text-white" />
              </div>
              Patient Sign Up
            </h2>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-border"}`} />
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google for Step 1 */}
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
          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="patient-name" className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="patient-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="patient-email" className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="patient-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" required className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="patient-password" className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="patient-password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 6 characters" required className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="patient-confirm" className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input id="patient-confirm" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" required className={inputClass} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!form.name || !form.email || !form.password || !form.confirmPassword) {
                    setError("Please fill all required fields.");
                    return;
                  }
                  if (form.password !== form.confirmPassword) {
                    setError("Passwords do not match.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="patient-phone" className="block text-sm font-medium mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="patient-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="03XX-XXXXXXX" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="patient-dob" className="block text-sm font-medium mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="patient-dob" type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="patient-gender" className="block text-sm font-medium mb-1.5">Gender</label>
                  <select id="patient-gender" value={form.gender} onChange={(e) => update("gender", e.target.value)} className={`${inputClass} pl-4`}>
                    {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="patient-blood" className="block text-sm font-medium mb-1.5">Blood Group</label>
                  <div className="relative">
                    <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select id="patient-blood" value={form.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="patient-address" className="block text-sm font-medium mb-1.5">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea id="patient-address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Your address" rows={2} className={`${inputClass} resize-none`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="patient-ec-name" className="block text-sm font-medium mb-1.5">Emergency Contact</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="patient-ec-name" type="text" value={form.emergencyContactName} onChange={(e) => update("emergencyContactName", e.target.value)} placeholder="Contact name" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="patient-ec-phone" className="block text-sm font-medium mb-1.5">Emergency Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="patient-ec-phone" type="tel" value={form.emergencyContactPhone} onChange={(e) => update("emergencyContactPhone", e.target.value)} placeholder="Phone number" className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border-2 border-border text-foreground font-semibold text-sm hover:bg-muted transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    "Create Patient Account"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default PatientSignupPage;
