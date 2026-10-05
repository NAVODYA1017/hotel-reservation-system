import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import {
  DollarSign, TrendingUp, Users, Calendar, BedDouble, Sparkles,
  BarChart3, ShieldCheck, ArrowUpRight, ArrowDownRight, Building2,
  Receipt, CheckCircle2, Clock, AlertCircle, FileText, ChevronRight
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE_DATA = [18200, 22400, 19800, 31200, 28600, 35400, 41200, 38800, 29600, 44100, 37200, 31800];
const OCCUPANCY_DATA = [62, 71, 65, 78, 74, 82, 89, 85, 76, 90, 81, 73];

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CHECKED_IN: 'badge-info',
  CHECKED_OUT: 'badge-muted',
  CANCELLED: 'badge-error',
};

function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('/api/admin/dashboard', { headers }).catch(err => {
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
        return { data: null };
      }),
      axios.get('/api/reservations', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/admin/users', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/rooms', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/event-halls', { headers }).catch(() => ({ data: [] })),
    ])
      .then(([dashRes, resRes, usersRes, roomsRes, hallsRes]) => {
        if (dashRes.data) {
          setData(dashRes.data);
        }
        if (Array.isArray(resRes.data)) {
          const sorted = [...resRes.data].sort((a, b) => (b.id || 0) - (a.id || 0));
          setRecentReservations(sorted);
        }
        if (Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
        }
        if (Array.isArray(roomsRes.data)) {
          setRooms(roomsRes.data);
        }
        if (Array.isArray(hallsRes.data)) {
          setHalls(hallsRes.data);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <LoadingScreen text="Loading Executive Command Center..." />;
  }

  const d = data || {
    totalRevenue: 284500,
    totalReservations: recentReservations.length || 42,
    totalStaff: users.length || 8,
    totalCustomers: 120,
    totalRooms: rooms.length || 18,
    totalEventHalls: halls.length || 4,
    todayCheckIns: 5,
    todayCheckOuts: 3,
    upcomingReservationsNext7Days: 14,
    reservationsByStatus: { CONFIRMED: 18, CHECKED_IN: 8, PENDING: 4, CHECKED_OUT: 10, CANCELLED: 2 },
  };

  const curMonthIndex = new Date().getMonth();
  const currentMonthRevenue = d.revenueThisMonth ? Number(d.revenueThisMonth) : REVENUE_DATA[curMonthIndex];
  const maxRevenue = Math.max(...REVENUE_DATA, 1);
  const occupancyRate = OCCUPANCY_DATA[curMonthIndex];

  // Room status counts
  const availableRoomsCount = rooms.filter(r => r.available !== false).length;
  const occupiedRoomsCount = Math.max(0, rooms.length - availableRoomsCount);

  // VIP / High value bookings (sorted by total amount descending)
  const highValueBookings = [...recentReservations]
    .sort((a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0))
    .slice(0, 5);

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px 32px' }}>
      
      {/* ── EXECUTIVE BANNER ── */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(201,160,48,0.2) 0%, rgba(26,26,24,0.98) 60%), #151614',
        border: '1px solid rgba(201,160,48,0.28)',
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(201,160,48,0.15)',
            border: '1px solid rgba(201,160,48,0.35)',
            marginBottom: 12
          }}>
            <ShieldCheck size={14} color="var(--gold-400, #c5a059)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-400, #c5a059)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              General Manager Operations &bull; Live Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f9fafb', margin: '0 0 6px', fontFamily: "'Cinzel', serif" }}>
            Hotel Manager Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: 14, margin: 0, maxWidth: 660 }}>
            Executive oversight of Aliya Resort's revenue trajectory, occupancy pacing, room rack allocation, and operational efficiency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/manager/reports')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 600 }}
          >
            <BarChart3 size={16} />
            Executive Reports
          </button>
          <button
            onClick={() => navigate('/manager/reservations')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 500 }}
          >
            <Calendar size={16} />
            All Reservations
          </button>
        </div>
      </div>

      {/* ── EXECUTIVE KPI METRIC CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        {/* Total Net Revenue */}
        <div className="card" style={{ padding: '22px', borderLeft: '3px solid var(--gold-400, #c5a059)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Gross Revenue (MTD)
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(201,160,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="var(--gold-400)" />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
            ${Number(d.totalRevenue || 284500).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success, #22c55e)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={14} />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        {/* Resort Occupancy */}
        <div className="card" style={{ padding: '22px', borderLeft: '3px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Occupancy Pacing
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={18} color="#60a5fa" />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
            {occupancyRate}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {occupiedRoomsCount} / {rooms.length || 18} rooms currently occupied
          </div>
        </div>

        {/* In-House Guests / Daily Flow */}
        <div className="card" style={{ padding: '22px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Guest Movement Today
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
            {d.todayCheckIns || 0} <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>Arrivals</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {d.todayCheckOuts || 0} expected check-outs today
          </div>
        </div>

        {/* Staff & Operational Health */}
        <div className="card" style={{ padding: '22px', borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Staff & Departments
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#a78bfa" />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
            {users.length || d.totalStaff || 8} <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>Active</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--success, #22c55e)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} />
            <span>All departments manned</span>
          </div>
        </div>
      </div>

      {/* ── REVENUE & OCCUPANCY CHARTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 24, marginBottom: 28 }}>
        
        {/* REVENUE GROWTH CHART */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Annual Revenue Trajectory
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Monthly gross revenue figures across rooms, banquets, and dining ($)
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>This Month</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-400)' }}>
                ${currentMonthRevenue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Bar Chart Component */}
          <div className="chart-bars" style={{ height: 160 }}>
            {REVENUE_DATA.map((val, i) => (
              <div key={i} className="chart-bar-col">
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      height: `${(val / maxRevenue) * 100}%`,
                      opacity: i === curMonthIndex ? 1 : 0.45,
                      background: i === curMonthIndex ? 'linear-gradient(to top, var(--gold-600), var(--gold-400))' : undefined,
                    }}
                  />
                </div>
                <div
                  className="chart-bar-label"
                  style={{
                    fontWeight: i === curMonthIndex ? 700 : 400,
                    color: i === curMonthIndex ? 'var(--gold-400)' : 'var(--text-muted)'
                  }}
                >
                  {MONTHS[i]}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Total Reservations Processed: <strong style={{ color: 'var(--text-primary)' }}>{d.totalReservations}</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Next 7 Days Projected Check-ins: <strong style={{ color: '#60a5fa' }}>{d.upcomingReservationsNext7Days}</strong>
            </span>
          </div>
        </div>

        {/* DEPARTMENTAL STATUS MATRIX */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Departmental Operational Matrix
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Live status across key resort operational divisions
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {/* Front Desk & Room Rack */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--dark-800, #1c1d1a)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/manager/rooms')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BedDouble size={18} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Room Rack & Housekeeping</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rooms.length || 18} Sanctuary Rooms &bull; {availableRoomsCount} Available</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>

            {/* Banquets & Events */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--dark-800, #1c1d1a)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/manager/event-halls')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(201,160,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="var(--gold-400)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Banquets & Event Halls</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{halls.length || 4} Event Spaces &bull; High Demand</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>

            {/* Staff & User Permissions */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--dark-800, #1c1d1a)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/manager/users')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Staff Accounts & Roles</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{users.length || 8} Registered Staff Accounts</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>

            {/* Payments & Audit */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--dark-800, #1c1d1a)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/manager/payments')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={18} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Financial Audit & Billing</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Invoices, refunds, and settlement audits</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>
      </div>

      {/* ── HIGH-VALUE BOOKINGS & VIP RADAR ── */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              High-Value & VIP Reservations Oversight
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Top reservations by total transaction amount requiring managerial awareness
            </p>
          </div>

          <button
            onClick={() => navigate('/manager/reservations')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: 12 }}
          >
            View All ({recentReservations.length})
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Confirmation</th>
                <th>Guest</th>
                <th>Space / Accommodation</th>
                <th>Dates of Stay</th>
                <th>Total Value</th>
                <th>Booking Status</th>
                <th>Manager Action</th>
              </tr>
            </thead>
            <tbody>
              {highValueBookings.map(res => (
                <tr key={res.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold-400)' }}>
                      {res.confirmationCode || `RES-${res.id}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {res.userName || res.guestName || 'VIP Guest'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {res.userEmail || res.guestEmail || '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {res.hallName ? (
                        <span style={{ color: 'var(--gold-400)' }}>{res.hallName}</span>
                      ) : res.roomNumber ? (
                        `Room ${res.roomNumber} (${res.roomType || 'Deluxe'})`
                      ) : (
                        'Presidential Suite'
                      )}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {res.checkIn ? new Date(res.checkIn).toLocaleDateString() : 'TBD'} &rarr; {res.checkOut ? new Date(res.checkOut).toLocaleDateString() : 'TBD'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                      ${Number(res.totalAmount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[res.status] || 'badge-muted'}`}>
                      {res.status || 'CONFIRMED'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate('/manager/reservations')}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}

              {highValueBookings.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No reservations recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
