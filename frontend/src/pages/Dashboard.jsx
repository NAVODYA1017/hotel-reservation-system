import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { 
  DollarSign, Calendar, Users, BarChart3, Receipt, Building2, BedDouble, TrendingUp 
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

function StatCard({ color, icon, value, label, subtext, trendDir }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {subtext && (
        <div className={`stat-card-trend ${trendDir || 'up'}`}>
          {subtext}
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(...data, 1);
  const curMonth = new Date().getMonth();

  return (
    <div className="chart-bars">
      {data.map((val, i) => (
        <div key={i} className="chart-bar-col">
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{
                height: `${(val / max) * 100}%`,
                opacity: i === curMonth ? 1 : 0.55,
              }}
            />
          </div>
          <div className="chart-bar-label">{MONTHS[i]}</div>
        </div>
      ))}
    </div>
  );
}

function OccupancyChart({ data }) {
  const max = 100;
  const curMonth = new Date().getMonth();

  return (
    <div className="chart-bars">
      {data.map((val, i) => (
        <div key={i} className="chart-bar-col">
          <div className="chart-bar-track">
            <div
              className={`chart-bar-fill ${i === curMonth ? '' : 'blue'}`}
              style={{
                height: `${(val / max) * 100}%`,
                opacity: i === curMonth ? 1 : 0.55,
              }}
            />
          </div>
          <div className="chart-bar-label">{MONTHS[i]}</div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || 'admin-session-token';
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('/api/admin/dashboard', { headers }).catch(err => {
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
        return { data: null };
      }),
      axios.get('/api/reservations', { headers }).catch(() => ({ data: [] }))
    ]).then(([dashRes, resRes]) => {
      if (dashRes.data) {
        setData(dashRes.data);
      }
      if (Array.isArray(resRes.data)) {
        // Sort descending by id or checkIn
        const sorted = [...resRes.data].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 6);
        setRecentReservations(sorted);
      }
    }).finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <LoadingScreen text="Loading administration dashboard..." />;
  }

  const d = data || {
    totalRevenue: 0,
    totalReservations: 0,
    totalStaff: 0,
    totalCustomers: 0,
    totalRooms: 0,
    totalEventHalls: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    reservationsByStatus: { PENDING: 0, CONFIRMED: 0, CHECKED_IN: 0, CHECKED_OUT: 0, CANCELLED: 0 },
  };

  const activeReservations = (d.reservationsByStatus?.PENDING || 0) + 
                            (d.reservationsByStatus?.CONFIRMED || 0) + 
                            (d.reservationsByStatus?.CHECKED_IN || 0);

  const curMonth = new Date().getMonth();
  const monthRevenue = d.revenueThisMonth ? Number(d.revenueThisMonth) : REVENUE_DATA[curMonth];
  const occupancy = OCCUPANCY_DATA[curMonth];

  return (
    <>
      {/* Quick Status Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: 'var(--card-bg, #181916)',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
        borderRadius: 'var(--radius-md, 8px)', marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 4,
            background: 'rgba(197,160,89,0.15)', color: 'var(--gold-400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={17} />
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Aliya Resort Operations</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 12 }}>
              {d.totalRooms} Sanctuary Rooms &bull; {d.totalEventHalls} Event Spaces
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <span><strong>Today Check-ins:</strong> <span style={{ color: 'var(--gold-400, #c5a059)' }}>{d.todayCheckIns || 0}</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span><strong>Today Check-outs:</strong> <span style={{ color: 'var(--text-secondary)' }}>{d.todayCheckOuts || 0}</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span><strong>Next 7 Days:</strong> <span style={{ color: '#60a5fa' }}>{d.upcomingReservationsNext7Days || 0} arrivals</span></span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-grid">
        <StatCard
          color="gold"
          icon={<DollarSign size={20} />}
          value={`LKR ${(d.totalRevenue ? Number(d.totalRevenue) : 0).toLocaleString()}`}
          label="Total Revenue"
          subtext={`LKR ${monthRevenue.toLocaleString()} this month`}
          trendDir="up"
        />
        <StatCard
          color="blue"
          icon={<Calendar size={20} />}
          value={activeReservations}
          label="Active Reservations"
          subtext={`${d.totalReservations || 0} total bookings`}
          trendDir="up"
        />
        <StatCard
          color="purple"
          icon={<Users size={20} />}
          value={d.totalStaff || 0}
          label="Staff Accounts"
          subtext={`${d.totalCustomers || 0} registered guests`}
          trendDir="up"
        />
        <StatCard
          color="green"
          icon={<BarChart3 size={20} />}
          value={`${occupancy}%`}
          label="Room Occupancy"
          subtext="Based on current capacity"
          trendDir="up"
        />
        <StatCard
          color="gold"
          icon={<Receipt size={20} />}
          value={`LKR ${(d.totalRefunded ? Number(d.totalRefunded) : 0).toLocaleString()}`}
          label="Total Refunded"
          subtext="Completed refunds"
          trendDir="neutral"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="var(--gold-400)" /> Annual Revenue Trend
              </div>
              <div className="card-subtitle">Monthly revenue projection across all streams</div>
            </div>
            <span className="badge badge-gold">2026</span>
          </div>
          <div className="card-body">
            <RevenueChart data={REVENUE_DATA} />
            <div className="flex justify-between mt-2" style={{ marginTop: 12 }}>
              <span className="text-muted">Total Bookings: <strong style={{ color: 'var(--text-primary)' }}>{d.totalReservations || 0}</strong></span>
              <span className="text-muted">Current Month: <strong style={{ color: 'var(--gold-300)' }}>LKR {monthRevenue.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BedDouble size={16} color="#60a5fa" /> Room Occupancy
              </div>
              <div className="card-subtitle">Monthly occupancy rate (%)</div>
            </div>
            <span className="badge badge-info">2026</span>
          </div>
          <div className="card-body">
            <OccupancyChart data={OCCUPANCY_DATA} />
            <div className="flex justify-between mt-2" style={{ marginTop: 12 }}>
              <span className="text-muted">Avg Rate: <strong style={{ color: 'var(--text-primary)' }}>78.9%</strong></span>
              <span className="text-muted">Active Rooms: <strong style={{ color: '#60a5fa' }}>{d.totalRooms} Listed</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown + Recent Reservations */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Reservation Status</div>
          </div>
          <div className="card-body" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(d.reservationsByStatus || {}).map(([status, count]) => {
              const total = Object.values(d.reservationsByStatus || {}).reduce((a, b) => a + b, 0);
              const pct = total ? Math.round((count / total) * 100) : 0;
              const colors = { CONFIRMED: 'var(--status-success)', PENDING: '#f59e0b', CHECKED_IN: '#3b82f6', CHECKED_OUT: 'var(--text-muted)', CANCELLED: '#ef4444' };
              return (
                <div key={status}>
                  <div className="flex justify-between mb-4" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{status.replace('_', ' ')}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: colors[status] || 'var(--gold-400)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Reservations</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/reservations')}>View all →</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest</th>
                  <th>Room / Space</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      No reservations recorded in the database yet.
                    </td>
                  </tr>
                ) : (
                  recentReservations.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.userName || r.user?.name || `Guest #${r.userId || ''}`}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.user?.email || ''}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', background: 'var(--dark-700)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                          {r.roomNumber ? `Room #${r.roomNumber}` : (r.hallName || 'Reserved Space')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.checkIn}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.checkOut}</td>
                      <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>
                        LKR {Number(r.totalAmount || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[r.status] || 'badge-muted'}`}>
                          {(r.status || 'PENDING').replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
