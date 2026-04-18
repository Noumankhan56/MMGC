import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import authApi from "../api";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await authApi.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage(data.message || "Your email has been verified successfully!");
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(axiosErr.response?.data?.message || "Email verification failed. The link may have expired.");
      }
    };

    verify();
  }, [token]);

  return (
    <AuthLayout title="Email Verification" subtitle="Confirming your email address">
      <div className="text-center animate-fade-in">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium text-foreground">Verifying your email...</p>
            <p className="text-sm text-muted-foreground">This will only take a moment</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Email Verified!</h2>
            <p className="text-muted-foreground max-w-sm">{message}</p>
            <Link
              to="/auth/login"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Verification Failed</h2>
            <p className="text-muted-foreground max-w-sm">{message}</p>
            <Link
              to="/auth/login"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-foreground font-semibold text-sm hover:bg-muted transition-all"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
