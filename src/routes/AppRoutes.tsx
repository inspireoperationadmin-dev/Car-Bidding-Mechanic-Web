import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { MainLayout } from "../components/layout/MainLayout";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const VerificationPage = lazy(() => import("../pages/VerificationPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const AvailableJobs = lazy(() => import("../pages/AvailableJobs"));
const MyBidsPage = lazy(() => import("../pages/MyBidsPage")); // export default உள்ளது
const ProfilePage = lazy(() => import("../pages/ProfilePage")); // export default உள்ளது
const EditProfilePage = lazy(() => import("../pages/EditProfilePage"));

const JobDetail = lazy(() =>
  import("../pages/JobDetail").then((module) => ({ default: module.JobDetail }))
);
const Notifications = lazy(() => import("../pages/Notifications"));
const Settings = lazy(() =>
  import("../pages/Settings").then((module) => ({ default: module.Settings }))
);
const PortfolioPage = lazy(() => import("../pages/Portfolio"));
const WorkHistoryPage = lazy(() => import("../pages/WorkHistoryPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage")); // ✅ Import ResetPasswordPage
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* --- 1. Public Routes --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* --- 2. Protected Dashboard Routes --- */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs" element={<AvailableJobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/my-bids" element={<MyBidsPage />} />
            <Route path="/work-history" element={<WorkHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            {/* ✅ Route with Sidebar */}
            <Route path="/account-verification" element={<VerificationPage />} />
          </Route>

          {/* --- 3. Redirects --- */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
