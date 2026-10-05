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

// ── Role-Specific Dashboards ──
import FrontDeskDashboard from './pages/FrontDeskDashboard';
import EventCoordinatorDashboard from './pages/EventCoordinatorDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// ── Customer pages ──
import Home        from './pages/customer/Home';
import BrowseRooms from './pages/customer/BrowseRooms';
import RoomDetail  from './pages/customer/RoomDetail';
import Checkout    from './pages/customer/Checkout';
import MyBookings  from './pages/customer/MyBookings';
import GuestLogin  from './pages/customer/GuestLogin';
import Profile     from './pages/customer/Profile';
import BrowseEvents from './pages/customer/BrowseEvents';

import { 
  LayoutDashboard, Calendar, BedDouble, Sparkles, CreditCard, Users as UsersIcon, BarChart3, Settings as SettingsIcon, Globe, Building2, LogOut, CheckSquare
} from 'lucide-react';

/* ═══════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════ */
const ADMIN_NAV = [
  { group: 'Overview',       items: [{ to: '/admin',              icon: <LayoutDashboard size={17} />, label: 'Dashboard',    exact: true }] },
  { group: 'Operations',     items: [
    { to: '/admin/reservations', icon: <Calendar size={17} />, label: 'Reservations' },
    { to: '/admin/rooms',        icon: <BedDouble size={17} />, label: 'Rooms'         },
    { to: '/admin/event-halls',  icon: <Sparkles size={17} />,  label: 'Event Halls'   },
    { to: '/admin/payments',     icon: <CreditCard size={17} />, label: 'Payments'      },
  ]},
  { group: 'Administration', items: [
    { to: '/admin/users',    icon: <UsersIcon size={17} />,   label: 'Users & Roles' },
    { to: '/admin/reports',  icon: <BarChart3 size={17} />,   label: 'Reports'       },
    { to: '/admin/settings', icon: <SettingsIcon size={17} />, label: 'Settings'      },
  ]},
];

const FRONTDESK_NAV = [
  { group: 'Overview',       items: [{ to: '/frontdesk',              icon: <LayoutDashboard size={17} />, label: 'Desk Dashboard',    exact: true }] },
  { group: 'Operations',     items: [
    { to: '/frontdesk/reservations', icon: <Calendar size={17} />, label: 'Reservations' },
    { to: '/frontdesk/rooms',        icon: <BedDouble size={17} />, label: 'Room Rack'         },
  ]},
];

const EVENT_COORD_NAV = [
  { group: 'Overview',       items: [{ to: '/events-admin',              icon: <Sparkles size={17} />, label: 'Events Portal',    exact: true }] },
  { group: 'Operations',     items: [
    { to: '/events-admin/reservations', icon: <Calendar size={17} />, label: 'Event Bookings' },
    { to: '/events-admin/halls', icon: <Building2 size={17} />,  label: 'Halls & Spaces'   },
  ]},
];

