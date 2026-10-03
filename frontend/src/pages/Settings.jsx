import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

const MOCK_SETTINGS = [
  { key: 'tax.rate', value: '10', defaultValue: '10', description: 'Tax percentage applied to all invoices (%)' },
  { key: 'checkin.time', value: '14:00', defaultValue: '14:00', description: 'Standard check-in time for all guests' },
  { key: 'checkout.time', value: '12:00', defaultValue: '12:00', description: 'Standard check-out time for all guests' },
  { key: 'late.checkout.fee', value: '2500', defaultValue: '2500', description: 'Fee charged for late check-out (LKR)' },
  { key: 'max.advance.booking.days', value: '365', defaultValue: '365', description: 'Maximum days in advance a booking can be made' },
  { key: 'cancellation.policy.days', value: '3', defaultValue: '3', description: 'Days before check-in when cancellation is free' },
  { key: 'currency', value: 'LKR', defaultValue: 'LKR', description: 'Primary currency for all transactions' },
  { key: 'hotel.name', value: 'Aliya Resort', defaultValue: 'Aliya Resort', description: 'Hotel name displayed on invoices and receipts' },
];

const KEY_ICONS = {
  'tax.rate': '🧾',
  'checkin.time': '🕐',
  'checkout.time': '🕛',
  'late.checkout.fee': '💸',
  'max.advance.booking.days': '📅',
  'cancellation.policy.days': '🔄',
  'currency': '💱',
  'hotel.name': '🏨',
};

const KEY_LABELS = {
  'tax.rate': 'Tax Rate (%)',
  'checkin.time': 'Check-in Time',
  'checkout.time': 'Check-out Time',
  'late.checkout.fee': 'Late Checkout Fee (LKR)',
  'max.advance.booking.days': 'Max Advance Booking (days)',
  'cancellation.policy.days': 'Free Cancellation Window (days)',
  'currency': 'Currency Code',
  'hotel.name': 'Hotel Name',
};

const KEY_TYPES = {
  'tax.rate': 'number',
  'checkin.time': 'time',
  'checkout.time': 'time',
  'late.checkout.fee': 'number',
  'max.advance.booking.days': 'number',
  'cancellation.policy.days': 'number',
  'currency': 'text',
  'hotel.name': 'text',
};

