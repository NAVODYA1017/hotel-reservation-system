import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { 
  User, Trash2, Edit3, Search, AlertTriangle, CheckCircle2, 
  Info, Shield, UserPlus, Users as UsersIcon
} from 'lucide-react';

const ROLES = [
  { value: 'SYSTEM_ADMIN', label: 'System Admin', badge: 'badge-error' },
  { value: 'HOTEL_MANAGER', label: 'Hotel Manager', badge: 'badge-gold' },
  { value: 'EVENT_COORDINATOR', label: 'Event Coordinator', badge: 'badge-purple' },
  { value: 'RECEPTIONIST', label: 'Receptionist', badge: 'badge-info' },
  { value: 'FINANCE_EXECUTIVE', label: 'Finance Executive', badge: 'badge-success' },
  { value: 'CUSTOMER', label: 'Customer / Guest', badge: 'badge-muted' },
];

const BLANK_FORM = { name: '', email: '', password: '', role: 'RECEPTIONIST' };

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(
    user ? { name: user.name, email: user.email, password: '', role: user.role } : BLANK_FORM
  );
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      await onSave(form);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action could not be completed.';
      setModalError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <div>
            <div className="modal-title">{user ? 'Edit Account' : 'Add New User'}</div>
            <div className="modal-subtitle">
              {user ? `Editing ${user.name} (${user.role})` : 'Create a staff or customer account'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {modalError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                <AlertTriangle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Kasun Fernando"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="e.g. kasun@aliyaresort.lk"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{user ? 'New Password (Optional)' : 'Password *'}</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={user ? 'Leave empty to preserve existing' : 'Minimum 8 characters'}
                  required={!user}
                  minLength={user ? 0 : 8}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Role *</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={e => set('role', e.target.value)}
                  required
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              padding: '12px 16px',
              background: 'rgba(201,160,48,0.06)',
              border: '1px solid var(--border-gold, #c5a059)',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8
            }}>
              <Info size={15} color="var(--gold-400)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Role permissions determine access privileges across the system. System Admin privileges can only be granted by existing System Admins.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</>
              ) : (
                user ? 'Save Changes' : '+ Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handle = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await onConfirm();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cannot delete account.';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon" style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5'
          }}>
            <Trash2 size={18} />
          </div>
          <div>
            <div className="modal-title">Delete User Account</div>
            <div className="modal-subtitle">Review before confirming deletion</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {deleteError ? (
            <div className="alert alert-error" style={{ marginBottom: 12 }}>
              <AlertTriangle size={16} />
              <div>
                <strong>Deletion Prevented (Extension 10a):</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>{deleteError}</p>
              </div>
            </div>
          ) : (
            <div className="alert alert-error">
              <AlertTriangle size={16} />
              <div>
                <div className="alert-title">Are you sure?</div>
                You are about to delete <strong>{user?.name}</strong> ({user?.email}).
                {user?.reservationCount > 0 && (
                  <p style={{ margin: '6px 0 0', color: '#fca5a5', fontWeight: 600 }}>
                    Notice: This user has {user.reservationCount} associated reservation(s). Accounts with booking history cannot be deleted.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {!deleteError && (
            <button
              className="btn btn-danger"
              onClick={handle}
              disabled={deleting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          )}
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

  const token = localStorage.getItem('token') || 'admin-session-token';
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/admin/users', { headers })
      .then(res => {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        }
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Failed to load user list.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (form) => {
    if (modal.user) {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        ...(form.password ? { password: form.password } : {})
      };
      const { data } = await axios.put(`/api/admin/users/${modal.user.id}`, payload, { headers });
      setUsers(u => u.map(x => x.id === modal.user.id ? data : x));
      showToast(`User ${data.name} updated successfully!`);
    } else {
      const { data } = await axios.post('/api/admin/users', form, { headers });
      setUsers(u => [...u, data]);
      showToast(`User ${data.name} created successfully!`);
    }
    setModal(null);
  };

  const handleDeleteConfirm = async () => {
    const id = modal.user.id;
    await axios.delete(`/api/admin/users/${id}`, { headers });
    setUsers(u => u.filter(x => x.id !== id));
    showToast(`User ${modal.user.name} removed successfully.`);
    setModal(null);
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${user.id}/role`, { role: newRole }, { headers });
      setUsers(u => u.map(x => x.id === user.id ? data : x));
      showToast(`Role updated to ${newRole.replace(/_/g, ' ')}`);
    } catch (err) {
      // Extension 10a: Unauthorized account operation
      const msg = err.response?.data?.message || 'Unauthorized role update.';
      showToast(`Role update blocked: ${msg}`, 'error');
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    let matchesRole = true;
    if (roleFilter === 'STAFF') {
      matchesRole = u.role !== 'CUSTOMER';
    } else if (roleFilter === 'CUSTOMER') {
      matchesRole = u.role === 'CUSTOMER';
    } else if (roleFilter) {
      matchesRole = u.role === roleFilter;
    }
    return matchesSearch && matchesRole;
  });

  const staffCount = users.filter(u => u.role !== 'CUSTOMER').length;
  const customerCount = users.filter(u => u.role === 'CUSTOMER').length;

  if (loading && users.length === 0) {
    return <LoadingScreen text="Loading user directory..." />;
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '12px 18px',
          fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.5))',
          backdropFilter: 'blur(8px)',
        }}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
        <div className="flex items-center gap-3">
          <span className="badge badge-gold">{users.length} Total Accounts</span>
          <span className="badge badge-purple">{staffCount} Staff</span>
          <span className="badge badge-info">{customerCount} Guests</span>
        </div>
        <button
          id="add-user-btn"
          className="btn btn-primary"
          onClick={() => setModal({ type: 'add' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <UserPlus size={15} /> Add User Account
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <Search size={15} />
              </span>
              <input
                className="search-input"
                placeholder="Search by user name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: 8 }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="form-label" style={{ margin: 0, fontSize: 13 }}>Filter:</label>
              <select
                className="form-select"
                style={{ width: 190 }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">All Accounts ({users.length})</option>
                <option value="STAFF">Staff Only ({staffCount})</option>
                <option value="CUSTOMER">Customers Only ({customerCount})</option>
                <optgroup label="By Role">
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({users.filter(u => u.role === r.value).length})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">User Account Directory</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {users.length} registered users
          </span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Classification</th>
                <th>Bookings</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const roleObj = ROLES.find(r => r.value === u.role) || { badge: 'badge-muted', label: u.role };
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={u.role}
                          onChange={e => handleRoleChange(u, e.target.value)}
                          style={{
                            padding: '4px 8px', fontSize: 12, height: 28,
                            borderColor: 'var(--border-subtle)', background: 'var(--card-bg)'
                          }}
                        >
                          {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${roleObj.badge}`}>
                          {u.staff ? 'Staff' : 'Guest'}
                        </span>
                      </td>
                      <td>
                        {u.reservationCount > 0 ? (
                          <span className="badge badge-gold" style={{ fontSize: 11 }}>
                            {u.reservationCount} Bookings
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>0</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {u.createdAt ? u.createdAt.slice(0, 10) : 'Active'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => setModal({ type: 'edit', user: u })}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => setModal({ type: 'delete', user: u })}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'add' && (
        <UserModal onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'edit' && (
        <UserModal user={modal.user} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleDeleteConfirm} />
      )}
    </>
  );
}

export default Users;
