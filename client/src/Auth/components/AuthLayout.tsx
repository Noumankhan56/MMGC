import React from "react";
import { Heart, Shield, Stethoscope, Activity, Pill } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const FloatingIcon: React.FC<{
  icon: React.ReactNode;
  className?: string;
  delay?: string;
}> = ({ icon, className, delay }) => (
  <div
    className={`absolute text-white/10 ${className}`}
    style={{
      animation: `float 6s ease-in-out infinite`,
      animationDelay: delay || "0s",
    }}
  >
    {icon}
  </div>
);

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = "Welcome to MMGC",
  subtitle = "Medical & Gynae Clinic Management System",
}) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(178, 48%, 22%) 0%, hsl(178, 48%, 32%) 40%, hsl(177, 48%, 40%) 70%, hsl(170, 55%, 45%) 100%)",
          }}
        />

        {/* Subtle Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Medical Icons */}
        <FloatingIcon
          icon={<Heart size={64} />}
          className="top-[12%] left-[15%]"
          delay="0s"
        />
        <FloatingIcon
          icon={<Stethoscope size={52} />}
          className="top-[30%] right-[20%]"
          delay="1s"
        />
        <FloatingIcon
          icon={<Shield size={48} />}
          className="bottom-[25%] left-[25%]"
          delay="2s"
        />
        <FloatingIcon
          icon={<Activity size={56} />}
          className="bottom-[40%] right-[15%]"
          delay="3s"
        />
        <FloatingIcon
          icon={<Pill size={44} />}
          className="top-[55%] left-[10%]"
          delay="1.5s"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-2xl font-heading font-bold text-white tracking-tight">
                MMGC
              </span>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-4">
            {title}
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-md mb-10">
            {subtitle}
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            {[
              { icon: Shield, text: "Secure Role-Based Access" },
              { icon: Stethoscope, text: "For Doctors, Patients & Admins" },
              { icon: Activity, text: "Real-time Health Monitoring" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-white/80"
                style={{
                  animation: "slideInLeft 0.5s ease-out forwards",
                  animationDelay: `${0.3 + i * 0.15}s`,
                  opacity: 0,
                }}
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full">
            <path
              d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,120 L0,120 Z"
              fill="rgba(255,255,255,0.05)"
            />
          </svg>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground tracking-tight">
              MMGC
            </span>
          </div>

          {children}
        </div>
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
