import { Camera, Check, Globe2, Mail, MapPin, Phone, Save, UserRound, Eye, Calendar, ArrowRight } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { useApp, formatDateRange } from '../../context/AppContext';

export function ProfilePage() {
  const { profile, updateProfile, trips, addToast } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(profile);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (!profile || !form) return <div className="loading-screen" />;

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateProfile(form);
    setIsEditing(false);
    addToast('Your profile details were updated.');
  };

  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

  const preplannedTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'ongoing');
  const previousTrips = trips.filter((t) => t.status === 'completed');

  // Fallback demo trips to populate grid if user has fewer trips
  const demoPreviousTrips = previousTrips.length > 0 ? previousTrips : [
    {
      id: 'trip-bali-demo',
      name: 'Island Time in Bali',
      startDate: '2024-11-10',
      endDate: '2024-11-16',
      cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85',
      stops: [{ city: 'Bali', country: 'Indonesia' }]
    },
    {
      id: 'trip-paris-demo',
      name: 'Autumn in Paris & Provence',
      startDate: '2024-09-15',
      endDate: '2024-09-24',
      cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=85',
      stops: [{ city: 'Paris', country: 'France' }]
    },
    {
      id: 'trip-tokyo-demo',
      name: 'Cherry Blossom Season Tokyo',
      startDate: '2024-04-01',
      endDate: '2024-04-10',
      cover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=85',
      stops: [{ city: 'Tokyo', country: 'Japan' }]
    }
  ];

  return (
    <div className="profile-page-v2" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-heading-row" style={{ marginBottom: '18px', marginTop: '0' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--amber-dark)', fontWeight: 700, fontSize: '12px' }}>
            User Profile Pages (Screen 7)
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--navy)', margin: '4px 0 8px', fontFamily: "'Fraunces', Georgia, serif" }}>
            GlobalTrotter Profile
          </h1>
          <p className="lede" style={{ color: 'var(--ink-muted)', fontSize: '14px' }}>
            User details with appropriate option to edit those information.
          </p>
        </div>
      </div>

      {/* Top Box: Image of the User + User Details */}
      <div
        className="card user-profile-header-box"
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '32px',
          padding: '32px',
          borderRadius: '24px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          alignItems: 'center',
          marginBottom: '36px'
        }}
      >
        {/* Left: Image of the User */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="profile-avatar-wrap" style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '16px' }}>
            <SafeImage
              src={form.avatar && form.avatar.trim() !== '' ? form.avatar : defaultAvatar}
              alt={`${form.firstName} ${form.lastName}`}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            />
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => {
                const url = window.prompt('Enter image URL for profile photo:', form.avatar);
                if (url !== null) {
                  setForm((f) => ({ ...f, avatar: url }));
                  updateProfile({ ...form, avatar: url });
                }
              }}
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                display: 'grid',
                placeItems: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--amber)',
                color: '#ffffff',
                border: '3px solid #ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease'
              }}
            >
              <Camera size={18} />
            </button>
          </div>
          <strong style={{ fontSize: '18px', color: 'var(--navy)' }}>
            {form.firstName} {form.lastName}
          </strong>
          <span style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px' }}>{form.email}</span>
        </div>

        {/* Right: User Details with appropriate option to edit those information */}
        <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
                User Details
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
                Manage your personal info, contact details, and location preferences.
              </p>
            </div>
            <Button
              variant={isEditing ? 'ghost' : 'secondary'}
              onClick={() => setIsEditing(!isEditing)}
              icon={isEditing ? <Check size={16} /> : <UserRound size={16} />}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </Button>
          </div>

          <form onSubmit={save}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px 24px',
                marginBottom: '20px'
              }}
            >
              <div className="field">
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>First Name</label>
                {isEditing ? (
                  <input value={form.firstName} onChange={set('firstName')} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '10px' }}>{form.firstName || 'Not specified'}</div>
                )}
              </div>

              <div className="field">
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Last Name</label>
                {isEditing ? (
                  <input value={form.lastName} onChange={set('lastName')} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '10px' }}>{form.lastName || 'Not specified'}</div>
                )}
              </div>

              <div className="field">
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Email Address</label>
                {isEditing ? (
                  <input type="email" value={form.email} onChange={set('email')} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={15} color="var(--amber-dark)" /> {form.email}
                  </div>
                )}
              </div>

              <div className="field">
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                {isEditing ? (
                  <input value={form.phone} onChange={set('phone')} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="var(--amber-dark)" /> {form.phone || '+1 (555) 234-5678'}
                  </div>
                )}
              </div>

              <div className="field">
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Home City</label>
                {isEditing ? (
                  <input value={form.city} onChange={set('city')} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} color="var(--amber-dark)" /> {form.city || 'Zurich'}
                  </div>
                )}
              </div>

              <div className="field">
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Country</label>
                {isEditing ? (
                  <input value={form.country} onChange={set('country')} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line)', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe2 size={15} color="var(--amber-dark)" /> {form.country || 'Switzerland'}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" icon={<Save size={16} />}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Middle Section: Preplanned Trips */}
      <section style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--navy)', margin: 0, fontFamily: "'Fraunces', Georgia, serif" }}>
              Preplanned Trips
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
              Upcoming multicity itineraries saved in your GlobeTrotter account.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber-dark)', background: 'var(--amber-soft)', padding: '6px 14px', borderRadius: '99px' }}>
            {preplannedTrips.length} Upcoming
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {preplannedTrips.length > 0 ? (
            preplannedTrips.map((trip) => (
              <div
                key={trip.id}
                className="card trip-preplanned-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
                  <SafeImage
                    src={trip.cover}
                    alt={trip.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(20, 29, 25, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '5px 12px',
                      borderRadius: '99px'
                    }}
                  >
                    Upcoming
                  </span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
                    {trip.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)', fontSize: '12px', marginBottom: '16px' }}>
                    <Calendar size={14} color="var(--amber-dark)" />
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                    <Button
                      variant="secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      icon={<Eye size={15} />}
                      onClick={() => navigate(`/trips/${trip.id}/build`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: 'span 3', padding: '32px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--line)' }}>
              <p style={{ color: 'var(--ink-muted)', margin: 0 }}>No preplanned trips found. Build a new trip from the Trip Builder!</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Section: Previous Trips */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--navy)', margin: 0, fontFamily: "'Fraunces', Georgia, serif" }}>
              Previous Trips
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
              Past journeys and completed travel adventures.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)', background: 'var(--surface-soft)', padding: '6px 14px', borderRadius: '99px' }}>
            {demoPreviousTrips.length} Completed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {demoPreviousTrips.map((trip) => (
            <div
              key={trip.id}
              className="card trip-previous-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid var(--line)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
                <SafeImage
                  src={trip.cover}
                  alt={trip.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(5, 150, 105, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '99px'
                  }}
                >
                  Completed
                </span>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
                  {trip.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)', fontSize: '12px', marginBottom: '16px' }}>
                  <Calendar size={14} color="var(--sage)" />
                  <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                  <Button
                    variant="secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    icon={<Eye size={15} />}
                    onClick={() => navigate(`/trips/${trip.id}/view`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
