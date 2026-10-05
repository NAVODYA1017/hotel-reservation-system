import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Calendar, Search, Edit3, XCircle, Trash2, CheckCircle2, AlertTriangle, Plus, Printer 
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
const TYPE_OPTIONS = ['ROOM', 'EVENT_HALL', 'PACKAGE'];

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CHECKED_IN: 'badge-info',
  CHECKED_OUT: 'badge-muted',
  CANCELLED: 'badge-error',
};

const MOCK_RESERVATIONS = [
  { id: 1, guestName: 'Amara Silva', guestEmail: 'amara@mail.com', roomId: 201, reservationType: 'ROOM', checkInDate: '2026-10-02', checkOutDate: '2026-10-05', status: 'CONFIRMED', totalAmount: 12600 },
  { id: 2, guestName: 'Rajiv Mendis', guestEmail: 'rajiv@mail.com', roomId: 315, reservationType: 'ROOM', checkInDate: '2026-10-01', checkOutDate: '2026-10-03', status: 'CHECKED_IN', totalAmount: 4200 },
  { id: 3, guestName: 'Priya Fernando', guestEmail: 'priya@mail.com', roomId: 102, reservationType: 'PACKAGE', checkInDate: '2026-10-03', checkOutDate: '2026-10-07', status: 'PENDING', totalAmount: 22400 },
  { id: 4, guestName: 'David Perera', guestEmail: 'david@mail.com', roomId: 408, reservationType: 'ROOM', checkInDate: '2026-09-28', checkOutDate: '2026-10-01', status: 'CHECKED_OUT', totalAmount: 9800 },
  { id: 5, guestName: 'Nadia Wijerama', guestEmail: 'nadia@mail.com', roomId: 511, reservationType: 'EVENT_HALL', checkInDate: '2026-10-05', checkOutDate: '2026-10-08', status: 'CONFIRMED', totalAmount: 7500 },
  { id: 6, guestName: 'Kasun De Silva', guestEmail: 'kasun@mail.com', roomId: 304, reservationType: 'ROOM', checkInDate: '2026-10-09', checkOutDate: '2026-10-11', status: 'PENDING', totalAmount: 5600 },
  { id: 7, guestName: 'Malini Jayawickrama', guestEmail: 'malini@mail.com', roomId: 217, reservationType: 'ROOM', checkInDate: '2026-09-20', checkOutDate: '2026-09-25', status: 'CANCELLED', totalAmount: 0 },
];

const BLANK = {
  guestName: '', guestEmail: '', roomId: '', reservationType: 'ROOM',
  checkInDate: '', checkOutDate: '', numberOfGuests: 1, specialRequests: '',
};

