import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

const SETTING_METADATA = {
  'hotel.name': { label: 'Resort Brand Name', icon: '🏨', type: 'text', placeholder: 'Aliya Resort' },
  'hotel.email': { label: 'Inquiries Email Address', icon: '📧', type: 'email', placeholder: 'info@aliyaresort.lk' },
  'hotel.phone': { label: 'Reception Contact Phone', icon: '📞', type: 'tel', placeholder: '+94 11 234 5678' },
  'hotel.address': { label: 'Physical Resort Address', icon: '📍', type: 'text', placeholder: 'Sigiriya, Central Province, Sri Lanka' },
  'currency': { label: 'Operating Currency Code', icon: '💱', type: 'text', placeholder: 'LKR (3 uppercase letters)' },
  'checkin.time': { label: 'Standard Check-in Time', icon: '🕐', type: 'time', placeholder: '14:00 (HH:mm)' },
  'checkout.time': { label: 'Standard Check-out Time', icon: '🕛', type: 'time', placeholder: '11:00 (HH:mm)' },
  'cancellation.hours': { label: 'Free Cancellation Window (Hours)', icon: '🔄', type: 'number', placeholder: '48 (hours before check-in)' },
  'tax.rate': { label: 'Standard Tax Percentage (%)', icon: '🧾', type: 'number', placeholder: '8.0' },
};

function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('token') || 'admin-session-token';
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = () => {
    setLoading(true);
    setErrorMessage('');
    axios.get('/api/admin/settings', { headers })
      .then(res => {
        if (Array.isArray(res.data)) {
          setSettings(res.data);
        }
      })
      .catch(err => {
        setErrorMessage(err.response?.data?.message || 'Could not load system settings from server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const setEdit = (key, val) => {
    setEdits(prev => ({ ...prev, [key]: val }));
  };

  const hasChanges = Object.keys(edits).length > 0;

  // Step 12: Validate and save authorized changes
  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    try {
      const { data } = await axios.put('/api/admin/settings', edits, { headers });
      setSettings(data);
      setEdits({});
      showToast('System settings validated and updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Settings validation failed.';
      setErrorMessage(msg);
      showToast('Validation error: changes not saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (key) => {
    setErrorMessage('');
    try {
      const { data } = await axios.put(`/api/admin/settings/${key}/reset`, {}, { headers });
      setSettings(data);
      const newEdits = { ...edits };
      delete newEdits[key];
      setEdits(newEdits);
      const meta = SETTING_METADATA[key];
      showToast(`"${meta?.label || key}" reset to factory default.`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to reset setting.');
    }
  };

  const handleDiscard = () => {
    setEdits({});
    setErrorMessage('');
  };

  const getValue = (setting) => {
    return edits[setting.key] !== undefined ? edits[setting.key] : (setting.value || '');
  };

  if (loading && settings.length === 0) {
    return <LoadingScreen text="Loading system preferences and settings..." />;
  }

  const sections = [
    {
      title: 'Resort Brand & Contact Profile',
      subtitle: 'Identify the resort across tax invoices, booking confirmations, and public views',
      icon: '🏨',
      keys: ['hotel.name', 'hotel.email', 'hotel.phone', 'hotel.address', 'currency'],
    },
    {
      title: 'Guest Stay & Accounting Policies',
      subtitle: 'Check-in times, free cancellation limits, and invoicing tax calculations',
      icon: '📋',
      keys: ['checkin.time', 'checkout.time', 'cancellation.hours', 'tax.rate'],
    },
  ];

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '12px 18px',
          fontSize: 14, fontWeight: 600,
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.5))',
          backdropFilter: 'blur(8px)',
        }}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Validation Error Alert */}
      {errorMessage && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Configuration Validation Error:</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Floating Save / Discard Bar */}
      {hasChanges && (
        <div style={{
          position: 'sticky', top: 12, zIndex: 100,
          background: 'rgba(24, 25, 22, 0.95)',
          border: '1px solid var(--border-gold, #c5a059)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>✏️</span>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                You have {Object.keys(edits).length} unsaved setting change(s)
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Click save to validate and persist the configuration changes to the database.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleDiscard} disabled={saving}>
              Discard
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving...</>
              ) : (
                '💾 Save Configuration'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sections.map(sec => {
          const sectionSettings = settings.filter(s => sec.keys.includes(s.key));
          if (sectionSettings.length === 0) return null;

          return (
            <div key={sec.title} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <span style={{ marginRight: 8 }}>{sec.icon}</span>
                    {sec.title}
                  </div>
                  <div className="card-subtitle">{sec.subtitle}</div>
                </div>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sectionSettings.map(setting => {
                  const meta = SETTING_METADATA[setting.key] || {
                    label: setting.key, icon: '⚙️', type: 'text', placeholder: ''
                  };
                  const isModified = edits[setting.key] !== undefined;

                  return (
                    <div
                      key={setting.key}
                      style={{
                        padding: '16px 18px',
                        background: isModified ? 'rgba(201,160,48,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isModified ? 'var(--border-gold, #c5a059)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                        borderRadius: 'var(--radius-md, 8px)',
                        display: 'grid',
                        gridTemplateColumns: '260px 1fr 110px',
                        alignItems: 'center',
                        gap: 20
                      }}
                    >
                      {/* Left: Label & Description */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                          {isModified && (
                            <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--gold-400)', color: '#000', borderRadius: 4, fontWeight: 700 }}>
                              EDITED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {setting.description}
                        </div>
                        {setting.updatedAt && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                            Updated: {setting.updatedAt.slice(0, 10)}
                          </div>
                        )}
                      </div>

                      {/* Middle: Input Field */}
                      <div>
                        <input
                          type={meta.type}
                          step={meta.type === 'number' ? 'any' : undefined}
                          className="form-input"
                          style={{
                            width: '100%',
                            fontFamily: meta.type === 'number' || setting.key.includes('time') ? 'monospace' : 'inherit',
                            borderColor: isModified ? 'var(--gold-400)' : undefined
                          }}
                          placeholder={meta.placeholder}
                          value={getValue(setting)}
                          onChange={e => setEdit(setting.key, e.target.value)}
                        />
                      </div>

                      {/* Right: Reset Action */}
                      <div style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleReset(setting.key)}
                          title="Restore factory default"
                        >
                          🔄 Reset
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Settings;
