import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function HallCarousel({ 
  images = [], 
  hallName = 'Gathering Space', 
  height = 220,
  showCaption = false 
}) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const slides = images.length > 0 ? images : [
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', caption: hallName, tag: 'Main View' }
  ];

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx(idx);
  };

  const activeSlide = slides[currentIdx] || slides[0];

  return (
    <div 
      className="hall-carousel-container"
      style={{
        position: 'relative',
        height,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#121411',
      }}
    >
      {/* Background Image with smooth transition */}
      <img
        src={typeof activeSlide === 'string' ? activeSlide : activeSlide.url}
        alt={activeSlide.caption || hallName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.4s ease, opacity 0.3s ease',
        }}
      />

      {/* Top Left: Slide Counter & Tag Badge */}
      <div 
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 5,
          display: 'flex',
          gap: 6,
          alignItems: 'center'
        }}
      >
        <span style={{
          background: 'rgba(15, 17, 14, 0.75)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          <Camera size={11} style={{ color: 'var(--gold-400, #c5a059)' }} />
          {currentIdx + 1} / {slides.length}
        </span>
        {activeSlide.tag && (
          <span style={{
            background: 'rgba(197, 160, 89, 0.9)',
            color: '#0d0f0c',
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {activeSlide.tag}
          </span>
        )}
      </div>

      {/* Ambient Gradient Overlay for Text Readability */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.1) 50%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none'
        }} 
      />

      {/* Previous Button */}
      {slides.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 6,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(15, 17, 14, 0.75)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 17, 14, 0.75)'; e.currentTarget.style.color = '#fff'; }}
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Next Button */}
      {slides.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 6,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(15, 17, 14, 0.75)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-400, #c5a059)'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 17, 14, 0.75)'; e.currentTarget.style.color = '#fff'; }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Slide Indicators: Capsule Dots Track */}
      {slides.length > 1 && (
        <div 
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            zIndex: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6
          }}
        >
          {slides.map((_, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={idx}
                onClick={(e) => handleDotClick(e, idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  height: 6,
                  width: isActive ? 22 : 6,
                  borderRadius: 10,
                  backgroundColor: isActive ? 'var(--gold-400, #c5a059)' : 'rgba(255, 255, 255, 0.45)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Optional Caption Bar */}
      {showCaption && activeSlide.caption && (
        <div 
          style={{
            position: 'absolute',
            bottom: 30,
            left: 14,
            right: 14,
            zIndex: 5,
            color: '#f5f2eb',
            fontSize: 12,
            fontWeight: 500,
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none'
          }}
        >
          {activeSlide.caption}
        </div>
      )}
    </div>
  );
}
