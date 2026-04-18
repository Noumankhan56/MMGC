import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Auth Module
import { AuthProvider } from "./Auth/AuthContext";
import ProtectedRoute from "./Auth/ProtectedRoute";
import LoginPage from "./Auth/pages/LoginPage";
import SignupPage from "./Auth/pages/SignupPage";
import PatientSignupPage from "./Auth/pages/PatientSignupPage";
import DoctorSignupPage from "./Auth/pages/DoctorSignupPage";
import AdminSignupPage from "./Auth/pages/AdminSignupPage";
import VerifyEmailPage from "./Auth/pages/VerifyEmailPage";

// Admin Pages
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Nurses from "./pages/Nurses";
import Patients from "./pages/Patients";
import Procedures from "./pages/Procedures";
import Laboratory from "./pages/Laboratory";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

// Patient Public Pages (landing, services, etc.)
import PatientIndex from "./Patient/pages/Index";
import DoctorsPage from "./Patient/pages/DoctorsPage";
import ServicesPage from "./Patient/pages/ServicesPage";
import ContactPage from "./Patient/pages/ContactPage";
import AboutPage from "./Patient/pages/AboutPage";

// Patient Dashboard Pages (protected)
import DashboardLayout from "./Patient/components/DashboardLayout";
import DashboardHome from "./Patient/pages/dashboard/DashboardHome";
import AppointmentsPage from "./Patient/pages/dashboard/AppointmentsPage";
import MedicalHistoryPage from "./Patient/pages/dashboard/MedicalHistoryPage";
import ReportsPage from "./Patient/pages/dashboard/ReportsPage";
import NotificationsPage from "./Patient/pages/dashboard/NotificationsPage";
import ProfilePage from "./Patient/pages/dashboard/ProfilePage";
import InvoicesPage from "./Patient/pages/dashboard/InvoicesPage";
import BookService from "./Patient/pages/dashboard/BookService";

// Module Routes
import DoctorRoutes from "./Doctor/App";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID =
  "706779012781-epbi1ck028ib4dsc4523n2fnn3it4cbp.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* ── Public Pages (Patient Landing) ── */}
              <Route path="/" element={<PatientIndex />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* ── Auth Routes (public) ── */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/signup/patient" element={<PatientSignupPage />} />
              <Route path="/auth/signup/doctor" element={<DoctorSignupPage />} />
              <Route path="/auth/signup/admin" element={<AdminSignupPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

              {/* ── Patient Dashboard (protected) ── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Patient"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="book" element={<BookService />} />
                <Route path="history" element={<MedicalHistoryPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* ── Admin Panel (protected) ── */}
              <Route path="/admin">
                <Route
                  index
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Navigate to="appointments" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="appointments"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Appointments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="doctors"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Doctors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="nurses"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Nurses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="patients"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Patients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="procedures"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Procedures />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="laboratory"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Laboratory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="transactions"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Transactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* ── Doctor Module (protected) ── */}
              <Route
                path="/doctor/*"
                element={
                  <ProtectedRoute allowedRoles={["Doctor"]}>
                    <DoctorRoutes />
                  </ProtectedRoute>
                }
              />

              {/* ── Fallback ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
