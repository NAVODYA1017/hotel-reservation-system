import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

export default function RoomGallery({ images = [], roomTitle = 'Room Gallery' }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fallback if images array is empty
  const gallery = images.length > 0 ? images : [
    { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80', caption: roomTitle, tag: 'Showcase' }
  ];

  const currentImage = gallery[activeIdx] || gallery[0];

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, gallery.length]);

  return (
    <div className="room-gallery-wrapper" style={{ marginBottom: 28 }}>
      {/* ── MAIN HERO VIEWPORT ── */}
      <div 
        style={{
          position: 'relative',
          height: 420,
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
          backgroundColor: '#121411',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          cursor: 'pointer'
        }}
        onClick={() => setLightboxOpen(true)}
      >
        <img 
          src={currentImage.url} 
          alt={currentImage.caption || roomTitle}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.35s ease, transform 0.5s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* Ambient Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(13,15,12,0.85) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          {currentImage.tag && (
            <span style={{
              background: 'rgba(20, 22, 19, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-gold, rgba(197,160,89,0.5))',
              color: 'var(--gold-300, #e2c185)',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              {currentImage.tag}
            </span>
          )}
          <span style={{
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 20
          }}>
            Photo {activeIdx + 1} of {gallery.length}
          </span>
        </div>

        {/* Expand / View Fullscreen Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(20, 22, 19, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = 'var(--gold-300, #e2c185)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
        >
          <Maximize2 size={13} />
          Expand Gallery
        </button>

        {/* Previous Button */}
        {gallery.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous Photo"
            style={{
              position: 'absolute',
              top: '50%',
              left: 16,
              transform: 'translateY(-50%)',
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(15, 17, 14, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 17, 14, 0.75)'; e.currentTarget.style.color = '#fff'; }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next Button */}
        {gallery.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next Photo"
            style={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(15, 17, 14, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 17, 14, 0.75)'; e.currentTarget.style.color = '#fff'; }}
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Bottom Caption Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none'
        }}>
          <div>
            <div style={{ color: 'var(--text-primary, #fff)', fontSize: 16, fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {currentImage.caption || roomTitle}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
              High-resolution sanctuary preview
            </div>
          </div>
        </div>
      </div>

      {/* ── THUMBNAIL STRIP ── */}
      {gallery.length > 1 && (
        <div 
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 12,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollbarWidth: 'thin'
          }}
        >
          {gallery.map((img, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                style={{
                  flex: '0 0 92px',
                  height: 64,
                  padding: 0,
                  borderRadius: 'var(--radius-md, 8px)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: isSelected ? '2px solid var(--gold-400, #c5a059)' : '2px solid transparent',
                  outline: isSelected ? '2px solid rgba(197,160,89,0.3)' : 'none',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.6,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#1b1d19'
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.opacity = '0.6'; }}
              >
                <img 
                  src={img.url} 
                  alt={img.caption || `Thumbnail ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {img.tag && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    insetInline: 0,
                    background: 'rgba(0,0,0,0.7)',
                    fontSize: 9,
                    color: isSelected ? 'var(--gold-300, #e2c185)' : '#fff',
                    textAlign: 'center',
                    padding: '2px 0',
                    fontWeight: 600,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {img.tag}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── LUXURY FULLSCREEN LIGHTBOX MODAL ── */}
      {lightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(10, 12, 10, 0.94)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 32px',
            animation: 'fadeIn 0.25s ease'
          }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Top Header */}
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                {roomTitle}
              </div>
              <div style={{ color: 'var(--gold-300, #e2c185)', fontSize: 13, marginTop: 2 }}>
                {currentImage.caption || 'Interior Experience'} • Photo {activeIdx + 1} of {gallery.length}
              </div>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close Lightbox"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Lightbox Main Stage */}
          <div 
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '20px 0',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stage Left Arrow */}
            {gallery.length > 1 && (
              <button
                onClick={handlePrev}
                style={{
                  position: 'absolute',
                  left: 20,
                  zIndex: 10,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.color = '#fff'; }}
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Enlarged Photo */}
            <img 
              src={currentImage.url} 
              alt={currentImage.caption || roomTitle}
              style={{
                maxWidth: '90vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 16px 50px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'opacity 0.3s ease'
              }}
            />

            {/* Stage Right Arrow */}
            {gallery.length > 1 && (
              <button
                onClick={handleNext}
                style={{
                  position: 'absolute',
                  right: 20,
                  zIndex: 10,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.color = '#fff'; }}
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Bar */}
          {gallery.length > 1 && (
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 10,
                overflowX: 'auto',
                paddingTop: 8
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    width: 60,
                    height: 42,
                    borderRadius: 6,
                    overflow: 'hidden',
                    padding: 0,
                    border: idx === activeIdx ? '2px solid var(--gold-400, #c5a059)' : '2px solid transparent',
                    opacity: idx === activeIdx ? 1 : 0.45,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
