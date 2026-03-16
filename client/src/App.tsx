import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import Procedures from "./pages/Procedures";
import Laboratory from "./pages/Laboratory";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

import DoctorRoutes from "./Doctor/App";
import PatientRoutes from "./Patient/App";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* Patient Module as Root */}
          <Route path="/*" element={<PatientRoutes />} />

          {/* Admin Panel */}
          <Route path="/admin">
            <Route index element={<Navigate to="appointments" replace />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients" element={<Patients />} />
            <Route path="procedures" element={<Procedures />} />
            <Route path="laboratory" element={<Laboratory />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
          </Route>

        {/* Doctor Module */}
        <Route path="/doctor/*" element={<DoctorRoutes />} />

        {/* Global Fallback */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
