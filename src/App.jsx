import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ConsultationPage } from "./pages/ConsultationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoiceLookupPage } from "./pages/InvoiceLookupPage";
import { InvoicePage } from "./pages/InvoicePage";
import { LoginPage } from "./pages/LoginPage";
import { PatientsPage } from "./pages/PatientsPage";
import { QueuePage } from "./pages/QueuePage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route element={<ProtectedRoute roles={["ADMIN", "STAFF"]} />}>
            <Route path="/registration" element={<RegistrationPage />} />
          </Route>
          <Route path="/queue" element={<QueuePage />} />
          <Route element={<ProtectedRoute roles={["ADMIN", "DOCTOR"]} />}>
            <Route path="/consultation/:visitId" element={<ConsultationPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["ADMIN", "STAFF"]} />}>
            <Route path="/invoice" element={<InvoiceLookupPage />} />
            <Route path="/invoice/:visitId" element={<InvoicePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
