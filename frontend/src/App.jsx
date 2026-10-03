import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './index.css';
import './customer.css';

// ── Admin pages ──
import Dashboard  from './pages/Dashboard';
import Users      from './pages/Users';
import Settings   from './pages/Settings';
import Reports    from './pages/Reports';
import Login      from './pages/Login';
import Reservations from './pages/Reservations';
import Rooms      from './pages/Rooms';
import Payments   from './pages/Payments';
import EventHalls from './pages/EventHalls';

// ── Customer pages ──
import Home        from './pages/customer/Home';
import BrowseRooms from './pages/customer/BrowseRooms';
import RoomDetail  from './pages/customer/RoomDetail';
import Checkout    from './pages/customer/Checkout';
import MyBookings  from './pages/customer/MyBookings';
import GuestLogin  from './pages/customer/GuestLogin';
import Profile     from './pages/customer/Profile';
import BrowseEvents from './pages/customer/BrowseEvents';

/* ═══════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════ */
const ADMIN_NAV = [
  { group: 'Overview',       items: [{ to: '/admin',              icon: '📊', label: 'Dashboard',    exact: true }] },
  { group: 'Operations',     items: [
    { to: '/admin/reservations', icon: '🗓️', label: 'Reservations' },
    { to: '/admin/rooms',        icon: '🛏️', label: 'Rooms'         },
    { to: '/admin/event-halls',  icon: '🎭', label: 'Event Halls'   },
    { to: '/admin/payments',     icon: '💳', label: 'Payments'      },
  ]},
  { group: 'Administration', items: [
    { to: '/admin/users',    icon: '👥', label: 'Users & Roles' },
    { to: '/admin/reports',  icon: '📈', label: 'Reports'       },
    { to: '/admin/settings', icon: '⚙️', label: 'Settings'      },
  ]},
];

const PAGE_META = {
  '/admin':              { title: 'Dashboard',          subtitle: "Welcome back — here's what's happening today" },
  '/admin/reservations': { title: 'Reservations',        subtitle: 'Manage guest bookings and stay requests'       },
  '/admin/rooms':        { title: 'Room Management',     subtitle: 'View and manage all hotel rooms'               },
  '/admin/event-halls':  { title: 'Event Halls',         subtitle: 'Manage event spaces and packages'              },
  '/admin/payments':     { title: 'Payments & Billing',  subtitle: 'Track payments, invoices, and refunds'         },
  '/admin/users':        { title: 'Users & Roles',       subtitle: 'Manage staff accounts and permissions'         },
  '/admin/reports':      { title: 'Reports & Analytics', subtitle: 'Revenue reports and operational insights'      },
  '/admin/settings':     { title: 'System Settings',     subtitle: 'Configure hotel preferences and policies'      },
};

function AdminSidebar({ currentUser, onLogout }) {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ borderRadius: 2, background: 'rgba(197,160,89,0.15)', color: 'var(--gold-400)' }}>🌲</div>
        <div>
          <span className="sidebar-logo-name" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>Gritstone Haven</span>
          <span className="sidebar-logo-sub">Sanctuary Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {ADMIN_NAV.map(group => (
          <div key={group.group}>
            <div className="nav-section-label">{group.group}</div>
            {group.items.map(item => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink key={item.to} to={item.to} className={`nav-item${isActive ? ' active' : ''}`}>
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Back to customer site */}
      <div style={{ padding: '0 12px 8px' }}>
        <NavLink to="/" className="nav-item" style={{ borderColor: 'rgba(201,160,48,0.2)', background: 'rgba(201,160,48,0.04)' }}>
          <span className="nav-item-icon">🌐</span>
          Customer Site
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={onLogout} title="Click to logout">
          <div className="user-avatar">
            {currentUser ? currentUser.name?.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="user-name truncate">{currentUser?.name || 'Admin'}</span>
            <span className="user-role">{currentUser?.role || 'System Admin'} · Logout</span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ currentUser }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'Gritstone Haven Sanctuary Admin', subtitle: '' };
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{meta.title}</div>
        <span className="topbar-subtitle">{meta.subtitle}</span>
      </div>
      <div className="topbar-actions">
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{now}</span>
        <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {currentUser ? currentUser.name?.charAt(0).toUpperCase() : 'A'}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {currentUser?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
      token = 'admin-session-token';
      localStorage.setItem('token', token);
      const defaultAdmin = { name: 'System Admin', role: 'SYSTEM_ADMIN' };
      localStorage.setItem('currentUser', JSON.stringify(defaultAdmin));
      setCurrentUser(defaultAdmin);
    } else {
      const u = localStorage.getItem('currentUser');
      if (u) {
        try { setCurrentUser(JSON.parse(u)); } catch { setCurrentUser({ name: 'System Admin', role: 'SYSTEM_ADMIN' }); }
      } else {
        setCurrentUser({ name: 'System Admin', role: 'SYSTEM_ADMIN' });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  return (
    <div className="app-shell">
      <AdminSidebar currentUser={currentUser} onLogout={handleLogout} />
      <div className="main-content">
        <AdminTopbar currentUser={currentUser} />
        <main className="page-body animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   APP ROUTER
═══════════════════════════════════════════ */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Customer-facing routes ── */}
        <Route path="/"              element={<Home />} />
        <Route path="/browse"        element={<BrowseRooms />} />
        <Route path="/events"        element={<BrowseEvents />} />
        <Route path="/event-halls"   element={<BrowseEvents />} />
        <Route path="/room/:id"      element={<RoomDetail />} />
        <Route path="/checkout"      element={<Checkout />} />
        <Route path="/my-bookings"   element={<MyBookings />} />
        <Route path="/profile"       element={<Profile />} />
        <Route path="/guest-login"   element={<GuestLogin />} />

        {/* ── Admin login ── */}
        <Route path="/admin/login"   element={<Login />} />

        {/* ── Admin panel routes (all under /admin) ── */}
        <Route path="/admin"              element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/reservations" element={<AdminLayout><Reservations /></AdminLayout>} />
        <Route path="/admin/rooms"        element={<AdminLayout><Rooms /></AdminLayout>} />
        <Route path="/admin/event-halls"  element={<AdminLayout><EventHalls /></AdminLayout>} />
        <Route path="/admin/payments"     element={<AdminLayout><Payments /></AdminLayout>} />
        <Route path="/admin/users"        element={<AdminLayout><Users /></AdminLayout>} />
        <Route path="/admin/reports"      element={<AdminLayout><Reports /></AdminLayout>} />
        <Route path="/admin/settings"     element={<AdminLayout><Settings /></AdminLayout>} />

        {/* Legacy /login redirect support */}
        <Route path="/login"         element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
