import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';
import { AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

function GuestLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const setLF = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));

  // Register form
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const setRF = (k, v) => setRegForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Try Teammate 1's Customer Auth API (/api/auth/login)
      const res = await axios.post('/api/auth/login', { email: loginForm.email, password: loginForm.password });
      if (res.data) {
        localStorage.setItem('guestUser', JSON.stringify(res.data));
        navigate(redirect);
        return;
      }
    } catch (err1) {
      try {
        // 2. Try Admin Auth API (/api/admin/auth/login)
        const adminRes = await axios.post('/api/admin/auth/login', { email: loginForm.email, password: loginForm.password });
        if (adminRes.data?.user) {
          localStorage.setItem('guestUser', JSON.stringify(adminRes.data.user));
          navigate(redirect);
          return;
        }
      } catch (err2) {
        setError(err1.response?.data?.message || err2.response?.data?.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // Call Teammate 1's Customer Registration API (/api/auth/register)
      const res = await axios.post('/api/auth/register', {
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        phoneNumber: regForm.phone,
      });
      if (res.data) {
        localStorage.setItem('guestUser', JSON.stringify(res.data));
        navigate(redirect);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-shell">
      <CustomerNav />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', position: 'relative' }}>
        {/* Background */}
        <div style={{
          position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(201,160,48,0.07) 0%, transparent 60%)',
        }} />

        <div style={{
          width: '100%', maxWidth: 480,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 44px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.4s ease',
          position: 'relative',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button
              onClick={() => navigate('/')}
              title="Return to Aliya Resort Home"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto 14px' }}
            >
              <img
                src="/assets/images/logo.png"
                alt="Aliya Resort"
                style={{ width: 68, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(197, 160, 89, 0.45))' }}
              />
            </button>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {tab === 'login' ? 'Sanctuary Access' : 'Join The Haven'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {tab === 'login' ? 'Sign in to manage your Aliya Resort reservations & invoices' : 'Create an account to book secluded countryside apartments'}
            </div>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLF('email', e.target.value)}
                  placeholder="your@email.com"
                  required autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={e => setLF('password', e.target.value)}
                    placeholder="Your password"
                    required autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '4px 0', fontSize: 12 }}>Forgot password?</button>
              </div>
              <button
                id="guest-login-btn"
                type="submit"
                className="hero-btn-primary w-full"
                style={{ borderRadius: 'var(--radius-md)', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing In...</> : 'Sign In'}
              </button>

              <div style={{ position: 'relative', textAlign: 'center', margin: '4px 0' }}>
                <hr className="divider" />
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--dark-800)', padding: '0 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                  or continue with
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ label: 'Google' }, { label: 'Facebook' }].map(s => (
                  <button key={s.label} type="button" className="btn btn-secondary" style={{ justifyContent: 'center', gap: 8 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={regForm.name} onChange={e => setRF('name', e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={regForm.email} onChange={e => setRF('email', e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" value={regForm.phone} onChange={e => setRF('phone', e.target.value)} placeholder="+94 77 123 4567" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type={showPass ? 'text' : 'password'} value={regForm.password} onChange={e => setRF('password', e.target.value)} placeholder="Min. 6 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input className="form-input" type={showPass ? 'text' : 'password'} value={regForm.confirmPassword} onChange={e => setRF('confirmPassword', e.target.value)} placeholder="Repeat password" required />
                </div>
              </div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                <input type="checkbox" required style={{ marginTop: 2 }} />
                <span>I agree to the <span style={{ color: 'var(--gold-300)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--gold-300)', cursor: 'pointer' }}>Privacy Policy</span></span>
              </label>
              <button
                id="guest-register-btn"
                type="submit"
                className="hero-btn-primary w-full"
                style={{ borderRadius: 'var(--radius-md)', justifyContent: 'center', marginTop: 4 }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating Account...</> : 'Create My Account'}
              </button>
            </form>
          )}

          {/* Member perks */}
          <div style={{ marginTop: 28, padding: '16px', background: 'rgba(201,160,48,0.06)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-300)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} /> Member Benefits
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Exclusive member rates & early access to deals', 'Easy booking management & cancellation', 'Priority concierge & room upgrades'].map(b => (
                <div key={b} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--gold-400)' }}>✓</span> {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}

export default GuestLogin;
