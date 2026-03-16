import { Routes, Route } from "react-router-dom";

// Doctor pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Appointments from "./pages/doctor/Appointments";
import Patients from "./pages/doctor/Patients";
import Procedures from "./pages/doctor/Procedures";
import PatientRegistration from "./pages/reception/PatientRegistration";
import TestReports from "./pages/laboratory/TestReports";
import Invoices from "./pages/accounts/Invoices";

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

      {/* Laboratory */}
      <Route path="laboratory/reports" element={<TestReports />} />

      {/* Accounts */}
      <Route path="accounts/invoices" element={<Invoices />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default DoctorRoutes;
