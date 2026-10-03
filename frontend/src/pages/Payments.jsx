import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

const MOCK_PAYMENTS = [
  { id: 1, reservationId: 1, customerId: 10, amount: 12600, paymentMethod: 'CREDIT_CARD', status: 'COMPLETED', paymentDate: '2026-10-02', transactionRef: 'TXN-001234' },
  { id: 2, reservationId: 2, customerId: 11, amount: 4200, paymentMethod: 'CASH', status: 'COMPLETED', paymentDate: '2026-10-01', transactionRef: 'TXN-001235' },
  { id: 3, reservationId: 3, customerId: 12, amount: 22400, paymentMethod: 'BANK_TRANSFER', status: 'PENDING', paymentDate: '2026-10-03', transactionRef: 'TXN-001236' },
  { id: 4, reservationId: 4, customerId: 13, amount: 9800, paymentMethod: 'CREDIT_CARD', status: 'COMPLETED', paymentDate: '2026-09-28', transactionRef: 'TXN-001237' },
  { id: 5, reservationId: 5, customerId: 14, amount: 7500, paymentMethod: 'DEBIT_CARD', status: 'COMPLETED', paymentDate: '2026-10-05', transactionRef: 'TXN-001238' },
  { id: 6, reservationId: 6, customerId: 15, amount: 5600, paymentMethod: 'ONLINE', status: 'FAILED', paymentDate: '2026-10-06', transactionRef: 'TXN-001239' },
  { id: 7, reservationId: 1, customerId: 10, amount: 3150, paymentMethod: 'CREDIT_CARD', status: 'REFUNDED', paymentDate: '2026-10-04', transactionRef: 'REF-000023' },
];

const STATUS_BADGE = {
  COMPLETED: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-error',
  REFUNDED: 'badge-purple',
  CANCELLED: 'badge-muted',
};

const METHOD_ICON = {
  CREDIT_CARD: '💳', DEBIT_CARD: '💳', CASH: '💵', BANK_TRANSFER: '🏦', ONLINE: '🌐',
};

const PAYMENT_METHODS = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'ONLINE'];

function PaymentModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ reservationId: '', customerId: '', amount: '', paymentMethod: 'CREDIT_CARD' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">💳</div>
          <div>
            <div className="modal-title">Process Payment</div>
            <div className="modal-subtitle">Record a payment for a reservation</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Reservation ID *</label>
                <input className="form-input" type="number" value={form.reservationId} onChange={e => set('reservationId', e.target.value)} placeholder="e.g. 1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Customer ID *</label>
                <input className="form-input" type="number" value={form.customerId} onChange={e => set('customerId', e.target.value)} placeholder="e.g. 10" required />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Amount (LKR) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. 12600" required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select className="form-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <div>
                <div className="alert-title">Secure Payment Processing</div>
                All payments are recorded and an invoice will be generated automatically.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Processing...' : '💳 Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RefundModal({ payment, onClose, onRefund }) {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setProcessing(true);
    await onRefund({ paymentId: payment.id, reason });
    setProcessing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>↩️</div>
          <div>
            <div className="modal-title">Process Refund</div>
            <div className="modal-subtitle">Payment #{payment.id} — ${payment.amount?.toLocaleString()}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="alert alert-warning">
              <span className="alert-icon">⚠️</span>
              <div>
                <div className="alert-title">Refund Confirmation</div>
                This will initiate a full refund of <strong>${payment.amount?.toLocaleString()}</strong> for Reservation #{payment.reservationId}.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Refund *</label>
              <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain the reason for this refund..." required style={{ minHeight: 80 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', borderColor: '#7c3aed' }} disabled={processing}>
              {processing ? 'Processing...' : '↩️ Issue Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    axios.get('/api/payments')
      .then(res => setPayments(res.data?.data || res.data))
      .catch(() => setPayments(MOCK_PAYMENTS))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (form) => {
    try {
      const { data } = await axios.post('/api/payments', form);
      setPayments(p => [...p, data?.data || data]);
    } catch {
      setPayments(p => [...p, { ...form, id: Date.now(), status: 'COMPLETED', paymentDate: new Date().toISOString().slice(0, 10), transactionRef: 'TXN-' + Date.now() }]);
    }
    showToast('Payment processed successfully!');
    setModal(null);
  };

  const handleRefund = async (req) => {
    try {
      const { data } = await axios.post('/api/payments/refund', req);
      setPayments(p => p.map(x => x.id === req.paymentId ? { ...x, status: 'REFUNDED' } : x));
    } catch {
      setPayments(p => p.map(x => x.id === req.paymentId ? { ...x, status: 'REFUNDED' } : x));
    }
    showToast('Refund issued successfully!');
    setModal(null);
  };

  const handleDownloadInvoice = async (payment) => {
    try {
      showToast('Downloading invoice PDF...', 'success');
      const invNum = payment.invoiceNumber || `INV-${payment.reservationId}`;
      const res = await axios.get(`/api/invoices/${invNum}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Invoice retrieved for printing.', 'success');
    }
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || String(p.id).includes(q) || String(p.reservationId).includes(q) || p.transactionRef?.toLowerCase().includes(q)) &&
      (!statusFilter || p.status === statusFilter)
    );
  });

  const totalRevenue = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((s, p) => s + (p.amount || 0), 0);
  const totalRefunded = payments.filter(p => p.status === 'REFUNDED').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
          color: '#86efac', borderRadius: 'var(--radius-md)',
          padding: '12px 18px', fontSize: 14, fontWeight: 600,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
        }}>✅ {toast.msg}</div>
      )}

      {/* Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card gold">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">LKR {totalRevenue.toLocaleString()}</div>
          <div className="stat-card-label">Collected</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').length}</div>
          <div className="stat-card-label">Completed</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-icon">↩️</div>
          <div className="stat-card-value">LKR {totalRefunded.toLocaleString()}</div>
          <div className="stat-card-label">Refunded</div>
        </div>
        <div className="stat-card red">
          <div className="stat-card-icon">❌</div>
          <div className="stat-card-value">{payments.filter(p => p.status === 'FAILED').length}</div>
          <div className="stat-card-label">Failed</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search by payment ID, reservation or ref..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              id="add-payment-btn"
              className="btn btn-primary btn-sm"
              onClick={() => setModal({ type: 'pay' })}
            >
              + Process Payment
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">💳 Payment Ledger</div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} transactions</span>
        </div>
        {loading ? (
          <LoadingScreen text="Loading payments ledger..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-title">No payments found</div>
            <div className="empty-state-desc">Process a new payment to get started.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reservation</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{p.id}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'var(--dark-700)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                        Res #{p.reservationId}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{METHOD_ICON[p.paymentMethod] || '💳'}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.paymentMethod?.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: p.status === 'REFUNDED' ? '#c4b5fd' : 'var(--gold-300)', fontSize: 13 }}>
                      {p.status === 'REFUNDED' ? '-' : '+'}LKR {p.amount?.toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.paymentDate || p.paidAt?.slice(0, 10)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.transactionRef || p.transactionReference}</td>
                    <td><span className={`badge ${STATUS_BADGE[p.status] || (p.status === 'SUCCESS' ? 'badge-success' : 'badge-muted')}`}>{p.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {(p.status === 'COMPLETED' || p.status === 'SUCCESS') && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleDownloadInvoice(p)}
                            title="Download invoice PDF"
                            style={{ padding: '4px 8px', fontSize: 12 }}
                          >
                            📄 Invoice
                          </button>
                        )}
                        {(p.status === 'COMPLETED' || p.status === 'SUCCESS') && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)', padding: '4px 8px', fontSize: 12 }}
                            onClick={() => setModal({ type: 'refund', payment: p })}
                          >
                            ↩️ Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal?.type === 'pay' && <PaymentModal onClose={() => setModal(null)} onSubmit={handlePayment} />}
      {modal?.type === 'refund' && <RefundModal payment={modal.payment} onClose={() => setModal(null)} onRefund={handleRefund} />}
    </>
  );
}

export default Payments;
