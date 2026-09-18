import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../hooks/useVerification';
import { VerificationStatusCard } from '../../components/safety/VerificationStatusCard';
import { VerificationForm } from '../../components/safety/VerificationForm';
import { SafetyNotice } from '../../components/safety/SafetyNotice';
import type { VerificationType } from '../../types/safety';

export const VerificationPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const role = userProfile?.role;

  // Determine which verification type applies to the current role
  const primaryType: VerificationType =
    role === 'EMPLOYER' ? 'EMPLOYER'
    : role === 'CONTRACTOR' ? 'CONTRACTOR'
    : 'IDENTITY';

  const { verification, loading, error, submit, setError } = useVerification(
    user?.uid ?? null,
    primaryType
  );

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (data: Record<string, string>) => {
    const success = await submit({ type: primaryType, submittedData: data });
    if (success) setShowForm(false);
    return success;
  };

  if (!user) {
    return <div style={{ padding: '2rem' }}>Please log in to view verification.</div>;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>Account Verification</h1>

      <SafetyNotice type="info">
        Verified accounts build trust on the platform. Employers and workers are more likely
        to engage with verified profiles. Documents are reviewed privately by our team.
      </SafetyNotice>

      {loading ? (
        <div style={{ color: '#999' }}>Loading verification status...</div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <VerificationStatusCard
              verification={verification}
              type={primaryType}
              onStartVerification={() => setShowForm(true)}
            />
          </div>

          {error && (
            <div role="alert" style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {showForm && (
            <div style={{ marginTop: '1.5rem' }}>
              <VerificationForm
                type={primaryType}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setError(null); }}
              />
            </div>
          )}

          {/* Identity verification section for workers */}
          {role === 'WORKER' && !showForm && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Also available</h2>
              <p style={{ color: '#555', fontSize: '0.875rem' }}>
                Identity verification provides an additional layer of trust.
                It will be available through our secure review process.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
