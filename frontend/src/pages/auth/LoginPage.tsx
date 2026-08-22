import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const { addToast, loginUser } = useApp();

  const [email, setEmail] = useState('aarav@globetrotter.app');
  const [password, setPassword] = useState('password123');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      setLoading(false);
      addToast('Welcome back to GlobeTrotter!', 'success');
      navigate('/');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Invalid email or password.');
    }
  };

  return (
    <AuthLayout mode="login">
      {/* Screen 1 Centered Card Container */}
      <div
        className="login-wireframe-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '28px',
          padding: '40px 36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          animation: 'card-in 0.3s ease both'
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--amber-dark)', fontWeight: 700, fontSize: '11px' }}>
          Welcome Back
        </span>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--navy)',
            margin: '4px 0 24px',
            fontFamily: "'Fraunces', Georgia, serif"
          }}
        >
          GlobeTrotter Sign In
        </h1>

        {/* Circular Photo Box (Screen 1 Photo) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '105px',
              height: '105px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--amber-soft) 0%, #ffffff 100%)',
              border: '4px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--amber-dark)'
            }}
          >
            <UserRound size={48} strokeWidth={1.8} />
          </div>
        </div>

        <form onSubmit={submit} noValidate style={{ display: 'grid', gap: '18px', textAlign: 'left' }}>
          {/* Username / Email */}
          <div className="field" style={{ textAlign: 'left' }}>
            <label htmlFor="login-email" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Username / Email Address
            </label>
            <div className="input-icon">
              <Mail size={17} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or username"
                autoComplete="email"
                style={{ borderRadius: '12px', padding: '11px 14px 11px 40px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field" style={{ textAlign: 'left' }}>
            <div className="field-label-row">
              <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 700 }}>
                Forgot password?
              </Link>
            </div>
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                id="login-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{ borderRadius: '12px', padding: '11px 40px 11px 40px' }}
              />
              <button
                type="button"
                className="input-action"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert" style={{ color: 'var(--red)', fontSize: '12px', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Login Button */}
          <div style={{ marginTop: '8px' }}>
            <Button
              className="button-large button-wide"
              type="submit"
              loading={loading}
              style={{ width: '100%', borderRadius: '12px', padding: '12px', justifyContent: 'center' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
          <p className="auth-switch" style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--ink-muted)' }}>
            New to GlobeTrotter?{' '}
            <Link to="/register" style={{ color: 'var(--amber-dark)', fontWeight: 700 }}>
              Create an account
            </Link>
          </p>
          <p className="secure-note" style={{ margin: 0, fontSize: '11px', color: 'var(--ink-faint)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--sage)' }} /> Verified secure authentication
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
