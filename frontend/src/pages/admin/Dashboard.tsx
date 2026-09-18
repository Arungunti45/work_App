import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';

// Placeholder components for nested routes
const AdminOverview = () => <div><h2>Platform Overview</h2><p>Summary cards will go here.</p></div>;
const AdminUsers = () => <div><h2>User Management</h2><p>Search and filter users.</p></div>;
const AdminJobs = () => <div><h2>Job Moderation Queue</h2><p>Review pending jobs.</p></div>;
const AdminVerifications = () => <div><h2>Verification Management</h2><p>Review identity documents.</p></div>;
const AdminReports = () => <div><h2>Report Moderation</h2><p>Review safety reports.</p></div>;
const AdminAuditLogs = () => <div><h2>Audit Logs</h2><p>Immutable system action logs.</p></div>;
const AdminAnalytics = () => <div><h2>Analytics Dashboard</h2><p>Platform metrics and trends.</p></div>;
const AdminSupport = () => <div><h2>Support Tickets</h2><p>Manage user support requests.</p></div>;
const AdminPayments = () => <div><h2>Payments & Subscriptions</h2><p>Review billing events.</p></div>;
const AdminAds = () => <div><h2>Ad Campaigns</h2><p>Manage sponsored placements.</p></div>;

export const AdminDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <nav style={{ width: '250px', padding: '1rem', background: '#1e293b', color: 'white' }}>
        <h2 style={{ marginBottom: '2rem' }}>Admin Panel</h2>
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          Role: {userProfile?.role}
        </div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li><Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
          <li><Link to="/admin/analytics" style={{ color: 'white', textDecoration: 'none' }}>Analytics</Link></li>
          <li><Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>Users</Link></li>
          <li><Link to="/admin/jobs" style={{ color: 'white', textDecoration: 'none' }}>Jobs Moderation</Link></li>
          <li><Link to="/admin/verifications" style={{ color: 'white', textDecoration: 'none' }}>Verifications</Link></li>
          <li><Link to="/admin/reports" style={{ color: 'white', textDecoration: 'none' }}>Reports & Safety</Link></li>
          <li><Link to="/admin/support" style={{ color: 'white', textDecoration: 'none' }}>Support Tickets</Link></li>
          <li><Link to="/admin/audit-logs" style={{ color: 'white', textDecoration: 'none' }}>Audit Logs</Link></li>
          <li><Link to="/admin/payments" style={{ color: 'white', textDecoration: 'none' }}>Finance & Billing</Link></li>
          <li><Link to="/admin/ads" style={{ color: 'white', textDecoration: 'none' }}>Advertising</Link></li>
          <li><Link to="/admin/categories" style={{ color: 'white', textDecoration: 'none' }}>Categories</Link></li>
          <li><Link to="/admin/skills" style={{ color: 'white', textDecoration: 'none' }}>Skills</Link></li>
        </ul>
        <button 
          onClick={handleLogout} 
          aria-label="Log out of Admin Dashboard"
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', width: '100%', position: 'absolute', bottom: '1rem', left: '1rem', maxWidth: '218px' }}
        >
          Logout
        </button>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', background: '#f8fafc' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 tabIndex={0}>Administration</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageSelector />
            <span aria-label="User email">{userProfile?.email}</span>
          </div>
        </header>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/analytics/*" element={<AdminAnalytics />} />
            <Route path="/users/*" element={<AdminUsers />} />
            <Route path="/jobs/*" element={<AdminJobs />} />
            <Route path="/verifications/*" element={<AdminVerifications />} />
            <Route path="/reports/*" element={<AdminReports />} />
            <Route path="/support/*" element={<AdminSupport />} />
            <Route path="/audit-logs/*" element={<AdminAuditLogs />} />
            <Route path="/payments/*" element={<AdminPayments />} />
            <Route path="/subscriptions/*" element={<AdminPayments />} />
            <Route path="/invoices/*" element={<AdminPayments />} />
            <Route path="/refunds/*" element={<AdminPayments />} />
            <Route path="/ads/*" element={<AdminAds />} />
            {/* Fallback */}
            <Route path="*" element={<div><h2>404 - Admin Route Not Found</h2></div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};
