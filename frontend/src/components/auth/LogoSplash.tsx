import { useEffect, useState, useMemo } from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

interface LogoSplashProps {
  onFinish: () => void;
}

function Particle({ delay, x, size, dur }: { delay: number; x: number; size: number; dur: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '-10px',
        left: `${x}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(232,160,68,${0.3 + Math.random() * 0.5}) 0%, transparent 70%)`,
        animation: `floatUp ${dur}s ${delay}s ease-out infinite`,
        pointerEvents: 'none' as const,
      }}
    />
  );
}

export function LogoSplash({ onFinish }: LogoSplashProps) {
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const [letterIdx, setLetterIdx] = useState(0);
  const brandName = 'GlobeTrotter';

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        delay: Math.random() * 3,
        x: Math.random() * 100,
        size: 2 + Math.random() * 5,
        dur: 4 + Math.random() * 6,
      })),
    []
  );

  useEffect(() => {
    // Staggered letter reveal
    if (letterIdx < brandName.length) {
      const t = setTimeout(() => setLetterIdx((p) => p + 1), 80);
      return () => clearTimeout(t);
    }
  }, [letterIdx]);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setPhase('exit');
      setTimeout(onFinish, 800);
    }, 3500);
    return () => clearTimeout(exitTimer);
  }, []);

  const handleClick = () => {
    if (phase === 'exit') return;
    setPhase('exit');
    setTimeout(onFinish, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: phase === 'exit' ? 'scale(1.08)' : 'scale(1)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s ease-out',
      }}
      onClick={handleClick}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0a0f0d 0%, #1a2520 25%, #0d1a15 50%, #152018 75%, #0a100e 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      {/* Large ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,160,68,0.08) 0%, transparent 70%)',
          animation: 'pulseGlow 4s infinite alternate ease-in-out',
        }}
      />

      {/* Orbital ring */}
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '1px solid rgba(232,160,68,0.15)',
          animation: 'orbitRing 6s linear infinite',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            left: '50%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#e8a044',
            boxShadow: '0 0 12px rgba(232,160,68,0.8)',
          }}
        />
      </div>

      {/* Second orbital ring - opposite direction */}
      <div
        style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          border: '1px solid rgba(232,160,68,0.08)',
          animation: 'orbitRing 10s linear infinite reverse',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-3px',
            left: '50%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#fef08a',
            boxShadow: '0 0 10px rgba(254,240,138,0.6)',
          }}
        />
      </div>

      {/* Main Logo Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          zIndex: 3,
        }}
      >
        {/* Logo Icon with 3D rotation */}
        <div
          style={{
            position: 'relative',
            width: '110px',
            height: '110px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #e8a044 0%, #d4882a 50%, #c47c2b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 60px rgba(232,160,68,0.4), 0 0 80px rgba(232,160,68,0.15)',
            animation: 'logoPop 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, logoFloat 3s 1.2s ease-in-out infinite',
            perspective: '600px',
          }}
        >
          <Compass
            size={58}
            color="#ffffff"
            style={{
              animation: 'compass3D 8s ease-in-out infinite',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            }}
          />

          {/* Corner sparkle */}
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              animation: 'sparkleRotate 4s ease-in-out infinite',
            }}
          >
            <Sparkles size={24} color="#fef08a" style={{ filter: 'drop-shadow(0 0 6px rgba(254,240,138,0.8))' }} />
          </div>

          {/* Inner glow ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '35px',
              border: '2px solid rgba(255,255,255,0.15)',
              animation: 'pulseGlow 2s infinite alternate',
            }}
          />
        </div>

        {/* Letter-by-letter Brand Text */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '3.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
              color: '#fcfbf7',
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {brandName.split('').map((letter, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: i < letterIdx ? 1 : 0,
                  transform: i < letterIdx ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.8)',
                  transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  color: letter === 'T' && i === 5 ? '#e8a044' : '#fcfbf7',
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '1.05rem',
              color: '#a3a29b',
              margin: 0,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: letterIdx >= brandName.length ? 1 : 0,
              transform: letterIdx >= brandName.length ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
            }}
          >
            Make room for what matters
          </p>
        </div>
      </div>

      {/* Bottom CTA with glowing pulse */}
      <div
        style={{
          position: 'absolute',
          bottom: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          color: '#e8a044',
          fontWeight: 600,
          zIndex: 3,
          opacity: letterIdx >= brandName.length ? 1 : 0,
          transform: letterIdx >= brandName.length ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s',
          animation: letterIdx >= brandName.length ? 'ctaPulse 2s ease-in-out infinite' : 'none',
        }}
      >
        <span>Begin Journey</span>
        <ArrowRight size={16} style={{ animation: 'arrowBounce 1.5s ease-in-out infinite' }} />
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes compass3D {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(15deg) rotateX(-10deg); }
          50% { transform: rotateY(0deg) rotateX(5deg); }
          75% { transform: rotateY(-15deg) rotateX(-5deg); }
          100% { transform: rotateY(0deg) rotateX(0deg); }
        }
        @keyframes orbitRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.95); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes logoPop {
          0% { transform: scale(0.4) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sparkleRotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(15deg) scale(1.2); }
        }
        @keyframes ctaPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
