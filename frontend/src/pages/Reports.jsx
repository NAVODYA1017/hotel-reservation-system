import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

function MiniBarChart({ values, labels, color = '' }) {
  const max = Math.max(...values, 1);
  return (
    <div className="chart-bars" style={{ height: 110 }}>
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

function DonutChart({ data, total }) {
  const entries = Object.entries(data || {});
  const colors = ['#c5a059', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#f59e0b'];

  let cumPct = 0;
  const segments = entries.map(([key, val], i) => {
    const numericVal = Number(val || 0);
    const pct = total > 0 ? (numericVal / total) * 100 : 0;
    const start = cumPct;
    cumPct += pct;
    return { key, val: numericVal, pct, start, color: colors[i % colors.length] };
  });

  const size = 120;
  const r = 45;
  const cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--dark-700, #262722)" strokeWidth="18" />
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
  const [reportTypes, setReportTypes] = useState([
    { code: 'REVENUE', name: 'Revenue Report', description: 'Financial payments, net income, refunds, and breakdowns.' },
    { code: 'RESERVATION', name: 'Reservation Report', description: 'Room and event space reservations, check-ins, and status analysis.' }
  ]);
  const [activeType, setActiveType] = useState('REVENUE');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const [revReport, setRevReport] = useState(null);
  const [resReport, setResReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const token = localStorage.getItem('token') || 'admin-session-token';
  const headers = { Authorization: `Bearer ${token}` };

  // Step 5: System displays available report types
  useEffect(() => {
    axios.get('/api/admin/reports', { headers })
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setReportTypes(res.data);
        }
      })
      .catch(() => {
        // Fallback to standard report types
      })
      .finally(() => setInitialLoading(false));
  }, []);

  // Step 6-8: Select report type & period, retrieve data, generate report
  const generateReport = async () => {
    setLoading(true);
    setError('');
    const params = { from, to };

    try {
      if (activeType === 'REVENUE') {
        const res = await axios.get('/api/admin/reports/revenue', { headers, params });
        setRevReport(res.data);
      } else {
        const res = await axios.get('/api/admin/reports/reservations', { headers, params });
        setResReport(res.data);
      }
    } catch (err) {
      // Extension 8a: If report generation fails, display error and allow administrator to retry
      const msg = err.response?.data?.message || err.message || 'Report generation failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [activeType]);

  const handlePrint = () => {
    window.print();
  };

  if (initialLoading) {
    return <LoadingScreen text="Loading report management system..." />;
  }

  const currentReport = activeType === 'REVENUE' ? revReport : resReport;

  return (
    <>
      {/* Step 5: Report Type Selection Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: 4 }}>
        <div className="flex gap-2">
          {reportTypes.map(rt => {
            const code = rt.code || rt.id || (rt.name.toLowerCase().includes('revenue') ? 'REVENUE' : 'RESERVATION');
            const isActive = activeType === code;
            return (
              <button
                key={code}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveType(code)}
                style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600 }}
              >
                {code === 'REVENUE' ? '💰' : '🗓️'} {rt.name}
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handlePrint}
          title="Print or save this report"
        >
          🖨️ Print / Review Report
        </button>
      </div>

      {/* Date Filter & Generation Controls */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>
              Reporting Period:
            </div>
            <div className="flex items-center gap-2">
              <label className="form-label" style={{ margin: 0, fontSize: 12 }}>From</label>
              <input
                type="date"
                className="form-input"
                style={{ width: 150, padding: '6px 10px', fontSize: 13 }}
                value={from}
                onChange={e => setFrom(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="form-label" style={{ margin: 0, fontSize: 12 }}>To</label>
              <input
                type="date"
                className="form-input"
                style={{ width: 150, padding: '6px 10px', fontSize: 13 }}
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={generateReport}
              disabled={loading}
              style={{ minWidth: 140 }}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Generating...</>
              ) : (
                '📊 Generate Report'
              )}
            </button>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              Active Range: <strong>{from}</strong> to <strong>{to}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Extension 8a: Error handling with Retry button */}
      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Report Generation Error:</strong> {error}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={generateReport}>
            🔄 Retry Generation
          </button>
        </div>
      )}

      {/* Extension 6a: If no data exists for selected period, display message */}
      {currentReport && currentReport.message && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(201,160,48,0.08)',
          border: '1px solid var(--border-gold, #c5a059)',
          borderRadius: 'var(--radius-md, 8px)',
          fontSize: 13,
          color: 'var(--gold-300, #e8bc3a)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span>ℹ️</span>
          <span>{currentReport.message}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REVENUE REPORT VIEW
      ───────────────────────────────────────────────────────────── */}
      {activeType === 'REVENUE' && revReport && (
        <>
          {/* Revenue Summary Stats */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card gold">
              <div className="stat-card-icon">💰</div>
              <div className="stat-card-value">LKR {Number(revReport.netRevenue || 0).toLocaleString()}</div>
              <div className="stat-card-label">Net Revenue</div>
              <div className="stat-card-trend up">Period Total</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-icon">📈</div>
              <div className="stat-card-value">LKR {Number(revReport.grossRevenue || 0).toLocaleString()}</div>
              <div className="stat-card-label">Gross Revenue</div>
              <div className="stat-card-trend up">{revReport.successfulPayments || 0} Successful Payments</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-card-icon">💸</div>
              <div className="stat-card-value">LKR {Number(revReport.refundedAmount || 0).toLocaleString()}</div>
              <div className="stat-card-label">Refunded Amount</div>
              <div className="stat-card-trend down">{revReport.refundedPayments || 0} Refunds Issued</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-card-icon">📊</div>
              <div className="stat-card-value">LKR {Number(revReport.averagePaymentValue || 0).toLocaleString()}</div>
              <div className="stat-card-label">Avg Payment Value</div>
              <div className="stat-card-trend neutral">Per Successful Trx</div>
            </div>
          </div>

          {/* Revenue Breakdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* By Payment Method */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">💳 Revenue by Payment Method</div>
                  <div className="card-subtitle">Breakdown across payment options</div>
                </div>
              </div>
              <div className="card-body">
                {revReport.revenueByPaymentMethod && Object.keys(revReport.revenueByPaymentMethod).length > 0 ? (
                  <DonutChart
                    data={revReport.revenueByPaymentMethod}
                    total={Number(revReport.netRevenue || 1)}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    No payment method breakdown recorded for this period.
                  </div>
                )}
              </div>
            </div>

            {/* By Booking Type */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">🏷️ Revenue by Space Type</div>
                  <div className="card-subtitle">Rooms vs. Event Spaces</div>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {revReport.revenueByBookingType && Object.entries(revReport.revenueByBookingType).map(([type, amount]) => {
                  const numAmount = Number(amount || 0);
                  const total = Number(revReport.netRevenue || 1);
                  const pct = total > 0 ? Math.round((numAmount / total) * 100) : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {type === 'ROOM' ? '🏨 Sanctuary Rooms' : '🎭 Event Spaces & Halls'}
                        </span>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--gold-300)', marginRight: 10 }}>
                            LKR {numAmount.toLocaleString()}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: type === 'ROOM' ? 'var(--gold-400)' : '#3b82f6' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">🧾 Transaction Ledger</div>
                <div className="card-subtitle">All payments logged for {from} to {to}</div>
              </div>
              <span className="badge badge-gold">{(revReport.payments || []).length} Records</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Trx ID</th>
                    <th>Booking #</th>
                    <th>Guest</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(!revReport.payments || revReport.payments.length === 0) ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                        No payment transactions recorded during this period.
                      </td>
                    </tr>
                  ) : (
                    revReport.payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{p.id}</td>
                        <td style={{ fontFamily: 'monospace' }}>#{p.reservationId}</td>
                        <td>{p.userName || 'Guest'}</td>
                        <td>
                          <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                            {p.method}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>
                          LKR {Number(p.amount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${p.status === 'SUCCESS' ? 'badge-success' : p.status === 'REFUNDED' ? 'badge-warning' : 'badge-error'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.paidAt ? p.paidAt.replace('T', ' ').slice(0, 16) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RESERVATION REPORT VIEW
      ───────────────────────────────────────────────────────────── */}
      {activeType === 'RESERVATION' && resReport && (
        <>
          {/* Reservation Summary Stats */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card blue">
              <div className="stat-card-icon">🗓️</div>
              <div className="stat-card-value">{resReport.totalReservations || 0}</div>
              <div className="stat-card-label">Total Reservations</div>
              <div className="stat-card-trend up">In Period</div>
            </div>
            <div className="stat-card gold">
              <div className="stat-card-icon">💵</div>
              <div className="stat-card-value">LKR {Number(resReport.totalBookingValue || 0).toLocaleString()}</div>
              <div className="stat-card-label">Booking Value</div>
              <div className="stat-card-trend up">Active Reservations</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-icon">🛏️</div>
              <div className="stat-card-value">{resReport.roomBookings || 0}</div>
              <div className="stat-card-label">Room Bookings</div>
              <div className="stat-card-trend up">{resReport.hallBookings || 0} Hall Events</div>
            </div>
            <div className="stat-card red">
              <div className="stat-card-icon">❌</div>
              <div className="stat-card-value">%{resReport.cancellationRatePercent || 0}</div>
              <div className="stat-card-label">Cancellation Rate</div>
              <div className="stat-card-trend down">Across all bookings</div>
            </div>
          </div>

          {/* Status Breakdown & Room Type Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Status Breakdown */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">📊 Reservations by Status</div>
                  <div className="card-subtitle">Confirmed, Pending, Completed, Cancelled</div>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(resReport.reservationsByStatus || {}).map(([status, count]) => {
                  const total = resReport.totalReservations || 1;
                  const pct = Math.round((Number(count || 0) / total) * 100);
                  const colorMap = { CONFIRMED: '#22c55e', PENDING: '#f59e0b', CHECKED_IN: '#3b82f6', CHECKED_OUT: '#635e8a', CANCELLED: '#ef4444' };
                  return (
                    <div key={status}>
                      <div className="flex justify-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {status.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: colorMap[status] || 'var(--gold-400)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Type Breakdown */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">🏷️ Bookings by Room Category</div>
                  <div className="card-subtitle">Distribution across accommodation tiers</div>
                </div>
              </div>
              <div className="card-body">
                {resReport.bookingsByRoomType && Object.keys(resReport.bookingsByRoomType).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(resReport.bookingsByRoomType).map(([type, count]) => {
                      const totalRooms = resReport.roomBookings || 1;
                      const pct = Math.round((Number(count || 0) / totalRooms) * 100);
                      return (
                        <div key={type}>
                          <div className="flex justify-between" style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{type}</span>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{count} ({pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--gold-400)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    No room type reservations recorded for this period.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reservations Detail Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">📋 Reservation Records</div>
                <div className="card-subtitle">All bookings registered between {from} and {to}</div>
              </div>
              <span className="badge badge-info">{(resReport.reservations || []).length} Bookings</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Guest</th>
                    <th>Reserved Unit</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!resReport.reservations || resReport.reservations.length === 0) ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                        No reservations found for the selected dates.
                      </td>
                    </tr>
                  ) : (
                    resReport.reservations.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{r.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.userName || `Guest #${r.userId}`}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', background: 'var(--dark-700)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                            {r.roomNumber ? `Room #${r.roomNumber} (${r.roomType || ''})` : (r.hallName || 'Event Hall')}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.checkIn}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.checkOut}</td>
                        <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>
                          LKR {Number(r.totalAmount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${
                            r.status === 'CONFIRMED' ? 'badge-success' :
                            r.status === 'PENDING' ? 'badge-warning' :
                            r.status === 'CHECKED_IN' ? 'badge-info' :
                            r.status === 'CANCELLED' ? 'badge-error' : 'badge-muted'
                          }`}>
                            {(r.status || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Reports;
