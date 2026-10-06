import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter, CustomerRoomCard } from './Home';
import LoadingScreen from '../../components/LoadingScreen';
import { RotateCcw, BedDouble } from 'lucide-react';

const MOCK_ROOMS = [
  { id: 1, roomNumber: '101', type: 'Standard Room', capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV'], view: 'Garden View', floor: 1 },
  { id: 2, roomNumber: '102', type: 'Deluxe Room', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View', floor: 1 },
  { id: 3, roomNumber: '201', type: 'Premier Suite', capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi'], view: 'Pool View', floor: 2 },
  { id: 4, roomNumber: '202', type: 'Standard Room', capacity: 2, pricePerNight: 8500, status: 'OCCUPIED', amenities: ['WiFi', 'AC', 'TV'], view: 'Garden View', floor: 2 },
  { id: 5, roomNumber: '301', type: 'Presidential Suite', capacity: 6, pricePerNight: 52000, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi', 'Kitchen'], view: 'Ocean View', floor: 3 },
  { id: 6, roomNumber: '302', type: 'Deluxe Room', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View', floor: 3 },
  { id: 7, roomNumber: '401', type: 'Standard Room', capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV'], view: 'Garden View', floor: 4 },
  { id: 8, roomNumber: '402', type: 'Premier Suite', capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi'], view: 'Pool View', floor: 4 },
  { id: 9, roomNumber: '501', type: 'Deluxe Room', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View', floor: 5 },
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
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(r => ({
            ...r,
            type: r.roomType || r.type || 'Standard Room',
            pricePerNight: Number(r.pricePerNight || r.price || 8500),
            capacity: Number(r.capacity || 2),
            imageUrl: r.imageUrl || null,
            amenities: typeof r.description === 'string'
              ? r.description.split(',').map(s => s.trim()).filter(Boolean)
              : Array.isArray(r.amenities) ? r.amenities : ['WiFi', 'AC', 'TV'],
            view: r.roomNumber?.startsWith('3') ? 'Ocean View' : r.roomNumber?.startsWith('2') ? 'Pool View' : 'Garden View',
          }));
          setRooms(mapped);
        } else {
          setRooms(MOCK_ROOMS);
        }
      })
      .catch(() => setRooms(MOCK_ROOMS))
      .finally(() => setLoading(false));
  }, []);

  const types = [...new Set(rooms.map(r => r.type).filter(Boolean))];

  const filtered = rooms
    .filter(r => !availOnly || r.status === 'AVAILABLE')
    .filter(r => !typeFilter || r.type.toLowerCase().includes(typeFilter.toLowerCase()) || typeFilter.toLowerCase().includes(r.type.toLowerCase()))
    .filter(r => (r.pricePerNight || 0) <= maxPrice)
    .filter(r => !guests || (r.capacity || 2) >= guests)
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
        background: 'linear-gradient(180deg, rgba(197,160,89,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '36px 0 0',
      }}>
        <div className="c-container">
          <div className="section-badge" style={{ marginBottom: 12 }}>The Countryside Spaces</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            Living Spaces & Cabins
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            {filtered.length} raw countryside sanctuary space(s) available for your retreat
          </p>

          {/* Search filter bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, padding: '8px 14px' }}>
              <span style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Arrival</span>
              <input type="date" className="search-bar-input" style={{ width: 130, fontSize: 13, background: 'transparent', border: 'none', color: '#f5f2eb', outline: 'none' }} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, padding: '8px 14px' }}>
              <span style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Departure</span>
              <input type="date" className="search-bar-input" style={{ width: 130, fontSize: 13, background: 'transparent', border: 'none', color: '#f5f2eb', outline: 'none' }} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, padding: '8px 14px' }}>
              <span style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guests</span>
              <input type="number" min={1} max={20} style={{ width: 50, fontSize: 13, background: 'transparent', border: 'none', color: '#f5f2eb', outline: 'none' }} value={guests} onChange={e => setGuests(Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>

      <div className="c-container" style={{ display: 'flex', gap: 32, flex: 1, padding: '36px 28px', alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <div style={{
          width: 280, flexShrink: 0, padding: '24px 20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#161814',
          borderRadius: 2,
          position: 'sticky', top: 96,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Refine Selection</div>

          {/* Search */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search Space</label>
            <input className="form-input" placeholder="Space type or number..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 13, borderRadius: 2, background: '#1a1c18' }} />
          </div>

          {/* Available only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 14px', background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, cursor: 'pointer' }} onClick={() => setAvailOnly(v => !v)}>
            <div style={{ width: 16, height: 16, border: `1px solid ${availOnly ? 'var(--gold-400)' : 'rgba(255,255,255,0.2)'}`, borderRadius: 2, background: availOnly ? 'var(--gold-400)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {availOnly && <span style={{ color: '#141513', fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.04em' }}>Available spaces only</span>
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

          <button className="btn btn-ghost btn-sm w-full" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => { setSearch(''); setTypeFilter(''); setMaxPrice(100000); setSortBy('price_asc'); setAvailOnly(true); }}>
            <RotateCcw size={13} /> Reset Filters
          </button>
        </div>

        {/* Room Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <LoadingScreen text="Carving available sanctuary spaces..." />
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 80 }}>
              <div className="empty-state-icon"><BedDouble size={48} style={{ color: 'var(--gold-400)', opacity: 0.6 }} /></div>
              <div className="empty-state-title">No spaces match your criteria</div>
              <div className="empty-state-desc">Try adjusting your filters or dates to find available sanctuary spaces.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> spaces
                  {checkIn && checkOut && <span> · {checkIn} → {checkOut}</span>}
                </span>
              </div>
              <div className="c-room-grid">
                {filtered.map(room => (
                  <CustomerRoomCard
                    key={room.id}
                    room={{...room, image: room.imageUrl}}
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
