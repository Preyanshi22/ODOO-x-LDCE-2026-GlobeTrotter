import { ArrowRight, Camera, CheckCircle2, Eye, EyeOff, Image as ImageIcon, LockKeyhole, Mail, MapPin, Phone, User, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
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
    additional: ''
  });

  const set = (key: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName || !form.email || !form.city || !form.country) {
      return setError('Please complete the required fields (First Name, Email, City, Country).');
    }
    if (form.password.length < 6) {
      return setError('Create a password with at least 6 characters.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

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
        additional_info: form.additional
      });

      setLoading(false);
      addToast(`Welcome to GlobeTrotter, ${form.firstName}! Your account was created successfully.`, 'success');
      navigate('/');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

  return (
    <AuthLayout mode="register">
      {/* Screen 2 Centered Card Container */}
      <div
        className="register-wireframe-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '28px',
          padding: '36px 40px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          animation: 'card-in 0.3s ease both'
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--amber-dark)', fontWeight: 700, fontSize: '11px' }}>
          Create Account
        </span>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--navy)',
            margin: '4px 0 20px',
            fontFamily: "'Fraunces', Georgia, serif"
          }}
        >
          GlobeTrotter Registration
        </h1>

        {/* Circular Photo Box (Screen 2 Photo Picker) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px' }}>
            <SafeImage
              src={form.profilePhoto && form.profilePhoto.trim() !== '' ? form.profilePhoto : defaultAvatar}
              alt="Profile preview"
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            />
            <button
              type="button"
              aria-label="Upload photo"
              onClick={() => {
                const url = window.prompt('Enter image URL for profile photo:', form.profilePhoto);
                if (url !== null) setForm((f) => ({ ...f, profilePhoto: url }));
              }}
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                display: 'grid',
                placeItems: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--amber)',
                color: '#ffffff',
                border: '2px solid #ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              <Camera size={16} />
            </button>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '6px' }}>Photo Preview</span>
        </div>

        <form onSubmit={submit} noValidate style={{ textAlign: 'left' }}>
          {/* Inner 2-Column Form Fields Box (Screen 2 Layout) */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'var(--surface-soft)',
              border: '1px solid var(--line)',
              marginBottom: '24px'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px 20px',
                marginBottom: '16px'
              }}
            >
              {/* First Name */}
              <div className="field">
                <label htmlFor="reg-firstname" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  First Name <i>*</i>
                </label>
                <div className="input-icon">
                  <User size={16} />
                  <input id="reg-firstname" value={form.firstName} onChange={set('firstName')} placeholder="Aarav" />
                </div>
              </div>

              {/* Last Name */}
              <div className="field">
                <label htmlFor="reg-lastname" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Last Name
                </label>
                <input id="reg-lastname" value={form.lastName} onChange={set('lastName')} placeholder="Mehta" style={{ borderRadius: '11px', padding: '11px 13px' }} />
              </div>

              {/* Email Address */}
              <div className="field">
                <label htmlFor="reg-email" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Email Address <i>*</i>
                </label>
                <div className="input-icon">
                  <Mail size={16} />
                  <input id="reg-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="field">
                <label htmlFor="reg-phone" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Phone Number
                </label>
                <div className="input-icon">
                  <Phone size={16} />
                  <input id="reg-phone" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                </div>
              </div>

              {/* City */}
              <div className="field">
                <label htmlFor="reg-city" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  City <i>*</i>
                </label>
                <div className="input-icon">
                  <MapPin size={16} />
                  <input id="reg-city" value={form.city} onChange={set('city')} placeholder="Bengaluru" />
                </div>
              </div>

              {/* Country */}
              <div className="field">
                <label htmlFor="reg-country" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Country <i>*</i>
                </label>
                <input id="reg-country" value={form.country} onChange={set('country')} placeholder="India" style={{ borderRadius: '11px', padding: '11px 13px' }} />
              </div>

              {/* Password */}
              <div className="field">
                <label htmlFor="reg-pass" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Password <i>*</i>
                </label>
                <div className="input-icon">
                  <LockKeyhole size={16} />
                  <input
                    id="reg-pass"
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="6+ characters"
                  />
                  <button type="button" className="input-action" aria-label="Toggle password" onClick={() => setShow(!show)}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="field">
                <label htmlFor="reg-confirm" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Confirm Password <i>*</i>
                </label>
                <input
                  id="reg-confirm"
                  type={show ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Repeat password"
                  style={{ borderRadius: '11px', padding: '11px 13px' }}
                />
              </div>
            </div>

            {/* Additional Information .... (Full Width Textarea) */}
            <div className="field" style={{ marginTop: '8px' }}>
              <label htmlFor="reg-additional" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                Additional Information ....
              </label>
              <textarea
                id="reg-additional"
                value={form.additional}
                onChange={set('additional')}
                placeholder="Share your travel preferences, dietary habits, or bucket list experiences..."
                rows={3}
                style={{ borderRadius: '11px', padding: '11px 13px', width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert" style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </p>
          )}

          {/* Register Users Button */}
          <Button
            className="button-large button-wide"
            type="submit"
            loading={loading}
            style={{ width: '100%', borderRadius: '12px', padding: '12px', justifyContent: 'center' }}
          >
            {loading ? 'Creating account...' : 'Register Users'} {!loading && <ArrowRight size={17} />}
          </Button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <p className="auth-switch" style={{ margin: 0, fontSize: '13px', color: 'var(--ink-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--amber-dark)', fontWeight: 700 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
