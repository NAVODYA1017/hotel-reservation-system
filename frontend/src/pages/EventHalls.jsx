import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_BADGE = {
  AVAILABLE: 'badge-success',
  UNAVAILABLE: 'badge-error',
  MAINTENANCE: 'badge-warning',
};

function EventHalls() {
  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('halls'); // 'halls' or 'packages'
  const [search, setSearch] = useState('');
  
  // Modals
  const [modal, setModal] = useState(null); // { type: 'hall'|'package', item?: any }
  const [deleteModal, setDeleteModal] = useState(null); // { type: 'hall'|'package', item: any }
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resHalls, resPkgs] = await Promise.all([
        axios.get('/api/event-halls'),
        axios.get('/api/packages')
      ]);
      setHalls(Array.isArray(resHalls.data) ? resHalls.data : []);
      setPackages(Array.isArray(resPkgs.data) ? resPkgs.data : []);
    } catch (err) {
      console.error('Error fetching event data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // EVENT HALL HANDLERS (UC-03 Steps 5, 6, 7, 8, Ext 7a, 7b)
  // ─────────────────────────────────────────────────────────────
  const handleSaveHall = async (form) => {
    const payload = {
      name: form.name?.trim(),
      pricePerEvent: Number(form.pricePerDay || form.pricePerEvent),
      seatingCapacity: Number(form.capacity || form.seatingCapacity),
      available: form.status === 'AVAILABLE' || form.available === true,
      description: form.amenities || form.description,
    };

    try {
      if (modal.item) {
        await axios.put(`/api/event-halls/${modal.item.id}`, payload);
        showToast(`Event Hall '${payload.name}' updated successfully in MySQL!`);
      } else {
        await axios.post('/api/event-halls', payload);
        showToast(`Event Hall '${payload.name}' created successfully in MySQL!`);
      }
      fetchData();
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showToast(msg, 'error');
    }
  };

  const handleToggleAvailability = async (hall) => {
    const newStatus = !hall.available;
    try {
      await axios.patch(`/api/event-halls/${hall.id}/availability`, { available: newStatus });
      showToast(`Hall '${hall.name}' availability changed to ${newStatus ? 'AVAILABLE' : 'UNAVAILABLE'}.`);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot update availability: Hall has active reservations.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteHall = async () => {
    if (!deleteModal?.item) return;
    const { id, name } = deleteModal.item;
    try {
      await axios.delete(`/api/event-halls/${id}`);
      showToast(`Event Hall '${name}' permanently deleted from MySQL!`);
      fetchData();
      setDeleteModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete hall: Linked to reservations.';
      showToast(msg, 'error');
      setDeleteModal(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PACKAGE HANDLERS (UC-03 Steps 9, 10, 11, Ext 10a, 11a)
  // ─────────────────────────────────────────────────────────────
  const handleSavePackage = async (form) => {
    const payload = {
      name: form.name?.trim(),
      description: form.description?.trim(),
      price: Number(form.price),
      servicesIncluded: form.servicesIncluded?.trim() || form.services?.trim() || '',
    };

    try {
      if (modal.item) {
        await axios.put(`/api/packages/${modal.item.id}`, payload);
        showToast(`Package '${payload.name}' updated successfully in MySQL!`);
      } else {
        await axios.post('/api/packages', payload);
        showToast(`Package '${payload.name}' created successfully in MySQL!`);
      }
      fetchData();
      setModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showToast(msg, 'error');
    }
  };

  const handleDeletePackage = async () => {
    if (!deleteModal?.item) return;
    const { id, name } = deleteModal.item;
    try {
      await axios.delete(`/api/packages/${id}`);
      showToast(`Package '${name}' permanently deleted from MySQL!`);
      fetchData();
      setDeleteModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete package: Linked to reservations.';
      showToast(msg, 'error');
      setDeleteModal(null);
    }
  };

  // Filtered lists
  const filteredHalls = halls.filter(h =>
    !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPackages = packages.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()) || p.servicesIncluded?.toLowerCase().includes(search.toLowerCase())
  );

  const availableHallsCount = halls.filter(h => h.available || h.status === 'AVAILABLE').length;

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
          animation: 'slideUp 0.3s ease', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card gold">
          <div className="stat-card-icon">🎭</div>
          <div className="stat-card-value">{halls.length}</div>
          <div className="stat-card-label">Total Event Halls</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{availableHallsCount}</div>
          <div className="stat-card-label">Available for Booking</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-card-icon">🎁</div>
          <div className="stat-card-value">{packages.length}</div>
          <div className="stat-card-label">Custom Packages</div>
        </div>
        <div className="stat-card red">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">
            {halls.reduce((sum, h) => sum + (h.seatingCapacity || h.capacity || 0), 0).toLocaleString()}
          </div>
          <div className="stat-card-label">Max Total Guests</div>
        </div>
      </div>

      {/* Navigation Tabs and Controls */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div className="flex gap-3">
            <button
              className={`btn ${activeTab === 'halls' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('halls'); setSearch(''); }}
            >
              🎭 Event Halls ({halls.length})
            </button>
            <button
              className={`btn ${activeTab === 'packages' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('packages'); setSearch(''); }}
            >
              🎁 Event Packages ({packages.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-wrapper" style={{ width: 240 }}>
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder={activeTab === 'halls' ? "Search halls..." : "Search packages..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {activeTab === 'halls' ? (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'hall' })}>
                + Add Event Hall
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'package' })}>
                + Add Package
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: EVENT HALLS */}
      {activeTab === 'halls' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div className="card-title">🎭 Event Halls Directory</div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {filteredHalls.length} halls</span>
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /> Loading event halls from MySQL...</div>
          ) : filteredHalls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎭</div>
              <div className="empty-state-title">No event halls found</div>
              <div className="empty-state-desc">Get started by creating your first grand venue.</div>
              <button className="btn btn-primary mt-4" onClick={() => setModal({ type: 'hall' })}>+ Add Hall</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hall Name</th>
                    <th>Capacity</th>
                    <th>Rate / Event</th>
                    <th>Availability</th>
                    <th>Features & Amenities</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHalls.map(h => {
                    const isAvail = h.available || h.status === 'AVAILABLE';
                    const price = h.pricePerEvent || h.pricePerDay || 0;
                    const capacity = h.seatingCapacity || h.capacity || 0;
                    return (
                      <tr key={h.id}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{h.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{h.name}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{capacity}</span> guests
                        </td>
                        <td style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: 14 }}>
                          LKR {Number(price).toLocaleString()}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleAvailability(h)}
                            className={`badge ${isAvail ? 'badge-success' : 'badge-error'}`}
                            style={{ cursor: 'pointer', border: 'none', padding: '4px 10px' }}
                            title="Click to toggle availability"
                          >
                            {isAvail ? '✓ Available' : '✕ Unavailable'}
                          </button>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280 }}>
                          {h.description || h.amenities || 'Standard hall facilities'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-2 justify-end">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setModal({ type: 'hall', item: h })}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteModal({ type: 'hall', item: h })}
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px' }}
                              title="Delete Hall"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div className="card-title">🎁 Customizable Event Packages</div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {filteredPackages.length} packages</span>
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /> Loading packages from MySQL...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎁</div>
              <div className="empty-state-title">No packages found</div>
              <div className="empty-state-desc">Configure bundle services for weddings, conferences & galas.</div>
              <button className="btn btn-primary mt-4" onClick={() => setModal({ type: 'package' })}>+ Add Package</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Package Name</th>
                    <th>Description</th>
                    <th>Services Included</th>
                    <th>Package Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{p.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{p.name}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 260 }}>
                        {p.description || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(p.servicesIncluded ? p.servicesIncluded.split(',').map(s => s.trim()).filter(Boolean) : ['Standard Services']).map(s => (
                            <span key={s} className="badge badge-purple" style={{ fontSize: 11 }}>{s}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: 15 }}>
                        LKR {Number(p.price || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setModal({ type: 'package', item: p })}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteModal({ type: 'package', item: p })}
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px' }}
                            title="Delete Package"
                          >
                            🗑️
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
      )}

      {/* Hall Add/Edit Modal */}
      {modal?.type === 'hall' && (
        <HallModal
          hall={modal.item}
          onClose={() => setModal(null)}
          onSave={handleSaveHall}
        />
      )}

      {/* Package Add/Edit Modal */}
      {modal?.type === 'package' && (
        <PackageModal
          pkg={modal.item}
          onClose={() => setModal(null)}
          onSave={handleSavePackage}
        />
      )}

      {/* Delete Confirmation Modal (Open Issue 1) */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>🗑️</div>
              <div>
                <div className="modal-title">Delete {deleteModal.type === 'hall' ? 'Event Hall' : 'Package'}</div>
                <div className="modal-subtitle">{deleteModal.item.name}</div>
              </div>
              <button className="modal-close" onClick={() => setDeleteModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <div>
                  <div className="alert-title">Confirm Permanent Deletion</div>
                  Are you sure you want to delete <strong>{deleteModal.item.name}</strong> from MySQL?
                  {deleteModal.type === 'hall' && <div style={{ marginTop: 6, fontSize: 12 }}>Note: Halls linked to active reservations cannot be deleted.</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={deleteModal.type === 'hall' ? handleDeleteHall : handleDeletePackage}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HallModal({ hall, onClose, onSave }) {
  const [form, setForm] = useState(hall ? {
    name: hall.name,
    capacity: hall.seatingCapacity || hall.capacity || 100,
    pricePerDay: hall.pricePerEvent || hall.pricePerDay || 50000,
    status: (hall.available ?? true) ? 'AVAILABLE' : 'UNAVAILABLE',
    amenities: hall.description || hall.amenities || '',
  } : { name: '', capacity: 100, pricePerDay: 50000, status: 'AVAILABLE', amenities: 'PA System, Projector, Stage, Lighting' });

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
          <div className="modal-header-icon">🎭</div>
          <div>
            <div className="modal-title">{hall ? `Edit Hall: ${hall.name}` : 'Add New Event Hall'}</div>
            <div className="modal-subtitle">UC-03 Event Hall Configuration</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Hall Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Grand Sapphire Ballroom" required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Guest Seating Capacity *</label>
                <input className="form-input" type="number" min="1" value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Rate per Event (LKR) *</label>
                <input className="form-input" type="number" min="1" step="1000" value={form.pricePerDay} onChange={e => set('pricePerDay', Number(e.target.value))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="AVAILABLE">AVAILABLE (Open for bookings)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Maintenance/Closed)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Features & Amenities</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={form.amenities}
                onChange={e => set('amenities', e.target.value)}
                placeholder="e.g. 4K LED Screen, State-of-the-art Sound, Bridal Suite, Stage"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving to MySQL...' : (hall ? 'Update Hall' : 'Save Hall')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PackageModal({ pkg, onClose, onSave }) {
  const [form, setForm] = useState(pkg ? {
    name: pkg.name,
    description: pkg.description || '',
    price: pkg.price || 100000,
    servicesIncluded: pkg.servicesIncluded || '',
  } : {
    name: '',
    description: '',
    price: 150000,
    servicesIncluded: '5-Course Buffet Catering, Floral Decoration, Photography, DJ Setup',
  });

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
          <div className="modal-header-icon">🎁</div>
          <div>
            <div className="modal-title">{pkg ? `Edit Package: ${pkg.name}` : 'Create Event Package'}</div>
            <div className="modal-subtitle">UC-03 Custom Services & Catering Bundle</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Package Name * (Extension 11a check)</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Royal Wedding Package" required />
            </div>
            <div className="form-group">
              <label className="form-label">Package Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Comprehensive service bundle for wedding receptions..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Package Price (LKR) * (Extension 10a check)</label>
              <input className="form-input" type="number" min="1" step="5000" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Services Included * (comma separated)</label>
              <input
                className="form-input"
                value={form.servicesIncluded}
                onChange={e => set('servicesIncluded', e.target.value)}
                placeholder="Catering, Decor, Sound System, Chauffeur"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving to MySQL...' : (pkg ? 'Update Package' : 'Save Package')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventHalls;
