import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../../components/LoadingScreen';
import { 
  Building2, Calendar, Users, Search, Wifi, Waves, Utensils, Car, Wind, Coffee, Tv, Wine, MapPin, Phone, Mail, ChevronRight, Star, LogOut, CalendarDays, User as UserIcon, Compass
} from 'lucide-react';

function CustomerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const guest = JSON.parse(localStorage.getItem('guestUser') || 'null');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('guestUser');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';
  const navClass = [
    'c-nav',
    isHome ? 'c-nav--home' : '',
    isHome && !scrolled ? 'c-nav--overlay' : '',
    scrolled ? 'scrolled' : '',
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClass}>
      <div className="c-nav-inner">
        <button className="c-nav-logo" onClick={() => navigate('/')}>
          <span className="c-nav-logo-name">Aliya Resort</span>
        </button>

        <div className="c-nav-links">
          <button className={`c-nav-link${isActive('/browse') ? ' active' : ''}`} onClick={() => navigate('/browse')}>
            THE SPACE
          </button>
          <button className="c-nav-link" onClick={() => {
            if (location.pathname !== '/') navigate('/#amenities');
            else document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            AMENITIES
          </button>
          <button className="c-nav-link" onClick={() => {
            if (location.pathname !== '/') navigate('/#location');
            else document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            LOCATION
          </button>
          <button className={`c-nav-link${isActive('/events') ? ' active' : ''}`} onClick={() => navigate('/events')}>
            GATHERINGS
          </button>

          <span className="c-nav-divider" />

          {guest ? (
            <>
              <button className={`c-nav-link${isActive('/my-bookings') ? ' active' : ''}`} onClick={() => navigate('/my-bookings')}>
                MY BOOKINGS
              </button>
              <button className="c-nav-avatar" onClick={() => navigate('/profile')} title="My Profile">
                {guest.name?.charAt(0).toUpperCase()}
              </button>
              <button className="c-nav-link" onClick={handleLogout}>LOGOUT</button>
            </>
          ) : (
            <button className="c-nav-link" onClick={() => navigate('/guest-login')}>SIGN IN</button>
          )}
          <button className="c-nav-link c-nav-link--muted" onClick={() => navigate('/admin')} title="Staff Portal">
            STAFF
          </button>
        </div>

        <button className="c-nav-book" onClick={() => navigate('/browse')}>
          <span>BOOK NOW</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}

/* ---- HERO SEARCH BAR ---- */
function HeroSearch({ onSearch }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [type, setType] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="search-bar-hero">
      <div className="search-bar-field">
        <span className="search-bar-label"><Calendar size={13} style={{ marginRight: 6 }} /> Arrival</span>
        <input className="search-bar-input" type="date" value={checkIn} min={today}
          onChange={e => setCheckIn(e.target.value)} />
      </div>
      <div className="search-bar-field">
        <span className="search-bar-label"><Calendar size={13} style={{ marginRight: 6 }} /> Departure</span>
        <input className="search-bar-input" type="date" value={checkOut} min={checkIn || today}
          onChange={e => setCheckOut(e.target.value)} />
      </div>
      <div className="search-bar-field" style={{ minWidth: 100 }}>
        <span className="search-bar-label"><Users size={13} style={{ marginRight: 6 }} /> Guests</span>
        <input className="search-bar-input" type="number" value={guests} min={1} max={20}
          onChange={e => setGuests(e.target.value)} style={{ width: 60 }} />
      </div>
      <div className="search-bar-field" style={{ minWidth: 150 }}>
        <span className="search-bar-label"><Building2 size={13} style={{ marginRight: 6 }} /> Space Type</span>
        <select className="search-bar-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Spaces</option>
          <option value="Standard">Standard Cabin</option>
          <option value="Deluxe">Deluxe Stone Haven</option>
          <option value="Suite">Countryside Suite</option>
          <option value="Premium Suite">Master Cliff Suite</option>
        </select>
      </div>
      <button
        className="hero-btn-primary"
        style={{ padding: '14px 28px', fontSize: 12, flexShrink: 0, margin: 4 }}
        onClick={() => onSearch({ checkIn, checkOut, guests, type })}
      >
        <Search size={14} style={{ marginRight: 6 }} /> SEARCH HAVEN
      </button>
    </div>
  );
}

/* ---- HOME PAGE ---- */
const AMENITIES = [
  { icon: <Wind size={30} />, title: 'Wild Air & Solitude', desc: 'Carved high into secluded mountain countryside with zero city noise' },
  { icon: <Waves size={30} />, title: 'Stone Dip Pool', desc: 'Natural spring-fed mountain dipping pool nestled in raw rock faces' },
  { icon: <Utensils size={30} />, title: 'Fire Hearth Dining', desc: 'Locally foraged ingredients and woodfired culinary craftsmanship' },
  { icon: <Coffee size={30} />, title: 'Artisan Roastery', desc: 'Fresh single-origin mountain roast brewed every sunrise' },
  { icon: <Tv size={30} />, title: 'Country Gathering Halls', desc: 'Architectural timber spaces for acoustic evenings and private retreats' },
  { icon: <Car size={30} />, title: 'Rugged Trail Access', desc: 'Private 4x4 trail guidance and covered country parking' },
  { icon: <Wine size={30} />, title: 'Cellar & Provisions', desc: 'Curated natural wines and seasonal provisions delivered to your space' },
  { icon: <Wifi size={30} />, title: 'Starlink High-Speed', desc: 'High-speed remote connectivity across all apartments and cabins' },
];

const TESTIMONIALS = [
  { name: 'Elena Rostova', from: 'Architect, Berlin', text: 'Aliya Resort is a masterclass in raw, honest countryside design. Waking up to mist rolling over the gritstone outcrops was unforgettable.', stars: 5 },
  { name: 'Marcus Vance', from: 'Melbourne, Australia', text: 'Escape the concrete is no exaggeration. Total seclusion, crackling timber fire, and impeccable craftsmanship throughout the apartment.', stars: 5 },
  { name: 'Naveen Senanayake', from: 'Colombo, Sri Lanka', text: 'The perfect antidote to urban exhaustion. Seamless online booking, effortless stay, and incredible peaceful stillness.', stars: 5 },
];

function Home() {
  const navigate = useNavigate();

  const handleSearch = ({ checkIn, checkOut, guests, type }) => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    if (type) params.set('type', type);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="customer-shell">
      <CustomerNav />

      {/* Hero - full-visibility photograph with editorial overlay text */}
      <section className="hero-editorial" style={{ backgroundImage: 'url(/assets/images/hero.jpg)' }}>
        <div className="c-container hero-editorial-content">
          <h1 className="hero-editorial-title">
            Escape the Concrete.<br />
            Find Your Paradise
          </h1>
          <div className="hero-editorial-aside">
            <p className="hero-editorial-sub">
              A lush, secluded resort carved into the tropical hills
            </p>
            <button className="hero-editorial-btn" onClick={() => navigate('/browse')}>
              <span>BOOK YOUR ESCAPE</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Booking band - search and key figures */}
      <section className="hero-booking-band">
        <div className="c-container">
          <HeroSearch onSearch={handleSearch} />

          <div className="hero-stats">
            <div>
              <span className="hero-stat-val">04</span>
              <span className="hero-stat-label">Architectural Spaces</span>
            </div>
            <div>
              <span className="hero-stat-val">100%</span>
              <span className="hero-stat-label">Secluded Countryside</span>
            </div>
            <div>
              <span className="hero-stat-val">4.9 / 5</span>
              <span className="hero-stat-label">Guest Solitude Rating</span>
            </div>
            <div>
              <span className="hero-stat-val">24/7</span>
              <span className="hero-stat-label">Haven Caretaker</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Living Spaces */}
      <section className="c-section" id="spaces">
        <div className="c-container">
          <div className="section-header">
            <div className="section-badge">The Sanctuary</div>
            <h2 className="section-title">Carved Countryside Living Spaces</h2>
            <p className="section-subtitle">Minimalist raw timber, stone finishes, and floor-to-ceiling wilderness views in every sanctuary apartment.</p>
          </div>
          <FeaturedRooms onBook={() => navigate('/browse')} />
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="btn-escape" onClick={() => navigate('/browse')}>
              EXPLORE ALL SPACES →
            </button>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="c-section" id="amenities" style={{ background: '#161814', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="c-container">
          <div className="section-header">
            <div className="section-badge">Living Untamed</div>
            <h2 className="section-title">Amenities of the Wild Haven</h2>
            <p className="section-subtitle">Curated modern comforts blended with raw country elements for quiet restoration.</p>
          </div>
          <div className="amenities-grid">
            {AMENITIES.map(a => (
              <div key={a.title} className="amenity-card" style={{ background: '#1a1c18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <span className="amenity-icon" style={{ color: 'var(--gold-400)' }}>{a.icon}</span>
                <div className="amenity-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 16 }}>{a.title}</div>
                <div className="amenity-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="c-section" id="location">
        <div className="c-container">
          <div className="section-header">
            <div className="section-badge">The Territory</div>
            <h2 className="section-title">Hidden in the Mountain Mist</h2>
            <p className="section-subtitle">Located away from highways and dense townships — accessible via countryside ridge roads.</p>
          </div>
          <div style={{
            maxWidth: 1000, margin: '0 auto', background: '#1a1c18', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 2, padding: 36, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--text-primary)', marginBottom: 12 }}>
                The Countryside Ridge, Ella Highland
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>
                Aliya Resort is carved into the hillside wilderness, offering private panoramic vistas over green valleys and rocky peaks. Arrive by 4x4 or arrange a sanctuary shuttle pickup from the central railway station.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={15} color="var(--gold-400)" /> <strong>Coordinates:</strong> 6.8667° N, 81.0466° E (Ella Highland Ridge)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Car size={15} color="var(--gold-400)" /> <strong>Access:</strong> Scenic Mountain Ridge Road, 25 mins from Ella Town</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Compass size={15} color="var(--gold-400)" /> <strong>Helipad:</strong> Private landing paddock on upper clearing</div>
              </div>
            </div>
            <div style={{
              height: 240, background: 'url(/assets/images/hero.jpg) center/cover', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <button className="btn-escape" onClick={() => navigate('/browse')} style={{ zIndex: 1 }}>
                RESERVE DATES →
              </button>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="c-section" style={{ background: '#161814' }}>
        <div className="c-container">
          <div className="section-header">
            <div className="section-badge">Guest Impressions</div>
            <h2 className="section-title">Words From the Wilderness</h2>
            <p className="section-subtitle">Untouched silence and honest reviews from those who retreated to our sanctuary.</p>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card" style={{ background: '#1a1c18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div className="testimonial-stars" style={{ display: 'flex', gap: 2 }}>
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} fill="var(--gold-400)" color="var(--gold-400)" />)}
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ borderRadius: 2, background: 'var(--gold-400)', color: '#141513' }}>{t.name.charAt(0)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-from">{t.from}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countryside CTA */}
      <section className="c-section-sm" style={{ textAlign: 'center', background: '#121410', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="c-container">
          <div className="section-badge">Wild Solitude Awaits</div>
          <h2 className="section-title" style={{ marginTop: 14 }}>Ready to Escape the Concrete?</h2>
          <p className="section-subtitle" style={{ marginBottom: 32 }}>Choose your space and experience raw countryside architecture.</p>
          <button className="btn-escape" onClick={() => navigate('/browse')} style={{ fontSize: 13, padding: '16px 36px' }}>
            BOOK YOUR RETREAT →
          </button>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

/* Featured rooms component */
function FeaturedRooms({ onBook }) {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/rooms/available')
      .then(res => {
        if (Array.isArray(res.data)) {
          const mapped = res.data.slice(0, 6).map(r => ({
            ...r,
            type: r.roomType || r.type || 'Standard Room',
            pricePerNight: r.pricePerNight || r.price || 8500,
            capacity: r.capacity || 2,
            amenities: typeof r.description === 'string' 
              ? r.description.split(',').map(s => s.trim()) 
              : Array.isArray(r.amenities) ? r.amenities : ['Fireplace', 'Terrace', 'Mountain View'],
            view: r.roomNumber?.startsWith('3') ? 'Cliff Peak' : r.roomNumber?.startsWith('2') ? 'Pine Ridge' : 'Wild Meadow',
          }));
          setFeatured(mapped);
        } else {
          setFeatured([]);
        }
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen text="Carving Featured Sanctuaries..." />;
  }

  if (featured.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 15 }}>
        No sanctuary spaces are currently listed in the database.
      </div>
    );
  }

  return (
    <div className="c-room-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      {featured.map(room => (
        <CustomerRoomCard key={room.id} room={room} onClick={() => navigate(`/room/${room.id}`)} />
      ))}
    </div>
  );
}

const FEATURED = [];

export function CustomerRoomCard({ room, onClick }) {
  const rType = String(room.roomType || room.type || 'Standard Cabin');
  const imgUrl = rType.toLowerCase().includes('suite') ? '/assets/images/suite.jpg' 
               : rType.toLowerCase().includes('deluxe') ? '/assets/images/deluxe.jpg' 
               : '/assets/images/standard.jpg';

  const amenitiesList = Array.isArray(room.amenities) 
    ? room.amenities 
    : typeof (room.description || room.amenities) === 'string'
      ? (room.description || room.amenities).split(',').map(s => s.trim()).filter(Boolean)
      : ['Fireplace', 'Timber Deck', 'Wild Vista'];

  const price = room.pricePerNight || room.price || 0;

  return (
    <div className="c-room-card" onClick={onClick} style={{ background: '#1a1c18', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 2 }}>
      <div className="c-room-img" style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '240px' }}>
        <div className="c-room-img-overlay" />
        <div className="c-room-badges">
          <span className={`badge ${room.status === 'AVAILABLE' ? 'badge-success' : 'badge-error'}`} style={{ borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {room.status === 'AVAILABLE' ? '✓ AVAILABLE' : (room.status || 'UNAVAILABLE')}
          </span>
          {room.view && (
            <span style={{ background: 'rgba(0,0,0,0.7)', color: '#f5f2eb', borderRadius: 2, fontSize: 11, padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {room.view}
            </span>
          )}
        </div>
      </div>
      <div className="c-room-body">
        <div className="c-room-name" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>{rType}</div>
        <div className="c-room-meta">
          <span className="c-room-meta-item"><Building2 size={12} style={{ marginRight: 4 }} /> Space #{room.roomNumber}</span>
          <span className="c-room-meta-item"><Users size={12} style={{ marginRight: 4 }} /> Sleeps {room.capacity || 2}</span>
        </div>
        <div className="c-room-amenities">
          {amenitiesList.slice(0, 4).map(a => (
            <span key={a} className="c-amenity-tag" style={{ background: '#22251f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>{a}</span>
          ))}
        </div>
        <div className="c-room-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div className="c-room-price-label">Rates from</div>
            <div className="c-room-price" style={{ color: 'var(--gold-400)', fontFamily: "'Playfair Display', serif" }}>LKR {Number(price).toLocaleString()}</div>
            <div className="c-room-price-period">per night</div>
          </div>
          <button
            className="hero-btn-primary"
            style={{ padding: '8px 18px', fontSize: 12, letterSpacing: '0.12em' }}
            disabled={room.status !== 'AVAILABLE'}
            onClick={e => { e.stopPropagation(); onClick(); }}
          >
            RESERVE SPACE →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- FOOTER ---- */
export function CustomerFooter() {
  return (
    <footer className="c-footer" style={{ background: '#0e100d', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="c-footer-inner">
        <div className="c-footer-grid">
          <div>
            <span className="c-footer-brand-name" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.14em', color: 'var(--gold-400)' }}>
              Aliya Resort
            </span>
            <p className="c-footer-desc">
              A premier countryside sanctuary retreat. Discover authentic rustic luxury, wild landscapes, and peaceful solitude.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wine size={16} color="var(--gold-400)" />
              </div>
              <div style={{ width: 36, height: 36, background: '#1c1e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coffee size={16} color="var(--gold-400)" />
              </div>
            </div>
          </div>
          <div>
            <div className="c-footer-heading">The Spaces</div>
            {['Standard Cabins', 'Deluxe Stone Haven', 'Countryside Suites', 'Cliffside Apartments', 'Private Paddock'].map(l => (
              <span key={l} className="c-footer-link">{l}</span>
            ))}
          </div>
          <div>
            <div className="c-footer-heading">Sanctuary</div>
            {['Wilderness Amenities', 'Trail Maps', 'Fire Hearth Dining', 'My Bookings', 'Care Policies'].map(l => (
              <span key={l} className="c-footer-link">{l}</span>
            ))}
          </div>
          <div>
            <div className="c-footer-heading">Territory Location</div>
            <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> Ella Highland Ridge, Wild Countryside</span>
            <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> +94 57 222 8900</span>
            <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> reservations@aliyaresort.com</span>
            <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={14} /> Year-Round Retreat Access</span>
          </div>
        </div>
        <div className="c-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span>© {new Date().getFullYear()} Aliya Resort Countryside Sanctuary. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Reservation Terms', 'Countryside Wilderness Policy'].map(l => (
              <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export { CustomerNav, Home };
export default Home;