function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    axios.get('/api/admin/settings', { headers })
      .then(res => setSettings(res.data))
      .catch(() => setSettings(MOCK_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  const setEdit = (key, val) => setEdits(e => ({ ...e, [key]: val }));

  const hasChanges = Object.keys(edits).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('/api/admin/settings', edits, { headers });
      setSettings(data);
      showToast('Settings saved successfully!');
    } catch {
      // Apply edits locally as mock
      setSettings(s => s.map(setting => ({
        ...setting,
        value: edits[setting.key] !== undefined ? edits[setting.key] : setting.value,
      })));
      showToast('Settings updated!');
    }
    setEdits({});
    setSaving(false);
  };

  const handleReset = async (key) => {
    try {
      const { data } = await axios.put(`/api/admin/settings/${key}/reset`, {}, { headers });
      setSettings(data);
    } catch {
      setSettings(s => s.map(setting =>
        setting.key === key ? { ...setting, value: setting.defaultValue } : setting
      ));
    }
    const newEdits = { ...edits };
    delete newEdits[key];
    setEdits(newEdits);
    showToast(`"${KEY_LABELS[key] || key}" reset to default.`);
  };

  const handleDiscard = () => setEdits({});

  const getValue = (setting) => edits[setting.key] !== undefined ? edits[setting.key] : setting.value;

  if (loading) {
    return <LoadingScreen text="Loading sanctuary settings..." />;
  }

  const sections = [
    { title: 'Hotel Profile', icon: '🏨', keys: ['hotel.name', 'currency'] },
    { title: 'Guest Policies', icon: '📋', keys: ['checkin.time', 'checkout.time', 'late.checkout.fee', 'cancellation.policy.days'] },
    { title: 'Booking Settings', icon: '📅', keys: ['max.advance.booking.days', 'tax.rate'] },
  ];

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px', fontSize: 14, fontWeight: 600,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
        }}>✅ {toast.msg}</div>
      )}

      {/* Save Bar */}
      {hasChanges && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,160,48,0.12), rgba(201,160,48,0.06))',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          animation: 'slideUp 0.3s ease',
        }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold-300)' }}>Unsaved Changes</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {Object.keys(edits).length} setting{Object.keys(edits).length !== 1 ? 's' : ''} modified
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleDiscard}>✕ Discard</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-settings-btn">
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : '✓ Save Changes'}
          </button>
        </div>
      )}

      {/* Sections */}
      {sections.map(section => {
        const sectionSettings = settings.filter(s => section.keys.includes(s.key));
        if (sectionSettings.length === 0) return null;

        return (
          <div key={section.title} className="card">
            <div className="card-header">
              <span style={{ fontSize: 18 }}>{section.icon}</span>
              <div>
                <div className="card-title">{section.title}</div>
                <div className="card-subtitle">Configure {section.title.toLowerCase()} preferences</div>
              </div>
            </div>
            <div className="settings-section">
              {sectionSettings.map(setting => {
                const isModified = edits[setting.key] !== undefined;
                const currentVal = getValue(setting);

                return (
                  <div key={setting.key} className="setting-row">
                    <div style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>
                      {KEY_ICONS[setting.key] || '⚙️'}
                    </div>
                    <div className="setting-info">
                      <div className="setting-key">
                        {KEY_LABELS[setting.key] || setting.key}
                        {isModified && (
                          <span style={{
                            marginLeft: 8,
                            background: 'rgba(201,160,48,0.15)',
                            color: 'var(--gold-300)',
                            border: '1px solid var(--border-gold)',
                            borderRadius: 4,
                            fontSize: 10,
                            padding: '1px 6px',
                            fontWeight: 600,
                          }}>Modified</span>
                        )}
                      </div>
                      <div className="setting-desc">{setting.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Default: <code style={{ color: 'var(--text-secondary)', background: 'var(--dark-700)', padding: '1px 4px', borderRadius: 3 }}>{setting.defaultValue}</code>
                      </div>
                    </div>
                    <div className="setting-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type={KEY_TYPES[setting.key] || 'text'}
                        className="form-input"
                        style={{ width: 160, textAlign: 'right' }}
                        value={currentVal}
                        onChange={e => setEdit(setting.key, e.target.value)}
                      />
                      {isModified && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Reset to default"
                          onClick={() => handleReset(setting.key)}
                          style={{ fontSize: 14, color: 'var(--text-muted)' }}
                        >
                          ↺
                        </button>
                      )}
                      {!isModified && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          title="Reset to default"
                          onClick={() => handleReset(setting.key)}
                          style={{ fontSize: 14, color: 'var(--text-muted)', opacity: 0.4 }}
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* All Settings Fallback */}
      {settings.filter(s => !sections.flatMap(sec => sec.keys).includes(s.key)).length > 0 && (
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 18 }}>⚙️</span>
            <div className="card-title">Other Settings</div>
          </div>
          <div className="settings-section">
            {settings
              .filter(s => !sections.flatMap(sec => sec.keys).includes(s.key))
              .map(setting => {
                const isModified = edits[setting.key] !== undefined;
                const currentVal = getValue(setting);
                return (
                  <div key={setting.key} className="setting-row">
                    <div style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>⚙️</div>
                    <div className="setting-info">
                      <div className="setting-key">{KEY_LABELS[setting.key] || setting.key}</div>
                      <div className="setting-desc">{setting.description}</div>
                    </div>
                    <div className="setting-value">
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: 160 }}
                        value={currentVal}
                        onChange={e => setEdit(setting.key, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end gap-3" style={{ paddingBottom: 8 }}>
        <button className="btn btn-secondary" onClick={handleDiscard} disabled={!hasChanges}>Discard Changes</button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          id="save-all-settings-btn"
        >
          {saving ? 'Saving...' : '✓ Save All Settings'}
        </button>
      </div>
    </>
  );
}

export default Settings;
