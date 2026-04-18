import { Routes, Route } from "react-router-dom";

// Doctor pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Appointments from "./pages/doctor/Appointments";
import Patients from "./pages/doctor/Patients";
import Procedures from "./pages/doctor/Procedures";

// Reception pages
import PatientRegistration from "./pages/reception/PatientRegistration";
import ReceptionAppointments from "./pages/reception/Appointments";
import MRNumbers from "./pages/reception/MRNumbers";

// Nursing pages
import PatientCare from "./pages/nursing/PatientCare";
import VitalsRecording from "./pages/nursing/VitalsRecording";
import ProgressNotes from "./pages/nursing/ProgressNotes";

// Laboratory pages
import SampleManagement from "./pages/laboratory/SampleManagement";
import TestReports from "./pages/laboratory/TestReports";
import Ultrasound from "./pages/laboratory/Ultrasound";

// Accounts pages
import Invoices from "./pages/accounts/Invoices";
import Payments from "./pages/accounts/Payments";

// Settings
import Settings from "@/Doctor/pages/Settings";
import FinancialReports from "./pages/accounts/FinancialReports";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route index element={<Index />} />

      {/* Doctor */}
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="patients" element={<Patients />} />
      <Route path="procedures" element={<Procedures />} />

      {/* Reception */}
      <Route path="reception/register" element={<PatientRegistration />} />
      <Route path="reception/appointments" element={<ReceptionAppointments />} />
      <Route path="reception/mr-numbers" element={<MRNumbers />} />

      {/* Nursing Staff */}
      <Route path="nursing/care" element={<PatientCare />} />
      <Route path="nursing/vitals" element={<VitalsRecording />} />
      <Route path="nursing/notes" element={<ProgressNotes />} />

      {/* Laboratory */}
      <Route path="laboratory/samples" element={<SampleManagement />} />
      <Route path="laboratory/reports" element={<TestReports />} />
      <Route path="laboratory/ultrasound" element={<Ultrasound />} />

      {/* Accounts */}
      <Route path="accounts/invoices" element={<Invoices />} />
      <Route path="accounts/payments" element={<Payments />} />
      <Route path="accounts/reports" element={<FinancialReports />} />

      {/* Settings */}
      <Route path="settings" element={<Settings />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default DoctorRoutes;
