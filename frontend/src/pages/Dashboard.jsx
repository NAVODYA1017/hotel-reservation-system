import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Mock data shown when backend is unavailable ---
const MOCK = {
  totalRevenue: 248750,
  totalUsers: 32,
  reservationsByStatus: { PENDING: 14, CONFIRMED: 28, CHECKED_IN: 9, CHECKED_OUT: 47, CANCELLED: 5 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE_DATA = [18200, 22400, 19800, 31200, 28600, 35400, 41200, 38800, 29600, 44100, 37200, 31800];
const OCCUPANCY_DATA = [62, 71, 65, 78, 74, 82, 89, 85, 76, 90, 81, 73];

const RECENT_RESERVATIONS = [
  { id: 1, guest: 'Amara Silva', room: '201', type: 'Deluxe Suite', checkIn: '2026-10-02', checkOut: '2026-10-05', status: 'CONFIRMED', amount: 12600 },
  { id: 2, guest: 'Rajiv Mendis', room: '315', type: 'Standard Room', checkIn: '2026-10-01', checkOut: '2026-10-03', status: 'CHECKED_IN', amount: 4200 },
  { id: 3, guest: 'Priya Fernando', room: '102', type: 'Premium Suite', checkIn: '2026-10-03', checkOut: '2026-10-07', status: 'PENDING', amount: 22400 },
  { id: 4, guest: 'David Perera', room: '408', type: 'Deluxe Room', checkIn: '2026-09-28', checkOut: '2026-10-01', status: 'CHECKED_OUT', amount: 9800 },
  { id: 5, guest: 'Nadia Wijerama', room: '511', type: 'Standard Suite', checkIn: '2026-10-05', checkOut: '2026-10-08', status: 'CONFIRMED', amount: 7500 },
];

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CHECKED_IN: 'badge-info',
  CHECKED_OUT: 'badge-muted',
  CANCELLED: 'badge-error',
};

function StatCard({ color, icon, value, label, trend, trendDir }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && (
        <div className={`stat-card-trend ${trendDir}`}>
          {trendDir === 'up' ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(...data);
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/admin/login'); return; }

    axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(() => setData(MOCK))   // Fall back to mock data gracefully
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        Loading dashboard...
      </div>
    );
  }

  const d = data || MOCK;
  const active = (d.reservationsByStatus?.PENDING || 0) + (d.reservationsByStatus?.CONFIRMED || 0) + (d.reservationsByStatus?.CHECKED_IN || 0);
  const curMonth = new Date().getMonth();
  const monthRevenue = REVENUE_DATA[curMonth];
  const occupancy = OCCUPANCY_DATA[curMonth];

  return (
    <>
      {/* Stats Row */}
      <div className="stat-grid">
        <StatCard color="gold" icon="💰" value={`$${(d.totalRevenue || 0).toLocaleString()}`} label="Total Revenue" trend="+12.4% this month" trendDir="up" />
        <StatCard color="blue" icon="🗓️" value={active} label="Active Reservations" trend="+3 today" trendDir="up" />
        <StatCard color="purple" icon="👥" value={d.totalUsers || 0} label="Staff Members" trend="" />
        <StatCard color="green" icon="📊" value={`${occupancy}%`} label="Room Occupancy" trend="+5% vs last month" trendDir="up" />
        <StatCard color="gold" icon="💵" value={`$${monthRevenue.toLocaleString()}`} label="Monthly Revenue" trend="+8.2% vs last month" trendDir="up" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📈 Annual Revenue</div>
              <div className="card-subtitle">Monthly revenue across all streams</div>
            </div>
            <span className="badge badge-gold">2026</span>
          </div>
          <div className="card-body">
            <RevenueChart data={REVENUE_DATA} />
            <div className="flex justify-between mt-2" style={{ marginTop: 12 }}>
              <span className="text-muted">Year Total: <strong style={{ color: 'var(--text-primary)' }}>$386,200</strong></span>
              <span className="text-muted">Peak: <strong style={{ color: 'var(--gold-300)' }}>Oct — $44,100</strong></span>
            </div>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">🛏️ Room Occupancy</div>
              <div className="card-subtitle">Monthly occupancy rate (%)</div>
            </div>
            <span className="badge badge-info">2026</span>
          </div>
          <div className="card-body">
            <OccupancyChart data={OCCUPANCY_DATA} />
            <div className="flex justify-between mt-2" style={{ marginTop: 12 }}>
              <span className="text-muted">Avg: <strong style={{ color: 'var(--text-primary)' }}>78.9%</strong></span>
              <span className="text-muted">Peak: <strong style={{ color: '#60a5fa' }}>Oct — 90%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown + Recent Reservations */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
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
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reservations')}>View all →</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_RESERVATIONS.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.guest}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.type}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'var(--dark-700)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                        #{r.room}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.checkIn}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.checkOut}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>${r.amount.toLocaleString()}</td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-muted'}`}>{r.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
