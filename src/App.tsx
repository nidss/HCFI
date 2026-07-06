import { Route, Routes } from "react-router-dom";
import { StaffLayout } from "./layouts/StaffLayout";
import { Overview } from "./pages/Overview";
import { Reception } from "./pages/Reception";
import { Cashier } from "./pages/Cashier";
import { Documents } from "./pages/Documents";
import { Accounting } from "./pages/Accounting";
import { Delivery } from "./pages/Delivery";
import { AuditLog } from "./pages/AuditLog";
import { Settings } from "./pages/Settings";
import { InsurerLogin } from "./pages/insurer/InsurerLogin";
import { InsurerDownload } from "./pages/insurer/InsurerDownload";
import { InsurerOverview } from "./pages/insurer/InsurerOverview";
import { PortalSelection } from "./pages/PortalSelection";
import { PatientPortalLayout } from "./layouts/PatientPortalLayout";
import { PatientSelect } from "./pages/patient/PatientSelect";
import { PatientSign } from "./pages/patient/PatientSign";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PortalSelection />} />
      <Route element={<StaffLayout />}>
        <Route path="/overview" element={<Overview />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route element={<PatientPortalLayout />}>
        <Route path="/patient/select" element={<PatientSelect />} />
        <Route path="/patient/sign/:hn" element={<PatientSign />} />
      </Route>
      <Route path="/insurer/login" element={<InsurerLogin />} />
      <Route path="/insurer/overview" element={<InsurerOverview />} />
      <Route path="/insurer/download" element={<InsurerDownload />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
