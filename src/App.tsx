import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import CareerSelection from "./pages/CareerSelection";
import SkillGap from "./pages/SkillGap";
import CareerMatching from "./pages/CareerMatching";
import Recommendations from "./pages/Recommendation";
import Roadmap from "./pages/Roadmap";
import JobAnalyzer from "./pages/JobAnalyzer";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import { useAuthStore } from "./store";

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/careers" element={<CareerSelection />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/career-matching" element={<CareerMatching />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/job-analyzer" element={<JobAnalyzer />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
