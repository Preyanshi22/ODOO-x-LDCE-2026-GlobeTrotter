import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { AuthLayout } from './AuthLayout';
import { api } from '../../services/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('Please enter your full name.');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setError('');
    setLoading(true);

    try {
      await api.registerUser({ name, email, password });
      addToast('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <div className="auth-form-wrap">
        <div className="auth-heading">
          <span className="eyebrow">Start your journey</span>
          <h1>Create your<br /><em>account.</em></h1>
          <p>Join GlobeTrotter to plan, collaborate, and track trips effortlessly.</p>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="reg-name">Full name</label>
            <div className="input-icon">
              <User size={17} />
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email address</label>
            <div className="input-icon">
              <Mail size={17} />
              <input
                id="reg-email"
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
            <label htmlFor="reg-password">Password</label>
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                id="reg-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (6+ characters)"
                autoComplete="new-password"
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
            {loading ? 'Creating account...' : 'Create account'} {!loading && <span>?</span>}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="secure-note">
          <CheckCircle2 size={15} /> All accounts are secured with hashed authentication.
        </p>
      </div>
    </AuthLayout>
  );
}
