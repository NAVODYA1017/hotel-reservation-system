import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [guest, setGuest] = useState(JSON.parse(localStorage.getItem('guestUser') || 'null'));
  
  const [form, setForm] = useState({
    name: guest?.name || '',
    email: guest?.email || '',
    phone: guest?.phoneNumber || guest?.phone || '',
  });

  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!guest) navigate('/guest-login');
  }, [guest, navigate]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (guest?.id) {
        await axios.put(`/api/users/${guest.id}`, {
          name: form.name,
          phoneNumber: form.phone,
        });
      }
      const updated = { ...guest, name: form.name, phone: form.phone, phoneNumber: form.phone };
      localStorage.setItem('guestUser', JSON.stringify(updated));
      setGuest(updated);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    try {
      if (guest?.id) {
        await axios.put(`/api/users/${guest.id}/password`, {
          oldPassword: passForm.current,
          newPassword: passForm.new,
        });
      }
      showToast('Password changed successfully.');
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently erase your profile.')) return;
    try {
      if (guest?.id) {
        await axios.delete(`/api/users/${guest.id}`);
      }
      localStorage.removeItem('guestUser');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account. Please cancel active bookings first.', 'error');
    }
  };

  if (!guest) return null;

  return (
    <div className="customer-shell">
      <CustomerNav />

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px', fontSize: 14, fontWeight: 600,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="c-section" style={{ maxWidth: 800, margin: '0 auto', width: '100%', flex: 1 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
          My Profile
        </h1>

        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} style={{ color: 'var(--gold-400)' }} /> Personal Details
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="card-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button type="submit" className="hero-btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>Save Changes</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} style={{ color: 'var(--gold-400)' }} /> Change Password
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="card-body">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} required />
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button type="submit" className="btn btn-secondary">Update Password</button>
            </div>
          </form>
        </div>

        {/* Delete Account Section */}
        <div style={{ marginTop: 40, padding: 24, border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-lg)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>Danger Zone: Delete Account</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Permanently erase your account and personal data. This cannot be undone.</div>
          </div>
          <button 
            onClick={handleDeleteAccount}
            className="btn" 
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 20px' }}
          >
            Delete My Account
          </button>
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}

export default Profile;
