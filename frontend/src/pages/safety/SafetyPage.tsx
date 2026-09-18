import React from 'react';
import { Link } from 'react-router-dom';
import { SafetyNotice } from '../../components/safety/SafetyNotice';
import { SafetyActions } from '../../components/safety/SafetyActions';

const TIPS = [
  { icon: '💰', title: 'Never pay to get a job', body: "Legitimate employers on this platform never charge workers to apply or get hired. If someone asks for money, report it immediately." },
  { icon: '🔍', title: 'Verify employer details', body: "Check the employer's profile, verification status, and reviews before accepting any offer. Verified employers have a badge on their profile." },
  { icon: '📄', title: 'Protect your documents', body: "Never share copies of your Aadhaar, PAN, or passport with employers outside the secure verification process." },
  { icon: '💬', title: 'Use platform messaging', body: "Keep all communication through GET YOUR JOB messaging. Avoid moving to WhatsApp or phone early in the relationship." },
  { icon: '🚨', title: 'Report suspicious behavior', body: "If something feels wrong — a too-good offer, requests for upfront fees, pressure tactics — report it using the Report button." },
  { icon: '🤝', title: 'Meet safely for in-person work', body: "For on-site work, meet in public places first. Let someone know where you are going. Trust your instincts." },
  { icon: '🔑', title: 'Protect your account', body: "Never share your OTP, password, or account credentials with anyone — including people claiming to be GET YOUR JOB staff." },
  { icon: '📵', title: 'Avoid unofficial payment requests', body: "All payments related to projects should go through proper channels. Avoid cash payments to strangers before work is verified." },
];


export const SafetyPage: React.FC = () => (
  <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem' }}>
    {/* Header */}
    <div style={{
      background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
      borderRadius: 12, padding: '2rem', color: 'white', marginBottom: '2rem',
    }}>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>🛡️ Safety Center</h1>
      <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
        Your safety is our priority. Here's how to stay protected on GET YOUR JOB.
      </p>
    </div>

    <SafetyNotice type="info" title="Stay safe on GET YOUR JOB">
      Our team actively reviews reports to keep the platform safe.
      If you encounter suspicious behavior, use the report tools available on every job, profile, and message.
    </SafetyNotice>

    {/* Quick actions */}
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Quick Safety Actions</h2>
      <SafetyActions />
    </div>

    {/* Safety tips */}
    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Safety Tips</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      {TIPS.map(tip => (
        <div key={tip.title} style={{
          border: '1px solid #e0e0e0', borderRadius: 10,
          padding: '1.25rem', background: 'white',
        }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{tip.icon}</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>{tip.title}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{tip.body}</p>
        </div>
      ))}
    </div>

    {/* Report section */}
    <div style={{
      background: '#fff8e1', border: '1px solid #f9a825', borderRadius: 10, padding: '1.25rem',
    }}>
      <h3 style={{ marginTop: 0 }}>🚩 Something feels wrong?</h3>
      <p style={{ color: '#555', fontSize: '0.9rem', margin: '0 0 1rem' }}>
        Use the Report button on any job, profile, or message to alert our moderation team.
        Your identity is kept private.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/jobs" style={{
          background: '#1565c0', color: 'white', textDecoration: 'none',
          borderRadius: 6, padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600,
        }}>Browse Jobs</Link>
        <Link to="/settings/blocked-users" style={{
          background: 'none', border: '1px solid #1565c0', color: '#1565c0',
          textDecoration: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontSize: '0.85rem',
        }}>Manage Blocked Users</Link>
      </div>
    </div>
  </div>
);
