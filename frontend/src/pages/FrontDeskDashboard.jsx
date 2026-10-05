import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, BedDouble, CalendarCheck, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

function FrontDeskDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('/api/frontdesk/summary', { headers })
      .then(res => setSummary(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load front desk summary. Ensure you have the Receptionist role.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen text="Loading front desk..." />;

  if (error) {
    return (
      <div className="alert alert-error" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const { arrivalsToday, departuresToday, inHouseGuests, availableRooms } = summary || {};

  return (
    <div className="animate-fade-in" style={{ padding: '0 8px' }}>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>Front Desk Operations</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of today's activities and guest status.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'var(--text-muted)' }}>
            <CalendarCheck size={20} />
            <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase' }}>Arrivals Today</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{arrivalsToday || 0}</div>
        </div>
        
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'var(--text-muted)' }}>
            <CheckSquare size={20} />
            <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase' }}>Departures Today</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{departuresToday || 0}</div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'var(--text-muted)' }}>
            <Users size={20} />
            <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase' }}>In-House</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{inHouseGuests || 0}</div>
        </div>

        <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'var(--text-muted)' }}>
            <BedDouble size={20} />
            <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase' }}>Available Rooms</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{availableRooms || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate('/frontdesk/reservations')} style={{ justifyContent: 'flex-start', padding: '12px 16px' }}>
              <Clock size={16} style={{ marginRight: 8 }} />
              Process Check-in / Check-out
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/frontdesk/rooms')} style={{ justifyContent: 'flex-start', padding: '12px 16px' }}>
              <BedDouble size={16} style={{ marginRight: 8 }} />
              View Room Rack
            </button>
          </div>
        </div>
        
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(201,160,48,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Users size={32} color="var(--gold-400)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Receptionist Role</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            You are currently logged in with receptionist privileges. You have access to room rack management, check-ins, check-outs, and payment verification, but you are restricted from administrative reports and settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FrontDeskDashboard;
