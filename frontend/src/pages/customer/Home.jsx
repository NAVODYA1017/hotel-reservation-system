import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, Calendar, Users, Search, Wifi, Waves, Utensils, Car, Wind, Coffee, Tv, Wine, MapPin, Phone, Mail, ChevronRight, Star, LogOut, CalendarDays, User as UserIcon
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

  return (
    <nav className={`c-nav${scrolled ? ' scrolled' : ''}`}>
      <button className="c-nav-logo" onClick={() => navigate('/')}>
        <Building2 className="c-nav-logo-icon" size={28} />
        <span className="c-nav-logo-name" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Aliya Resort</span>
      </button>

      <div className="c-nav-links">
        <button className={`c-nav-link${isActive('/') ? ' active' : ''}`} onClick={() => navigate('/')}>Home</button>
        <button className={`c-nav-link${isActive('/browse') ? ' active' : ''}`} onClick={() => navigate('/browse')}>Browse Rooms</button>
        <button className="c-nav-link" onClick={() => navigate('/browse#amenities')}>Amenities</button>
        <button className="c-nav-link" onClick={() => navigate('/browse#about')}>About</button>
      </div>

      <div className="c-nav-actions">
        {guest ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/my-bookings')}>
              <CalendarDays size={16} style={{ marginRight: 6 }} /> My Bookings
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div 
                className="user-avatar" 
                style={{ width: 32, height: 32, fontSize: 13, cursor: 'pointer' }}
                onClick={() => navigate('/profile')}
                title="My Profile"
              >
                {guest.name?.charAt(0).toUpperCase()}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/guest-login')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/guest-login?tab=register')}>
              Register
            </button>
          </>
        )}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/admin')}
          title="Staff Login"
          style={{ fontSize: 11 }}
        >
          🔒 Staff
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
        <span className="search-bar-label"><Calendar size={14} style={{ marginRight: 6 }} /> Check-in</span>
        <input className="search-bar-input" type="date" value={checkIn} min={today}
          onChange={e => setCheckIn(e.target.value)} placeholder="Select date" />
      </div>
      <div className="search-bar-field">
        <span className="search-bar-label"><Calendar size={14} style={{ marginRight: 6 }} /> Check-out</span>
        <input className="search-bar-input" type="date" value={checkOut} min={checkIn || today}
          onChange={e => setCheckOut(e.target.value)} placeholder="Select date" />
      </div>
      <div className="search-bar-field" style={{ minWidth: 100 }}>
        <span className="search-bar-label"><Users size={14} style={{ marginRight: 6 }} /> Guests</span>
        <input className="search-bar-input" type="number" value={guests} min={1} max={20}
          onChange={e => setGuests(e.target.value)} style={{ width: 60 }} />
      </div>
      <div className="search-bar-field" style={{ minWidth: 120 }}>
        <span className="search-bar-label"><Building2 size={14} style={{ marginRight: 6 }} /> Room Type</span>
        <select className="search-bar-input" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Any Type</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
          <option value="Premium Suite">Premium Suite</option>
        </select>
      </div>
      <button
        className="hero-btn-primary"
        style={{ borderRadius: 'var(--radius-md)', padding: '12px 24px', fontSize: 14, flexShrink: 0 }}
        onClick={() => onSearch({ checkIn, checkOut, guests, type })}
      >
        <Search size={16} style={{ marginRight: 6 }} /> Search
      </button>
    </div>
  );
}

/* ---- HOME PAGE ---- */
const AMENITIES = [
  { icon: <Waves size={32} />, title: 'Infinity Pool', desc: 'Olympic-sized rooftop infinity pool with panoramic views' },
  { icon: <Wind size={32} />, title: 'Luxury Spa', desc: 'Full-service spa with massages, facials & wellness treatments' },
  { icon: <Utensils size={32} />, title: 'Fine Dining', desc: '3 award-winning restaurants with world-class chefs' },
  { icon: <Coffee size={32} />, title: 'Fitness Center', desc: 'State-of-the-art gym, yoga studio & personal training' },
  { icon: <Tv size={32} />, title: 'Event Halls', desc: 'Grand ballrooms for weddings, conferences & celebrations' },
  { icon: <Car size={32} />, title: 'Valet Parking', desc: '24/7 secure valet and chauffeur services' },
  { icon: <Wine size={32} />, title: 'Concierge', desc: 'Round-the-clock personalized concierge at your service' },
  { icon: <Wifi size={32} />, title: 'Ultra-Fast Wi-Fi', desc: 'Complimentary high-speed internet throughout the property' },
];

