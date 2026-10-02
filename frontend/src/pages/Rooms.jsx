import { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_ROOMS = [
  { id: 1, roomNumber: '101', type: 'Standard', floor: 1, capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: 'WiFi, AC, TV' },
  { id: 2, roomNumber: '102', type: 'Deluxe', floor: 1, capacity: 2, pricePerNight: 14200, status: 'OCCUPIED', amenities: 'WiFi, AC, TV, Mini-bar' },
  { id: 3, roomNumber: '201', type: 'Suite', floor: 2, capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: 'WiFi, AC, TV, Mini-bar, Jacuzzi' },
  { id: 4, roomNumber: '202', type: 'Standard', floor: 2, capacity: 2, pricePerNight: 8500, status: 'MAINTENANCE', amenities: 'WiFi, AC, TV' },
  { id: 5, roomNumber: '301', type: 'Premium Suite', floor: 3, capacity: 6, pricePerNight: 52000, status: 'AVAILABLE', amenities: 'WiFi, AC, TV, Mini-bar, Jacuzzi, Kitchen' },
  { id: 6, roomNumber: '302', type: 'Deluxe', floor: 3, capacity: 2, pricePerNight: 14200, status: 'OCCUPIED', amenities: 'WiFi, AC, TV, Mini-bar' },
  { id: 7, roomNumber: '401', type: 'Standard', floor: 4, capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: 'WiFi, AC, TV' },
  { id: 8, roomNumber: '402', type: 'Suite', floor: 4, capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: 'WiFi, AC, TV, Mini-bar, Jacuzzi' },
];

const STATUS_BADGE = {
  AVAILABLE: 'badge-success',
  OCCUPIED: 'badge-error',
  MAINTENANCE: 'badge-warning',
  RESERVED: 'badge-info',
  OUT_OF_SERVICE: 'badge-muted',
};

const TYPE_ICON = {
  'Standard': '🛏️',
  'Deluxe': '🌟',
  'Suite': '👑',
  'Premium Suite': '💎',
};

const TYPE_OPTIONS = ['Standard', 'Deluxe', 'Suite', 'Premium Suite'];
const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'OUT_OF_SERVICE'];

function RoomCard({ room, onEdit, onDelete }) {
  const icon = TYPE_ICON[room.type] || '🛏️';
  const isAvailable = room.status === 'AVAILABLE';

  return (
    <div className="room-card">
      <div className="room-card-img" style={{
        background: isAvailable
          ? 'linear-gradient(135deg, #1e1a33, #2a2545)'
          : 'linear-gradient(135deg, #13101e, #1e1a33)',
      }}>
        <span style={{ fontSize: 52, zIndex: 1, position: 'relative' }}>{icon}</span>
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
        }}>
          <span className={`badge ${STATUS_BADGE[room.status] || 'badge-muted'}`}>{room.status}</span>
        </div>
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 2,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 6, padding: '3px 8px',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>
          Floor {room.floor}
        </div>
      </div>
      <div className="room-card-body">
        <div className="flex items-center justify-between">
          <div>
            <div className="room-card-number">Room {room.roomNumber}</div>
            <div className="room-card-type">{room.type} · {room.capacity} guests</div>
          </div>
          <div className="room-card-price" style={{ textAlign: 'right' }}>
            <div>${room.pricePerNight?.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>per night</div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {room.amenities?.split(', ').map(a => (
            <span key={a} style={{
              background: 'var(--dark-700)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4, padding: '2px 6px',
            }}>{a}</span>
          ))}
        </div>
      </div>
      <div className="room-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          ID #{room.id}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(room)}>✏️ Edit</button>
          <button className="btn btn-danger btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px' }} onClick={() => onDelete(room.id, room.roomNumber)} title="Delete Room">🗑️</button>
        </div>
      </div>
    </div>
  );
}

