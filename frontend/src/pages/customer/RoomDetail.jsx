import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';

const MOCK_ROOMS = {
  1: { id: 1, roomNumber: '101', type: 'Standard Room', icon: '🛏️', capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'Smart TV', 'In-room Safe', 'Tea/Coffee Maker'], view: 'Garden View', floor: 1, size: '32 sqm', description: 'Our cosy Standard Rooms offer everything you need for a comfortable stay, with elegant furnishings, a plush king-size bed, and a modern en-suite bathroom.' },
  2: { id: 2, roomNumber: '102', type: 'Deluxe Room', icon: '🌟', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'Smart TV', 'Mini-bar', 'Bathrobe & Slippers', 'Espresso Machine'], view: 'City View', floor: 1, size: '46 sqm', description: 'Elevated in every detail, our Deluxe Rooms feature premium bedding, a spacious marble bathroom, and panoramic city views from floor-to-ceiling windows.' },
  3: { id: 3, roomNumber: '201', type: 'Premier Suite', icon: '👑', capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'Smart TV', 'Mini-bar', 'Jacuzzi', 'Living Room', 'Butler Service'], view: 'Pool View', floor: 2, size: '80 sqm', description: 'Indulge in the grandeur of our Premier Suite, featuring a private living area, spa-like bathroom with soaking tub, and stunning pool views from your private terrace.' },
  5: { id: 5, roomNumber: '301', type: 'Presidential Suite', icon: '💎', capacity: 6, pricePerNight: 52000, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'Smart TV', 'Mini-bar', 'Jacuzzi', 'Full Kitchen', 'Private Terrace', 'Butler Service', 'Airport Transfer'], view: 'Ocean View', floor: 3, size: '140 sqm', description: 'The pinnacle of luxury, our Presidential Suite spans an entire floor with breathtaking ocean views, a gourmet kitchen, private dining area, and dedicated 24/7 butler service.' },
};

function BookingStep({ step, label, active, done }) {
  return null; // handled inline below
}

