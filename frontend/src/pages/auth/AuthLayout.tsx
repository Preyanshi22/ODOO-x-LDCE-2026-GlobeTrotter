import { ReactNode } from 'react';

const swissAlpsBg = encodeURI('/assets/images/Swiss Alps Majesty.png');

export function AuthLayout({ children }: { children: ReactNode; mode: 'login' | 'register' }) {
  return (
    <div
      className="auth-screen-v2"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        backgroundImage: `linear-gradient(180deg, rgba(16, 28, 22, 0.65) 0%, rgba(12, 22, 17, 0.85) 100%), url("${swissAlpsBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Header Brand */}
      <div style={{ position: 'absolute', top: '24px', left: '32px', zIndex: 10 }}>
        <a href="/" className="brand" style={{ color: '#ffffff', textDecoration: 'none' }}>
          <span className="brand-symbol">✦</span>
          <span style={{ color: '#ffffff' }}>Globe<span style={{ color: 'var(--amber)' }}>Trotter</span></span>
        </a>
      </div>

      {children}
    </div>
  );
}
