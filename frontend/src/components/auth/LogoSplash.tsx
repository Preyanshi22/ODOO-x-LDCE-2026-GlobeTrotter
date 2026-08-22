import { useEffect, useState } from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

interface LogoSplashProps {
  onFinish: () => void;
}

export function LogoSplash({ onFinish }: LogoSplashProps) {
  const [sliding, setSliding] = useState(false);

  const handleStart = () => {
    if (sliding) return;
    setSliding(true);
    setTimeout(() => {
      onFinish();
    }, 600); // 600ms match sliding animation duration
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleStart();
    }, 2400); // Auto advance after 2.4s

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(circle at 50% 40%, #1e2623 0%, #0d1210 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        transform: sliding ? 'translateY(-100%)' : 'translateY(0)',
        opacity: sliding ? 0 : 1,
        transition: 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.6s ease-in-out',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={handleStart}
    >
      {/* Ambient background glow ring */}
      <div
        style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 160, 68, 0.15) 0%, rgba(0,0,0,0) 70%)',
          animation: 'pulseGlow 3s infinite alternate ease-in-out',
        }}
      />

      {/* Main Logo Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          zIndex: 2,
        }}
      >
        {/* Animated Compass Icon Wrapper */}
        <div
          style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #e8a044 0%, #c47c2b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(232, 160, 68, 0.35)',
            animation: 'logoPop 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <Compass size={52} color="#ffffff" style={{ animation: 'spinCompass 12s linear infinite' }} />
          
          {/* Glowing orbital star */}
          <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
            <Sparkles size={22} color="#fef08a" />
          </div>
        </div>

        {/* Brand Text */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.8rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
              color: '#fcfbf7',
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            GlobeTrotter
          </h1>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '1rem',
              color: '#a3a29b',
              margin: 0,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Make room for what matters
          </p>
        </div>
      </div>

      {/* Bottom CTA / Skip hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: '#e8a044',
          fontWeight: 600,
          opacity: 0.9,
          zIndex: 2,
        }}
      >
        <span>Begin Journey</span>
        <ArrowRight size={15} />
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes spinCompass {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes logoPop {
          0% { transform: scale(0.6) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