function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [activeImg, setActiveImg] = useState(0);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    axios.get(`/api/rooms/${id}`)
      .then(res => {
        const r = res.data;
        setRoom({
          ...r,
          type: r.roomType || r.type || 'Standard Room',
          pricePerNight: Number(r.pricePerNight || r.price || 8500),
          capacity: Number(r.capacity || 2),
          amenities: typeof r.description === 'string' 
            ? r.description.split(',').map(s => s.trim()).filter(Boolean)
            : Array.isArray(r.amenities) ? r.amenities : ['WiFi', 'AC', 'Smart TV', 'In-room Safe'],
          view: r.roomNumber?.startsWith('3') ? 'Ocean View' : r.roomNumber?.startsWith('2') ? 'Pool View' : 'Garden View',
          size: r.roomNumber?.startsWith('3') ? '140 sqm' : r.roomNumber?.startsWith('2') ? '80 sqm' : '46 sqm',
          description: r.description || 'Experience ultimate luxury with our beautifully appointed room, crafted for relaxation and comfort.',
        });
      })
      .catch(() => {
        setRoom(MOCK_ROOMS[id] || MOCK_ROOMS[1]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut) - new Date(checkIn);
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  })();

  const subtotal = (room?.pricePerNight || 0) * nights;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleBook = () => {
    const guest = JSON.parse(localStorage.getItem('guestUser') || 'null');
    if (!guest) {
      navigate(`/guest-login?redirect=/room/${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      return;
    }
    const params = new URLSearchParams({ checkIn, checkOut, guests, roomId: room.id });
    navigate(`/checkout?${params.toString()}`);
  };

  if (loading) return (
    <div className="customer-shell">
      <CustomerNav />
      <div className="loading-overlay" style={{ flex: 1 }}><div className="spinner" style={{ width: 40, height: 40 }} />Loading room details...</div>
    </div>
  );

  if (!room) return (
    <div className="customer-shell">
      <CustomerNav />
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon">🛏️</div>
        <div className="empty-state-title">Room not found</div>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/browse')}>Browse All Rooms</button>
      </div>
    </div>
  );

  const ROOM_ICONS = [room.icon || '🛏️', '🚿', '🛋️', '🌅'];
  const ROOM_LABELS = ['Bedroom', 'Bathroom', 'Living Area', 'View'];

  return (
    <div className="customer-shell">
      <CustomerNav />

      <div className="c-section" style={{ paddingTop: 36 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => navigate('/')}>Home</button>
          <span>›</span>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => navigate('/browse')}>Browse Rooms</button>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)' }}>{room.type}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
          {/* Left: Room Info */}
          <div>
            {/* Main Image */}
            <div
              className="room-detail-hero"
              style={{
                backgroundImage: `url(${
                  (room.type || '').toLowerCase().includes('suite') ? '/assets/images/suite.jpg' :
                  (room.type || '').toLowerCase().includes('deluxe') ? '/assets/images/deluxe.jpg' :
                  '/assets/images/standard.jpg'
                })`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.12)',
                marginBottom: 20,
                height: 380,
              }}
            />

            {/* Room Title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {room.type}
                </h1>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <span className="c-room-meta-item">🏠 Room {room.roomNumber}</span>
                  <span className="c-room-meta-item">📐 {room.size || '—'}</span>
                  <span className="c-room-meta-item">👤 Up to {room.capacity} guests</span>
                  <span className="c-room-meta-item">🏢 Floor {room.floor}</span>
                  {room.view && <span className="c-room-meta-item">🌅 {room.view}</span>}
                </div>
              </div>
              <span className={`badge ${room.status === 'AVAILABLE' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 13 }}>
                {room.status === 'AVAILABLE' ? '✓ Available' : room.status}
              </span>
            </div>

            {/* Description */}
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>About This Room</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>{room.description}</p>
            </div>

            {/* Amenities */}
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Room Amenities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {(room.amenities || []).map(a => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--dark-750)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Policies</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🕐', label: 'Check-in', value: 'From 2:00 PM' },
                  { icon: '🕛', label: 'Check-out', value: 'Until 12:00 PM' },
                  { icon: '🚭', label: 'Smoking', value: 'Non-smoking room' },
                  { icon: '🐾', label: 'Pets', value: 'Not allowed' },
                  { icon: '🔄', label: 'Cancellation', value: 'Free cancellation up to 3 days before check-in' },
                ].map(p => (
                  <div key={p.label} className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.icon} {p.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="booking-panel">
            <div className="booking-panel-price">LKR {(room.pricePerNight || 0).toLocaleString()}</div>
            <div className="booking-panel-period">per night · taxes not included</div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Check-in Date *</label>
              <input type="date" className="form-input" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Check-out Date *</label>
              <input type="date" className="form-input" value={checkOut} min={checkIn || today} onChange={e => setCheckOut(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Number of Guests</label>
              <input type="number" className="form-input" value={guests} min={1} max={room.capacity} onChange={e => setGuests(Number(e.target.value))} />
              <span className="form-hint">Max {room.capacity} guests for this room</span>
            </div>

            {nights > 0 && (
              <div className="price-breakdown">
                <div className="price-row">
                  <span>LKR {room.pricePerNight?.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>Taxes & fees (10%)</span>
                  <span>LKR {tax.toLocaleString()}</span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span style={{ color: 'var(--gold-300)' }}>LKR {total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {!nights && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <span className="alert-icon">ℹ️</span>
                <span>Select check-in and check-out dates to see the price breakdown.</span>
              </div>
            )}

            <button
              className="hero-btn-primary w-full"
              style={{ borderRadius: 'var(--radius-md)', justifyContent: 'center', fontSize: 15 }}
              onClick={handleBook}
              disabled={room.status !== 'AVAILABLE'}
            >
              {room.status !== 'AVAILABLE' ? 'Room Unavailable' : nights > 0 ? `Reserve for LKR ${total.toLocaleString()}` : '🏨 Reserve This Room'}
            </button>

            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              🔒 Secure booking · Free cancellation up to 3 days before check-in
            </div>

            {/* Price match guarantee */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>✅ Best Price Guarantee</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>We'll match any lower price you find for this room.</div>
            </div>
          </div>
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}

export default RoomDetail;
