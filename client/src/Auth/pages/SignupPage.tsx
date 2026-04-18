import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import {
  UserRound,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const roles = [
  {
    id: "patient",
    label: "Patient",
    description: "Book appointments, view medical records, and manage your health journey",
    icon: UserRound,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderHover: "hover:border-emerald-400",
    route: "/auth/signup/patient",
  },
  {
    id: "doctor",
    label: "Doctor",
    description: "Manage patients, appointments, prescriptions, and medical procedures",
    icon: Stethoscope,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderHover: "hover:border-blue-400",
    route: "/auth/signup/doctor",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Full system access — manage staff, reports, billing, and clinic operations",
    icon: ShieldCheck,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    borderHover: "hover:border-violet-400",
    route: "/auth/signup/admin",
  },
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Join MMGC"
      subtitle="Create your account and start managing healthcare effortlessly"
    >
      <div className="animate-fade-in">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
          Create Account
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Select your role to get started
        </p>

        {/* Role Cards */}
        <div className="space-y-3">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => navigate(role.route)}
              className={`w-full group flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${role.borderHover}`}
              style={{
                animation: "fadeSlideUp 0.4s ease-out forwards",
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                <role.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground text-base">
                  {role.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                  {role.description}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Back to Login */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Already have an account? <span className="font-semibold text-primary">Sign in</span>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AuthLayout>
  );
};

export default SignupPage;
