import { ArrowRight, Check, Eye, EyeOff, Image as ImageIcon, LockKeyhole, Mail, MapPin, Phone, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const { addToast, registerUser } = useApp();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    confirm: '',
    profilePhoto: '',
    additional: '',
  });

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName || !form.email || !form.city || !form.country)
      return setError('Please complete the required fields.');
    if (form.password.length < 6) return setError('Create a password with at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setError('');
    setLoading(true);

    try {
      await registerUser({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        country: form.country,
        password: form.password,
        profile_photo: form.profilePhoto,
        additional_info: form.additional,
      });

      setLoading(false);
      addToast(`Welcome to GlobeTrotter, ${form.firstName}! Your account was created in MongoDB.`);
      navigate('/');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout mode="register">
      <div className="auth-form-wrap register-wrap">
        <div className="auth-heading">
          <span className="eyebrow">Your next chapter</span>
          <h1>Make room for<br /><em>more somewhere.</em></h1>
          <p>Build a travel profile that turns “one day” into a real itinerary.</p>
        </div>
        <form className="auth-form register-form" onSubmit={submit} noValidate>
          <div className="form-grid form-grid-two">
            <div className="field">
              <label htmlFor="first-name">First name <i>*</i></label>
              <div className="input-icon">
                <User size={16} />
                <input id="first-name" value={form.firstName} onChange={set('firstName')} placeholder="Aarav" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="last-name">Last name</label>
              <input id="last-name" value={form.lastName} onChange={set('lastName')} placeholder="Mehta" />
            </div>
            <div className="field">
              <label htmlFor="register-email">Email <i>*</i></label>
              <div className="input-icon">
                <Mail size={16} />
                <input id="register-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <div className="input-icon">
                <Phone size={16} />
                <input id="phone" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="city">Home city <i>*</i></label>
              <div className="input-icon">
                <MapPin size={16} />
                <input id="city" value={form.city} onChange={set('city')} placeholder="Bengaluru" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="country">Country <i>*</i></label>
              <input id="country" value={form.country} onChange={set('country')} placeholder="India" />
            </div>
            <div className="field">
              <label htmlFor="register-password">Password <i>*</i></label>
              <div className="input-icon">
                <LockKeyhole size={16} />
                <input
                  id="register-password"
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="6+ characters"
                />
                <button
                  type="button"
                  className="input-action"
                  aria-label="Toggle password"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirm password <i>*</i></label>
              <input
                id="confirm-password"
                type={show ? 'text' : 'password'}
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat password"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-photo">Profile photo URL</label>
            <div className="input-icon">
              <ImageIcon size={16} />
              <input id="profile-photo" value={form.profilePhoto} onChange={set('profilePhoto')} placeholder="Paste a photo URL (optional)" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="additional-info">A little more about you</label>
            <textarea
              id="additional-info"
              value={form.additional}
              onChange={set('additional')}
              placeholder="What kind of places make you feel most alive?"
              rows={3}
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}

          <Button className="button-large button-wide" type="submit" loading={loading}>
            {loading ? 'Creating your account...' : 'Create my account'} {!loading && <ArrowRight size={17} />}
          </Button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="secure-note"><Check size={15} /> Your personal details are saved securely to MongoDB Atlas.</p>
      </div>
    </AuthLayout>
  );
}