const TESTIMONIALS = [
  { name: 'Amara Wijerama', from: 'Colombo, Sri Lanka', text: 'Absolutely breathtaking experience. The suite was immaculate, the staff went above and beyond. Will definitely return for our anniversary!', stars: 5 },
  { name: 'James Thornton', from: 'London, UK', text: 'Aliya Resort redefined luxury for me. The pool view at sunset is something I will never forget. Five-star in every sense.', stars: 5 },
  { name: 'Priya Nalakshmi', from: 'Chennai, India', text: 'The perfect venue for our corporate retreat. The event team was phenomenal and the rooms made our international guests feel truly pampered.', stars: 5 },
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

      {/* Hero */}
      <section className="hero" style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(/assets/images/hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="hero-bg" />
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-badge" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>⭐ Sri Lanka's #1 Luxury Hotel</div>
          <h1 className="hero-title">
            Experience the Art<br />of <span>Luxury Living</span>
          </h1>
          <p className="hero-subtitle">
            Nestled in the heart of paradise, Aliya Resort offers an unparalleled blend of
            timeless elegance and modern sophistication — where every moment becomes a memory.
          </p>

          <HeroSearch onSearch={handleSearch} />

          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => navigate('/browse')}>
              <Building2 size={16} style={{ marginRight: 6 }} /> Browse Our Rooms
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/browse#amenities')}>
              <Star size={16} style={{ marginRight: 6 }} /> View Amenities
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <span className="hero-stat-val">150+</span>
              <span className="hero-stat-label">Luxury Rooms</span>
            </div>
            <div>
              <span className="hero-stat-val">98%</span>
              <span className="hero-stat-label">Guest Satisfaction</span>
            </div>
            <div>
              <span className="hero-stat-val">25+</span>
              <span className="hero-stat-label">Years of Excellence</span>
            </div>
            <div>
              <span className="hero-stat-val">12</span>
              <span className="hero-stat-label">International Awards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="c-section" id="rooms">
        <div className="section-header">
          <div className="section-badge">Our Accommodations</div>
          <h2 className="section-title">Handcrafted Rooms & Suites</h2>
          <p className="section-subtitle">Every room is a sanctuary — thoughtfully designed with premium furnishings and all the comforts you deserve.</p>
        </div>
        <FeaturedRooms onBook={() => navigate('/browse')} />
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="hero-btn-primary" onClick={() => navigate('/browse')}>
            View All Rooms →
          </button>
        </div>
      </section>

      {/* Amenities */}
      <section className="c-section" id="amenities" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="section-header">
          <div className="section-badge">Facilities & Services</div>
          <h2 className="section-title">World-Class Amenities</h2>
          <p className="section-subtitle">From our infinity pool to the award-winning spa, every facility is crafted to exceed expectations.</p>
        </div>
        <div className="amenities-grid">
          {AMENITIES.map(a => (
            <div key={a.title} className="amenity-card">
              <span className="amenity-icon">{a.icon}</span>
              <div className="amenity-title">{a.title}</div>
              <div className="amenity-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="c-section">
        <div className="section-header">
          <div className="section-badge">Guest Reviews</div>
          <h2 className="section-title">What Our Guests Say</h2>
          <p className="section-subtitle">Genuine stories from guests who've experienced the Aliya Resort difference.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-stars" style={{ display: 'flex', gap: 2 }}>
                {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="var(--gold-400)" color="var(--gold-400)" />)}
              </div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-from">{t.from}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="c-section-sm" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(201,160,48,0.08), rgba(139,92,246,0.06))' }}>
        <div className="section-badge">Ready to Book?</div>
        <h2 className="section-title" style={{ marginTop: 16 }}>Begin Your Luxury Journey</h2>
        <p className="section-subtitle" style={{ marginBottom: 36 }}>Reserve your room today and experience the epitome of Sri Lankan hospitality.</p>
        <button className="hero-btn-primary" onClick={() => navigate('/browse')} style={{ fontSize: 17, padding: '18px 44px' }}>
          🏨 Book Your Stay Now
        </button>
      </section>

      <CustomerFooter />
    </div>
  );
}

/* Featured rooms component */
const FEATURED = [
  { id: 1, roomNumber: '101', type: 'Deluxe Room', capacity: 2, pricePerNight: 14200, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar'], view: 'City View' },
  { id: 3, roomNumber: '201', type: 'Premier Suite', capacity: 4, pricePerNight: 28600, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi'], view: 'Pool View' },
  { id: 5, roomNumber: '301', type: 'Presidential Suite', capacity: 6, pricePerNight: 52000, status: 'AVAILABLE', amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Jacuzzi', 'Kitchen'], view: 'Ocean View' },
];

function FeaturedRooms({ onBook }) {
  const navigate = useNavigate();
  return (
    <div className="c-room-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {FEATURED.map(room => (
        <CustomerRoomCard key={room.id} room={room} onClick={() => navigate(`/room/${room.id}`)} />
      ))}
    </div>
  );
}

export function CustomerRoomCard({ room, onClick }) {
  const imgUrl = room.type.toLowerCase().includes('suite') ? '/assets/images/suite.jpg' 
               : room.type.toLowerCase().includes('deluxe') ? '/assets/images/deluxe.jpg' 
               : '/assets/images/standard.jpg';

  return (
    <div className="c-room-card" onClick={onClick}>
      <div className="c-room-img" style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '240px' }}>
        <div className="c-room-img-overlay" />
        <div className="c-room-badges">
          <span className={`badge ${room.status === 'AVAILABLE' ? 'badge-success' : 'badge-error'}`}>
            {room.status === 'AVAILABLE' ? '✓ Available' : 'Unavailable'}
          </span>
          {room.view && (
            <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 20, fontSize: 11, padding: '3px 10px', fontWeight: 600 }}>
              {room.view}
            </span>
          )}
        </div>
      </div>
      <div className="c-room-body">
        <div className="c-room-name">{room.type}</div>
        <div className="c-room-meta">
          <span className="c-room-meta-item"><Building2 size={12} style={{ marginRight: 4 }} /> Room {room.roomNumber}</span>
          <span className="c-room-meta-item"><Users size={12} style={{ marginRight: 4 }} /> Up to {room.capacity} guests</span>
        </div>
        <div className="c-room-amenities">
          {(room.amenities || []).slice(0, 4).map(a => (
            <span key={a} className="c-amenity-tag">{a}</span>
          ))}
        </div>
        <div className="c-room-footer">
          <div>
            <div className="c-room-price-label">Starting from</div>
            <div className="c-room-price">LKR {room.pricePerNight?.toLocaleString()}</div>
            <div className="c-room-price-period">per night</div>
          </div>
          <button
            className="btn btn-primary"
            disabled={room.status !== 'AVAILABLE'}
            onClick={e => { e.stopPropagation(); onClick(); }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- FOOTER ---- */
export function CustomerFooter() {
  return (
    <footer className="c-footer">
      <div className="c-footer-grid">
        <div>
          <span className="c-footer-brand-name"><Building2 size={24} style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} /> Aliya Resort</span>
          <p className="c-footer-desc">
            Sri Lanka's premier luxury resort, offering unparalleled comfort and world-class service
            since 2001. Where every stay becomes a cherished memory.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--dark-700)', border: '1px solid var(--border-subtle)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Wine size={16} />
            </div>
            <div style={{ width: 36, height: 36, background: 'var(--dark-700)', border: '1px solid var(--border-subtle)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Coffee size={16} />
            </div>
          </div>
        </div>
        <div>
          <div className="c-footer-heading">Explore</div>
          {['Rooms & Suites', 'Dining', 'Spa & Wellness', 'Events & Weddings', 'Offers'].map(l => (
            <span key={l} className="c-footer-link">{l}</span>
          ))}
        </div>
        <div>
          <div className="c-footer-heading">Guest Services</div>
          {['My Bookings', 'Online Check-in', 'Room Service', 'Concierge', 'FAQs'].map(l => (
            <span key={l} className="c-footer-link">{l}</span>
          ))}
        </div>
        <div>
          <div className="c-footer-heading">Contact</div>
          <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> 123 Paradise Road, Tropical Island</span>
          <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> +94 11 234 5678</span>
          <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} /> reservations@aliyaresort.com</span>
          <span className="c-footer-link" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={14} /> 24/7 Reservations</span>
        </div>
      </div>
      <div className="c-footer-bottom">
        <span>© {new Date().getFullYear()} Aliya Resort. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
            <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export { CustomerNav, Home };
export default Home;
