export function LoadingScreen({ text = 'Carving Haven Spaces...', fullScreen = false, size = 80 }) {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#121410', // Darker background to match the theme
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}>
        <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/assets/images/logo.png" alt="Aliya Resort" className="loading-logo" style={{ width: '100%', height: '100%' }} />
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
      gap: 16,
      width: '100%',
    }}>
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/assets/images/logo.png" alt="Aliya Resort" className="loading-logo" style={{ width: '100%', height: '100%' }} />
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
