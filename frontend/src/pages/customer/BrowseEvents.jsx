import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CustomerNav, CustomerFooter } from './Home';
import LoadingScreen from '../../components/LoadingScreen';
import { Building2, Package, Sparkles, CheckCircle2 } from 'lucide-react';

const MOCK_HALLS = [
  {
    id: 1,
    name: 'Grand Sapphire Ballroom',
    seatingCapacity: 500,
    pricePerEvent: 250000,
    available: true,
    description: 'Olympic crystal chandeliers, dynamic acoustic stage, LED videowalls & private bridal salon.',
    img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Crystal Glass Banquet',
    seatingCapacity: 300,
    pricePerEvent: 160000,
    available: true,
    description: 'Floor-to-ceiling panoramic garden views, outdoor cocktail terrace & intelligent ambient lighting.',
    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Lotus Orchid Pavilion',
    seatingCapacity: 120,
    pricePerEvent: 85000,
    available: true,
    description: 'Intimate setting for corporate symposiums, VIP gatherings and engagement celebrations.',
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
  },
];

const MOCK_PACKAGES = [
  {
    id: 1,
    name: 'Royal Heritage Wedding Bundle',
    price: 450000,
    description: 'A regal experience tailored for once-in-a-lifetime wedding celebrations.',
    servicesIncluded: '5-Course Gourmet Buffet, Complete Floral Arch & Aisle Decor, Pro Sound & Stage Lighting, Chauffeur Car',
  },
  {
    id: 2,
    name: 'Executive Corporate Summit',
    price: 180000,
    description: 'Full-day corporate seminar solution with international dining and AV tech.',
    servicesIncluded: 'Morning & Evening Tea Buffets, Business Lunch, 4K Projection System, Wireless Microphones',
  },
  {
    id: 3,
    name: 'Golden Jubilee Celebration',
    price: 320000,
    description: 'Bespoke package for milestone anniversaries, galas, and birthday parties.',
    servicesIncluded: 'Cocktail Bar Setup, Live DJ & Entertainment, Gourmet Dinner, Custom Cake & Champagne Toast',
  },
];

