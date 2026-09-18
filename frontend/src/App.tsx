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

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/select-role" element={<RoleSelection />} />
            
            {/* Role Protected Routes (Requires Onboarding) */}
            <Route element={<RoleProtectedRoute allowedRoles={['WORKER']} requireOnboarding={true} />}>
              <Route path="/worker/*" element={<WorkerDashboard />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['WORKER']} requireOnboarding={false} />}>
              <Route path="/worker/onboarding" element={<WorkerOnboarding />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['EMPLOYER']} requireOnboarding={true} />}>
              <Route path="/employer/*" element={<EmployerDashboard />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['EMPLOYER']} requireOnboarding={false} />}>
              <Route path="/employer/onboarding" element={<EmployerOnboarding />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['CONTRACTOR']} requireOnboarding={true} />}>
              <Route path="/contractor/*" element={<ContractorDashboard />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['CONTRACTOR']} requireOnboarding={false} />}>
              <Route path="/contractor/onboarding" element={<ContractorOnboarding />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} requireOnboarding={false} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
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