function RoomModal({ room, onClose, onSave }) {
  const [form, setForm] = useState(room ? {
    roomNumber: room.roomNumber,
    type: room.type,
    floor: room.floor,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight,
    status: room.status,
    amenities: room.amenities,
  } : { roomNumber: '', type: 'Standard', floor: 1, capacity: 2, pricePerNight: 8500, status: 'AVAILABLE', amenities: '' });

  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">🛏️</div>
          <div>
            <div className="modal-title">{room ? `Edit Room ${room.roomNumber}` : 'Add New Room'}</div>
            <div className="modal-subtitle">{room ? 'Update room details' : 'Configure a new room'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input className="form-input" value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)} placeholder="e.g. 201" required />
              </div>
              <div className="form-group">
                <label className="form-label">Floor *</label>
                <input className="form-input" type="number" min="1" value={form.floor} onChange={e => set('floor', Number(e.target.value))} required />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Room Type *</label>
                <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (guests) *</label>
                <input className="form-input" type="number" min="1" max="20" value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} required />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Price per Night (LKR) *</label>
                <input className="form-input" type="number" min="0" value={form.pricePerNight} onChange={e => set('pricePerNight', Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Amenities (comma-separated)</label>
              <input className="form-input" value={form.amenities} onChange={e => set('amenities', e.target.value)} placeholder="WiFi, AC, TV, Mini-bar" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : room ? '✓ Update Room' : '+ Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchRooms = () => {
    setLoading(true);
    axios.get('/api/rooms')
      .then(res => {
        // Map backend fields to UI
        const mapped = res.data.map(r => ({
          ...r,
          type: r.roomType || r.type || 'Standard',
          floor: r.roomNumber?.length >= 3 ? parseInt(r.roomNumber.charAt(0)) : 1,
          amenities: r.description || 'WiFi, AC, TV',
        }));
        setRooms(mapped);
      })
      .catch(() => setRooms(MOCK_ROOMS))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSave = async (form) => {
    const payload = {
      roomNumber: form.roomNumber,
      roomType: form.type,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      status: form.status,
      description: form.amenities,
    };

    try {
      if (modal.room) {
        await axios.put(`/api/rooms/${modal.room.id}`, payload);
        showToast('Room updated successfully in MySQL!');
      } else {
        await axios.post('/api/rooms', payload);
        showToast('Room added successfully to MySQL!');
      }
      fetchRooms();
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showToast(msg, 'error');
    }
  };

  const handleDeleteClick = (id, roomNumber) => {
    setModal({ type: 'delete', room: { id, roomNumber } });
  };

  const confirmDelete = async () => {
    if (!modal?.room) return;
    const { id, roomNumber } = modal.room;
    try {
      await axios.delete(`/api/rooms/${id}`);
      showToast(`Room ${roomNumber} deleted successfully from MySQL!`, 'success');
      fetchRooms();
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete room: linked to reservations or foreign keys.';
      showToast(msg, 'error');
      setModal(null);
    }
  };

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    return (
      (!q || r.roomNumber?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q)) &&
      (!typeFilter || r.type === typeFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const available = rooms.filter(r => r.status === 'AVAILABLE').length;
  const occupied = rooms.filter(r => r.status === 'OCCUPIED').length;

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 3000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md)',
          padding: '14px 22px', fontSize: 14, fontWeight: 600,
          backdropFilter: 'blur(8px)',
          animation: 'slideUp 0.3s ease', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{typeof toast === 'string' ? toast : toast.msg}</span>
        </div>
      )}

      {/* Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card green">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{available}</div>
          <div className="stat-card-label">Available</div>
        </div>
        <div className="stat-card red">
          <div className="stat-card-icon">🔴</div>
          <div className="stat-card-value">{occupied}</div>
          <div className="stat-card-label">Occupied</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-card-icon">🔧</div>
          <div className="stat-card-value">{rooms.filter(r => r.status === 'MAINTENANCE').length}</div>
          <div className="stat-card-label">Maintenance</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-card-icon">🛏️</div>
          <div className="stat-card-value">{rooms.length}</div>
          <div className="stat-card-label">Total Rooms</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search room number or type..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <div className="flex gap-2">
              <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')}>⊞ Grid</button>
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>☰ List</button>
            </div>
            <button
              id="add-room-btn"
              className="btn btn-primary btn-sm"
              onClick={() => setModal({ type: 'add' })}
            >
              + Add Room
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" /> Loading rooms...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🛏️</div>
            <div className="empty-state-title">No rooms found</div>
            <div className="empty-state-desc">Try changing your filters or add a new room.</div>
            <button className="btn btn-primary mt-4" onClick={() => setModal({ type: 'add' })}>+ Add Room</button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="room-grid">
          {filtered.map(room => (
            <RoomCard key={room.id} room={room} onEdit={r => setModal({ type: 'edit', room: r })} onDelete={handleDeleteClick} />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🛏️ Room List</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} rooms</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Room No.</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Price/Night</th>
                  <th>Status</th>
                  <th>Amenities</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.roomNumber}</td>
                    <td><span className="tag">{TYPE_ICON[r.type] || '🛏️'} {r.type}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>Floor {r.floor}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.capacity} guests</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>${r.pricePerNight?.toLocaleString()}</td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-muted'}`}>{r.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.amenities}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'edit', room: r })}>✏️ Edit</button>
                        <button type="button" className="btn btn-danger btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px' }} onClick={() => handleDeleteClick(r.id, r.roomNumber)} title="Delete Room">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <RoomModal room={modal.room} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>🗑️</div>
              <div>
                <div className="modal-title">Delete Room {modal.room.roomNumber}?</div>
                <div className="modal-subtitle">Confirm room removal</div>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                Are you sure you want to permanently delete <strong>Room {modal.room.roomNumber}</strong> from the database? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: '#ef4444', color: '#ffffff', fontWeight: 600 }}
                onClick={confirmDelete}
              >
                ✓ Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Rooms;