const MANAGER_NAV = [
  { group: 'Overview',       items: [{ to: '/manager',              icon: <LayoutDashboard size={17} />, label: 'Command Center',    exact: true }] },
  { group: 'Operations',     items: [
    { to: '/manager/reservations', icon: <Calendar size={17} />, label: 'Reservations' },
    { to: '/manager/rooms',        icon: <BedDouble size={17} />, label: 'Rooms'         },
    { to: '/manager/event-halls',  icon: <Sparkles size={17} />,  label: 'Event Halls'   },
    { to: '/manager/payments',     icon: <CreditCard size={17} />, label: 'Payments'      },
  ]},
  { group: 'Administration', items: [
    { to: '/manager/users',    icon: <UsersIcon size={17} />,   label: 'Staff Accounts' },
    { to: '/manager/reports',  icon: <BarChart3 size={17} />,   label: 'Reports & Analytics'       },
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
  '/frontdesk':          { title: 'Front Desk',          subtitle: "Welcome back — here's your desk overview"      },
  '/frontdesk/reservations': { title: 'Reservations',        subtitle: 'Manage walk-ins and guest check-ins'       },
  '/frontdesk/rooms':        { title: 'Room Rack',           subtitle: 'View live room status'               },
  '/events-admin':       { title: 'Event Coordinator Portal', subtitle: 'Manage luxury halls, catering packages & event scheduling' },
  '/events-admin/reservations': { title: 'Event Reservations', subtitle: 'Monitor banquet and event hall bookings' },
  '/events-admin/halls': { title: 'Event Venues & Spaces', subtitle: 'Manage venue readiness and curated event packages' },
  '/manager':            { title: 'Executive Command Center',   subtitle: 'High-level resort analytics, revenue trajectory & operational oversight' },
  '/manager/reservations': { title: 'Reservations Oversight',      subtitle: 'Audit and monitor all guest bookings' },
  '/manager/rooms':      { title: 'Room Rack & Inventory',     subtitle: 'Oversee all hotel rooms and housekeeping status' },
  '/manager/event-halls': { title: 'Banquets & Venues',        subtitle: 'Oversee event operations and hall revenue' },
  '/manager/payments':   { title: 'Financial Audit & Billing',  subtitle: 'Monitor business revenue, invoices, and settlement' },
  '/manager/users':      { title: 'Staff Accounts & Access',      subtitle: 'Manage employee access and departmental roles' },
  '/manager/reports':    { title: 'Executive Reports & Analytics',    subtitle: 'Comprehensive revenue and occupancy business reports' },
};

function AdminSidebar({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div
        className="sidebar-logo"
        onClick={() => navigate('/')}
        title="View Aliya Resort Website"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, userSelect: 'none' }}
      >
        <img
          src="/assets/images/logo.png"
          alt="Aliya Resort"
          style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(197, 160, 89, 0.4))', flexShrink: 0 }}
        />
        <div>
          <span className="sidebar-logo-name" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>ALIYA RESORT</span>
          <span className="sidebar-logo-sub">Resort Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {(currentUser?.role === 'RECEPTIONIST' ? FRONTDESK_NAV : 
          currentUser?.role === 'EVENT_COORDINATOR' ? EVENT_COORD_NAV :
          currentUser?.role === 'HOTEL_MANAGER' ? MANAGER_NAV :
          ADMIN_NAV).map(group => (
          <div key={group.group}>
            <div className="nav-section-label">{group.group}</div>
            {group.items.map(item => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink key={item.to} to={item.to} className={`nav-item${isActive ? ' active' : ''}`}>
                  <span className="nav-item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
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
          <span className="nav-item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Globe size={17} /></span>
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
          <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}><LogOut size={14} /></span>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ currentUser }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'Aliya Resort Admin Portal', subtitle: '' };
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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    const u = localStorage.getItem('currentUser');
    if (u) {
      try { setCurrentUser(JSON.parse(u)); } catch { setCurrentUser(null); }
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

        {/* ── Front Desk routes ── */}
        <Route path="/frontdesk"              element={<AdminLayout><FrontDeskDashboard /></AdminLayout>} />
        <Route path="/frontdesk/reservations" element={<AdminLayout><Reservations /></AdminLayout>} />
        <Route path="/frontdesk/rooms"        element={<AdminLayout><Rooms /></AdminLayout>} />

        {/* ── Event Coordinator routes ── */}
        <Route path="/events-admin"       element={<AdminLayout><EventCoordinatorDashboard /></AdminLayout>} />
        <Route path="/events-admin/reservations" element={<AdminLayout><Reservations /></AdminLayout>} />
        <Route path="/events-admin/halls" element={<AdminLayout><EventHalls /></AdminLayout>} />

        {/* ── Hotel Manager routes ── */}
        <Route path="/manager"              element={<AdminLayout><ManagerDashboard /></AdminLayout>} />
        <Route path="/manager/reservations" element={<AdminLayout><Reservations /></AdminLayout>} />
        <Route path="/manager/rooms"        element={<AdminLayout><Rooms /></AdminLayout>} />
        <Route path="/manager/event-halls"  element={<AdminLayout><EventHalls /></AdminLayout>} />
        <Route path="/manager/payments"     element={<AdminLayout><Payments /></AdminLayout>} />
        <Route path="/manager/users"        element={<AdminLayout><Users /></AdminLayout>} />
        <Route path="/manager/reports"      element={<AdminLayout><Reports /></AdminLayout>} />

        {/* Legacy /login redirect support */}
        <Route path="/login"         element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
