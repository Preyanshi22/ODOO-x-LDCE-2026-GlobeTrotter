import { Camera, Check, Globe2, Lock, Mail, MapPin, Phone, Save, Shield, Trash2, UserRound, ArrowRight } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SafeImage } from '../../components/ui/Image';
import { useApp, formatDateRange, formatMoney } from '../../context/AppContext';

export function ProfilePage() {
  const { profile, updateProfile, trips, addToast } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState<'profile' | 'preferences' | 'privacy'>('profile');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(profile);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (!profile || !form) return <div className="loading-screen" />;

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateProfile(form);
    addToast('Your profile was saved.');
  };

  const preplannedTrips = trips.filter((t) => t.status === 'upcoming');
  const previousTrips = trips.filter((t) => t.status === 'completed' || t.status === 'ongoing');

  return (
    <div className="profile-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">User Profile Pages (Screen 7)</p>
          <h1>Profile & settings</h1>
          <p className="lede">User details with appropriate option to edit those information.</p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-nav card">
          <div className="profile-card-top">
            <div className="profile-avatar-wrap">
              <SafeImage src={form.avatar} alt={`${form.firstName} ${form.lastName}`} />
              <button aria-label="Change profile photo"><Camera size={14} /></button>
            </div>
            <h2>{form.firstName} {form.lastName}</h2>
            <p>{form.email}</p>
          </div>
          <nav>
            {[
              ['profile', <UserRound size={16} />, 'Personal details'],
              ['preferences', <Globe2 size={16} />, 'Travel preferences'],
              ['privacy', <Shield size={16} />, 'Privacy & security'],
            ].map(([value, icon, label]) => (
              <button key={String(value)} className={section === value ? 'active' : ''} onClick={() => setSection(value as typeof section)}>
                {icon}<span>{label}</span>
              </button>
            ))}
          </nav>
          <Link to="/login" className="logout-link">Sign out</Link>
        </aside>

        <main className="card profile-form-card">
          {section === 'profile' && (
            <div>
              <form onSubmit={save}>
                <div className="form-card-heading">
                  <div className="form-icon"><UserRound size={20} /></div>
                  <div>
                    <h2>Personal details</h2>
                    <p>User details with appropriate option to edit those information.</p>
                  </div>
                </div>
                <div className="form-grid form-grid-two">
                  <div className="field"><label htmlFor="profile-first">First name</label><input id="profile-first" value={form.firstName} onChange={set('firstName')} /></div>
                  <div className="field"><label htmlFor="profile-last">Last name</label><input id="profile-last" value={form.lastName} onChange={set('lastName')} /></div>
                  <div className="field"><label htmlFor="profile-email">Email address</label><div className="input-icon"><Mail size={16} /><input id="profile-email" type="email" value={form.email} onChange={set('email')} /></div></div>
                  <div className="field"><label htmlFor="profile-phone">Phone number</label><div className="input-icon"><Phone size={16} /><input id="profile-phone" value={form.phone} onChange={set('phone')} /></div></div>
                  <div className="field"><label htmlFor="profile-city">Home city</label><div className="input-icon"><MapPin size={16} /><input id="profile-city" value={form.city} onChange={set('city')} /></div></div>
                  <div className="field"><label htmlFor="profile-country">Country</label><input id="profile-country" value={form.country} onChange={set('country')} /></div>
                </div>
                <div className="field"><label htmlFor="profile-avatar">Profile photo URL</label><input id="profile-avatar" value={form.avatar} onChange={set('avatar')} /></div>
                <div className="form-submit-row">
                  <span><Check size={15} /> Changes saved to your profile</span>
                  <Button type="submit" icon={<Save size={15} />}>Save changes</Button>
                </div>
              </form>

              {/* Screen 7: Preplanned Trips */}
              <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Preplanned Trips</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {preplannedTrips.length > 0 ? (
                    preplannedTrips.map((t) => (
                      <div key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', background: '#ffffff' }}>
                        <SafeImage src={t.cover} alt={t.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{t.name}</strong>
                        <small style={{ color: '#6b7280', display: 'block', marginBottom: '10px' }}>{formatDateRange(t.startDate, t.endDate)}</small>
                        <Button variant="secondary" className="button-small" onClick={() => navigate(`/trips/${t.id}/view`)}>View</Button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No preplanned trips.</p>
                  )}
                </div>
              </div>

              {/* Screen 7: Previous Trips */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Previous Trips</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {previousTrips.length > 0 ? (
                    previousTrips.map((t) => (
                      <div key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', background: '#ffffff' }}>
                        <SafeImage src={t.cover} alt={t.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{t.name}</strong>
                        <small style={{ color: '#6b7280', display: 'block', marginBottom: '10px' }}>{formatDateRange(t.startDate, t.endDate)}</small>
                        <Button variant="secondary" className="button-small" onClick={() => navigate(`/trips/${t.id}/view`)}>View</Button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No previous trips.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {section === 'preferences' && (
            <form onSubmit={save}>
              <div className="form-card-heading">
                <div className="form-icon"><Globe2 size={20} /></div>
                <div>
                  <h2>Travel preferences</h2>
                  <p>Help us make future recommendations feel more like you.</p>
                </div>
              </div>
              <div className="preference-block">
                <h3>Favorite ways to travel</h3>
                <div className="preference-chips">
                  {['Slow mornings', 'Local food', 'Art & culture', 'Nature', 'Nightlife', 'Wellness', 'Architecture', 'Road trips'].map((item) => (
                    <button type="button" className={item === 'Local food' || item === 'Art & culture' ? 'selected' : ''} key={item}>
                      {item}{(item === 'Local food' || item === 'Art & culture') && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="language">Language</label>
                <select id="language" value={form.language} onChange={set('language')}>
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>हिन्दी</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="form-submit-row">
                <span>Recommendations are always optional.</span>
                <Button type="submit" icon={<Save size={15} />}>Save preferences</Button>
              </div>
            </form>
          )}

          {section === 'privacy' && (
            <div>
              <div className="form-card-heading">
                <div className="form-icon"><Shield size={20} /></div>
                <div>
                  <h2>Privacy & security</h2>
                  <p>You’re in control of what you share and who sees it.</p>
                </div>
              </div>
              <div className="settings-list">
                <div>
                  <span className="settings-icon"><Lock size={17} /></span>
                  <span><strong>Profile visibility</strong><small>Choose who can see your shared trips</small></span>
                  <select value={form.privacy} onChange={set('privacy')}>
                    <option value="public">Everyone</option>
                    <option value="friends">Friends only</option>
                    <option value="private">Only me</option>
                  </select>
                </div>
              </div>
              <div className="danger-zone">
                <div><h3>Delete account</h3><p>This permanently removes your profile and saved trips.</p></div>
                <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)}>Delete account</Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal open={deleteOpen} title="Delete your account?" onClose={() => setDeleteOpen(false)}>
        <p className="modal-copy">This demo will only clear your local profile. Are you sure?</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { setDeleteOpen(false); addToast('Account deletion is disabled in demo.', 'info'); }}>Delete account</Button>
        </div>
      </Modal>
    </div>
  );
}
