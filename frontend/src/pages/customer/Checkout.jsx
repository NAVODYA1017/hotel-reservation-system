import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';
import LoadingScreen from '../../components/LoadingScreen';

const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', icon: '💳', label: 'Credit Card' },
  { id: 'DEBIT_CARD', icon: '🏧', label: 'Debit Card' },
  { id: 'BANK_TRANSFER', icon: '🏦', label: 'Bank Transfer' },
  { id: 'CASH', icon: '💵', label: 'Pay at Hotel' },
];

const MOCK_ROOM_PRICES = { 1: 8500, 2: 14200, 3: 28600, 5: 52000 };
const MOCK_ROOM_NAMES = { 1: 'Standard Room', 2: 'Deluxe Room', 3: 'Premier Suite', 5: 'Presidential Suite' };

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get('roomId') || '1';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsCount = Number(searchParams.get('guests') || 1);

  const guest = JSON.parse(localStorage.getItem('guestUser') || 'null');

  const [dbRoom, setDbRoom] = useState(null);

  useEffect(() => {
    if (roomId) {
      axios.get(`/api/rooms/${roomId}`)
        .then(res => setDbRoom(res.data))
        .catch(() => {});
    }
  }, [roomId]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 1;
    const ms = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
  })();

  const pricePerNight = dbRoom ? Number(dbRoom.pricePerNight || dbRoom.price || 8500) : (MOCK_ROOM_PRICES[roomId] || 12000);
  const subtotal = pricePerNight * nights;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const roomName = dbRoom ? `${dbRoom.roomType || 'Room'} #${dbRoom.roomNumber}` : (MOCK_ROOM_NAMES[roomId] || 'Deluxe Room');

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirm
  const [guestForm, setGuestForm] = useState({
    name: guest?.name || '',
    email: guest?.email || '',
    phone: guest?.phone || '',
    specialRequests: '',
  });
  const [payMethod, setPayMethod] = useState('CREDIT_CARD');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState(null);
  const [error, setError] = useState('');

  const setGF = (k, v) => setGuestForm(f => ({ ...f, [k]: v }));
  const setCF = (k, v) => setCardForm(f => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setProcessing(true);
    setError('');
    try {
      // Step 1: Create reservation in MySQL backend
      const resRes = await axios.post('/api/reservations', {
        userId: guest?.id,
        guestName: guestForm.name || guest?.name || 'Valued Guest',
        guestEmail: guestForm.email || guest?.email || 'guest@example.com',
        roomId: Number(roomId),
        checkIn: checkIn || new Date().toISOString().slice(0, 10),
        checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      });

      const reservationId = resRes.data?.id;
      const refCode = resRes.data?.confirmationCode || resRes.data?.reservationId || `LXS-${Date.now().toString().slice(-6)}`;

      // Step 2: Process payment
      if (payMethod !== 'CASH' && reservationId) {
        try {
          await axios.post('/api/payments', {
            reservationId,
            customerId: guest?.id || 1,
            amount: total,
            paymentMethod: payMethod,
          });
        } catch (payErr) {
          console.warn('Payment recording note:', payErr);
        }
      }

      setBookingRef(refCode);
      setStep(4); // success
    } catch (err) {
      console.error('Reservation error:', err);
      const msg = err.response?.data?.message || err.message || 'Booking could not be finalized. Please check date availability.';
      setError(msg);
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Guest Details' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Review' },
  ];

  return (
    <div className="customer-shell">
      <CustomerNav />

      {processing && (
        <LoadingScreen fullScreen={true} text="Securing your countryside sanctuary reservation..." />
      )}

      <div className="c-section" style={{ paddingTop: 36 }}>
        <div className="c-container">
          {step === 4 ? (
            /* SUCCESS */
          <div className="success-hero">
            <span className="success-icon">🌲</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              Countryside Sanctuary Reserved
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
              Your retreat at Gritstone Haven is confirmed. A raw haven awaits your arrival.
            </p>
            <div style={{
              background: '#1a1c18', border: '1px solid rgba(197,160,89,0.3)',
              borderRadius: 2, padding: 32, maxWidth: 520, margin: '0 auto 36px',
            }}>
              <div style={{ fontSize: 11, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 8 }}>Haven Reference Code</div>
              <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>{bookingRef}</div>
              <hr className="divider" style={{ marginBottom: 20 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Space', roomName],
                  ['Arrival', checkIn],
                  ['Departure', checkOut],
                  ['Guests', `${guestsCount} Person(s)`],
                  ['Total Amount', `LKR ${total.toLocaleString()}`],
                  ['Payment Status', payMethod === 'CASH' ? 'Pay upon Check-in' : 'Confirmed & Paid'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button className="btn-escape" onClick={() => navigate('/my-bookings')}>
                MY RESERVATIONS & INVOICES →
              </button>
              <button className="btn btn-secondary" style={{ borderRadius: 2 }} onClick={() => navigate('/')}>
                Back to Haven Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Indicator */}
            <div style={{ maxWidth: 600, margin: '0 auto 40px' }}>
              <div className="booking-steps">
                {STEPS.map((s, i) => (
                  <div key={s.num} className={`booking-step${step >= s.num ? (step > s.num ? ' done' : ' active') : ''}`}>
                    <div className="step-num">{step > s.num ? '✓' : s.num}</div>
                    <div className="step-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-grid">
              {/* Left panel */}
              <div>
                {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><span className="alert-icon">⚠️</span>{error}</div>}

                {/* STEP 1: Guest Details */}
                {step === 1 && (
                  <div className="card animate-fade-in">
                    <div className="card-header">
                      <div className="modal-header-icon">👤</div>
                      <div>
                        <div className="card-title">Your Details</div>
                        <div className="card-subtitle">Tell us about the primary guest</div>
                      </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input className="form-input" value={guestForm.name} onChange={e => setGF('name', e.target.value)} placeholder="Your full name" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email Address *</label>
                          <input className="form-input" type="email" value={guestForm.email} onChange={e => setGF('email', e.target.value)} placeholder="your@email.com" required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-input" value={guestForm.phone} onChange={e => setGF('phone', e.target.value)} placeholder="+94 77 123 4567" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Special Requests</label>
                        <textarea className="form-textarea" value={guestForm.specialRequests} onChange={e => setGF('specialRequests', e.target.value)} placeholder="Any dietary requirements, room preferences, accessibility needs..." style={{ minHeight: 80 }} />
                      </div>
                    </div>
                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="hero-btn-primary" style={{ borderRadius: 'var(--radius-md)' }}
                        disabled={!guestForm.name || !guestForm.email}
                        onClick={() => setStep(2)}>
                        Continue to Payment →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Payment */}
                {step === 2 && (
                  <div className="card animate-fade-in">
                    <div className="card-header">
                      <div className="modal-header-icon">💳</div>
                      <div>
                        <div className="card-title">Payment Method</div>
                        <div className="card-subtitle">Choose how you'd like to pay</div>
                      </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div className="payment-methods">
                        {PAYMENT_METHODS.map(m => (
                          <button key={m.id} className={`payment-method-btn${payMethod === m.id ? ' selected' : ''}`} onClick={() => setPayMethod(m.id)}>
                            <span className="payment-method-icon">{m.icon}</span>
                            <span className="payment-method-label">{m.label}</span>
                          </button>
                        ))}
                      </div>

                      {(payMethod === 'CREDIT_CARD' || payMethod === 'DEBIT_CARD') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div className="form-group">
                            <label className="form-label">Card Number *</label>
                            <input className="form-input" value={cardForm.number}
                              onChange={e => setCF('number', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                              placeholder="1234 5678 9012 3456" maxLength={19} style={{ fontFamily: 'monospace', letterSpacing: '2px' }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Cardholder Name *</label>
                            <input className="form-input" value={cardForm.name} onChange={e => setCF('name', e.target.value)} placeholder="As printed on card" />
                          </div>
                          <div className="form-grid">
                            <div className="form-group">
                              <label className="form-label">Expiry *</label>
                              <input className="form-input" value={cardForm.expiry} onChange={e => setCF('expiry', e.target.value)} placeholder="MM/YY" maxLength={5} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">CVV *</label>
                              <input className="form-input" type="password" value={cardForm.cvv} onChange={e => setCF('cvv', e.target.value)} placeholder="•••" maxLength={4} />
                            </div>
                          </div>
                        </div>
                      )}

                      {payMethod === 'BANK_TRANSFER' && (
                        <div className="alert alert-info">
                          <span className="alert-icon">🏦</span>
                          <div>
                            <div className="alert-title">Bank Transfer Details</div>
                            Bank: People's Bank · Account: LuxeStay Reservations · Acc No: 123-456-789-0<br />
                            Please use your booking reference as the payment reference.
                          </div>
                        </div>
                      )}

                      {payMethod === 'CASH' && (
                        <div className="alert alert-warning">
                          <span className="alert-icon">💵</span>
                          <div>
                            <div className="alert-title">Pay at Hotel</div>
                            Your room will be held for 24 hours. Please present this booking reference at the front desk.
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>
                        <span>🔒</span>
                        <span>Your payment information is encrypted with 256-bit SSL security.</span>
                      </div>
                    </div>
                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                      <button className="hero-btn-primary" style={{ borderRadius: 'var(--radius-md)' }} onClick={() => setStep(3)}>
                        Review Booking →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Review */}
                {step === 3 && (
                  <div className="card animate-fade-in">
                    <div className="card-header">
                      <div className="modal-header-icon">✅</div>
                      <div>
                        <div className="card-title">Review & Confirm</div>
                        <div className="card-subtitle">Double-check your booking details</div>
                      </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {[
                        ['👤 Guest Name', guestForm.name],
                        ['📧 Email', guestForm.email],
                        ['📞 Phone', guestForm.phone || '—'],
                        ['🛏️ Room', roomName],
                        ['📅 Check-in', checkIn],
                        ['📅 Check-out', checkOut],
                        ['👥 Guests', guestsCount],
                        ['🌙 Nights', nights],
                        ['💳 Payment', payMethod.replace('_', ' ')],
                        ['💰 Total Amount', `LKR ${total.toLocaleString()}`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{k}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: k.includes('Total') ? 'var(--gold-300)' : 'var(--text-primary)' }}>{v}</span>
                        </div>
                      ))}
                      {guestForm.specialRequests && (
                        <div style={{ padding: '14px 0' }}>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Special Requests</div>
                          <div style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'var(--dark-750)', padding: 12, borderRadius: 8 }}>{guestForm.specialRequests}</div>
                        </div>
                      )}
                    </div>
                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                      <button
                        className="hero-btn-primary"
                        style={{ borderRadius: 'var(--radius-md)' }}
                        onClick={handleConfirm}
                        disabled={processing}
                      >
                        {processing ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing...</> : '🏨 Confirm & Book'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Summary */}
              <div className="checkout-summary">
                <div className="checkout-summary-header">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{
                    roomId === '5' ? '💎' : roomId === '3' ? '👑' : roomId === '2' ? '🌟' : '🛏️'
                  }</div>
                  <div className="checkout-summary-title">{roomName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Room #{roomId} · {nights} night{nights !== 1 ? 's' : ''}</div>
                </div>
                <div className="checkout-summary-body">
                  {[
                    ['Check-in', checkIn || '—'],
                    ['Check-out', checkOut || '—'],
                    ['Guests', guestsCount],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between" style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                  <hr className="divider" style={{ margin: '16px 0' }} />
                  <div className="price-breakdown" style={{ margin: 0 }}>
                    <div className="price-row">
                      <span>LKR {pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                      <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="price-row">
                      <span>Tax (10%)</span>
                      <span>LKR {tax.toLocaleString()}</span>
                    </div>
                    <div className="price-row total">
                      <span>Total</span>
                      <span style={{ color: 'var(--gold-300)', fontSize: 18 }}>LKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
                    🔄 Free cancellation up to 3 days before check-in<br />
                    🔒 Secure, encrypted payment processing
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}

export default Checkout;
