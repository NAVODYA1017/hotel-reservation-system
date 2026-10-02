import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        } else {
          localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', role: 'SYSTEM_ADMIN' }));
        }
        navigate('/admin');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'ERR_NETWORK') {
        // For demo / dev purposes, allow bypass when backend is offline
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('currentUser', JSON.stringify({ name: 'Hotel Manager', role: 'HOTEL_MANAGER' }));
        navigate('/admin');
        return;
      } else {
        setError('Login error: ' + (err.response?.data?.message || err.message));
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
        <div className="login-logo">
          <div className="login-logo-icon">🏨</div>
          <div>
            <h1 className="login-title">Aliya Resort</h1>
            <p className="login-subtitle">Staff Administration Portal</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 8 }}>
            <span className="alert-icon">⚠️</span>
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
                  color: 'var(--text-muted)', fontSize: 16, padding: 4,
                }}
              >
                {showPass ? '🙈' : '👁️'}
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
              <>🔑 Sign In</>
            )}
          </button>
        </form>

        <div style={{
          marginTop: 28,
          padding: '16px',
          background: 'rgba(201,160,48,0.06)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Demo Credentials
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            📧 admin@hotel.com &nbsp;|&nbsp; 🔒 admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
