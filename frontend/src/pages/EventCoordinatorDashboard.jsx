import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import {
  Sparkles, Calendar, Users, Package, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Plus, MapPin, DollarSign,
  ArrowUpRight, Building2, Tag, Layers, Filter
} from 'lucide-react';

const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CHECKED_IN: 'badge-info',
  CHECKED_OUT: 'badge-muted',
  CANCELLED: 'badge-error',
  AVAILABLE: 'badge-success',
  UNAVAILABLE: 'badge-error',
};

function EventCoordinatorDashboard() {
  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('upcoming'); // 'upcoming', 'all'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('/api/event-halls', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/packages', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/reservations', { headers }).catch(() => ({ data: [] })),
    ])
      .then(([hallsRes, pkgsRes, resRes]) => {
        setHalls(Array.isArray(hallsRes.data) ? hallsRes.data : []);
        setPackages(Array.isArray(pkgsRes.data) ? pkgsRes.data : []);
        
        // Filter reservations that are event hall bookings or general bookings
        const allRes = Array.isArray(resRes.data) ? resRes.data : [];
        setReservations(allRes);
      })
      .catch(err => {
        console.error('Error loading event coordinator data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen text="Loading Event Coordinator Portal..." />;
  }

  // Calculate metrics
  const totalHalls = halls.length;
  const availableHalls = halls.filter(h => h.available !== false).length;
  const totalCapacity = halls.reduce((sum, h) => sum + (Number(h.seatingCapacity) || 0), 0);
  const totalPackages = packages.length;

  // Filter event reservations (either have hallId/hallName or all recent reservations)
  const eventReservations = reservations.filter(r => r.hallId || r.hallName);
  const displayEvents = eventReservations.length > 0 ? eventReservations : reservations.slice(0, 6);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = displayEvents.filter(r => !r.checkIn || r.checkIn >= today);

  return (
    <div className="animate-fade-in" style={{ padding: '0 4px 32px' }}>
      {/* ── HERO BANNER ── */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(201,160,48,0.18) 0%, rgba(20,20,18,0.95) 70%), #141412',
        border: '1px solid rgba(201,160,48,0.25)',
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(201,160,48,0.15)', border: '1px solid rgba(201,160,48,0.3)', marginBottom: 12 }}>
            <Sparkles size={14} color="var(--gold-400, #c5a059)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-400, #c5a059)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Banquet & Event Operations
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f3f4f6', margin: '0 0 6px', fontFamily: "'Cinzel', serif" }}>
            Event Coordinator Portal
          </h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: 14, margin: 0, maxWidth: 640 }}>
            Oversee grand ballrooms, garden pavilions, luxury catering packages, and gala reservations for Aliya Resort.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/events-admin/halls')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 600 }}
          >
            <Building2 size={16} />
            Manage Halls & Spaces
          </button>
          <button
            onClick={() => navigate('/events-admin/reservations')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 500 }}
          >
            <Calendar size={16} />
            Event Bookings
          </button>
        </div>
      </div>

      {/* ── METRIC STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        <div className="card" style={{ padding: '20px 22px', borderLeft: '3px solid var(--gold-400, #c5a059)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Event Spaces
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(201,160,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="var(--gold-400)" />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>{totalHalls}</div>
          <div style={{ fontSize: 12, color: 'var(--success, #22c55e)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} />
            <span>{availableHalls} Ready for Immediate Booking</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px', borderLeft: '3px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Banquet Capacity
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#60a5fa" />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>{totalCapacity.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Maximum concurrent guests
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px', borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Catering & Packages
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="#a78bfa" />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>{totalPackages}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Curated wedding & corporate tiers
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px', borderLeft: '3px solid #ec4899' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Scheduled Banquets
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(236,72,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="#f472b6" />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>{upcomingEvents.length}</div>
          <div style={{ fontSize: 12, color: 'var(--gold-400)', marginTop: 4 }}>
            Upcoming gala & event reservations
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT TWO-COLUMN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24, marginBottom: 28 }}>
        
        {/* LEFT COLUMN: EVENT HALLS OVERVIEW */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Resort Event Venues & Halls
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Live capacity and readiness status of luxury event spaces
              </p>
            </div>
            <button
              onClick={() => navigate('/events-admin/halls')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              Manage All <ArrowUpRight size={14} style={{ marginLeft: 4 }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {halls.slice(0, 4).map(hall => (
              <div
                key={hall.id}
                style={{
                  background: 'var(--dark-800, #1c1d1a)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                  borderRadius: 'var(--radius-md, 8px)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/events-admin/halls')}
              >
                <div style={{ height: 120, position: 'relative', background: '#262722' }}>
                  <img
                    src={hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80'}
                    alt={hall.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: hall.available !== false ? 'rgba(34, 197, 94, 0.85)' : 'rgba(239, 68, 68, 0.85)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {hall.available !== false ? 'Available' : 'Reserved'}
                  </div>
                </div>

                <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    {hall.name}
                  </h3>
                  <p style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    margin: '0 0 12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}>
                    {hall.description || 'Premium banquet hall equipped with ambient lighting and acoustics.'}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={14} /> {hall.seatingCapacity || 100} Guests
                    </span>
                    <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>
                      ${hall.pricePerEvent ? Number(hall.pricePerEvent).toLocaleString() : '500'}/event
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {halls.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>No event halls found in the database.</p>
              <button onClick={() => navigate('/events-admin/halls')} className="btn btn-outline btn-sm">
                Create First Hall
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EVENT CATERING & PACKAGES */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Event & Catering Packages
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Curated dining and decoration packages
              </p>
            </div>
            <button
              onClick={() => navigate('/events-admin/halls')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {packages.slice(0, 4).map(pkg => (
              <div
                key={pkg.id}
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'var(--dark-800, #1c1d1a)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'rgba(201,160,48,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Package size={20} color="var(--gold-400)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pkg.packageName || pkg.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {pkg.hallName ? `Paired with ${pkg.hallName}` : 'All-Inclusive Hospitality'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-400)' }}>
                    ${pkg.price ? Number(pkg.price).toLocaleString() : '1,200'}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>per booking</span>
                </div>
              </div>
            ))}

            {packages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <Package size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>No catering packages created yet.</p>
                <button onClick={() => navigate('/events-admin/halls')} className="btn btn-outline btn-sm">
                  Add Package
                </button>
              </div>
            )}
          </div>

          <div style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 'var(--radius-md, 8px)',
            background: 'rgba(201,160,48,0.06)',
            border: '1px dashed var(--border-gold, rgba(201,160,48,0.3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color="var(--gold-400)" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Want to launch a seasonal holiday package?</span>
            </div>
            <button
              onClick={() => navigate('/events-admin/halls')}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              + Create Package
            </button>
          </div>
        </div>
      </div>

      {/* ── UPCOMING EVENT SCHEDULE / BOOKINGS TABLE ── */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Upcoming Event Schedule & Reservations
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Recent banquet bookings and function schedules
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn btn-sm ${filterPeriod === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterPeriod('upcoming')}
              style={{ fontSize: 12 }}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              className={`btn btn-sm ${filterPeriod === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterPeriod('all')}
              style={{ fontSize: 12 }}
            >
              All Events ({displayEvents.length})
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest / Host</th>
                <th>Event Space / Hall</th>
                <th>Package</th>
                <th>Event Date(s)</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filterPeriod === 'upcoming' ? upcomingEvents : displayEvents).map(res => (
                <tr key={res.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold-400)' }}>
                      {res.confirmationCode || `EVT-${res.id}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {res.userName || res.guestName || 'Valued Guest'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {res.userEmail || res.guestEmail || '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                      <Building2 size={14} color="var(--gold-400)" />
                      {res.hallName || (res.roomNumber ? `Room ${res.roomNumber}` : 'Grand Sapphire Ballroom')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {res.packageName || 'Standard Function Package'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {res.checkIn ? new Date(res.checkIn).toLocaleDateString() : 'TBD'}
                    </div>
                    {res.checkOut && res.checkOut !== res.checkIn && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        to {new Date(res.checkOut).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${res.totalAmount ? Number(res.totalAmount).toLocaleString() : '0.00'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[res.status] || 'badge-muted'}`}>
                      {res.status || 'CONFIRMED'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate('/events-admin/reservations')}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}

              {displayEvents.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No event bookings recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EventCoordinatorDashboard;
