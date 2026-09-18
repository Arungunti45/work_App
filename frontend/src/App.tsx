import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './routes/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PhoneOtp } from './pages/auth/PhoneOtp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { RoleSelection } from './pages/auth/RoleSelection';

// Dashboards
import { WorkerDashboard } from './pages/worker/Dashboard';
import { EmployerDashboard } from './pages/employer/Dashboard';
import { ContractorDashboard } from './pages/contractor/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';

// Onboarding
import { WorkerOnboarding } from './pages/worker/Onboarding';
import { EmployerOnboarding } from './pages/employer/Onboarding';
import { ContractorOnboarding } from './pages/contractor/Onboarding';

// Jobs
import { NewJob } from './pages/employer/jobs/NewJob';
import { EmployerJobs } from './pages/employer/jobs/EmployerJobs';
import { AdminModeration } from './pages/admin/jobs/AdminModeration';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';
import { SavedJobsPage } from './pages/jobs/SavedJobsPage';

// Applications (Phase 6)
import { WorkerApplications } from './pages/worker/applications/WorkerApplications';
import { WorkerApplicationDetail } from './pages/worker/applications/WorkerApplicationDetail';
import { EmployerApplications } from './pages/employer/applications/EmployerApplications';
import { ApplicantDetail } from './pages/employer/applications/ApplicantDetail';

// Messaging (Phase 8)
import { MessagesPage } from './pages/messages/MessagesPage';

// Notifications (Phase 9)
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { NotificationSettingsPage } from './pages/settings/NotificationSettingsPage';

// Safety, Verification & Blocking (Phase 10)
import { SafetyPage } from './pages/safety/SafetyPage';
import { VerificationPage } from './pages/verification/VerificationPage';
import { BlockedUsersPage } from './pages/settings/BlockedUsersPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/phone-otp" element={<PhoneOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public Job Routes */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />

          {/* Public Safety Center */}
          <Route path="/safety" element={<SafetyPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/select-role" element={<RoleSelection />} />
            
            {/* Role Protected Routes (Requires Onboarding) */}
            <Route element={<RoleProtectedRoute allowedRoles={['WORKER']} requireOnboarding={true} />}>
              <Route path="/worker/*" element={<WorkerDashboard />} />
              <Route path="/jobs/saved" element={<SavedJobsPage />} />
              <Route path="/my-applications" element={<WorkerApplications />} />
              <Route path="/my-applications/:applicationId" element={<WorkerApplicationDetail />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:conversationId" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/settings/blocked-users" element={<BlockedUsersPage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['WORKER']} requireOnboarding={false} />}>
              <Route path="/worker/onboarding" element={<WorkerOnboarding />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['EMPLOYER']} requireOnboarding={true} />}>
              <Route path="/employer/*" element={<EmployerDashboard />} />
              <Route path="/employer/jobs/new" element={<NewJob />} />
              <Route path="/employer/jobs" element={<EmployerJobs />} />
              <Route path="/employer/applications" element={<EmployerApplications />} />
              <Route path="/employer/applications/:applicationId/worker" element={<ApplicantDetail />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:conversationId" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/settings/blocked-users" element={<BlockedUsersPage />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['EMPLOYER']} requireOnboarding={false} />}>
              <Route path="/employer/onboarding" element={<EmployerOnboarding />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['CONTRACTOR']} requireOnboarding={true} />}>
              <Route path="/contractor/*" element={<ContractorDashboard />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/settings/blocked-users" element={<BlockedUsersPage />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['CONTRACTOR']} requireOnboarding={false} />}>
              <Route path="/contractor/onboarding" element={<ContractorOnboarding />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} requireOnboarding={false} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
