import { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_HALLS = [
  { id: 1, name: 'Grand Ballroom', capacity: 500, pricePerDay: 150000, status: 'AVAILABLE', amenities: 'Projector, PA System, Stage, Dance Floor' },
  { id: 2, name: 'Crystal Banquet', capacity: 300, pricePerDay: 95000, status: 'AVAILABLE', amenities: 'Projector, PA System, Stage' },
  { id: 3, name: 'Orchid Meeting Room', capacity: 50, pricePerDay: 25000, status: 'AVAILABLE', amenities: 'Projector, Whiteboard, Video Conferencing' },
  { id: 4, name: 'Lotus Conference Hall', capacity: 100, pricePerDay: 45000, status: 'MAINTENANCE', amenities: 'Projector, PA System, Whiteboard' },
];

const MOCK_PACKAGES = [
  { id: 1, name: 'Platinum Wedding Package', description: 'Full catering, decoration, photography, and complimentary bridal suite.', price: 500000 },
  { id: 2, name: 'Corporate Seminar Package', description: 'Lunch buffet, morning/evening tea, notepads, and basic AV setup.', price: 150000 },
];

const STATUS_BADGE = {
  AVAILABLE: 'badge-success',
  OCCUPIED: 'badge-error',
  MAINTENANCE: 'badge-warning',
};

function EventHalls() {
  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('halls'); // 'halls' or 'packages'
  
  const [modal, setModal] = useState(null); // null | { type: 'hall'|'package', item?: any }
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    // Fetch halls and packages
    Promise.all([
      axios.get('/api/event-halls').catch(() => ({ data: MOCK_HALLS })),
      axios.get('/api/packages').catch(() => ({ data: MOCK_PACKAGES }))
    ]).then(([resHalls, resPkgs]) => {
      setHalls(resHalls.data || MOCK_HALLS);
      setPackages(resPkgs.data || MOCK_PACKAGES);
      setLoading(false);
    });
  }, []);

  const handleSaveHall = async (form) => {
    try {
      if (modal.item) {
        setHalls(h => h.map(x => x.id === modal.item.id ? { ...x, ...form } : x));
      } else {
        setHalls(h => [...h, { ...form, id: Date.now() }]);
      }
    } catch {/* */}
    showToast(modal.item ? 'Hall updated!' : 'Hall added!');
    setModal(null);
  };

  const handleSavePackage = async (form) => {
    try {
      if (modal.item) {
        setPackages(p => p.map(x => x.id === modal.item.id ? { ...x, ...form } : x));
      } else {
        setPackages(p => [...p, { ...form, id: Date.now() }]);
      }
    } catch {/* */}
    showToast(modal.item ? 'Package updated!' : 'Package added!');
    setModal(null);
  };

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
          color: '#86efac', borderRadius: 'var(--radius-md)',
          padding: '12px 18px', fontSize: 14, fontWeight: 600,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
        }}>✅ {toast}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button className={`btn ${activeTab === 'halls' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('halls')}>
          🎭 Event Halls
        </button>
        <button className={`btn ${activeTab === 'packages' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('packages')}>
          🎁 Event Packages
        </button>
      </div>

      {activeTab === 'halls' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div className="card-title">🎭 Event Halls Management</div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'hall' })}>+ Add Hall</button>
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Capacity</th>
                    <th>Price / Day</th>
                    <th>Status</th>
                    <th>Amenities</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{h.name}</td>
                      <td>{h.capacity} guests</td>
                      <td style={{ color: 'var(--gold-300)', fontWeight: 600 }}>LKR {h.pricePerDay?.toLocaleString()}</td>
                      <td><span className={`badge ${STATUS_BADGE[h.status] || 'badge-muted'}`}>{h.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.amenities}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'hall', item: h })}>✏️ Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div className="card-title">🎁 Event Packages</div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'package' })}>+ Add Package</button>
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Package Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.description}</td>
                      <td style={{ color: 'var(--gold-300)', fontWeight: 600 }}>LKR {p.price?.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'package', item: p })}>✏️ Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal?.type === 'hall' && <HallModal hall={modal.item} onClose={() => setModal(null)} onSave={handleSaveHall} />}
      {modal?.type === 'package' && <PackageModal pkg={modal.item} onClose={() => setModal(null)} onSave={handleSavePackage} />}
    </>
  );
}

function HallModal({ hall, onClose, onSave }) {
  const [form, setForm] = useState(hall || { name: '', capacity: 100, pricePerDay: 50000, status: 'AVAILABLE', amenities: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">🎭</div>
          <div><div className="modal-title">{hall ? 'Edit Hall' : 'Add Hall'}</div></div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Hall Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input className="form-input" type="number" value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price / Day (LKR) *</label>
                <input className="form-input" type="number" value={form.pricePerDay} onChange={e => set('pricePerDay', Number(e.target.value))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amenities</label>
              <input className="form-input" value={form.amenities} onChange={e => set('amenities', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Hall</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PackageModal({ pkg, onClose, onSave }) {
  const [form, setForm] = useState(pkg || { name: '', description: '', price: 100000 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">🎁</div>
          <div><div className="modal-title">{pkg ? 'Edit Package' : 'Add Package'}</div></div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Package Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (LKR) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Package</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventHalls;
