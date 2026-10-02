import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter, CustomerRoomCard } from './Home';

const MOCK_ROOMS = [
  { id: 1, roomNumber: '101', type: 'Standard Room', icon: '🛏️', capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV'], view: 'Garden View', floor: 1 },
  { id: 2, roomNumber: '102', type: 'Deluxe Room', icon: '🌟', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View', floor: 1 },
  { id: 3, roomNumber: '201', type: 'Premier Suite', icon: '👑', capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi'], view: 'Pool View', floor: 2 },
  { id: 4, roomNumber: '202', type: 'Standard Room', icon: '🛏️', capacity: 2, pricePerNight: 8500, status: 'OCCUPIED', amenities: ['WiFi', 'AC', 'TV'], view: 'Garden View', floor: 2 },
  { id: 5, roomNumber: '301', type: 'Presidential Suite', icon: '💎', capacity: 6, pricePerNight: 52000, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi', 'Kitchen'], view: 'Ocean View', floor: 3 },
  { id: 6, roomNumber: '302', type: 'Deluxe Room', icon: '🌟', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View', floor: 3 },
  { id: 7, roomNumber: '401', type: 'Standard Room', icon: '🛏️', capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV'], view: 'Garden View', floor: 4 },
  { id: 8, roomNumber: '402', type: 'Premier Suite', icon: '👑', capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi'], view: 'Pool View', floor: 4 },
  { id: 9, roomNumber: '501', type: 'Deluxe Room', icon: '🌟', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View', floor: 5 },
];

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'capacity_asc', label: 'Capacity: Small First' },
  { value: 'capacity_desc', label: 'Capacity: Large First' },
];

function BrowseRooms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('price_asc');
  const [availOnly, setAvailOnly] = useState(true);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);

  useEffect(() => {
    axios.get('/api/rooms')
      .then(res => setRooms(res.data))
      .catch(() => setRooms(MOCK_ROOMS))
      .finally(() => setLoading(false));
  }, []);

  const types = [...new Set(MOCK_ROOMS.map(r => r.type))];

  const filtered = rooms
    .filter(r => !availOnly || r.status === 'AVAILABLE')
    .filter(r => !typeFilter || r.type === typeFilter)
    .filter(r => (r.pricePerNight || 0) <= maxPrice)
    .filter(r => !guests || r.capacity >= guests)
    .filter(r => {
      const q = search.toLowerCase();
      return !q || r.type?.toLowerCase().includes(q) || r.roomNumber?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      if (sortBy === 'capacity_asc') return a.capacity - b.capacity;
      if (sortBy === 'capacity_desc') return b.capacity - a.capacity;
      return 0;
    });

  const handleRoomClick = (room) => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/room/${room.id}?${params.toString()}`);
  };

  return (
    <div className="customer-shell">
      <CustomerNav />

      {/* Page Header */}
      <div style={{
        padding: '40px 60px 0',
        background: 'linear-gradient(180deg, rgba(201,160,48,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="section-badge" style={{ marginBottom: 12 }}>Our Accommodations</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          Browse Rooms & Suites
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>
          {filtered.length} rooms available · Choose your perfect sanctuary
        </p>

        {/* Search filter bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dark-750)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>📅 Check-in</span>
            <input type="date" className="search-bar-input" style={{ width: 130, fontSize: 13, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dark-750)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>📅 Check-out</span>
            <input type="date" className="search-bar-input" style={{ width: 130, fontSize: 13, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dark-750)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>👥 Guests</span>
            <input type="number" min={1} max={20} style={{ width: 50, fontSize: 13, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }} value={guests} onChange={e => setGuests(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, flex: 1 }}>
        {/* Sidebar Filters */}
        <div style={{
          width: 280, flexShrink: 0, padding: '28px 24px',
          borderRight: '1px solid var(--border-subtle)',
          position: 'sticky', top: 72, height: 'calc(100vh - 72px)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>🔧 Filters</div>

          {/* Search */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Search</label>
            <input className="form-input" placeholder="Room type or number..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 13 }} />
          </div>

          {/* Available only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 14px', background: 'var(--dark-750)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => setAvailOnly(v => !v)}>
            <div style={{ width: 18, height: 18, border: `2px solid ${availOnly ? 'var(--gold-400)' : 'var(--border-subtle)'}`, borderRadius: 4, background: availOnly ? 'var(--gold-400)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {availOnly && <span style={{ color: 'var(--dark-900)', fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Available rooms only</span>
          </div>

          {/* Room Type */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Room Type</label>
            {['', ...types].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }} onClick={() => setTypeFilter(t)}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${typeFilter === t ? 'var(--gold-400)' : 'var(--border-subtle)'}`, background: typeFilter === t ? 'var(--gold-400)' : 'transparent', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: typeFilter === t ? 'var(--gold-300)' : 'var(--text-secondary)' }}>
                  {t || 'All Types'}
                </span>
              </div>
            ))}
          </div>

          {/* Max Price */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Max Price per Night</label>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-300)', marginBottom: 10 }}>
              LKR {maxPrice.toLocaleString()}
            </div>
            <input
              type="range" min={5000} max={100000} step={1000} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-400)' }}
            />
            <div className="flex justify-between" style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>LKR 5,000</span><span>LKR 100,000</span>
            </div>
          </div>

          {/* Sort */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <button className="btn btn-ghost btn-sm w-full" onClick={() => { setSearch(''); setTypeFilter(''); setMaxPrice(100000); setSortBy('price_asc'); setAvailOnly(true); }}>
            ↺ Reset Filters
          </button>
        </div>

        {/* Room Grid */}
        <div style={{ flex: 1, padding: '28px 40px' }}>
          {loading ? (
            <div className="loading-overlay"><div className="spinner" style={{ width: 36, height: 36 }} />Loading rooms...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 100 }}>
              <div className="empty-state-icon">🛏️</div>
              <div className="empty-state-title">No rooms match your criteria</div>
              <div className="empty-state-desc">Try adjusting your filters or dates to find available rooms.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> rooms
                  {checkIn && checkOut && <span> · {checkIn} → {checkOut}</span>}
                </span>
              </div>
              <div className="c-room-grid">
                {filtered.map(room => (
                  <CustomerRoomCard
                    key={room.id}
                    room={room}
                    onClick={() => handleRoomClick(room)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}

export default BrowseRooms;
