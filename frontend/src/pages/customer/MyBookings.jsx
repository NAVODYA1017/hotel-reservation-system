import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';
import LoadingScreen from '../../components/LoadingScreen';
import Reveal from '../../components/Reveal';
import html2pdf from 'html2pdf.js';
import { Lottie } from 'lottie-react';
import paymentSuccessAnim from '../../assets/payment-success.json';
import { 
  CreditCard, Download, Eye, CheckCircle2, AlertCircle, AlertTriangle, 
  FileText, Calendar, Building2, User, ShieldCheck, Clock, Check, 
  XCircle, Trash2, Edit3, BedDouble, Trees, DollarSign, Building, Banknote, Sparkles, Printer
} from 'lucide-react';
import { buffetApi } from '../../utils/buffetApi';

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CHECKED_IN: 'badge-info',
  CHECKED_OUT: 'badge-muted',
  CANCELLED: 'badge-error',
  PAID: 'badge-success',
  AWAITING_PAYMENT: 'badge-warning',
};

function BookingCard({ booking, onCancel, onDelete, onModify, onPay, onDownloadInvoice, onViewInvoice, onDownloadReceipt }) {
  const [expanded, setExpanded] = useState(false);
  const isPast = new Date(booking.checkOut) < new Date();
  const canCancel = ['CONFIRMED', 'PENDING', 'AWAITING_PAYMENT'].includes(booking.status);
  const isPaid = booking.paymentStatus === 'PAID' || booking.status === 'PAID';

  return (
    <div className="booking-card animate-fade-in" style={{ background: '#1a1c18', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}>
      <div className="booking-card-top">
        <div className="booking-card-img" style={{ background: '#22251f', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BedDouble size={28} style={{ color: 'var(--gold-400)' }} />
        </div>
        <div className="booking-card-info" style={{ flex: 1 }}>
          <div className="booking-card-room" style={{ fontFamily: "'Playfair Display', serif" }}>{booking.roomType}</div>
          <div className="booking-card-dates" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Calendar size={13} style={{ color: 'var(--gold-400)' }} /> {booking.checkIn} → {booking.checkOut} · {booking.nights} night{booking.nights !== 1 ? 's' : ''} · <User size={13} style={{ color: 'var(--gold-400)' }} /> {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <span className={`badge ${STATUS_BADGE[booking.status] || 'badge-muted'}`} style={{ borderRadius: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {booking.status?.replace('_', ' ')}
            </span>
            <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ borderRadius: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isPaid ? 'Paid in Full' : 'Amount Payable Due'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold-400)', fontFamily: "'Playfair Display', serif" }}>
            LKR {booking.totalAmount?.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total incl. tax & services</div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, borderRadius: 2 }} onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              ['Booking Ref', booking.reservationId],
              ['Space Number', `#${booking.roomNumber}`],
              ['Payment Status', isPaid ? 'PAID' : 'PENDING PAYMENT'],
              ['Check-in Date', booking.checkIn],
              ['Check-out Date', booking.checkOut],
              ['Total Guests', `${booking.guests} Persons`],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '10px 14px', background: '#20221e', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, color: 'var(--gold-400)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: k === 'Booking Ref' || k === 'Space Number' ? 'monospace' : 'inherit' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="booking-card-footer" style={{ background: '#141613', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {isPast ? `Stay completed · ${booking.checkOut}` : `Arrival in ${Math.max(0, Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24)))} days`}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {!isPaid && booking.status !== 'CANCELLED' && (
            <button
              className="hero-btn-primary"
              onClick={() => onPay(booking)}
              style={{ background: 'var(--gold-400)', color: '#141513', padding: '7px 16px', fontSize: 12, border: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Pay now to confirm reservation and receive itemized invoice"
            >
              <CreditCard size={14} /> MAKE PAYMENT →
            </button>
          )}

          {isPaid && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onDownloadInvoice(booking)}
                style={{ borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Download official PDF invoice"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onViewInvoice(booking)}
                style={{ borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="View itemized breakdown"
              >
                <Eye size={14} /> View Invoice
              </button>
            </>
          )}

          {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT' || isPaid) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onDownloadReceipt(booking)}
              style={{ borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Download Reservation Receipt"
            >
              <Printer size={14} /> Receipt
            </button>
          )}

          {canCancel && !booking.isBuffet && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onModify(booking)}
              style={{ borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Modify Dates"
            >
              <Edit3 size={13} /> Modify Dates
            </button>
          )}
          {booking.status !== 'CANCELLED' && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onCancel(booking)}
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 12px', borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Cancel Booking"
            >
              <Trash2 size={13} /> Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   UC-05 PAYMENT MODAL (Steps 3-7, Extensions 6a & 7a)
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankName, setBankName] = useState('Bank of Ceylon');
  const [bankRef, setBankRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [processing, setProcessing] = useState(false);

  // Step 3: calculate payable amount
  const payableAmount = Number(booking.totalAmount || 0);

  // Format card number with spaces (e.g. 4532 1234 5678 9012)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length >= 3) {
      setCardExpiry(raw.slice(0, 2) + '/' + raw.slice(2, 4));
    } else if (raw.length === 2 && !cardExpiry.endsWith('/')) {
      setCardExpiry(raw + '/');
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Step 6 / Extension 6a: Client-side validation
    const digitsOnlyCard = cardNumber.replace(/\s/g, '');
    if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
      if (digitsOnlyCard.length < 13 || digitsOnlyCard.length > 19) {
        setErrorMsg('Please enter a valid 13 to 16 digit card number.');
        return;
      }
      if (!cardHolder.trim() || cardHolder.trim().length < 2) {
        setErrorMsg('Please enter the cardholder full name as printed on card.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpiry)) {
        setErrorMsg('Card expiry date must be in MM/YY format (e.g. 12/28).');
        return;
      }
      if (!/^[0-9]{3,4}$/.test(cvv)) {
        setErrorMsg('CVV security code must be 3 or 4 digits.');
        return;
      }
    } else if (method === 'BANK_TRANSFER') {
      if (!bankRef.trim()) {
        setErrorMsg('Please enter the bank transfer slip or transaction reference number.');
        return;
      }
    }

    setProcessing(true);

    try {
      // Step 7: System processes the payment
      let paymentData;
      if (booking.isBuffet) {
        const res = await buffetApi.processPayment({
          confirmationCode: booking.reservationId,
          amount: payableAmount,
          paymentMethod: method,
          paymentReferenceInfo: method === 'BANK_TRANSFER' ? bankRef : `Card ending in ${digitsOnlyCard.slice(-4) || '4242'}`
        });
        paymentData = res;
      } else {
        const payload = {
          reservationId: booking.id,
          amount: payableAmount,
          paymentMethod: method,
          cardNumber: digitsOnlyCard || undefined,
          cardHolderName: cardHolder || undefined,
          cardExpiry: cardExpiry || undefined,
          cvv: cvv || undefined,
          bankName: method === 'BANK_TRANSFER' ? bankName : undefined,
          bankReferenceNumber: method === 'BANK_TRANSFER' ? bankRef : undefined,
        };
        const res = await axios.post('/api/payments', payload);
        paymentData = res.data?.data || res.data;
      }

      // Step 8 & 9: Successful payment recorded and invoice generated
      onSuccess(paymentData, booking);
    } catch (err) {
      // Extension 7a: Payment fails, allow customer to retry
      const serverMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.defaultMessage || 'Payment processing failed. Please check your details and try again.';
      setErrorMsg(serverMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540, background: '#181a16', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <div className="modal-header-icon" style={{ background: 'rgba(197,160,89,0.15)', border: '1px solid rgba(197,160,89,0.4)', borderRadius: 2 }}>
            <CreditCard size={20} style={{ color: 'var(--gold-400)' }} />
          </div>
          <div>
            <div className="modal-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 19 }}>
              Process Payment & Billing
            </div>
            <div className="modal-subtitle">Reservation #{booking.reservationId} · {booking.roomType}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handlePaySubmit}>
          <div className="modal-body" style={{ padding: '24px' }}>
            {/* Step 3: Display Amount Payable */}
            <div style={{ background: '#20221e', border: '1px solid rgba(197,160,89,0.3)', borderRadius: 2, padding: '18px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold-400)', fontWeight: 700 }}>
                    Outstanding Amount Payable
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {booking.nights} night(s) stay ({booking.checkIn} → {booking.checkOut})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold-400)', fontFamily: "'Playfair Display', serif" }}>
                    LKR {payableAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inclusive of all taxes</div>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: 18, borderRadius: 2, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <div className="alert-title" style={{ color: '#fca5a5' }}>Payment Validation Issue</div>
                  <span style={{ fontSize: 13, color: '#fecaca' }}>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 18 }}>
              <label className="form-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11, color: 'var(--text-secondary)' }}>
                Select Payment Method *
              </label>
              <div className="payment-methods" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { id: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard size={18} /> },
                  { id: 'DEBIT_CARD', label: 'Debit Card', icon: <CreditCard size={18} /> },
                  { id: 'BANK_TRANSFER', label: 'Bank Slip', icon: <Building size={18} /> },
                  { id: 'CASH', label: 'At Desk', icon: <Banknote size={18} /> },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`payment-method-btn ${method === m.id ? 'selected' : ''}`}
                    onClick={() => { setMethod(m.id); setErrorMsg(''); }}
                    style={{ borderRadius: 2, padding: '12px 6px', background: method === m.id ? 'rgba(197,160,89,0.15)' : '#1e201b', borderColor: method === m.id ? 'var(--gold-400)' : 'rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                  >
                    <span className="payment-method-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: method === m.id ? 'var(--gold-400)' : 'inherit' }}>{m.icon}</span>
                    <span className="payment-method-label" style={{ fontSize: 10, letterSpacing: '0.05em' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Customer enters payment information */}
            {(method === 'CREDIT_CARD' || method === 'DEBIT_CARD') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Card Number *</label>
                  <input
                    type="text"
                    className="card-input-field"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4532 1234 5678 9012"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name *</label>
                  <input
                    type="text"
                    className="card-input-field"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    placeholder="e.g. RANASINGHE A.D."
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY) *</label>
                    <input
                      type="text"
                      className="card-input-field"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV / CVC *</label>
                    <input
                      type="password"
                      className="card-input-field"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'BANK_TRANSFER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Bank Name *</label>
                  <select className="form-select" value={bankName} onChange={e => setBankName(e.target.value)} style={{ background: '#141613', borderRadius: 2 }}>
                    <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                    <option value="Commercial Bank">Commercial Bank of Ceylon</option>
                    <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transfer / Slip Reference Number *</label>
                  <input
                    type="text"
                    className="card-input-field"
                    value={bankRef}
                    onChange={e => setBankRef(e.target.value)}
                    placeholder="e.g. REF-BOC-992384"
                    required
                  />
                </div>
              </div>
            )}

            {method === 'CASH' && (
              <div style={{ padding: '16px', background: '#20221e', borderRadius: 2, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Banknote size={18} style={{ color: 'var(--gold-400)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Cash Settlement at Resort Desk:</strong> You may settle payment directly upon check-in. Clicking confirm will record your invoice and reservation as guaranteed.
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--gold-400)" />
              <span>256-Bit Encrypted Secure Payment Gateway · Immediate Itemized Invoice</span>
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={processing} style={{ borderRadius: 2 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="hero-btn-primary"
              disabled={processing}
              style={{ background: 'var(--gold-400)', color: '#141513', border: 'none', padding: '10px 24px', fontWeight: 700 }}
            >
              {processing ? 'Processing Payment...' : `PAY LKR ${payableAmount.toLocaleString()} →`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   UC-05 PAYMENT CONFIRMATION & INVOICE DOWNLOAD MODAL (Steps 10-11)
   ═══════════════════════════════════════════════════════════════════════ */
function PaymentConfirmationModal({ payment, booking, onClose, onDownloadPdf, onViewInvoice }) {
  const invNumber = payment.invoiceNumber || `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${booking.id}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520, background: '#181a16', border: '1px solid rgba(197,160,89,0.3)', borderRadius: 2 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '36px 30px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Lottie src={paymentSuccessAnim} loop={false} style={{ width: 100, height: 100 }} />
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>
            Payment Confirmed
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Your transaction has been processed and an itemized invoice is ready.
          </p>

          <div style={{ background: '#20221e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Invoice Number</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-400)', fontSize: 14 }}>{invNumber}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Transaction Ref</span>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)' }}>{payment.transactionReference || 'TXN-SUCCESS'}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Amount Paid</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>LKR {Number(payment.amount || booking.totalAmount).toLocaleString()}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Payment Status</span>
                <span style={{ color: '#4ade80', fontWeight: 600, fontSize: 13 }}>✓ Fully Settled</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {/* Step 11: Customer downloads invoice PDF */}
            <button
              className="hero-btn-primary"
              onClick={() => onDownloadPdf(invNumber)}
              style={{ background: 'var(--gold-400)', color: '#141513', padding: '12px 24px', fontSize: 13, border: 'none', fontWeight: 700 }}
            >
              <Download size={15} style={{ marginRight: 6 }} /> DOWNLOAD INVOICE (PDF)
            </button>
            {/* Step 11: Customer views invoice */}
            <button
              className="btn btn-secondary"
              onClick={() => onViewInvoice(invNumber, booking, payment)}
              style={{ borderRadius: 2 }}
            >
              <FileText size={15} style={{ marginRight: 6 }} /> View Invoice Details
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ITEMIZED INVOICE VIEW MODAL (Step 11 - View Invoice)
   ═══════════════════════════════════════════════════════════════════════ */
function InvoiceViewModal({ invoiceData, booking, onClose, onDownloadPdf }) {
  const invNumber = invoiceData?.invoiceNumber || `INV-${booking?.id}`;
  const total = Number(invoiceData?.totalAmount || booking?.totalAmount || 0);
  const tax = total * 0.10;
  const subtotal = total - tax;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 650, background: '#161814', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div className="modal-title" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', color: 'var(--gold-400)' }}>
              ALIYA RESORT INVOICE
            </div>
            <div className="modal-subtitle">Official Itemized Tax Invoice #{invNumber}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: 28 }}>
          <div className="invoice-header-bar">
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--gold-400)', letterSpacing: '0.12em' }}>ALIYA RESORT</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Ella Highland Ridge, Wild Countryside<br />
                VAT Registration No: VAT-88291039
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date: {new Date().toLocaleDateString()}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>#{invNumber}</div>
            </div>
          </div>

          <div className="invoice-details-grid">
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Billed To</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{booking?.userName || 'Valued Haven Guest'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking?.userEmail || ''}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Booking Details</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{booking?.roomType} (#{booking?.roomNumber})</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stay: {booking?.checkIn} to {booking?.checkOut} ({booking?.nights} nights)</div>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Nights</th>
                <th style={{ textAlign: 'right' }}>Rate / Night</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Accommodation — {booking?.roomType}</td>
                <td style={{ textAlign: 'center' }}>{booking?.nights}</td>
                <td style={{ textAlign: 'right' }}>LKR {(subtotal / (booking?.nights || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td style={{ textAlign: 'right' }}>LKR {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Countryside Tourism & Services Tax (10%)</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td style={{ textAlign: 'right' }}>LKR {tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td style={{ textAlign: 'right' }}>LKR {tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-summary-box">
            <div style={{ display: 'flex', gap: 40, justifyContent: 'space-between', width: '240px', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span>LKR {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'space-between', width: '240px', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Tax (10%):</span>
              <span>LKR {tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'space-between', width: '240px', fontSize: 16, fontWeight: 700, color: 'var(--gold-400)', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Total Paid:</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ borderRadius: 2 }}>Close</button>
          <button
            className="hero-btn-primary"
            onClick={() => onDownloadPdf(invNumber)}
            style={{ background: 'var(--gold-400)', color: '#141513', border: 'none', padding: '10px 20px', fontWeight: 700 }}
          >
            <Download size={14} style={{ marginRight: 6 }} /> DOWNLOAD PDF INVOICE
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN MY BOOKINGS PAGE
   ═══════════════════════════════════════════════════════════════════════ */
function MyBookings() {
  const navigate = useNavigate();
  const guest = JSON.parse(localStorage.getItem('guestUser') || 'null');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [modifyModal, setModifyModal] = useState(null);

  // UC-05 specific state
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [invoiceViewData, setInvoiceViewData] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = () => {
    if (!guest) { navigate('/guest-login?redirect=/my-bookings'); return; }
    setLoading(true);
    Promise.all([
      axios.get('/api/reservations').catch(() => ({ data: [] })),
      buffetApi.getAllReservations().catch(() => [])
    ])
      .then(([resRooms, resBuffets]) => {
        const allRooms = Array.isArray(resRooms.data) ? resRooms.data : [];
        const allBuffets = Array.isArray(resBuffets) ? resBuffets : [];

        const myRooms = allRooms.filter(r => 
          (guest?.email && (r.userEmail?.toLowerCase() === guest.email.toLowerCase() || r.guestEmail?.toLowerCase() === guest.email.toLowerCase())) ||
          (guest?.id && r.userId === guest.id) ||
          (guest?.name && r.userName?.toLowerCase() === guest.name.toLowerCase())
        );

        const myBuffets = allBuffets.filter(r => 
          (guest?.email && (r.guestEmail?.toLowerCase() === guest.email.toLowerCase())) ||
          (guest?.name && r.guestName?.toLowerCase() === guest.name.toLowerCase())
        );

        const roomsToDisplay = myRooms.length > 0 ? myRooms : allRooms.filter(r => r.userId === guest.id);
        const buffetsToDisplay = myBuffets.length > 0 ? myBuffets : allBuffets.filter(r => r.guestEmail === guest.email);

        const mappedRooms = roomsToDisplay.map(r => {
          const isHall = r.reservationType === 'EVENT_HALL' || !!r.hallName;
          return {
            ...r,
            id: r.id,
            reservationId: r.confirmationCode || r.reservationId || `RES-00${r.id}`,
            itemType: isHall ? 'EVENT_HALL' : 'ROOM',
            roomType: isHall ? (r.hallName || 'Event Hall') : (r.roomType || 'Standard Cabin'),
            roomNumber: isHall ? 'EVENT' : (r.roomNumber || '101'),
            icon: isHall ? <Building size={20} /> : ((r.roomType || '').toLowerCase().includes('suite') ? <Building2 size={20} /> : <BedDouble size={20} />),
            checkIn: r.checkIn || r.checkInDate,
          checkOut: r.checkOut || r.checkOutDate,
          nights: r.checkIn && r.checkOut ? Math.max(1, Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60 * 24))) : 1,
          guests: r.guests || 2,
          totalAmount: Number(r.totalAmount || 0),
          amountPaid: Number(r.amountPaid || 0),
          paymentStatus: (r.status === 'PAID' || Number(r.amountPaid) >= Number(r.totalAmount)) ? 'PAID' : 'PENDING',
          paymentMethod: 'CREDIT_CARD',
        };
      });

        const mappedBuffets = buffetsToDisplay.map(b => ({
          ...b,
          id: `BUF-${b.id}`,
          realId: b.id,
          reservationId: b.confirmationCode || `BUF-00${b.id}`,
          itemType: 'BUFFET',
          roomType: `Buffet: ${b.mealSession || 'Dining'}`,
          roomNumber: b.tableNumber || 'TBD',
          icon: <Trees size={20} />, // dining icon
          checkIn: b.reservationDate,
          checkOut: b.reservationDate,
          nights: 1,
          guests: (b.adultCount || 0) + (b.childCount || 0),
          totalAmount: Number(b.amountPaid || 0), // buffet usually paid in full
          amountPaid: Number(b.amountPaid || 0),
          status: b.status || 'CONFIRMED',
          paymentStatus: (b.paymentStatus === 'SUCCESS') ? 'PAID' : 'PENDING',
          paymentMethod: b.paymentMethod || 'CREDIT_CARD',
          isBuffet: true
        }));

        setBookings([...mappedRooms, ...mappedBuffets].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn)));
      })
      .catch(err => {
        console.error('Error fetching reservations:', err);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  // UC-05: Handle successful payment callback
  const handlePaymentSuccess = (paymentData, booking) => {
    setPaymentModalBooking(null);
    showToast(`Payment processed successfully for Reservation #${booking.reservationId}!`, 'success');
    setConfirmationData({ payment: paymentData, booking });
    fetchBookings();
  };

  // UC-05: Step 11 - Download Invoice PDF
  const handleDownloadInvoicePdf = async (invoiceNumber) => {
    try {
      showToast('Downloading invoice PDF...', 'success');
      const res = await axios.get(`/api/invoices/${invoiceNumber}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Invoice PDF ready for viewing.', 'success');
    }
  };

  // UC-05: Download directly from booking card
  const handleBookingCardDownload = async (booking) => {
    if (booking.isBuffet) {
      handleDownloadReceipt(booking);
      return;
    }
    try {
      // Find invoice by reservation id
      const res = await axios.get(`/api/invoices/reservation/${booking.id}`);
      const invoices = res.data?.data || res.data;
      if (Array.isArray(invoices) && invoices.length > 0) {
        const invNum = invoices[0].invoiceNumber;
        await handleDownloadInvoicePdf(invNum);
      } else {
        const fallbackNum = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${booking.id}`;
        await handleDownloadInvoicePdf(fallbackNum);
      }
    } catch {
      const fallbackNum = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${booking.id}`;
      await handleDownloadInvoicePdf(fallbackNum);
    }
  };

  // UC-05: View invoice breakdown modal
  const handleBookingCardViewInvoice = async (booking) => {
    if (booking.isBuffet) {
      setInvoiceViewData({
        invoiceData: { invoiceNumber: `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${booking.id}`, totalAmount: booking.totalAmount },
        booking
      });
      return;
    }
    try {
      const res = await axios.get(`/api/invoices/reservation/${booking.id}`);
      const invoices = res.data?.data || res.data;
      const inv = Array.isArray(invoices) && invoices.length > 0 ? invoices[0] : null;
      setInvoiceViewData({
        invoiceData: inv || { invoiceNumber: `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${booking.id}`, totalAmount: booking.totalAmount },
        booking
      });
    } catch {
      setInvoiceViewData({
        invoiceData: { invoiceNumber: `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${booking.id}`, totalAmount: booking.totalAmount },
        booking
      });
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

  const handleCancel = async (booking) => {
    try {
      if (booking.isBuffet) {
        await buffetApi.cancelReservation(booking.realId);
      } else {
        await axios.put(`/api/reservations/${booking.id}/cancel`);
      }
      showToast(`Reservation #${booking.reservationId} cancelled successfully!`, 'success');
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel reservation.';
      showToast(msg, 'error');
    } finally {
      setCancelModal(null);
    }
  };

  const handleModify = async () => {
    if (!modifyModal) return;
    try {
      const res = await axios.put(`/api/reservations/${modifyModal.id}`, {
        checkIn: modifyModal.newCheckIn,
        checkOut: modifyModal.newCheckOut,
      });
      showToast(`Reservation #${modifyModal.reservationId} modified successfully! New Total: LKR ${res.data.totalAmount?.toLocaleString()}`, 'success');
      setModifyModal(null);
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to modify reservation. Overlapping dates or invalid range.';
      showToast(msg, 'error');
    }
  };



  const FILTERS = [
    { id: 'all', label: 'All Reservations' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past Stays' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'room', label: 'Rooms' },
    { id: 'event', label: 'Event Halls' },
    { id: 'buffet', label: 'Dining' }
  ];

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return ['CONFIRMED', 'PENDING', 'AWAITING_PAYMENT', 'PAID', 'CHECKED_IN'].includes(b.status);
    if (filter === 'past') return b.status === 'CHECKED_OUT';
    if (filter === 'cancelled') return b.status === 'CANCELLED';
    if (filter === 'room') return b.itemType === 'ROOM';
    if (filter === 'event') return b.itemType === 'EVENT_HALL';
    if (filter === 'buffet') return b.itemType === 'BUFFET';
    return true;
  });

  return (
    <div className="customer-shell">
      <CustomerNav />

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#86efac',
          borderRadius: 2,
          padding: '14px 22px', fontSize: 13, fontWeight: 600,
          animation: 'slideUp 0.3s ease', boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <Reveal>
        <div style={{ padding: '36px 0 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="c-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div className="user-avatar" style={{ width: 54, height: 54, fontSize: 22, borderRadius: 2, background: 'var(--gold-400)', color: '#141513' }}>
              {guest?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                My Countryside Reservations
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Welcome back, {guest?.name || 'Guest'} · {bookings.length} sanctuary reservation{bookings.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-escape" style={{ marginLeft: 'auto' }} onClick={() => navigate('/browse')}>
              + NEW ESCAPE
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, paddingBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Stays', value: bookings.filter(b => b.status === 'CHECKED_OUT').length, icon: <Trees size={22} style={{ color: 'var(--gold-400)' }} /> },
              { label: 'Upcoming', value: bookings.filter(b => ['CONFIRMED', 'PENDING', 'AWAITING_PAYMENT', 'PAID'].includes(b.status)).length, icon: <Calendar size={22} style={{ color: 'var(--gold-400)' }} /> },
              { label: 'Total Settled', value: `LKR ${bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}`, icon: <DollarSign size={22} style={{ color: 'var(--gold-400)' }} /> },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 20px', background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="c-section" style={{ paddingTop: 32 }}>
          <div className="c-container">
            {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f.id)}
                style={{ borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingScreen text="Carving your sanctuary reservations..." />
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 80 }}>
              <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <Calendar size={48} style={{ color: 'var(--gold-400)', opacity: 0.6 }} />
              </div>
              <div className="empty-state-title" style={{ fontFamily: "'Playfair Display', serif" }}>No {filter === 'all' ? '' : filter} bookings found</div>
              <div className="empty-state-desc">
                {filter === 'upcoming' ? "You have no upcoming countryside reservations." : filter === 'past' ? "You haven't completed any sanctuary stays yet." : "You have no bookings recorded yet."}
              </div>
              <button className="btn-escape" style={{ marginTop: 24 }} onClick={() => navigate('/browse')}>
                EXPLORE AVAILABLE SPACES →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={b => setCancelModal(b)}
                  onDelete={b => setDeleteModal(b)}
                  onModify={b => setModifyModal({ ...b, newCheckIn: b.checkIn, newCheckOut: b.checkOut })}
                  onPay={b => setPaymentModalBooking(b)}
                  onDownloadInvoice={b => handleBookingCardDownload(b)}
                  onViewInvoice={b => handleBookingCardViewInvoice(b)}
                  onDownloadReceipt={b => handleDownloadReceipt(b)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </Reveal>

      {/* UC-05: Payment Modal */}
      {paymentModalBooking && (
        <PaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* UC-05: Confirmation & Invoice Download Modal */}
      {confirmationData && (
        <PaymentConfirmationModal
          payment={confirmationData.payment}
          booking={confirmationData.booking}
          onClose={() => setConfirmationData(null)}
          onDownloadPdf={handleDownloadInvoicePdf}
          onViewInvoice={(invNum, b, p) => {
            setConfirmationData(null);
            setInvoiceViewData({
              invoiceData: { invoiceNumber: invNum, totalAmount: p.amount || b.totalAmount },
              booking: b
            });
          }}
        />
      )}

      {/* UC-05: View Itemized Invoice Modal */}
      {invoiceViewData && (
        <InvoiceViewModal
          invoiceData={invoiceViewData.invoiceData}
          booking={invoiceViewData.booking}
          onClose={() => setInvoiceViewData(null)}
          onDownloadPdf={handleDownloadInvoicePdf}
        />
      )}

      {/* Modify Dates Modal */}
      {modifyModal && (
        <div className="modal-overlay" onClick={() => setModifyModal(null)}>
          <div className="modal" style={{ maxWidth: 440, background: '#181a16', borderRadius: 2 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 2, color: 'var(--gold-400)' }}>
                <Edit3 size={18} />
              </div>
              <div>
                <div className="modal-title">Modify Stay Dates</div>
                <div className="modal-subtitle">{modifyModal.reservationId} · {modifyModal.roomType}</div>
              </div>
              <button className="modal-close" onClick={() => setModifyModal(null)}><XCircle size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                Select your new arrival and departure dates. The system will check availability in real-time.
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">New Arrival Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={modifyModal.newCheckIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setModifyModal(m => ({ ...m, newCheckIn: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Departure Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={modifyModal.newCheckOut}
                    min={modifyModal.newCheckIn || new Date().toISOString().split('T')[0]}
                    onChange={e => setModifyModal(m => ({ ...m, newCheckOut: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModifyModal(null)} style={{ borderRadius: 2 }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleModify} style={{ borderRadius: 2 }}>Save New Dates</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" style={{ maxWidth: 420, background: '#181a16', borderRadius: 2 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 2, color: '#f59e0b' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="modal-title">Cancel Reservation</div>
                <div className="modal-subtitle">{cancelModal.reservationId}</div>
              </div>
              <button className="modal-close" onClick={() => setCancelModal(null)}><XCircle size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning" style={{ borderRadius: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <div className="alert-title">Are you sure?</div>
                  Cancelling <strong>{cancelModal.roomType}</strong> ({cancelModal.checkIn} → {cancelModal.checkOut}).
                  The reservation status will be updated to CANCELLED.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModal(null)} style={{ borderRadius: 2 }}>Keep Stay</button>
              <button className="btn btn-warning" onClick={() => handleCancel(cancelModal)} style={{ borderRadius: 2 }}>Yes, Cancel Reservation</button>
            </div>
          </div>
        </div>
      )}


      <CustomerFooter />
    </div>
  );
}

export default MyBookings;
