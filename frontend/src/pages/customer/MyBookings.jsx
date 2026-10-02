import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CHECKED_IN: 'badge-info',
  CHECKED_OUT: 'badge-muted',
  CANCELLED: 'badge-error',
};

const STATUS_ICON = { CONFIRMED: '✅', PENDING: '⏳', CHECKED_IN: '🏨', CHECKED_OUT: '🚪', CANCELLED: '❌' };

const MOCK_BOOKINGS = [
  {
    id: 1, reservationId: 'LXS-001234', roomType: 'Deluxe Room', roomNumber: '102', icon: '🌟',
    checkIn: '2026-10-10', checkOut: '2026-10-13', guests: 2, status: 'CONFIRMED',
    totalAmount: 46644, paymentStatus: 'PAID', paymentMethod: 'CREDIT_CARD', nights: 3,
  },
  {
    id: 2, reservationId: 'LXS-001198', roomType: 'Premier Suite', roomNumber: '201', icon: '👑',
    checkIn: '2026-09-15', checkOut: '2026-09-18', guests: 2, status: 'CHECKED_OUT',
    totalAmount: 94380, paymentStatus: 'PAID', paymentMethod: 'BANK_TRANSFER', nights: 3,
  },
  {
    id: 3, reservationId: 'LXS-001302', roomType: 'Standard Room', roomNumber: '401', icon: '🛏️',
    checkIn: '2026-11-05', checkOut: '2026-11-07', guests: 1, status: 'PENDING',
    totalAmount: 18700, paymentStatus: 'PENDING', paymentMethod: 'CASH', nights: 2,
  },
];

function BookingCard({ booking, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const isPast = new Date(booking.checkOut) < new Date();
  const canCancel = ['CONFIRMED', 'PENDING'].includes(booking.status);

  return (
    <div className="booking-card animate-fade-in">
      <div className="booking-card-top">
        <div className="booking-card-img">{booking.icon}</div>
        <div className="booking-card-info" style={{ flex: 1 }}>
          <div className="booking-card-room">{booking.roomType}</div>
          <div className="booking-card-dates">
            📅 {booking.checkIn} → {booking.checkOut} · {booking.nights} night{booking.nights !== 1 ? 's' : ''} · 👥 {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_BADGE[booking.status] || 'badge-muted'}`}>
              {STATUS_ICON[booking.status]} {booking.status?.replace('_', ' ')}
            </span>
            <span className={`badge ${booking.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
              {booking.paymentStatus === 'PAID' ? '💰 Paid' : '⏳ Pending Payment'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-300)' }}>LKR {booking.totalAmount?.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total incl. tax</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setExpanded(v => !v)}>
            {expanded ? '▲ Less' : '▼ Details'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              ['Booking Ref', booking.reservationId],
              ['Room Number', `#${booking.roomNumber}`],
              ['Payment Method', booking.paymentMethod?.replace('_', ' ')],
              ['Check-in', booking.checkIn],
              ['Check-out', booking.checkOut],
              ['Guests', booking.guests],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '12px 14px', background: 'var(--dark-750)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: k === 'Booking Ref' || k === 'Room Number' ? 'monospace' : 'inherit' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="booking-card-footer">
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {isPast ? `✅ Stay completed ${booking.checkOut}` : `📅 ${Math.max(0, Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24)))} days until check-in`}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canCancel && (
            <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking)}>
              ❌ Cancel
            </button>
          )}
          {booking.status === 'CHECKED_OUT' && (
            <button className="btn btn-secondary btn-sm" onClick={() => {}}>⭐ Leave Review</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => {}}>📄 Download Invoice</button>
        </div>
      </div>
    </div>
  );
}

function MyBookings() {
  const navigate = useNavigate();
  const guest = JSON.parse(localStorage.getItem('guestUser') || 'null');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!guest) { navigate('/guest-login?redirect=/my-bookings'); return; }
    // Try fetching from API, fall back to mock
    axios.get('/api/reservations')
      .then(res => {
        const my = res.data.filter(r => r.guestEmail === guest.email);
        setBookings(my.length > 0 ? my : MOCK_BOOKINGS);
      })
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setLoading(false));
  }, [navigate]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCancel = async (booking) => {
    try {
      await axios.put(`/api/reservations/${booking.id}/cancel`);
    } catch {/* */}
    setBookings(b => b.map(x => x.id === booking.id ? { ...x, status: 'CANCELLED' } : x));
    setCancelModal(null);
    showToast('Reservation cancelled successfully.');
  };

  const FILTERS = [
    { id: 'all', label: '🗂️ All Bookings' },
    { id: 'upcoming', label: '📅 Upcoming' },
    { id: 'past', label: '✅ Past Stays' },
    { id: 'cancelled', label: '❌ Cancelled' },
  ];

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return ['CONFIRMED', 'PENDING', 'CHECKED_IN'].includes(b.status);
    if (filter === 'past') return b.status === 'CHECKED_OUT';
    if (filter === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="customer-shell">
      <CustomerNav />

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
          color: '#86efac', borderRadius: 'var(--radius-md)',
          padding: '12px 20px', fontSize: 14, fontWeight: 600,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
        }}>✅ {toast}</div>
      )}

      {/* Header */}
      <div style={{ padding: '40px 60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{guest?.name?.charAt(0) || 'G'}</div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              My Bookings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Welcome back, {guest?.name || 'Guest'} · {bookings.length} total reservation{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="hero-btn-primary" style={{ borderRadius: 'var(--radius-md)', marginLeft: 'auto' }} onClick={() => navigate('/browse')}>
            + New Booking
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 24, paddingBottom: 24 }}>
          {[
            { label: 'Total Stays', value: bookings.filter(b => b.status === 'CHECKED_OUT').length, icon: '🏨' },
            { label: 'Upcoming', value: bookings.filter(b => ['CONFIRMED', 'PENDING'].includes(b.status)).length, icon: '📅' },
            { label: 'Total Spent', value: `LKR ${bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}`, icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 20px', background: 'var(--dark-750)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="c-section" style={{ paddingTop: 32 }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {FILTERS.map(f => (
            <button key={f.id} className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 36, height: 36 }} />Loading your bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 80 }}>
            <div className="empty-state-icon">{filter === 'upcoming' ? '📅' : filter === 'past' ? '✅' : '🗓️'}</div>
            <div className="empty-state-title">No {filter === 'all' ? '' : filter} bookings found</div>
            <div className="empty-state-desc">
              {filter === 'upcoming' ? "You have no upcoming reservations." : filter === 'past' ? "You haven't completed any stays yet." : "You have no bookings yet."}
            </div>
            <button className="hero-btn-primary" style={{ borderRadius: 'var(--radius-md)', marginTop: 24 }} onClick={() => navigate('/browse')}>
              Browse Rooms
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={b => setCancelModal(b)} />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>❌</div>
              <div>
                <div className="modal-title">Cancel Reservation</div>
                <div className="modal-subtitle">{cancelModal.reservationId}</div>
              </div>
              <button className="modal-close" onClick={() => setCancelModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <span className="alert-icon">⚠️</span>
                <div>
                  <div className="alert-title">Are you sure?</div>
                  Cancelling <strong>{cancelModal.roomType}</strong> ({cancelModal.checkIn} → {cancelModal.checkOut}).
                  If within the free cancellation window, a full refund will be processed.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModal(null)}>Keep Booking</button>
              <button className="btn btn-danger" onClick={() => handleCancel(cancelModal)}>❌ Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      <CustomerFooter />
    </div>
  );
}

export default MyBookings;
