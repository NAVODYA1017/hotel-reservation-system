import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerNav, CustomerFooter } from './Home';
import { buffetApi } from '../../utils/buffetApi';
import {
  UtensilsCrossed, Calendar, Clock, Users, CheckCircle2, ShieldCheck,
  Sparkles, Coffee, Sun, Moon, AlertTriangle, ArrowRight, Printer, Search,
  Check, Info, ChevronRight, HeartHandshake, Award, CreditCard
} from 'lucide-react';

const DIETARY_OPTIONS = [
  'Standard Dining',
  'Vegetarian',
  'Vegan',
  'Halal Certified',
  'Gluten-Free',
  'Nut Allergy',
  'No Seafood',
  'Jain Friendly'
];

function BuffetReservation() {
  const navigate = useNavigate();
  const guestUser = JSON.parse(localStorage.getItem('guestUser') || 'null');

  // Form states
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedSession, setSelectedSession] = useState('DINNER');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [selectedDietary, setSelectedDietary] = useState(['Standard Dining']);
  const [specialNotes, setSpecialNotes] = useState('');
  const [guestName, setGuestName] = useState(guestUser?.name || '');
  const [guestEmail, setGuestEmail] = useState(guestUser?.email || '');
  const [guestPhone, setGuestPhone] = useState(guestUser?.phone || '');
  const [celebration, setCelebration] = useState('Casual Fine Dining');

  // API states
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const sessionsMeta = buffetApi.getSessionsMeta();

  // Load availability whenever selected date changes
  useEffect(() => {
    let isMounted = true;
    setLoadingAvailability(true);
    buffetApi.getAvailability(selectedDate)
      .then(res => {
        if (isMounted) setAvailability(res);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingAvailability(false);
      });
    return () => { isMounted = false; };
  }, [selectedDate]);

  // Set default slot when session changes
  useEffect(() => {
    const meta = sessionsMeta.find(s => s.mealSession === selectedSession);
    if (meta && meta.slots?.length > 0) {
      setSelectedSlot(meta.slots[0]);
    }
  }, [selectedSession]);

  const activeSessionMeta = sessionsMeta.find(s => s.mealSession === selectedSession) || sessionsMeta[0];
  const activeAvailability = availability.find(a => a.mealSession === selectedSession) || {
    remainingSeats: activeSessionMeta.maxCapacity,
    maxCapacity: activeSessionMeta.maxCapacity,
    isSoldOut: false
  };

  const adultPrice = activeSessionMeta.adultPrice;
  const childPrice = activeSessionMeta.childPrice;
  const totalAmount = adultPrice * adultCount + childPrice * childCount;
  const totalGuests = adultCount + childCount;

  const toggleDietary = (item) => {
    if (item === 'Standard Dining') {
      setSelectedDietary(['Standard Dining']);
      return;
    }
    const filtered = selectedDietary.filter(d => d !== 'Standard Dining');
    if (filtered.includes(item)) {
      const next = filtered.filter(d => d !== item);
      setSelectedDietary(next.length === 0 ? ['Standard Dining'] : next);
    } else {
      setSelectedDietary([...filtered, item]);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!guestEmail.trim()) {
      setErrorMsg('Please enter a valid email address for confirmation.');
      return;
    }

    if (totalGuests > activeAvailability.remainingSeats) {
      setErrorMsg(`Sorry, only ${activeAvailability.remainingSeats} seat(s) remaining for ${activeSessionMeta.sessionTitle} on ${selectedDate}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        reservationDate: selectedDate,
        mealSession: selectedSession,
        timeSlot: selectedSlot || activeSessionMeta.timeRange,
        adultCount,
        childCount,
        specialDietary: `${selectedDietary.join(', ')}${specialNotes ? ` | Note: ${specialNotes}` : ''}${celebration ? ` | Occasion: ${celebration}` : ''}`
      };

      const res = await buffetApi.createReservation(payload);
      setConfirmedReservation(res);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to complete buffet booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToOnlinePayment = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!guestEmail.trim()) {
      setErrorMsg('Please enter a valid email address for confirmation.');
      return;
    }

    if (totalGuests > activeAvailability.remainingSeats) {
      setErrorMsg(`Sorry, only ${activeAvailability.remainingSeats} seat(s) remaining for ${activeSessionMeta.sessionTitle} on ${selectedDate}.`);
      return;
    }

    const queryParams = new URLSearchParams({
      type: 'BUFFET',
      session: selectedSession,
      title: activeSessionMeta.sessionTitle,
      date: selectedDate,
      slot: selectedSlot || activeSessionMeta.timeRange,
      adults: String(adultCount),
      children: String(childCount),
      amount: String(totalAmount),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      dietary: `${selectedDietary.join(', ')}${specialNotes ? ` | Note: ${specialNotes}` : ''}${celebration ? ` | Occasion: ${celebration}` : ''}`
    });

    navigate(`/checkout?${queryParams.toString()}`);
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await buffetApi.verifyCode(lookupCode.trim());
      setLookupResult(res);
    } catch (err) {
      setLookupError(err.message || 'No reservation found for this reference code.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="customer-page" style={{ background: '#0e0f0d', color: '#f3f4f1', minHeight: '100vh' }}>
      <CustomerNav />

      {/* ── HERO BANNER ── */}
      <section style={{
        position: 'relative',
        minHeight: '48vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 60px',
        background: `linear-gradient(180deg, rgba(14,15,13,0.4) 0%, rgba(14,15,13,0.95) 100%), url('/assets/images/dining/restaurant_ambience.jpg') center/cover no-repeat`
      }}>
        <div style={{ maxWidth: 840, zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(197, 160, 89, 0.15)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            marginBottom: 16
          }}>
            <Sparkles size={14} color="var(--gold-400, #c5a059)" />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-400, #c5a059)', textTransform: 'uppercase' }}>
              The Alaka Culinary Sanctuary
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            margin: '0 0 16px',
            color: '#ffffff'
          }}>
            Gourmet Buffet Dining Experience
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            lineHeight: 1.6,
            maxWidth: 680,
            margin: '0 auto 24px'
          }}>
            Immerse yourself in authentic Ceylon spices, live cooking stations, and international gastronomy overlooking the iconic Sigiriya rock fortress. Limited slots preserved for supreme dining comfort.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--gold-300, #d4af37)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Award size={15} /> 5-Star Chef Curated</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={15} /> Limited Slot Guarantees</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><HeartHandshake size={15} /> Dedicated Front Desk Check-in</span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* CONFIRMATION PASS POPUP / SUCCESS BANNER */}
        {confirmedReservation && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(20,22,18,0.98), rgba(28,30,24,0.98))',
            border: '2px solid var(--gold-400, #c5a059)',
            borderRadius: 16,
            padding: '32px',
            marginBottom: 48,
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} color="#22c55e" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f3f4f1' }}>Buffet Reservation Confirmed!</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary, #9ca3af)' }}>
                  Your table reservation has been saved in the resort management database.
                </p>
              </div>
            </div>

            {/* GOLD DIGITAL DINING PASS */}
            <div style={{
              background: '#ffffff',
              color: '#1a1a18',
              borderRadius: 12,
              padding: '24px 28px',
              borderLeft: '8px solid var(--gold-500, #ad8742)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              marginBottom: 20
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#9e7d3b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Confirmation Reference
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: '#111827', marginTop: 4 }}>
                  {confirmedReservation.confirmationCode}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  Guest: <strong>{confirmedReservation.guestName}</strong>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Session & Time</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 4 }}>
                  {activeSessionMeta.sessionTitle}
                </div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>
                  {confirmedReservation.reservationDate} &bull; {confirmedReservation.timeSlot}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Party Size & Status</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 4 }}>
                  {confirmedReservation.numberOfGuests} Guests ({confirmedReservation.adultCount} Adults{confirmedReservation.childCount > 0 ? `, ${confirmedReservation.childCount} Children` : ''})
                </div>
                <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                  STATUS: {confirmedReservation.status}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Total & Payment Status</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#9e7d3b', marginTop: 4 }}>
                  LKR {Number(confirmedReservation.totalAmount || 0).toLocaleString()}
                </div>
                <div style={{ marginTop: 4 }}>
                  {confirmedReservation.paymentStatus === 'SUCCESS' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> PAID ONLINE ({confirmedReservation.paymentMethod || 'CARD'})
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700 }}>
                      PAYMENT PENDING
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
                  {confirmedReservation.paymentStatus === 'SUCCESS'
                    ? `Ref: ${confirmedReservation.transactionReference || confirmedReservation.confirmationCode}`
                    : 'Payable at reception or settle online below'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>
                &bull; Please present this pass <strong>{confirmedReservation.confirmationCode}</strong> upon arrival at The Alaka Restaurant.
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {confirmedReservation.paymentStatus !== 'SUCCESS' && (
                  <button
                    onClick={() => {
                      const q = new URLSearchParams({
                        type: 'BUFFET',
                        buffetCode: confirmedReservation.confirmationCode,
                        session: confirmedReservation.mealSession,
                        title: activeSessionMeta.sessionTitle,
                        date: confirmedReservation.reservationDate,
                        slot: confirmedReservation.timeSlot || '',
                        adults: String(confirmedReservation.adultCount),
                        children: String(confirmedReservation.childCount),
                        amount: String(confirmedReservation.totalAmount),
                        guestName: confirmedReservation.guestName,
                        guestEmail: confirmedReservation.guestEmail || '',
                        guestPhone: confirmedReservation.guestPhone || ''
                      });
                      navigate(`/checkout?${q.toString()}`);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'linear-gradient(135deg, var(--gold-400), var(--gold-500))',
                      color: '#000',
                      fontWeight: 700
                    }}
                  >
                    <CreditCard size={15} /> Pay Online via Checkout &rarr;
                  </button>
                )}
                <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={15} /> Print Pass
                </button>
                <button onClick={() => setConfirmedReservation(null)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Reserve Another Slot &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: CHOOSE MEAL SESSION CARDS ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400, #c5a059)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Step 1 of 3
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, fontFamily: "'Cinzel', serif" }}>
                Select Your Dining Session
              </h2>
            </div>

            {/* Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#191b17', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Calendar size={18} color="var(--gold-400)" />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>Dining Date:</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  background: '#0d0f0c',
                  border: '1px solid var(--border-gold, #c5a059)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20
          }}>
            {sessionsMeta.map(session => {
              const isSelected = selectedSession === session.mealSession;
              const avail = availability.find(a => a.mealSession === session.mealSession) || {
                remainingSeats: session.maxCapacity,
                bookedSeats: 0,
                maxCapacity: session.maxCapacity,
                isSoldOut: false
              };
              const pctBooked = Math.round((avail.bookedSeats / avail.maxCapacity) * 100);
              const isAlmostFull = avail.remainingSeats <= 15 && avail.remainingSeats > 0;

              return (
                <div
                  key={session.mealSession}
                  onClick={() => !avail.isSoldOut && setSelectedSession(session.mealSession)}
                  style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: isSelected ? 'rgba(197, 160, 89, 0.08)' : '#161814',
                    border: isSelected ? '2px solid var(--gold-400, #c5a059)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? '0 8px 30px rgba(197, 160, 89, 0.25)' : 'none',
                    cursor: avail.isSoldOut ? 'not-allowed' : 'pointer',
                    opacity: avail.isSoldOut ? 0.6 : 1,
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: 160 }}>
                    <img
                      src={session.image}
                      alt={session.sessionTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(6px)',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <Clock size={13} color="var(--gold-400)" />
                      {session.timeRange}
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      background: 'rgba(197, 160, 89, 0.95)',
                      color: '#0d0f0c',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 800
                    }}>
                      LKR {session.adultPrice.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 500 }}>/ adult</span>
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                        {session.sessionTitle}
                      </h3>
                      {isSelected && (
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'var(--gold-400, #c5a059)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Check size={14} color="#000" />
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--text-secondary, #9ca3af)', margin: '0 0 16px', lineHeight: 1.5, flex: 1 }}>
                      {session.description}
                    </p>

                    {/* Capacity Indicator */}
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: '#aaa', fontWeight: 500 }}>Table Capacity Pacing</span>
                        <span style={{
                          fontWeight: 700,
                          color: avail.isSoldOut ? '#ef4444' : isAlmostFull ? '#f59e0b' : '#22c55e'
                        }}>
                          {avail.isSoldOut ? 'Sold Out' : `${avail.remainingSeats} seats left`}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#2a2c26', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pctBooked}%`,
                          height: '100%',
                          background: avail.isSoldOut ? '#ef4444' : isAlmostFull ? '#f59e0b' : 'var(--gold-400, #c5a059)',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 2 & 3: FORM DETAILS & GUEST SUMMARY ── */}
        <form onSubmit={handleBookingSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 28,
          background: '#141613',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 32px',
          boxShadow: '0 10px 32px rgba(0,0,0,0.4)'
        }}>

          {/* Left Column: Reservation Parameters */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400, #c5a059)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Step 2 of 3
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px', fontFamily: "'Cinzel', serif", color: '#ffffff' }}>
              Seating & Guest Demographics
            </h3>

            {/* Time Slot Picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 8 }}>
                Preferred Arrival Window:
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {activeSessionMeta.slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: selectedSlot === slot ? '1px solid var(--gold-400, #c5a059)' : '1px solid rgba(255,255,255,0.12)',
                      background: selectedSlot === slot ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.04)',
                      color: selectedSlot === slot ? 'var(--gold-400, #c5a059)' : '#ccc'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Party Size Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#1c1e19', padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, textTransform: 'uppercase' }}>Adults (12+ yrs)</div>
                <div style={{ fontSize: 11, color: 'var(--gold-400)' }}>LKR {adultPrice.toLocaleString()} ea</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 32, height: 32, padding: 0 }}
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                  >-</button>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{adultCount}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 32, height: 32, padding: 0 }}
                    onClick={() => setAdultCount(Math.min(activeAvailability.remainingSeats - childCount, adultCount + 1))}
                  >+</button>
                </div>
              </div>

              <div style={{ background: '#1c1e19', padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, textTransform: 'uppercase' }}>Children (Under 12)</div>
                <div style={{ fontSize: 11, color: '#22c55e' }}>50% Off &bull; LKR {childPrice.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 32, height: 32, padding: 0 }}
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                  >-</button>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{childCount}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 32, height: 32, padding: 0 }}
                    onClick={() => setChildCount(Math.min(activeAvailability.remainingSeats - adultCount, childCount + 1))}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Dietary Preferences Tags */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 8 }}>
                Dietary & Allergen Preferences:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIETARY_OPTIONS.map(opt => {
                  const active = selectedDietary.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleDietary(opt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: active ? '1px solid var(--gold-400, #c5a059)' : '1px solid rgba(255,255,255,0.1)',
                        background: active ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: active ? 'var(--gold-400, #c5a059)' : '#9ca3af'
                      }}
                    >
                      {active && <Check size={11} style={{ display: 'inline', marginRight: 4 }} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Occasion */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 6 }}>
                Dining Occasion:
              </label>
              <select
                value={celebration}
                onChange={e => setCelebration(e.target.value)}
                style={{
                  width: '100%',
                  background: '#191b17',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13
                }}
              >
                <option value="Casual Fine Dining">Casual Fine Dining</option>
                <option value="Birthday Celebration">Birthday Celebration (Candle Dessert)</option>
                <option value="Anniversary Dinner">Anniversary Celebration</option>
                <option value="Corporate / Business Meal">Corporate / Business Dining</option>
                <option value="Family Holiday Reunion">Family Holiday Reunion</option>
              </select>
            </div>
          </div>

          {/* Right Column: Guest Details & Bill Summary */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400, #c5a059)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Step 3 of 3
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px', fontFamily: "'Cinzel', serif", color: '#ffffff' }}>
              Guest Contact & Reservation Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  style={{ width: '100%', background: '#1c1e19', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kasun@example.com"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    style={{ width: '100%', background: '#1c1e19', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    style={{ width: '100%', background: '#1c1e19', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Chef's Special Note / Seating Preference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quiet corner table overlooking pool, high chair needed for toddler..."
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  style={{ width: '100%', background: '#1c1e19', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 13, resize: 'none' }}
                />
              </div>
            </div>

            {/* Price Calculation Card */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid rgba(197, 160, 89, 0.25)',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#ccc' }}>
                <span>{adultCount} Adult(s) &times; LKR {adultPrice.toLocaleString()}</span>
                <span>LKR {(adultCount * adultPrice).toLocaleString()}</span>
              </div>
              {childCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#ccc' }}>
                  <span>{childCount} Child(ren) &times; LKR {childPrice.toLocaleString()}</span>
                  <span>LKR {(childCount * childPrice).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12, color: 'var(--text-muted)' }}>
                <span>Taxes, Resort Surcharges & Service Charge</span>
                <span style={{ color: '#22c55e' }}>Included</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Total Payable Amount:</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold-400, #c5a059)' }}>
                  LKR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Primary: Online Payment via Checkout */}
              <button
                type="button"
                onClick={handleProceedToOnlinePayment}
                disabled={activeAvailability.isSoldOut}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontWeight: 700,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, var(--gold-400, #c5a059), var(--gold-500, #ad8742))',
                  color: '#0d0f0c',
                  justifyContent: 'center',
                  boxShadow: '0 4px 18px rgba(197, 160, 89, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: activeAvailability.isSoldOut ? 'not-allowed' : 'pointer'
                }}
              >
                {activeAvailability.isSoldOut ? (
                  'Slot Sold Out for Selected Date'
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Proceed to Online Payment (Card / Bank Transfer)</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Secondary: Reserve without paying now (Pay at restaurant) */}
              <button
                type="submit"
                disabled={submitting || activeAvailability.isSoldOut}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  fontWeight: 600,
                  fontSize: 13,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#e5e7eb',
                  justifyContent: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>Securing Table...</span>
                  </>
                ) : (
                  <>
                    <span>Reserve & Pay at Restaurant (Cash / Room Charge)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── LOOKUP EXISTING DINING PASS SECTION ── */}
        <section style={{
          marginTop: 64,
          padding: '32px',
          background: '#131512',
          borderRadius: 14,
          border: '1px dashed rgba(197, 160, 89, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Search size={20} color="var(--gold-400)" />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
              Already Have a Buffet Reservation? Lookup Your Digital Pass
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
            Enter your <strong>BUF-...</strong> confirmation code to retrieve your digital dining ticket or check your verification status.
          </p>

          <form onSubmit={handleLookup} style={{ display: 'flex', gap: 12, maxWidth: 540 }}>
            <input
              type="text"
              placeholder="e.g. BUF-20261006-4821"
              value={lookupCode}
              onChange={e => setLookupCode(e.target.value)}
              style={{
                flex: 1,
                background: '#0a0b09',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'monospace'
              }}
            />
            <button type="submit" disabled={lookupLoading} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {lookupLoading ? 'Checking...' : 'View Pass'}
            </button>
          </form>

          {lookupError && (
            <div style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{lookupError}</div>
          )}

          {lookupResult && (
            <div style={{
              marginTop: 20,
              padding: '18px 24px',
              borderRadius: 10,
              background: '#191c17',
              border: '1px solid var(--gold-400)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lookupResult.confirmationCode}
                </span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                  {lookupResult.guestName} &bull; {lookupResult.mealSession}
                </div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  Date: {lookupResult.reservationDate} &bull; Time: {lookupResult.timeSlot} &bull; Guests: {lookupResult.numberOfGuests}
                </div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {lookupResult.paymentStatus === 'SUCCESS' ? (
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700 }}>
                      ✓ PAID ONLINE ({lookupResult.paymentMethod || 'CARD'})
                    </span>
                  ) : (
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700 }}>
                      PAYMENT PENDING
                    </span>
                  )}
                  {lookupResult.paymentStatus !== 'SUCCESS' && (
                    <button
                      onClick={() => {
                        const q = new URLSearchParams({
                          type: 'BUFFET',
                          buffetCode: lookupResult.confirmationCode,
                          session: lookupResult.mealSession,
                          title: activeSessionMeta.sessionTitle,
                          date: lookupResult.reservationDate,
                          slot: lookupResult.timeSlot || '',
                          adults: String(lookupResult.adultCount || 1),
                          children: String(lookupResult.childCount || 0),
                          amount: String(lookupResult.totalAmount || 0),
                          guestName: lookupResult.guestName,
                          guestEmail: lookupResult.guestEmail || '',
                          guestPhone: lookupResult.guestPhone || ''
                        });
                        navigate(`/checkout?${q.toString()}`);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <CreditCard size={12} /> Pay Online Now &rarr;
                    </button>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  background: lookupResult.status === 'CHECKED_IN' ? '#22c55e' : '#c5a059',
                  color: '#000'
                }}>
                  {lookupResult.status}
                </span>
                {lookupResult.tableNumber && (
                  <div style={{ fontSize: 12, color: 'var(--gold-300)', marginTop: 4 }}>
                    Table: <strong>{lookupResult.tableNumber}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </main>

      <CustomerFooter />
    </div>
  );
}

export default BuffetReservation;
