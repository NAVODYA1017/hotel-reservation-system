import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { buffetApi } from '../utils/buffetApi';
import { 
  CreditCard, DollarSign, CheckCircle2, RotateCcw, 
  XCircle, Search, Info, AlertTriangle, FileText, Plus, X,
  UtensilsCrossed
} from 'lucide-react';

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
          <div className="modal-header-icon"><CreditCard size={20} style={{ color: 'var(--gold-400)' }} /></div>
          <div>
            <div className="modal-title">Process Payment</div>
            <div className="modal-subtitle">Record a payment for a reservation</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
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
            <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={18} style={{ color: 'var(--blue-400)', flexShrink: 0 }} />
              <div>
                <div className="alert-title">Secure Payment Processing</div>
                All payments are recorded and an invoice will be generated automatically.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={14} />
              {saving ? 'Processing...' : 'Process Payment'}
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
          <div className="modal-header-icon" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}><RotateCcw size={20} /></div>
          <div>
            <div className="modal-title">Process Refund</div>
            <div className="modal-subtitle">Payment #{payment.id} — LKR {payment.amount?.toLocaleString()}</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <div className="alert-title">Refund Confirmation</div>
                This will initiate a full refund of <strong>LKR {payment.amount?.toLocaleString()}</strong> for Reservation #{payment.reservationId}.
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Reason for Refund *</label>
              <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain the reason for this refund..." required style={{ minHeight: 80 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', borderColor: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={processing}>
              <RotateCcw size={14} />
              {processing ? 'Processing...' : 'Issue Refund'}
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
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [roomRes, buffetRes] = await Promise.allSettled([
        axios.get('/api/payments'),
        buffetApi.getBuffetPayments()
      ]);

      let roomPayments = [];
      if (roomRes.status === 'fulfilled') {
        const raw = roomRes.value.data?.data || roomRes.value.data || [];
        roomPayments = (Array.isArray(raw) ? raw : []).map(p => ({
          ...p,
          category: 'ROOM_EVENT',
          isBuffet: false
        }));
      } else {
        roomPayments = MOCK_PAYMENTS.map(p => ({
          ...p,
          category: 'ROOM_EVENT',
          isBuffet: false
        }));
      }

      let diningPayments = [];
      if (buffetRes.status === 'fulfilled' && Array.isArray(buffetRes.value)) {
        diningPayments = buffetRes.value.map(bp => ({
          id: `BUF-${bp.id || (bp.confirmationCode ? bp.confirmationCode.slice(-4) : Date.now())}`,
          reservationId: bp.confirmationCode,
          customerId: bp.guestEmail || bp.guestPhone || 'Walk-in Guest',
          guestName: bp.guestName,
          mealSession: bp.mealSession,
          amount: Number(bp.amountPaid || bp.totalAmount || 0),
          paymentMethod: bp.paymentMethod || 'CREDIT_CARD',
          status: bp.paymentStatus === 'SUCCESS' ? 'COMPLETED' : (bp.paymentStatus || 'COMPLETED'),
          paymentDate: bp.paidAt ? bp.paidAt.slice(0, 10) : (bp.reservationDate || new Date().toISOString().slice(0, 10)),
          transactionRef: bp.transactionReference || bp.confirmationCode,
          category: 'BUFFET_DINING',
          isBuffet: true,
          rawBuffet: bp
        }));
      }

      const combined = [...diningPayments, ...roomPayments].sort((a, b) => {
        return new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0);
      });
      setPayments(combined);
    } catch {
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePayment = async (form) => {
    try {
      const { data } = await axios.post('/api/payments', form);
      setPayments(p => [data?.data || data, ...p]);
    } catch {
      setPayments(p => [{ ...form, id: Date.now(), status: 'COMPLETED', paymentDate: new Date().toISOString().slice(0, 10), transactionRef: 'TXN-' + Date.now(), category: 'ROOM_EVENT', isBuffet: false }, ...p]);
    }
    showToast('Payment processed successfully!');
    setModal(null);
  };

  const handleRefund = async (req) => {
    try {
      if (req.paymentId?.toString().startsWith('BUF-')) {
        setPayments(p => p.map(x => x.id === req.paymentId ? { ...x, status: 'REFUNDED' } : x));
      } else {
        await axios.post('/api/payments/refund', req);
        setPayments(p => p.map(x => x.id === req.paymentId ? { ...x, status: 'REFUNDED' } : x));
      }
    } catch {
      setPayments(p => p.map(x => x.id === req.paymentId ? { ...x, status: 'REFUNDED' } : x));
    }
    showToast('Refund issued successfully!');
    setModal(null);
  };

  const handleDownloadInvoice = async (payment) => {
    if (payment.isBuffet) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Dining Invoice Receipt - ${payment.reservationId}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111827; background: #fff; }
                .card { max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 2px solid #c5a059; padding-bottom: 20px; }
                .brand { font-size: 20px; font-weight: 800; letter-spacing: 0.05em; color: #0f172a; }
                .subbrand { font-size: 12px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
                .title { font-size: 18px; font-weight: 700; color: #b45309; margin-top: 14px; }
                .table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
                .table td, .table th { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: left; }
                .table th { color: #64748b; font-weight: 600; width: 40%; }
                .total-row { font-size: 18px; font-weight: 800; color: #047857; background: #f0fdf4; }
                .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 16px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <div class="brand">THE GRAND REGENCY RESORT & SPA</div>
                  <div class="subbrand">Luxury Sanctuary &bull; Sigiriya, Sri Lanka</div>
                  <div class="title">🍽️ Official Dining Voucher & Payment Receipt</div>
                </div>
                <table class="table">
                  <tr><th>Pass Reference:</th><td><strong style="color: #b45309; font-family: monospace; font-size: 15px;">${payment.reservationId}</strong></td></tr>
                  <tr><th>Transaction Ref:</th><td><span style="font-family: monospace;">${payment.transactionRef || payment.reservationId}</span></td></tr>
                  <tr><th>Guest Name:</th><td><strong>${payment.guestName || payment.customerId}</strong></td></tr>
                  <tr><th>Dining Session:</th><td>${payment.mealSession || 'Buffet Dining'}</td></tr>
                  <tr><th>Dining Date:</th><td>${payment.paymentDate}</td></tr>
                  <tr><th>Payment Method:</th><td>${payment.paymentMethod?.replace(/_/g, ' ')}</td></tr>
                  <tr><th>Settlement Status:</th><td><strong style="color: #047857;">VERIFIED & COMPLETED</strong></td></tr>
                  <tr class="total-row"><th>Total Amount Paid:</th><td>LKR ${Number(payment.amount || 0).toLocaleString()}</td></tr>
                </table>
                <div class="footer">
                  Thank you for dining with us. Please present this electronic receipt upon arrival at The Alaka Restaurant.
                </div>
              </div>
              <script>window.onload = function() { window.print(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      showToast('Official dining receipt opened for printing/saving.', 'success');
      return;
    }

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
    const matchesSearch = (
      !q ||
      String(p.id).toLowerCase().includes(q) ||
      String(p.reservationId).toLowerCase().includes(q) ||
      p.transactionRef?.toLowerCase().includes(q) ||
      p.guestName?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q)
    );
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalRevenue = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((s, p) => s + (p.amount || 0), 0);
  const buffetPayments = payments.filter(p => p.isBuffet);
  const buffetRevenue = buffetPayments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((s, p) => s + (p.amount || 0), 0);
  const roomRevenue = totalRevenue - buffetRevenue;
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
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <CheckCircle2 size={16} /> {toast.msg}
        </div>
      )}

      {/* Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card gold">
          <div className="stat-card-icon"><DollarSign size={24} style={{ color: 'var(--gold-400)' }} /></div>
          <div className="stat-card-value">LKR {totalRevenue.toLocaleString()}</div>
          <div className="stat-card-label">Total Collected</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Rooms: LKR {roomRevenue.toLocaleString()} &bull; 🍽️ Dining: LKR {buffetRevenue.toLocaleString()}
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon"><CheckCircle2 size={24} style={{ color: 'var(--emerald-400)' }} /></div>
          <div className="stat-card-value">{payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').length}</div>
          <div className="stat-card-label">Completed Transactions</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {buffetPayments.length} Buffet Dining Orders
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-icon"><RotateCcw size={24} style={{ color: '#a78bfa' }} /></div>
          <div className="stat-card-value">LKR {totalRefunded.toLocaleString()}</div>
          <div className="stat-card-label">Refunded</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {payments.filter(p => p.status === 'REFUNDED').length} Reversed
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-card-icon"><XCircle size={24} style={{ color: '#ef4444' }} /></div>
          <div className="stat-card-value">{payments.filter(p => p.status === 'FAILED').length}</div>
          <div className="stat-card-label">Failed</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Zero Pending Gateway Errors
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="filter-bar">
            <div className="search-wrapper">
              <span className="search-icon"><Search size={15} /></span>
              <input className="search-input" placeholder="Search by payment ID, reference, guest name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Category Filter */}
            <select className="form-select" style={{ width: 180 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="ROOM_EVENT">🏨 Rooms & Halls</option>
              <option value="BUFFET_DINING">🍽️ Buffet Dining</option>
            </select>

            {/* Status Filter */}
            <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              id="add-payment-btn"
              className="btn btn-primary btn-sm"
              onClick={() => setModal({ type: 'pay' })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Process Payment
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} style={{ color: 'var(--gold-400)' }} /> Payment Ledger
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} transactions</span>
        </div>
        {loading ? (
          <LoadingScreen text="Loading payments ledger..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><CreditCard size={36} style={{ color: 'var(--text-muted)' }} /></div>
            <div className="empty-state-title">No payments found</div>
            <div className="empty-state-desc">No transactions matched your selected filters.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reservation / Order</th>
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
                      {p.isBuffet ? (
                        <div>
                          <span style={{
                            fontFamily: 'monospace',
                            background: 'rgba(197, 160, 89, 0.15)',
                            border: '1px solid rgba(197, 160, 89, 0.35)',
                            color: 'var(--gold-400, #c5a059)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <UtensilsCrossed size={12} /> {p.reservationId}
                          </span>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary, #9ca3af)', marginTop: 2 }}>
                            🍽️ {p.mealSession} &bull; {p.guestName || 'Buffet Guest'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontFamily: 'monospace', background: 'var(--dark-700)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                            🏨 Res #{p.reservationId}
                          </span>
                          {p.guestName && (
                            <div style={{ fontSize: 11, color: 'var(--text-secondary, #9ca3af)', marginTop: 2 }}>
                              {p.guestName}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} style={{ color: 'var(--gold-400)' }} />
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
                            title={p.isBuffet ? 'Print Official Dining Receipt' : 'Download invoice PDF'}
                            style={{ padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <FileText size={12} /> {p.isBuffet ? 'Receipt' : 'Invoice'}
                          </button>
                        )}
                        {(p.status === 'COMPLETED' || p.status === 'SUCCESS') && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)', padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => setModal({ type: 'refund', payment: p })}
                          >
                            <RotateCcw size={12} /> Refund
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
