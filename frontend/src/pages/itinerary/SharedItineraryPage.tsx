import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Compass,
  Copy,
  Globe,
  Lock,
  LogOut,
  MapPin,
  Share2,
  Sparkles,
  User,
  UserCheck,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { formatDateRange, formatMoney, tripDays, useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { Trip } from '../../types';

export function SharedItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, profile, copyTrip, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [publicTrip, setPublicTrip] = useState<Trip | null>(null);
  const [error, setError] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if current user is logged in
  const isAuthenticated = Boolean(profile?.email || window.localStorage.getItem('gt_active_user'));

  useEffect(() => {
    async function loadPublicTrip() {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      // First check local trips state
      const localMatch = trips.find((t) => t.id === id);
      if (localMatch) {
        setPublicTrip(localMatch);
        setLoading(false);
        return;
      }

      // Try fetching from backend API
      try {
        const fetched = await api.fetchSharedItinerary(id);
        if (fetched) {
          const formattedTrip: Trip = {
            id: fetched.id || id,
            name: fetched.title || fetched.name || 'Shared Travel Itinerary',
            description: fetched.description || 'Public shared trip on GlobeTrotter.',
            startDate: fetched.start_date || fetched.startDate || '2026-09-01',
            endDate: fetched.end_date || fetched.endDate || '2026-09-05',
            cover: fetched.cover || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85',
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            budget: {
              total: fetched.total_budget || 50000,
              categories: { Transport: 10000, Accommodation: 20000, Activities: 10000, Meals: 7500, Other: 2500 }
            },
            stops: fetched.stops || []
          };
          setPublicTrip(formattedTrip);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadPublicTrip();
  }, [id, trips]);

  // Flatten activities
  const allActivities = useMemo(() => {
    if (!publicTrip) return [];
    return publicTrip.stops.flatMap((stop) =>
      stop.activities.map((activity) => ({
        ...activity,
        stop
      }))
    );
  }, [publicTrip]);

  const daysCount = publicTrip ? tripDays(publicTrip) : 1;
  const daysArray = Array.from({ length: Math.min(daysCount, 14) }, (_, i) => i + 1);

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    addToast('✦ Shareable itinerary link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWebShare = async () => {
    if (navigator.share && publicTrip) {
      try {
        await navigator.share({
          title: `GlobeTrotter Itinerary: ${publicTrip.name}`,
          text: `Check out this travel itinerary for ${publicTrip.name} on GlobeTrotter!`,
          url: currentUrl
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyTripToAccount = () => {
    if (!id || !publicTrip) return;
    setCopying(true);

    if (isAuthenticated) {
      // Authenticated flow: copy directly into user's account
      const newCopy = copyTrip(id);
      setCopying(false);
      if (newCopy) {
        addToast(`✦ Trip "${publicTrip.name}" copied to your account!`, 'success');
        navigate(`/trips/${newCopy.id}/build`);
      } else {
        addToast('Failed to copy trip. Please try again.', 'error');
      }
    } else {
      // Unauthenticated flow: store pending trip ID and redirect to login
      sessionStorage.setItem('gt_pending_copy_trip_id', id);
      addToast('Please sign in or register to copy this trip into your account.', 'info');
      navigate('/login', { state: { copyPending: true } });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', background: 'var(--surface-soft)' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={32} color="var(--amber-dark)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '15px' }}>Loading public itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !publicTrip) {
    return (
      <div style={{ minHeight: '85vh', background: 'var(--bg-cream)', padding: '60px 20px', display: 'grid', placeItems: 'center' }}>
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '40px 32px',
            border: '1px solid var(--line)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--amber-soft)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 20px',
              color: 'var(--amber-dark)'
            }}
          >
            <Compass size={32} />
          </div>
          <span className="eyebrow" style={{ color: 'var(--amber-dark)', fontWeight: 700, fontSize: '11px' }}>
            Unavailable Route
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--navy)', margin: '6px 0 12px', fontFamily: "'Fraunces', Georgia, serif" }}>
            Public Itinerary Not Found
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 28px' }}>
            This itinerary might be private, deleted, or the shared URL is invalid. Explore other public travel destinations or return home.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/explore')}>
              Explore Destinations
            </Button>
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-itinerary-page" style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Public Navigation Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--line)',
          padding: '14px 32px'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--navy)', display: 'grid', placeItems: 'center', color: '#ffffff' }}>
              <Globe size={20} />
            </div>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '20px', fontWeight: 700, color: 'var(--navy)' }}>
              GlobeTrotter
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber-dark)', background: 'var(--amber-soft)', border: '1px solid #ebdcc2', padding: '4px 12px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={13} /> Public Shared Itinerary
            </span>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button variant="secondary" onClick={() => navigate('/trips')} style={{ fontSize: '13px', padding: '7px 16px' }}>
                  My Trips
                </Button>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <img
                    src={profile?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                    alt="User Profile"
                    style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--amber-dark)' }}
                  />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button variant="secondary" onClick={() => navigate('/login')} style={{ fontSize: '13px', padding: '7px 16px' }}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')} style={{ fontSize: '13px', padding: '7px 16px' }}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section style={{ position: 'relative', width: '100%', minHeight: '380px', display: 'flex', alignItems: 'flex-end', padding: '48px 32px 36px', overflow: 'hidden' }}>
        <SafeImage
          src={publicTrip.cover}
          alt={publicTrip.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,29,25,0.3) 0%, rgba(20,29,25,0.85) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', width: '100%', margin: '0 auto', color: '#ffffff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ background: 'rgba(229, 155, 62, 0.9)', backdropFilter: 'blur(6px)', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Globe size={13} /> Public Trip
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: '#ffffff', fontWeight: 600, fontSize: '12px', padding: '4px 12px', borderRadius: '99px' }}>
              <CalendarDays size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {formatDateRange(publicTrip.startDate, publicTrip.endDate)} ({daysCount} Days)
            </span>
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 700, margin: '0 0 10px', textShadow: '0 4px 16px rgba(0,0,0,0.5)', fontFamily: "'Fraunces', Georgia, serif", lineHeight: 1.15 }}>
            {publicTrip.name}
          </h1>

          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', margin: '0 0 20px', maxWidth: '720px', lineHeight: 1.5 }}>
            {publicTrip.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--amber)" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                Shared publicly by GlobeTrotter Explorer
              </span>
            </div>

            {/* Hero CTA & Social Share */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                onClick={handleCopyTripToAccount}
                loading={copying}
                icon={<Copy size={16} />}
                style={{ background: 'var(--amber)', color: 'var(--navy)', fontWeight: 700, border: 'none' }}
              >
                Copy Trip to My Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0 32px' }}>
        {/* Trip Metadata Cards Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Est. Total Budget
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <CircleDollarSign size={24} color="var(--amber-dark)" />
              <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>
                {formatMoney(publicTrip.budget?.total || 50000)}
              </strong>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Destinations & Stops
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <MapPin size={24} color="var(--amber-dark)" />
              <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>
                {publicTrip.stops.length > 0 ? publicTrip.stops.map((s) => s.city).join(', ') : publicTrip.name}
              </strong>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Activities Scheduled
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <Sparkles size={24} color="var(--amber-dark)" />
              <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>
                {allActivities.length} Experiences
              </strong>
            </div>
          </div>
        </div>

        {/* Social Sharing Bar Component */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '16px 24px',
            borderRadius: '20px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            marginBottom: '36px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={20} color="var(--amber-dark)" />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', display: 'block' }}>
                Inspired by this trip? Share it with friends
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                Anyone with the link can view this read-only itinerary.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="secondary" icon={copiedLink ? <Check size={15} /> : <Copy size={15} />} onClick={handleCopyLink} style={{ fontSize: '12px' }}>
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this travel itinerary for ${publicTrip.name} on GlobeTrotter: ${currentUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '99px',
                background: '#25D366',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              WhatsApp
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '99px',
                background: '#1877F2',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Facebook
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this trip itinerary for ${publicTrip.name} on GlobeTrotter!`)}&url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '99px',
                background: '#000000',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              X / Twitter
            </a>

            <Button variant="ghost" icon={<Share2 size={15} />} onClick={handleWebShare} style={{ fontSize: '12px' }}>
              More
            </Button>
          </div>
        </div>

        {/* Column Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 280px',
            gap: '24px',
            alignItems: 'center',
            padding: '12px 24px',
            marginBottom: '20px',
            background: 'var(--surface-soft)',
            borderRadius: '14px',
            border: '1px solid var(--line)'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Timeline
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Physical Activity & Description
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
            Expense
          </span>
        </div>

        {/* Day-by-Day Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {daysArray.map((dayNum) => {
            const dayActs = allActivities.filter((a) => a.day === dayNum);
            const dayCity = dayActs[0]?.stop.city ?? publicTrip.stops[Math.min(dayNum - 1, publicTrip.stops.length - 1)]?.city ?? 'Exploration Day';
            const dayTotalExpense = dayActs.reduce((sum, a) => sum + a.price, 0);

            return (
              <div
                key={dayNum}
                className="card"
                style={{
                  borderRadius: '24px',
                  padding: '28px',
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}
              >
                {/* Day Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        background: 'var(--amber-soft)',
                        color: 'var(--amber-dark)',
                        fontWeight: 800,
                        fontSize: '14px',
                        padding: '8px 18px',
                        borderRadius: '99px',
                        border: '1px solid #ebdcc2'
                      }}
                    >
                      Day {dayNum}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
                        {dayCity}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                        {dayLabel(publicTrip, dayNum)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sage)', fontWeight: 700, fontSize: '14px' }}>
                    <CircleDollarSign size={18} />
                    <span>Day Expense: {formatMoney(dayTotalExpense)}</span>
                  </div>
                </div>

                {/* Day Activities List */}
                {dayActs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {dayActs.map((activity, index) => (
                      <div key={activity.id || index}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 260px',
                            gap: '24px',
                            alignItems: 'stretch'
                          }}
                        >
                          {/* Activity Card */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '140px 1fr',
                              gap: '20px',
                              border: '1px solid var(--line)',
                              borderRadius: '18px',
                              padding: '16px',
                              background: 'var(--surface)',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '110px' }}>
                              <SafeImage src={activity.image} alt={activity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '6px',
                                  left: '6px',
                                  background: 'rgba(20, 29, 25, 0.8)',
                                  backdropFilter: 'blur(4px)',
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px'
                                }}
                              >
                                {activity.time}
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Badge tone="amber">{activity.category}</Badge>
                                <span style={{ fontSize: '11px', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock3 size={12} /> {activity.duration}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={12} /> {activity.stop.city}
                                </span>
                              </div>
                              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
                                {activity.name}
                              </h4>
                              <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>
                                {activity.description}
                              </p>
                            </div>
                          </div>

                          {/* Expense Box */}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              textAlign: 'center',
                              border: '1px solid #ebdcc2',
                              borderRadius: '18px',
                              padding: '16px 20px',
                              background: 'linear-gradient(135deg, #fffcf7 0%, #fff8ed 100%)',
                              boxShadow: '0 2px 10px rgba(229, 155, 62, 0.08)'
                            }}
                          >
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Expense Breakdown
                            </span>
                            <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--amber-dark)', margin: '4px 0 2px' }}>
                              {formatMoney(activity.price)}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 500 }}>
                              / person estimated
                            </span>
                            <span style={{ marginTop: '8px', fontSize: '10px', color: 'var(--sage)', background: 'var(--sage-soft)', padding: '3px 8px', borderRadius: '99px', fontWeight: 600 }}>
                              Included in Budget
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'var(--surface-soft)', borderRadius: '14px' }}>
                    <p style={{ color: 'var(--ink-muted)', margin: 0, fontSize: '13px' }}>
                      No physical activities scheduled for Day {dayNum}. Enjoy free exploration in {dayCity}!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Copy Trip CTA Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(20, 29, 25, 0.94)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 32px',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--amber)" /> Love this itinerary?
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Copy this itinerary into your account to customize dates, destinations, and activities.
            </span>
          </div>

          <Button
            onClick={handleCopyTripToAccount}
            loading={copying}
            icon={<Copy size={16} />}
            style={{ background: 'var(--amber)', color: 'var(--navy)', fontWeight: 700, border: 'none', padding: '12px 24px', fontSize: '14px' }}
          >
            Copy Trip to My Account
          </Button>
        </div>
      </div>
    </div>
  );
}

function dayLabel(trip: Trip, day: number) {
  if (!trip) return 'Open day';
  const date = new Date(new Date(`${trip.startDate}T12:00:00`).getTime() + (day - 1) * 86400000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
