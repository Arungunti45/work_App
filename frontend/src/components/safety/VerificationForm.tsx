import React, { useState } from 'react';
import type { VerificationType } from '../../types/safety';
import { ContentModerationService } from '../../services/contentModerationService';

interface Props {
  type: VerificationType;
  onSubmit: (data: Record<string, string>) => Promise<boolean>;
  onCancel: () => void;
}

const FORM_FIELDS: Record<VerificationType, Array<{ key: string; label: string; placeholder: string; required: boolean }>> = {
  IDENTITY: [
    { key: 'fullName', label: 'Full Legal Name', placeholder: 'As on your ID', required: true },
    { key: 'documentType', label: 'Document Type', placeholder: 'Aadhaar / PAN / Passport', required: true },
  ],
  EMPLOYER: [
    { key: 'companyName', label: 'Company / Business Name', placeholder: 'Registered name', required: true },
    { key: 'businessType', label: 'Business Type', placeholder: 'Proprietorship / Pvt Ltd / LLP', required: true },
    { key: 'registrationNumber', label: 'Registration Number (if applicable)', placeholder: 'Optional', required: false },
    { key: 'website', label: 'Business Website', placeholder: 'https://...', required: false },
  ],
  CONTRACTOR: [
    { key: 'contractorName', label: 'Contractor / Business Name', placeholder: 'Your business name', required: true },
    { key: 'serviceCategory', label: 'Primary Service Category', placeholder: 'e.g. Plumbing, Electrical', required: true },
    { key: 'experienceYears', label: 'Years of Experience', placeholder: 'e.g. 5', required: true },
  ],
  PHONE: [
    { key: 'phoneNumber', label: 'Phone Number', placeholder: '+91 XXXXX XXXXX', required: true },
  ],
  EMAIL: [
    { key: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
  ],
};

export const VerificationForm: React.FC<Props> = ({ type, onSubmit, onCancel }) => {
  const fields = FORM_FIELDS[type] ?? [];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.key]?.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    // Basic content moderation on text fields
    for (const [, value] of Object.entries(formData)) {
      const check = ContentModerationService.validateText(value, 500);
      if (!check.isSafe) {
        setError(check.reason ?? 'Invalid content');
        return;
      }
    }

    setSubmitting(true);
    const success = await onSubmit(formData);
    setSubmitting(false);
    if (!success) {
      setError('Submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
      <h3 style={{ marginTop: 0 }}>Submit {type} Verification</h3>

      <div style={{
        background: '#fff8e1', border: '1px solid #f9a825', borderRadius: 6,
        padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#5d4037',
      }}>
        <strong>Important:</strong> Only provide accurate information.
        Documents are reviewed by our team and kept private.
        Identity verification will be completed through our secure review process.
      </div>

      {fields.map(field => (
        <div key={field.key} style={{ marginBottom: '1rem' }}>
          <label htmlFor={`vf-${field.key}`} style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.875rem' }}>
            {field.label} {field.required && <span style={{ color: '#c62828' }}>*</span>}
          </label>
          <input
            id={`vf-${field.key}`}
            type="text"
            placeholder={field.placeholder}
            value={formData[field.key] ?? ''}
            onChange={e => handleChange(field.key, e.target.value)}
            style={{
              width: '100%', padding: '0.6rem', borderRadius: 6,
              border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box',
            }}
            required={field.required}
          />
        </div>
      ))}

      {error && (
        <div style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            background: '#1565c0', color: 'white', border: 'none',
            borderRadius: 6, padding: '0.6rem 1.5rem', cursor: 'pointer',
            fontWeight: 600, opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Verification'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none', border: '1px solid #ccc',
            borderRadius: 6, padding: '0.6rem 1.25rem', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
