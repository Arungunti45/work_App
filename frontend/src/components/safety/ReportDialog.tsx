import React, { useState } from 'react';
import type { ReportTargetType, CreateReportPayload } from '../../types/safety';
import { REPORT_CATEGORIES } from '../../types/safety';
import { ReportService } from '../../services/reportService';
import { ContentModerationService } from '../../services/contentModerationService';

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string; // display name e.g. "this job" / "this user"
  isOpen: boolean;
  onClose: () => void;
  // Optional extras for message reports
  conversationId?: string;
  messageId?: string;
}

export const ReportDialog: React.FC<Props> = ({
  targetType,
  targetId,
  targetLabel = 'this',
  isOpen,
  onClose,
  conversationId,
  messageId,
}) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = REPORT_CATEGORIES[targetType] ?? [];

  const reset = () => {
    setCategory('');
    setDescription('');
    setError(null);
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) { setError('Please select a reason.'); return; }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please provide a description (at least 5 characters).');
      return;
    }

    const check = ContentModerationService.validateText(description, 2000);
    if (!check.isSafe) { setError(check.reason ?? 'Invalid content'); return; }

    setSubmitting(true);
    try {
      const payload: CreateReportPayload = {
        targetType,
        targetId,
        category,
        description: description.trim(),
        conversationId,
        messageId,
      };
      await ReportService.createReport(payload);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: 12,
        width: '100%', maxWidth: 480,
        padding: '1.5rem', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close */}
        <button
          onClick={handleClose}
          aria-label="Close report dialog"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', color: '#666',
          }}
        >✕</button>

        <h2 id="report-dialog-title" style={{ marginTop: 0, fontSize: '1.15rem' }}>
          Report {targetLabel}
        </h2>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h3 style={{ marginTop: 0, color: '#1565c0' }}>Report submitted successfully.</h3>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>
              Our team will review the report.
              We keep all reporter information private.
            </p>
            <button
              onClick={handleClose}
              style={{
                background: '#1565c0', color: 'white', border: 'none',
                borderRadius: 6, padding: '0.6rem 1.5rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="report-category" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                Reason <span style={{ color: '#c62828' }}>*</span>
              </label>
              <select
                id="report-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 6,
                  border: '1px solid #ddd', fontSize: '0.9rem',
                }}
                required
              >
                <option value="">Select a reason...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="report-description" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                Description <span style={{ color: '#c62828' }}>*</span>
              </label>
              <textarea
                id="report-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe what happened. Be specific."
                rows={4}
                maxLength={2000}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 6,
                  border: '1px solid #ddd', fontSize: '0.875rem',
                  resize: 'vertical', boxSizing: 'border-box',
                }}
                required
              />
              <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'right' }}>
                {description.length}/2000
              </div>
            </div>

            <div style={{
              background: '#f5f5f5', borderRadius: 6, padding: '0.75rem',
              fontSize: '0.78rem', color: '#666', marginBottom: '1rem',
            }}>
              Your identity will not be shared with the reported party.
              False reports may result in action on your account.
            </div>

            {error && (
              <div role="alert" style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#c62828', color: 'white', border: 'none',
                  borderRadius: 6, padding: '0.6rem 1.5rem', cursor: 'pointer',
                  fontWeight: 600, flex: 1, opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'Report'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none', border: '1px solid #ddd',
                  borderRadius: 6, padding: '0.6rem 1rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
