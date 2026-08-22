import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { AuthLayout } from './AuthLayout';
import { api } from '../../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const userData = await api.loginUser({ email, password });
      localStorage.setItem('user', JSON.stringify(userData));
      addToast(`Welcome back, ${userData.name}!`, 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <div className="auth-form-wrap">
        <div className="auth-heading">
          <span className="eyebrow">Welcome back</span>
          <h1>Pick up where<br /><em>you left off.</em></h1>
          <p>Sign in to keep planning your next escape.</p>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email address</label>
            <div className="input-icon">
              <Mail size={17} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                id="login-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
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

          {error && <p className="form-error" role="alert" style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}

          <Button className="button-large button-wide" type="submit" loading={loading}>
            {loading ? 'Signing you in...' : 'Sign in'} {!loading && <span>?</span>}
          </Button>
        </form>

        <p className="auth-switch">
          New to GlobeTrotter? <Link to="/register">Create an account</Link>
        </p>
        <p className="secure-note">
          <CheckCircle2 size={15} /> Authenticated securely with MongoDB.
        </p>
      </div>
    </AuthLayout>
  );
}
