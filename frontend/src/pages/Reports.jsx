import { useState, useEffect } from 'react';
import axios from 'axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MOCK_REVENUE_REPORT = {
  from: '2026-10-01', to: '2026-10-31',
  totalRevenue: 44100,
  totalReservations: 18,
  averageRevenuePerReservation: 2450,
  revenueByType: { ROOM: 31800, EVENT_HALL: 8200, PACKAGE: 4100 },
  revenueByPaymentMethod: { CREDIT_CARD: 22400, CASH: 8600, BANK_TRANSFER: 7100, DEBIT_CARD: 4200, ONLINE: 1800 },
};

const MOCK_RESERVATION_REPORT = {
  from: '2026-10-01', to: '2026-10-31',
  total: 18,
  byStatus: { CONFIRMED: 8, PENDING: 4, CHECKED_IN: 3, CHECKED_OUT: 2, CANCELLED: 1 },
  byType: { ROOM: 12, EVENT_HALL: 3, PACKAGE: 3 },
};

const MONTH_REVENUE = [18200, 22400, 19800, 31200, 28600, 35400, 41200, 38800, 29600, 44100, 37200, 31800];
const REPORT_TYPES = [
  { id: 'reservations', name: 'Reservation Report', icon: '🗓️', desc: 'Booking trends, status breakdown, type analysis' },
  { id: 'revenue', name: 'Revenue Report', icon: '💰', desc: 'Income analysis by payment method and type' },
];

function MiniBarChart({ values, labels, color = '' }) {
  const max = Math.max(...values, 1);
  return (
    <div className="chart-bars" style={{ height: 100 }}>
      {values.map((v, i) => (
        <div key={i} className="chart-bar-col">
          <div className="chart-bar-track">
            <div className={`chart-bar-fill ${color}`} style={{ height: `${(v / max) * 100}%` }} />
          </div>
          <div className="chart-bar-label">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, total, title }) {
  const entries = Object.entries(data);
  const colors = ['#e8bc3a', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444'];

  let cumPct = 0;
  const segments = entries.map(([key, val], i) => {
    const pct = total > 0 ? (val / total) * 100 : 0;
    const start = cumPct;
    cumPct += pct;
    return { key, val, pct, start, color: colors[i % colors.length] };
  });

  const size = 120;
  const r = 45;
  const cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--dark-700)" strokeWidth="18" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="18"
            strokeDasharray={`${(s.pct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-((s.start / 100) * circumference)}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{s.key.replace(/_/g, ' ')}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{Math.round(s.pct)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Reports() {
  const [activeReport, setActiveReport] = useState('revenue');
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 8) + '01');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [revData, setRevData] = useState(MOCK_REVENUE_REPORT);
  const [resData, setResData] = useState(MOCK_RESERVATION_REPORT);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReports = () => {
    setLoading(true);
    const params = { from, to };
    Promise.all([
      axios.get('/api/admin/reports/revenue', { headers, params }).catch(() => ({ data: MOCK_REVENUE_REPORT })),
      axios.get('/api/admin/reports/reservations', { headers, params }).catch(() => ({ data: MOCK_RESERVATION_REPORT })),
    ]).then(([rev, res]) => {
      setRevData(rev.data || MOCK_REVENUE_REPORT);
      setResData(res.data || MOCK_RESERVATION_REPORT);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const curMonth = new Date().getMonth();

  return (
    <>
      {/* Report Type Selector */}
      <div className="flex gap-3">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.id}
            className={`btn ${activeReport === rt.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport(rt.id)}
          >
            {rt.icon} {rt.name}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 24px' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>Date Range:</div>
            <div className="flex items-center gap-2">
              <label className="form-label" style={{ margin: 0 }}>From</label>
              <input type="date" className="form-input" style={{ width: 160 }} value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="form-label" style={{ margin: 0 }}>To</label>
              <input type="date" className="form-input" style={{ width: 160 }} value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={fetchReports} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Generating...</> : '📊 Generate Report'}
            </button>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              Period: {from} → {to}
            </div>
          </div>
        </div>
      </div>

      {activeReport === 'revenue' && revData && (
        <>
          {/* Revenue Summary */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card gold">
              <div className="stat-card-icon">💰</div>
              <div className="stat-card-value">${(revData.totalRevenue || 0).toLocaleString()}</div>
              <div className="stat-card-label">Total Revenue</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-card-icon">🗓️</div>
              <div className="stat-card-value">{revData.totalReservations || 0}</div>
              <div className="stat-card-label">Reservations</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-icon">📊</div>
              <div className="stat-card-value">${(revData.averageRevenuePerReservation || 0).toLocaleString()}</div>
              <div className="stat-card-label">Avg. per Booking</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Annual Trend */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">📈 Annual Revenue Trend</div>
                <span className="badge badge-gold">2026</span>
              </div>
              <div className="card-body">
                <MiniBarChart values={MONTH_REVENUE} labels={MONTHS} />
                <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  Highlighted bar = current month
                </div>
              </div>
            </div>

            {/* Revenue by Payment Method */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">💳 Revenue by Payment Method</div>
              </div>
              <div className="card-body">
                {revData.revenueByPaymentMethod && (
                  <DonutChart
                    data={revData.revenueByPaymentMethod}
                    total={revData.totalRevenue || 1}
                    title="Payment Method"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Revenue by Type */}
          {revData.revenueByType && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🏷️ Revenue by Reservation Type</div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Period: {from} to {to}</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(revData.revenueByType).map(([type, amount]) => {
                  const pct = revData.totalRevenue > 0 ? (amount / revData.totalRevenue) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between" style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{type.replace('_', ' ')}</span>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--gold-300)', marginRight: 10 }}>${amount.toLocaleString()}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(pct)}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {activeReport === 'reservations' && resData && (
        <>
          {/* Reservation Summary */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card blue">
              <div className="stat-card-icon">🗓️</div>
              <div className="stat-card-value">{resData.total || 0}</div>
              <div className="stat-card-label">Total Bookings</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-icon">✅</div>
              <div className="stat-card-value">{resData.byStatus?.CONFIRMED || 0}</div>
              <div className="stat-card-label">Confirmed</div>
            </div>
            <div className="stat-card red">
              <div className="stat-card-icon">❌</div>
              <div className="stat-card-value">{resData.byStatus?.CANCELLED || 0}</div>
              <div className="stat-card-label">Cancelled</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Status Breakdown */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">📊 Reservations by Status</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(resData.byStatus || {}).map(([status, count]) => {
                  const pct = resData.total > 0 ? Math.round((count / resData.total) * 100) : 0;
                  const colorMap = { CONFIRMED: '#22c55e', PENDING: '#f59e0b', CHECKED_IN: '#3b82f6', CHECKED_OUT: '#635e8a', CANCELLED: '#ef4444' };
                  return (
                    <div key={status}>
                      <div className="flex justify-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{status.replace('_', ' ')}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{count} ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: colorMap[status] || 'var(--gold-400)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Type Breakdown */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">🏷️ Reservations by Type</div>
              </div>
              <div className="card-body">
                {resData.byType && (
                  <DonutChart data={resData.byType} total={resData.total || 1} title="Reservation Type" />
                )}
                <div style={{ marginTop: 20 }}>
                  {Object.entries(resData.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between" style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{type.replace('_', ' ')}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Reports;
