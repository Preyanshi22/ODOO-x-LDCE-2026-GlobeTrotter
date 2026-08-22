import { ArrowRight, CalendarDays, ChevronRight, Compass, Map, Plus, Sparkles, WalletCards, Globe2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DestinationCard } from '../../components/discovery/DestinationCard';
import { ActivityCard } from '../../components/discovery/ActivityCard';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SafeImage } from '../../components/ui/Image';
import { formatDateRange, formatMoney, tripDays, useApp } from '../../context/AppContext';

export function DashboardPage() {
  const { selectedTrip, trips, destinations, activities, profile } = useApp();
  const navigate = useNavigate();

  if (!profile)
    return (
      <div className="loading-screen">
        <div className="loading-orb" />
        <p>Gathering your travel plans...</p>
      </div>
    );

  const activeTrip = selectedTrip || trips[0];
  const spent = activeTrip ? Object.values(activeTrip.budget.categories).reduce((sum, value) => sum + value, 0) : 0;
  const progress = activeTrip ? Math.round((spent / activeTrip.budget.total) * 100) : 0;

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">{greeting()}, {profile.firstName}</p>
          <h1>Where are you going<br /><em>next?</em></h1>
          <p className="lede">Your next great story is closer than you think. Let’s make a plan for it.</p>
        </div>
        <div className="welcome-badge">
          <Sparkles size={18} />
          <span><strong>{trips.length}</strong> trips on your horizon</span>
        </div>
      </section>

      {/* Screen 3: Banner Image & Travel Search */}
      <section className="travel-search-card">
        <div className="search-card-copy">
          <span className="eyebrow light">Start with a feeling</span>
          <h2>What kind of trip<br />are you dreaming of?</h2>
          <p>Find a place, save an idea, or start shaping your next adventure.</p>
        </div>
        <div className="search-card-actions">
          <button onClick={() => navigate('/explore')}>
            <span className="search-action-icon"><Compass size={20} /></span>
            <span><strong>Explore somewhere new</strong><small>Browse destinations & activities</small></span>
            <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/trips/new')}>
            <span className="search-action-icon"><Plus size={20} /></span>
            <span><strong>Plan a new trip</strong><small>Turn an idea into an itinerary</small></span>
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="sun-shape" />
      </section>

      {/* Screen 3: Top Regional Selections */}
      <section className="quick-actions" style={{ marginBottom: '32px' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Top Regional Selections</p>
            <h2>Explore by Region</h2>
          </div>
        </div>
        <div className="quick-action-grid">
          <Link to="/explore/cities?search=Europe">
            <span className="quick-icon quick-amber"><Globe2 /></span>
            <span><strong>Europe</strong><small>Paris, Swiss Alps, Prague</small></span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/explore/cities?search=Asia">
            <span className="quick-icon quick-blue"><Globe2 /></span>
            <span><strong>Asia</strong><small>Kyoto, Tokyo, Osaka</small></span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/explore/cities?search=Mediterranean">
            <span className="quick-icon quick-green"><Globe2 /></span>
            <span><strong>Mediterranean</strong><small>Santorini, Amalfi Coast</small></span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/explore/cities?search=Americas">
            <span className="quick-icon quick-lilac"><Globe2 /></span>
            <span><strong>Americas</strong><small>New York, Vancouver</small></span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Screen 3: Upcoming & Active Trip Section */}
      {activeTrip && (
        <section className="dashboard-grid-top">
          <article className="upcoming-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your next adventure</p>
                <h2>{activeTrip.name}</h2>
              </div>
              <Link to={`/trips/${activeTrip.id}/build`} className="text-link">Open trip <ArrowRight size={15} /></Link>
            </div>
            <div className="upcoming-visual">
              <SafeImage src={activeTrip.cover} alt={activeTrip.name} />
              <div className="upcoming-overlay">
                <div>
                  <span className="upcoming-place">{activeTrip.stops.map((stop) => stop.city).join('  ·  ') || 'Your route is waiting'}</span>
                  <strong>{formatDateRange(activeTrip.startDate, activeTrip.endDate)}</strong>
                </div>
                <span className="upcoming-days">{tripDays(activeTrip)}<small>days</small></span>
              </div>
            </div>
            <div className="upcoming-footer">
              <div>
                <span className="muted small">Planning progress</span>
                <ProgressBar value={activeTrip.stops.length} max={4} tone="amber" label={`${activeTrip.stops.length} of 4 stops added`} />
              </div>
              <Link to={`/trips/${activeTrip.id}/build`} className="button button-primary">Continue planning</Link>
            </div>
          </article>

          <article className="budget-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Trip budget</p>
                <h2>Stay curious, not costly.</h2>
              </div>
              <Link to={`/budget/${activeTrip.id}`} className="icon-link" aria-label="View budget"><ChevronRight size={19} /></Link>
            </div>
            <div className="budget-number">
              <strong>{formatMoney(spent)}</strong>
              <span>of {formatMoney(activeTrip.budget.total)} estimated</span>
            </div>
            <ProgressBar value={spent} max={activeTrip.budget.total} label={`${progress}% allocated`} tone={progress > 90 ? 'red' : 'green'} />
            <div className="budget-breakdown">
              {Object.entries(activeTrip.budget.categories).slice(0, 3).map(([key, value]) => (
                <div key={key}>
                  <span className={`breakdown-dot dot-${key.toLowerCase()}`} /> <span>{key}</span>
                  <strong>{formatMoney(value)}</strong>
                </div>
              ))}
            </div>
            <Link to={`/budget/${activeTrip.id}`} className="button button-secondary button-wide">See full breakdown <ArrowRight size={15} /></Link>
          </article>
        </section>
      )}

      {/* Screen 3: Previous / Planned Trips Overview */}
      <section className="recommendation-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your Journeys</p>
            <h2>Previous & Planned Trips</h2>
          </div>
          <Link to="/trips/new" className="button button-primary"><Plus size={16} /> Plan a trip</Link>
        </div>
        <div className="destination-grid">
          {trips.map((trip) => (
            <article className="destination-card" key={trip.id}>
              <div className="destination-image-wrap">
                <SafeImage src={trip.cover} alt={trip.name} className="destination-image" />
                <span className="image-badge">{trip.status.toUpperCase()}</span>
              </div>
              <div className="destination-body">
                <h3>{trip.name}</h3>
                <p>{trip.stops.map((s) => s.city).join(', ') || 'Flexible stops'} • {formatDateRange(trip.startDate, trip.endDate)}</p>
                <div className="destination-footer">
                  <span><strong>{formatMoney(trip.budget.total)}</strong></span>
                  <Button variant="secondary" onClick={() => navigate(`/trips/${trip.id}/view`)}>View trip</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="recommendation-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Curated for you</p>
            <h2>Places worth going around for</h2>
          </div>
          <Link to="/explore/cities" className="button button-quiet">View all cities <ArrowRight size={15} /></Link>
        </div>
        <div className="destination-grid">
          {destinations.slice(0, 4).map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </section>

      <section className="recommendation-section activity-recommendation">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Add a little magic</p>
            <h2>Experiences to remember</h2>
          </div>
          <Link to="/explore/activities" className="button button-quiet">Explore activities <ArrowRight size={15} /></Link>
        </div>
        <div className="activity-grid">
          {activities.slice(0, 3).map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