function ReservationModal({ reservation, onClose, onSave }) {
  const [form, setForm] = useState(reservation ? {
    guestName: reservation.guestName,
    guestEmail: reservation.guestEmail,
    roomId: reservation.roomId,
    reservationType: reservation.reservationType,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    numberOfGuests: reservation.numberOfGuests || 1,
    specialRequests: reservation.specialRequests || '',
  } : BLANK);
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
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} />
          </div>
          <div>
            <div className="modal-title">{reservation ? 'Edit Reservation' : 'New Reservation'}</div>
            <div className="modal-subtitle">{reservation ? `Reservation #${reservation.id}` : 'Book a room, event hall or package'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Guest Name *</label>
                <input className="form-input" value={form.guestName} onChange={e => set('guestName', e.target.value)} placeholder="Full name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Guest Email *</label>
                <input className="form-input" type="email" value={form.guestEmail} onChange={e => set('guestEmail', e.target.value)} placeholder="guest@email.com" required />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Room / Hall ID *</label>
                <input className="form-input" type="number" value={form.roomId} onChange={e => set('roomId', e.target.value)} placeholder="e.g. 201" required />
              </div>
              <div className="form-group">
                <label className="form-label">Reservation Type *</label>
                <select className="form-select" value={form.reservationType} onChange={e => set('reservationType', e.target.value)}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Guests</label>
                <input className="form-input" type="number" min="1" max="20" value={form.numberOfGuests} onChange={e => set('numberOfGuests', e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Check-in Date *</label>
                <input className="form-input" type="date" value={form.checkInDate} onChange={e => set('checkInDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Check-out Date *</label>
                <input className="form-input" type="date" value={form.checkOutDate} onChange={e => set('checkOutDate', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Special Requests</label>
              <textarea className="form-textarea" value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} placeholder="Any special requirements..." style={{ minHeight: 72 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : (reservation ? '✓ Update' : '+ Create Reservation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReservations = () => {
    setLoading(true);
    axios.get('/api/reservations')
      .then(res => setReservations(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSave = async (form) => {
    try {
      const payload = {
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        roomId: Number(form.roomId),
        checkIn: form.checkInDate,
        checkOut: form.checkOutDate,
      };
      if (modal.reservation) {
        await axios.put(`/api/reservations/${modal.reservation.id}`, payload);
        showToast('Reservation updated successfully in MySQL!');
      } else {
        await axios.post('/api/reservations', payload);
        showToast('Reservation created successfully in MySQL!');
      }
      fetchReservations();
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error saving reservation';
      showToast(msg, 'error');
    }
  };

  const handleCancel = async (res) => {
    try {
      await axios.put(`/api/reservations/${res.id}/cancel`);
      showToast(`Reservation #${res.id} marked CANCELLED in MySQL.`, 'success');
      fetchReservations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error cancelling reservation';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (res) => {
    try {
      await axios.delete(`/api/reservations/${res.id}`);
      showToast(`Reservation #${res.id} deleted permanently from MySQL!`, 'success');
      fetchReservations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting reservation';
      showToast(msg, 'error');
    }
  };

  const handleDownloadReceipt = (r) => {
    showToast('Generating PDF receipt...', 'success');
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; background: white;">
        <div style="text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #c9a030; letter-spacing: 2px;">ALIYA RESORT</h1>
          <h2 style="font-size: 20px; margin: 0 0 5px 0; color: #333;">OFFICIAL RESERVATION RECEIPT</h2>
          <div style="font-size: 14px; color: #666;">Reservation #${r.reservationId || r.id} | Status: ${r.status}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f5f5f5;">
          <span style="font-weight: bold; color: #555; width: 150px;">Guest Name:</span> 
          <span style="flex: 1; text-align: right;">${r.guestName || r.userName || 'Guest'}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f5f5f5;">
          <span style="font-weight: bold; color: #555; width: 150px;">Room / Venue:</span> 
          <span style="flex: 1; text-align: right;">${r.roomType || r.reservationType || 'Room'} (No. ${r.roomNumber || r.roomId})</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f5f5f5;">
          <span style="font-weight: bold; color: #555; width: 150px;">Check-In Date:</span> 
          <span style="flex: 1; text-align: right;">${r.checkInDate || r.checkIn}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f5f5f5;">
          <span style="font-weight: bold; color: #555; width: 150px;">Check-Out Date:</span> 
          <span style="flex: 1; text-align: right;">${r.checkOutDate || r.checkOut}</span>
        </div>
        
        <div style="margin-top: 40px; border-top: 2px solid #333; padding-top: 20px; text-align: right;">
          <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Total Amount Paid / Due</div>
          <div style="font-size: 24px; font-weight: bold; color: #c9a030;">LKR ${Number(r.totalAmount || 0).toLocaleString()}</div>
        </div>
        
        <div style="margin-top: 60px; text-align: center; font-size: 12px; color: #999;">
          Thank you for choosing Aliya Resort. We look forward to your stay.<br/>
          This is a computer generated document.
        </div>
      </div>
    `;

    const opt = {
      margin:       0.5,
      filename:     `Receipt_RES_${r.reservationId || r.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(container).save();
  };

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase();
    return (
      (!q || r.guestName?.toLowerCase().includes(q) || r.guestEmail?.toLowerCase().includes(q) || String(r.id).includes(q)) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px', fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
        }}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Summary Pills */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_OPTIONS.map(s => {
          const count = reservations.filter(r => r.status === s).length;
          return (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(prev => prev === s ? '' : s)}
            >
              {s.replace(/_/g, ' ')} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
        <button className="btn btn-ghost btn-sm" onClick={() => setStatusFilter('')}>Show All ({reservations.length})</button>
        <button
          id="add-reservation-btn"
          className="btn btn-primary btn-sm ml-auto"
          onClick={() => setModal({ type: 'add' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={14} /> New Reservation
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon"><Search size={15} /></span>
              <input className="search-input" placeholder="Search guest name, email or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} style={{ color: 'var(--gold-400)' }} /> Reservation List
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} results</span>
        </div>
        {loading ? (
          <LoadingScreen text="Loading reservations..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Calendar size={36} style={{ color: 'var(--text-muted)' }} /></div>
            <div className="empty-state-title">No reservations found</div>
            <div className="empty-state-desc">Try changing filters or create a new reservation.</div>
            <button className="btn btn-primary mt-4" onClick={() => setModal({ type: 'add' })}>+ New Reservation</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.guestName || r.userName || 'Guest'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.guestEmail || r.userEmail || '—'}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'var(--dark-700)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                        {r.roomNumber ? `Room ${r.roomNumber}` : r.hallName ? r.hallName : `#${r.roomId}`}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: 10 }}>{r.roomType || r.reservationType?.replace('_', ' ') || 'ROOM'}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.checkInDate || r.checkIn}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.checkOutDate || r.checkOut}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>
                      {r.totalAmount > 0 ? `LKR ${Number(r.totalAmount).toLocaleString()}` : '—'}
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-muted'}`}>{r.status?.replace('_', ' ')}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'edit', reservation: r })} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Edit3 size={12} /> Edit
                        </button>
                        {(r.status === 'CONFIRMED' || r.status === 'CHECKED_IN' || r.status === 'CHECKED_OUT' || r.status === 'PAID') && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadReceipt(r)} title="Download Receipt" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Printer size={12} /> Receipt
                          </button>
                        )}
                        {r.status !== 'CANCELLED' && r.status !== 'CHECKED_OUT' && (
                          <button className="btn btn-warning btn-sm" onClick={() => handleCancel(r)} title="Cancel Reservation" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={12} /> Cancel
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r)}
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Permanently Delete Reservation"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <ReservationModal reservation={modal.reservation} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </>
  );
}

export default Reservations;
