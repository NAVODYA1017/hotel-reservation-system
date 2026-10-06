import { useState, useEffect } from 'react';
import { buffetApi } from '../utils/buffetApi';
import LoadingScreen from '../components/LoadingScreen';
import {
  UtensilsCrossed, Calendar, Search, CheckCircle2, Clock, Users,
  Plus, AlertCircle, RefreshCw, X, ShieldCheck, Tag, Coffee, Sun, Moon,
  Check, Filter, UserCheck, ChevronRight
} from 'lucide-react';

const SESSIONS = [
  { key: 'ALL', label: 'All Sessions' },
  { key: 'BREAKFAST', label: 'Sunrise Breakfast (06:30 - 10:30)' },
  { key: 'LUNCH', label: 'Spice Lunch (12:30 - 15:30)' },
  { key: 'DINNER', label: 'Grand Seafood Dinner (19:00 - 22:30)' },
];

function FrontDeskBuffet() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSession, setSelectedSession] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reservations, setReservations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check-In Modal state
  const [checkInModalItem, setCheckInModalItem] = useState(null);
  const [assignedTable, setAssignedTable] = useState('');
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);

  // Walk-in Booking Modal state
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInGuestName, setWalkInGuestName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInSession, setWalkInSession] = useState('DINNER');
  const [walkInAdults, setWalkInAdults] = useState(2);
  const [walkInChildren, setWalkInChildren] = useState(0);
  const [walkInTable, setWalkInTable] = useState('');
  const [walkInDietary, setWalkInDietary] = useState('Standard Dining');
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);

  // Direct Verify State
  const [directCode, setDirectCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState(null);

  const fetchBuffetData = async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, availRes] = await Promise.all([
        buffetApi.getAllReservations({
          date: selectedDate,
          session: selectedSession !== 'ALL' ? selectedSession : undefined,
          search: searchQuery || undefined
        }),
        buffetApi.getAvailability(selectedDate)
      ]);
      setReservations(listRes);
      setAvailability(availRes);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch buffet reservations. Using local fallback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuffetData();
  }, [selectedDate, selectedSession]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBuffetData();
  };

  // Quick Verification By Code
  const handleDirectCodeVerify = async (e) => {
    e.preventDefault();
    if (!directCode.trim()) return;
    setVerifyMessage(null);
    try {
      const found = await buffetApi.verifyCode(directCode.trim());
      setVerifyMessage({ type: 'success', data: found });
      // Open check-in modal directly for this guest!
      setCheckInModalItem(found);
      setAssignedTable(found.tableNumber || '');
    } catch (err) {
      setVerifyMessage({ type: 'error', text: err.message || 'Confirmation code not found.' });
    }
  };

  // Confirm Check-In
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!checkInModalItem) return;
    setCheckInSubmitting(true);
    try {
      await buffetApi.checkInGuest(checkInModalItem.id, assignedTable);
      setCheckInModalItem(null);
      setAssignedTable('');
      fetchBuffetData();
    } catch (err) {
      alert('Failed to check in guest: ' + (err.message || 'Error'));
    } finally {
      setCheckInSubmitting(false);
    }
  };

  // Create Walk-in Reservation
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setWalkInSubmitting(true);
    try {
      await buffetApi.createWalkIn({
        guestName: walkInGuestName.trim(),
        guestEmail: walkInEmail.trim() || 'walkin@aliya.com',
        guestPhone: walkInPhone.trim(),
        reservationDate: selectedDate,
        mealSession: walkInSession,
        adultCount: walkInAdults,
        childCount: walkInChildren,
        specialDietary: walkInDietary,
        tableNumber: walkInTable.trim()
      });
      setWalkInModalOpen(false);
      setWalkInGuestName('');
      setWalkInEmail('');
      setWalkInPhone('');
      setWalkInTable('');
      fetchBuffetData();
    } catch (err) {
      alert('Walk-in booking error: ' + (err.message || 'Failed'));
    } finally {
      setWalkInSubmitting(false);
    }
  };

  // Cancel reservation
  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this buffet reservation?')) return;
    try {
      await buffetApi.cancelReservation(id);
      fetchBuffetData();
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 8px 32px' }}>

      {/* ── TOP HEADER & ACTIONS ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(201,160,48,0.15) 0%, rgba(22,23,20,0.98) 60%), #141613',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid rgba(201,160,48,0.25)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--gold-400)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            <UtensilsCrossed size={14} /> Front Desk &bull; Dining & Buffet Desk
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, fontFamily: "'Cinzel', serif", color: '#fff' }}>
            Alaka Buffet Reception & Seat Allocation
          </h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: 13, margin: '4px 0 0' }}>
            Verify online guest dining vouchers, manage table allocations, and create instant walk-in reservations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setWalkInModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--gold-400, #c5a059), var(--gold-500, #ad8742))',
              color: '#0d0f0c'
            }}
          >
            <Plus size={16} /> New Walk-In Booking
          </button>
          <button
            onClick={fetchBuffetData}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ── QUICK SCAN / CODE LOOKUP STRIP ── */}
      <div style={{
        background: '#191b17',
        border: '1px solid rgba(197, 160, 89, 0.3)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(197,160,89,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={18} color="var(--gold-400)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Quick Check-In Verification</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Type or scan customer dining pass reference code</div>
          </div>
        </div>

        <form onSubmit={handleDirectCodeVerify} style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 440 }}>
          <input
            type="text"
            placeholder="e.g. BUF-20261006-1234"
            value={directCode}
            onChange={e => setDirectCode(e.target.value)}
            style={{
              flex: 1,
              background: '#0d0f0c',
              border: '1px solid var(--border-gold, #c5a059)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'monospace'
            }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 16px', fontWeight: 600 }}>
            Verify & Check-In
          </button>
        </form>

        {verifyMessage && (
          <div style={{
            fontSize: 12,
            color: verifyMessage.type === 'success' ? '#22c55e' : '#ef4444',
            width: '100%'
          }}>
            {verifyMessage.type === 'success'
              ? `Found reservation for ${verifyMessage.data.guestName} (${verifyMessage.data.mealSession})`
              : verifyMessage.text}
          </div>
        )}
      </div>

      {/* ── REAL-TIME SESSION CAPACITY CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {availability.map(avail => {
          const isSelected = selectedSession === avail.mealSession;
          const checkedInCount = reservations.filter(
            r => r.mealSession === avail.mealSession && r.status === 'CHECKED_IN'
          ).reduce((sum, r) => sum + r.numberOfGuests, 0);

          return (
            <div
              key={avail.mealSession}
              onClick={() => setSelectedSession(selectedSession === avail.mealSession ? 'ALL' : avail.mealSession)}
              style={{
                background: isSelected ? 'rgba(197, 160, 89, 0.1)' : '#161814',
                border: isSelected ? '1px solid var(--gold-400)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {avail.sessionTitle?.split(' ')[0] || avail.mealSession}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{avail.timeRange}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                    {avail.bookedSeats} <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>/ {avail.maxCapacity}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#22c55e' }}>{avail.remainingSeats} Seats Available</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-400)' }}>
                    {checkedInCount}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase' }}>In-House Dining</div>
                </div>
              </div>

              <div style={{ width: '100%', height: 4, background: '#222', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (avail.bookedSeats / avail.maxCapacity) * 100)}%`,
                  height: '100%',
                  background: 'var(--gold-400)'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FILTER & DATE BAR ── */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="var(--gold-400)" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  background: '#191b17',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {SESSIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSelectedSession(s.key)}
                  className={`btn btn-xs ${selectedSession === s.key ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '5px 10px' }}
                >
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search name, phone, ref, table..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: '#191b17',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                width: 220
              }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '4px 12px' }}>
              Filter
            </button>
          </form>

        </div>
      </div>

      {/* ── RESERVATIONS TABLE ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest Details</th>
                <th>Session & Arrival</th>
                <th>Party Count</th>
                <th>Special Dietary / Notes</th>
                <th>Assigned Table</th>
                <th>Status</th>
                <th>Receptionist Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    Loading buffet reservations...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No buffet reservations found for {selectedDate}. Use "New Walk-In Booking" to create one.
                  </td>
                </tr>
              ) : (
                reservations.map(res => {
                  const isCheckedIn = res.status === 'CHECKED_IN';
                  const isCancelled = res.status === 'CANCELLED';

                  return (
                    <tr key={res.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-400)' }}>
                          {res.confirmationCode}
                        </span>
                        <div style={{ fontSize: 10, color: '#777' }}>
                          {res.bookedBy === 'RECEPTIONIST_WALKIN' ? 'Walk-in' : 'Online Booking'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{res.guestName}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{res.guestPhone || res.guestEmail}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#ddd' }}>{res.mealSession}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{res.timeSlot}</div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{res.numberOfGuests} Guests</span>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {res.adultCount} Adult{res.childCount > 0 ? `, ${res.childCount} Child` : ''}
                        </div>
                      </td>

                      <td style={{ maxWidth: 180 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {res.specialDietary || 'Standard Dining'}
                        </span>
                      </td>

                      <td>
                        {res.tableNumber ? (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: 'rgba(197, 160, 89, 0.2)',
                            color: 'var(--gold-400)',
                            fontWeight: 700,
                            fontSize: 12
                          }}>
                            {res.tableNumber}
                          </span>
                        ) : (
                          <span style={{ color: '#666', fontStyle: 'italic', fontSize: 12 }}>Unassigned</span>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${
                          isCheckedIn ? 'badge-success' : isCancelled ? 'badge-error' : 'badge-warning'
                        }`}>
                          {res.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!isCheckedIn && !isCancelled && (
                            <button
                              onClick={() => {
                                setCheckInModalItem(res);
                                setAssignedTable(res.tableNumber || '');
                              }}
                              className="btn btn-primary btn-xs"
                              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
                            >
                              Check-In
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelReservation(res.id)}
                              className="btn btn-outline btn-xs"
                              style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                            >
                              Cancel
                            </button>
                          )}
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

      {/* ── CHECK-IN MODAL ── */}
      {checkInModalItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: '#161814',
            border: '1px solid var(--gold-400)',
            borderRadius: 14,
            padding: '24px 28px',
            maxWidth: 460,
            width: '100%',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={20} color="var(--gold-400)" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>Guest Check-In</h3>
              </div>
              <button onClick={() => setCheckInModalItem(null)} className="btn btn-ghost btn-xs" style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ background: '#1c1e19', padding: '14px 16px', borderRadius: 8, marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700 }}>
                {checkInModalItem.confirmationCode}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                {checkInModalItem.guestName}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                Session: {checkInModalItem.mealSession} &bull; Guests: {checkInModalItem.numberOfGuests}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                Dietary: {checkInModalItem.specialDietary || 'Standard'}
              </div>
            </div>

            <form onSubmit={handleCheckInSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#ccc', marginBottom: 6, fontWeight: 600 }}>
                  Assign Restaurant Table Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 12, Terrace 4, Pavilion A"
                  value={assignedTable}
                  onChange={e => setAssignedTable(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d0f0c',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCheckInModalItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkInSubmitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  {checkInSubmitting ? 'Checking in...' : 'Confirm Seat Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WALK-IN BOOKING MODAL ── */}
      {walkInModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: '#161814',
            border: '1px solid var(--gold-400)',
            borderRadius: 14,
            padding: '28px 32px',
            maxWidth: 520,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={20} color="var(--gold-400)" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>New Walk-In Buffet Booking</h3>
              </div>
              <button onClick={() => setWalkInModalOpen(false)} className="btn btn-ghost btn-xs" style={{ padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Guest Full Name or Resident Room *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 204 - Mr. Perera"
                  value={walkInGuestName}
                  onChange={e => setWalkInGuestName(e.target.value)}
                  style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Meal Session</label>
                  <select
                    value={walkInSession}
                    onChange={e => setWalkInSession(e.target.value)}
                    style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                  >
                    <option value="BREAKFAST">Sunrise Breakfast</option>
                    <option value="LUNCH">Spice Lunch</option>
                    <option value="DINNER">Grand Seafood Dinner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Table Allocation</label>
                  <input
                    type="text"
                    placeholder="e.g. Table 08"
                    value={walkInTable}
                    onChange={e => setWalkInTable(e.target.value)}
                    style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={walkInAdults}
                    onChange={e => setWalkInAdults(Number(e.target.value))}
                    style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Children (under 12)</label>
                  <input
                    type="number"
                    min="0"
                    value={walkInChildren}
                    onChange={e => setWalkInChildren(Number(e.target.value))}
                    style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Contact Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+94 77 000 0000"
                    value={walkInPhone}
                    onChange={e => setWalkInPhone(e.target.value)}
                    style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 4 }}>Dietary Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian, Halal"
                    value={walkInDietary}
                    onChange={e => setWalkInDietary(e.target.value)}
                    style={{ width: '100%', background: '#0d0f0c', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setWalkInModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkInSubmitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  {walkInSubmitting ? 'Creating...' : 'Create & Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default FrontDeskBuffet;
