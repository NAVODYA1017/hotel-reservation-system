import { Lottie } from 'lottie-react';
import loadingAnimation from '../assets/loading-animation.json';

export function LoadingScreen({ text = 'Carving Haven Spaces...', fullScreen = false, size = 120 }) {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#141513',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lottie src={loadingAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
        </div>
        <span style={{
          fontFamily: "'Cinzel', 'Playfair Display', serif",
          fontSize: 14,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--gold-400)',
          fontWeight: 600,
        }}>
          {text}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      gap: 12,
      width: '100%',
    }}>
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lottie src={loadingAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
      </div>
      {text && (
        <span style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        }}>
          {text}
        </span>
      )}
    </div>
  );
}

export default LoadingScreen;
