import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('admin@hotel.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/admin/auth/login', { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Store user info if returned
        if (res.data.user) {
          localStorage.setItem('currentUser', JSON.stringify(res.data.user));
          if (res.data.user.role === 'RECEPTIONIST') {
            navigate('/frontdesk');
          } else if (res.data.user.role === 'EVENT_COORDINATOR') {
            navigate('/events-admin');
          } else if (res.data.user.role === 'HOTEL_MANAGER') {
            navigate('/manager');
          } else {
            navigate('/admin');
          }
        } else {
          localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', role: 'SYSTEM_ADMIN' }));
          navigate('/admin');
        }
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'Access denied: You do not have administrator privileges.');
      } else if (err.response?.status === 401) {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      } else if (err.response?.status === 500) {
        const errorText = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || '');
        if (errorText.includes('ECONNREFUSED') || !err.response?.data) {
          setError('Backend server (port 8080) is unreachable. Please ensure the Spring Boot server is started.');
        } else {
          setError(err.response?.data?.message || 'Backend Server Error (500). Please check backend connection.');
        }
      } else if (err.code === 'ERR_NETWORK') {
        // For demo / dev purposes, allow bypass when backend is offline
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('currentUser', JSON.stringify({ name: 'Hotel Manager', role: 'HOTEL_MANAGER' }));
        navigate('/admin');
        return;
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decorations */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
      }}>
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,160,48,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        }} />
      </div>

      <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
        <div className="login-logo" onClick={() => navigate('/')} title="Return to Aliya Resort Home" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/assets/images/logo.png"
            alt="Aliya Resort"
            style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(197, 160, 89, 0.4))' }}
          />
          <div>
            <h1 className="login-title">Aliya Resort</h1>
            <p className="login-subtitle">Staff Administration Portal</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@hotel.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4,
                }}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          padding: '16px',
          background: 'rgba(201,160,48,0.06)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--gold-400)', marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Quick-Fill Staff Accounts (Click to Select)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => { setEmail('admin@hotel.com'); setPassword('admin123'); setError(''); }}
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => { setEmail('manager@hotel.com'); setPassword('manager123'); setError(''); }}
            >
              👔 Manager
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => { setEmail('frontdesk@hotel.com'); setPassword('desk123'); setError(''); }}
            >
              🛎️ Receptionist
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ justifyContent: 'flex-start', padding: '8px 10px', fontSize: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => { setEmail('events@hotel.com'); setPassword('events123'); setError(''); }}
            >
              ✨ Event Coord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
