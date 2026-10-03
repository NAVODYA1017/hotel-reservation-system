import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

const ROLES = ['SYSTEM_ADMIN', 'HOTEL_MANAGER', 'RECEPTIONIST', 'FINANCE_EXECUTIVE', 'HOUSEKEEPING'];

const ROLE_BADGE = {
  SYSTEM_ADMIN: 'badge-error',
  HOTEL_MANAGER: 'badge-gold',
  RECEPTIONIST: 'badge-info',
  FINANCE_EXECUTIVE: 'badge-success',
  HOUSEKEEPING: 'badge-purple',
};

const MOCK_USERS = [
  { id: 1, name: 'Kamal Perera', email: 'kamal@hotel.com', role: 'SYSTEM_ADMIN', active: true },
  { id: 2, name: 'Amara Silva', email: 'amara@hotel.com', role: 'HOTEL_MANAGER', active: true },
  { id: 3, name: 'Rajiv Mendis', email: 'rajiv@hotel.com', role: 'RECEPTIONIST', active: true },
  { id: 4, name: 'Priya Fernando', email: 'priya@hotel.com', role: 'FINANCE_EXECUTIVE', active: true },
  { id: 5, name: 'David Wijerama', email: 'david@hotel.com', role: 'HOUSEKEEPING', active: false },
  { id: 6, name: 'Nadia Peris', email: 'nadia@hotel.com', role: 'RECEPTIONIST', active: true },
];

const BLANK_FORM = { name: '', email: '', password: '', role: 'RECEPTIONIST' };

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user ? { name: user.name, email: user.email, password: '', role: user.role } : BLANK_FORM);
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
          <div className="modal-header-icon">👤</div>
          <div>
            <div className="modal-title">{user ? 'Edit User' : 'Add New User'}</div>
            <div className="modal-subtitle">{user ? `Editing ${user.name}` : 'Create a new staff account'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@hotel.com" required />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{user ? 'New Password' : 'Password *'}</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={user ? 'Leave blank to keep current' : 'Min 8 characters'}
                  required={!user}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <div style={{
              padding: '12px 16px',
              background: 'rgba(201,160,48,0.06)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              💡 Role defines what features this user can access in the system.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : (user ? '✓ Update User' : '+ Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handle = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>🗑️</div>
          <div>
            <div className="modal-title">Delete User</div>
            <div className="modal-subtitle">This action cannot be undone</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <div>
              <div className="alert-title">Are you sure?</div>
              You are about to permanently delete <strong>{user?.name}</strong>. This will remove their account and all associated access.
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handle} disabled={deleting}>
            {deleting ? 'Deleting...' : '🗑️ Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(null); // null | { type: 'add' | 'edit' | 'delete', user? }
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/admin/users', { headers })
      .then(res => setUsers(res.data))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (form) => {
    try {
      if (modal.user) {
        const { data } = await axios.put(`/api/admin/users/${modal.user.id}`, form, { headers });
        setUsers(u => u.map(x => x.id === modal.user.id ? data : x));
      } else {
        const { data } = await axios.post('/api/admin/users', form, { headers });
        setUsers(u => [...u, data]);
      }
      showToast(modal.user ? 'User updated successfully!' : 'User created successfully!');
    } catch {
      // Mock success for demo
      if (modal.user) {
        setUsers(u => u.map(x => x.id === modal.user.id ? { ...x, ...form } : x));
      } else {
        setUsers(u => [...u, { ...form, id: Date.now(), active: true }]);
      }
      showToast(modal.user ? 'User updated!' : 'User created!');
    }
    setModal(null);
  };

  const handleDelete = async () => {
    const id = modal.user.id;
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers });
    } catch {/* mock */}
    setUsers(u => u.filter(x => x.id !== id));
    showToast('User deleted.', 'error');
    setModal(null);
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${user.id}/role`, { role: newRole }, { headers });
      setUsers(u => u.map(x => x.id === user.id ? data : x));
    } catch {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, role: newRole } : x));
    }
    showToast(`Role updated to ${newRole.replace(/_/g, ' ')}`);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) &&
      (!roleFilter || u.role === roleFilter)
    );
  });

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          fontSize: 14, fontWeight: 600,
          animation: 'slideUp 0.3s ease',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {toast.type === 'error' ? '🗑️' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center" style={{ marginBottom: -8 }}>
        <div>
          <span className="badge badge-gold">{users.length} Staff Members</span>
        </div>
        <button id="add-user-btn" className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          + Add User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 200 }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setRoleFilter(''); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 Staff Directory</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} of {users.length}</span>
        </div>
        {loading ? (
          <LoadingScreen text="Loading staff directory..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-title">No users found</div>
            <div className="empty-state-desc">Try adjusting your search or filter criteria.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {u.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ fontWeight: 600 }}>{u.name || '—'}</div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 180, padding: '5px 10px', fontSize: 12 }}
                        value={u.role}
                        onChange={e => handleRoleChange(u, e.target.value)}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.active !== false ? 'badge-success' : 'badge-muted'}`}>
                        {u.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setModal({ type: 'edit', user: u })}
                          title="Edit user"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setModal({ type: 'delete', user: u })}
                          title="Delete user"
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

      {/* Modals */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <UserModal user={modal.user} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleDelete} />
      )}
    </>
  );
}

export default Users;
