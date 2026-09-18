import React, { useState, useEffect } from 'react';
import { NotificationPreferenceService } from '../../services/notificationPreferenceService';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import type { NotificationPreferences } from '../../types/notifications';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../types/notifications';

interface Props {
  uid: string;
}

type Category = keyof NotificationPreferences;

const CATEGORY_LABELS: Record<Category, string> = {
  jobs:         '💼 Jobs',
  applications: '📋 Applications',
  interviews:   '🗓️ Interviews',
  messages:     '💬 Messages',
  teams:        '👥 Teams',
  projects:     '🏗️ Projects',
  account:      '🔐 Account (required)',
};

export const NotificationSettings: React.FC<Props> = ({ uid }) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { permissionState, isSupported, isRegistering, enablePush } = usePushNotifications(uid);

  useEffect(() => {
    NotificationPreferenceService.getPreferences(uid)
      .then(p => { setPrefs(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, [uid]);

  const toggle = (category: Category, channel: 'inApp' | 'browserPush') => {
    if (category === 'account') return; // mandatory
    setPrefs(prev => ({
      ...prev,
      [category]: { ...prev[category], [channel]: !prev[category][channel] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await NotificationPreferenceService.savePreferences(uid, prefs);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pushStatusLabel: Record<string, string> = {
    granted:     '✅ Browser notifications are enabled',
    denied:      '🚫 Browser notifications are blocked. Change this in your browser settings.',
    default:     '🔔 Browser notifications not yet enabled',
    unsupported: '⚠️ Your browser does not support push notifications',
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Loading preferences...</div>;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ marginTop: 0 }}>Notification Settings</h2>

      {/* Push Permission Card */}
      <div style={{
        background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: 10,
        padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Browser Push Notifications</h3>
        <p style={{ color: '#555', fontSize: '0.875rem', margin: '0 0 1rem' }}>
          {pushStatusLabel[permissionState]}
        </p>
        {isSupported && permissionState === 'default' && (
          <button
            onClick={() => enablePush()}
            disabled={isRegistering}
            style={{
              background: '#1565c0', color: 'white', border: 'none',
              borderRadius: 6, padding: '0.5rem 1.25rem', cursor: 'pointer',
              fontWeight: 600, opacity: isRegistering ? 0.7 : 1,
            }}
          >
            {isRegistering ? 'Enabling...' : 'Enable Notifications'}
          </button>
        )}
        {permissionState === 'denied' && (
          <p style={{ color: '#d32f2f', fontSize: '0.82rem', margin: 0 }}>
            To re-enable: click the 🔒 icon in your browser address bar → Notifications → Allow.
          </p>
        )}
      </div>

      {/* Per-category toggles */}
      <div style={{ borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 100px 120px',
          padding: '0.6rem 1rem', background: '#f5f5f5',
          fontSize: '0.78rem', fontWeight: 700, color: '#666',
        }}>
          <div>Category</div>
          <div style={{ textAlign: 'center' }}>In-App</div>
          <div style={{ textAlign: 'center' }}>Browser Push</div>
        </div>

        {(Object.keys(prefs) as Category[]).map((cat, i) => (
          <div
            key={cat}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 120px',
              padding: '0.875rem 1rem', alignItems: 'center',
              borderTop: i === 0 ? 'none' : '1px solid #f0f0f0',
              background: cat === 'account' ? '#fff8e1' : 'white',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: cat === 'account' ? 600 : 400 }}>
              {CATEGORY_LABELS[cat]}
            </div>
            <div style={{ textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={prefs[cat].inApp}
                disabled={cat === 'account'}
                onChange={() => toggle(cat, 'inApp')}
                aria-label={`In-app ${cat} notifications`}
                style={{ width: 18, height: 18, cursor: cat === 'account' ? 'not-allowed' : 'pointer' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={prefs[cat].browserPush}
                disabled={cat === 'account' || !isSupported || permissionState !== 'granted'}
                onChange={() => toggle(cat, 'browserPush')}
                aria-label={`Browser push ${cat} notifications`}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: '#1565c0', color: 'white', border: 'none',
            borderRadius: 6, padding: '0.6rem 1.5rem', cursor: 'pointer',
            fontWeight: 600, opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        {saved && <span style={{ color: '#388e3c', fontSize: '0.875rem' }}>✓ Saved!</span>}
      </div>

      <p style={{ fontSize: '0.78rem', color: '#999', marginTop: '0.75rem' }}>
        Account security notifications cannot be disabled for your safety.
        Email notifications are stored for future use but not delivered yet.
      </p>
    </div>
  );
};