function BrowseEvents() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('halls'); // 'halls' or 'packages'
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/api/event-halls/available').catch(() => ({ data: [] })),
      axios.get('/api/packages').catch(() => ({ data: [] }))
    ]).then(([resHalls, resPkgs]) => {
      const liveHalls = Array.isArray(resHalls.data) && resHalls.data.length > 0 ? resHalls.data : MOCK_HALLS;
      const livePkgs = Array.isArray(resPkgs.data) && resPkgs.data.length > 0 ? resPkgs.data : MOCK_PACKAGES;
      setHalls(liveHalls);
      setPackages(livePkgs);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleBookHall = (hall) => {
    setSelectedHall(hall);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleConfirmBooking = () => {
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setSelectedHall(null);
      setSelectedPackage(null);
    }, 3000);
  };

  return (
    <div className="customer-shell">
      <CustomerNav />

      {/* Hero Header */}
      <div style={{
        padding: '50px 0 36px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,160,48,0.15) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="c-container">
          <div className="section-badge" style={{ margin: '0 auto 16px' }}>Sanctuary Spaces & Gatherings</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Countryside Gathering Halls & Curated Bundles
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 680, margin: '0 auto 28px' }}>
            Host unforgettable gatherings, acoustic retreats, and celebrations surrounded by rugged countryside hills.
          </p>

          {/* Tab switcher */}
          <div style={{ display: 'inline-flex', gap: 10, background: 'var(--dark-800)', padding: 6, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn btn-sm ${activeTab === 'halls' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-md)', padding: '10px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onClick={() => setActiveTab('halls')}
            >
              <Building2 size={15} />
              Country Gathering Halls ({halls.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'packages' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-md)', padding: '10px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onClick={() => setActiveTab('packages')}
            >
              <Package size={15} />
              Curated Packages ({packages.length})
            </button>
          </div>
        </div>
      </div>

      <div className="c-section" style={{ paddingTop: 40 }}>
        <div className="c-container">
          {loading ? (
            <LoadingScreen text="Carving gathering spaces & packages..." />
          ) : (
          <>
            {/* VIEW 1: AVAILABLE EVENT HALLS (Step 12) */}
            {activeTab === 'halls' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28 }}>
                {halls.map((hall, idx) => {
                  const capacity = hall.seatingCapacity || hall.capacity || 200;
                  const price = hall.pricePerEvent || hall.pricePerDay || 150000;
                  const defaultImg = MOCK_HALLS[idx % MOCK_HALLS.length]?.img;

                  return (
                    <div key={hall.id} className="booking-card animate-fade-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        height: 220,
                        background: `url(${defaultImg}) center/cover no-repeat`,
                        position: 'relative'
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)' }} />
                        <span className="badge badge-success" style={{ position: 'absolute', top: 16, right: 16 }}>
                          ✓ Available for Booking
                        </span>
                        <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
                          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{hall.name}</h3>
                          <div style={{ fontSize: 13, color: 'var(--gold-300)', marginTop: 4 }}>
                            👥 Up to {capacity} Guests Seating
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                          {hall.description || hall.amenities || 'Magnificent event hall with high ceilings, sound dampening and state of the art presentation systems.'}
                        </p>

                        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Hall Rate</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-300)' }}>
                              LKR {Number(price).toLocaleString()}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per full-day event</div>
                          </div>
                          <button
                            className="hero-btn-primary"
                            style={{ borderRadius: 'var(--radius-md)', padding: '10px 22px', fontSize: 14 }}
                            onClick={() => handleBookHall(hall)}
                          >
                            Reserve Hall →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: EVENT PACKAGES (Step 12) */}
            {activeTab === 'packages' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28 }}>
                {packages.map((pkg) => {
                  const services = pkg.servicesIncluded ? pkg.servicesIncluded.split(',').map(s => s.trim()).filter(Boolean) : ['Catering', 'Lighting', 'Decoration'];

                  return (
                    <div key={pkg.id} className="booking-card animate-fade-in" style={{ padding: 28, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <span className="badge badge-purple" style={{ marginBottom: 8, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Package size={12} /> Curated Event Package
                          </span>
                          <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{pkg.name}</h3>
                        </div>
                        <Sparkles size={22} style={{ color: 'var(--gold-400)', opacity: 0.8 }} />
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                        {pkg.description || 'Comprehensive event service bundle with award-winning catering and stage production.'}
                      </p>

                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                          Included Services & Amenities
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {services.map(svc => (
                            <div key={svc} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-primary)' }}>
                              <span style={{ color: 'var(--gold-400)', fontWeight: 800 }}>✓</span>
                              <span>{svc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Package Cost</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-300)' }}>
                            LKR {Number(pkg.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-300)', padding: '10px 20px' }}
                          onClick={() => handleSelectPackage(pkg)}
                        >
                          Select Bundle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Hall Booking / Inquiry Modal */}
      {selectedHall && (
        <div className="modal-overlay" onClick={() => setSelectedHall(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} style={{ color: 'var(--gold-400)' }} />
              </div>
              <div>
                <div className="modal-title">Book {selectedHall.name}</div>
                <div className="modal-subtitle">Direct Event Hall Reservation</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedHall(null)}>×</button>
            </div>
            {inquirySuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <CheckCircle2 size={44} style={{ color: 'var(--gold-400)' }} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Reservation Request Confirmed!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Our Event Coordinator will reach out to you within 2 hours to confirm your dates and menu details.
                </p>
              </div>
            ) : (
              <div className="modal-body">
                <div style={{ padding: '14px 18px', background: 'var(--dark-750)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Venue:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedHall.name}</span>
                  </div>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Capacity:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Up to {selectedHall.seatingCapacity || selectedHall.capacity} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rate:</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold-300)' }}>LKR {Number(selectedHall.pricePerEvent || selectedHall.pricePerDay || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Event Date *</label>
                  <input className="form-input" type="date" min={new Date().toISOString().slice(0, 10)} defaultValue={new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10)} />
                </div>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Estimated Guests *</label>
                  <input className="form-input" type="number" min={1} max={selectedHall.seatingCapacity || 1000} defaultValue={100} />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Event Notes / Setup Requirements</label>
                  <textarea className="form-textarea" rows={2} placeholder="e.g. Banquet round-table seating with central floral stage..." />
                </div>
              </div>
            )}
            {!inquirySuccess && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedHall(null)}>Close</button>
                <button className="btn btn-primary" onClick={handleConfirmBooking}>Confirm Event Booking</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Package Selection Modal */}
      {selectedPackage && (
        <div className="modal-overlay" onClick={() => setSelectedPackage(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} style={{ color: 'var(--gold-400)' }} />
              </div>
              <div>
                <div className="modal-title">Select {selectedPackage.name}</div>
                <div className="modal-subtitle">Package Inquiry & Bundle Selection</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedPackage(null)}>×</button>
            </div>
            {inquirySuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <CheckCircle2 size={44} style={{ color: 'var(--gold-400)' }} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Package Added to Booking!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Our Event Coordinator will customize the bundle according to your catering and decor preferences.
                </p>
              </div>
            ) : (
              <div className="modal-body">
                <div style={{ padding: '14px 18px', background: 'var(--dark-750)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bundle:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Price:</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold-300)' }}>LKR {Number(selectedPackage.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Would you like our Event Coordinator to apply this package to your forthcoming reservation?
                </p>
              </div>
            )}
            {!inquirySuccess && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedPackage(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmBooking}>Apply Package</button>
              </div>
            )}
          </div>
        </div>
      )}

      <CustomerFooter />
    </div>
  );
}

export default BrowseEvents;
