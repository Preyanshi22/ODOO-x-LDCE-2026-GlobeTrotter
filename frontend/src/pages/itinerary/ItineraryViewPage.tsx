import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, Copy, MapPin, Printer, Share2, Train, Utensils, Wallet, X, CircleDollarSign } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { formatDateRange, formatMoney, tripDays, useApp } from '../../context/AppContext';

export function ItineraryViewPage({ shared = false }: { shared?: boolean }) {
  const { id } = useParams();
  const { selectedTrip, trips, copyTrip, addToast } = useApp();
  const trip = trips.find((item) => item.id === id) ?? selectedTrip;
  const [mode, setMode] = useState<'timeline' | 'list'>('timeline');
  const [day, setDay] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const allActivities = trip?.stops.flatMap((stop) => stop.activities.map((activity) => ({ ...activity, stop }))) ?? [];
  const dayActivities = useMemo(() => allActivities.filter((activity) => activity.day === day), [allActivities, day]);

  if (!trip) return <div className="loading-screen"><p>Loading itinerary...</p></div>;

  const shareUrl = `${window.location.origin}/shared/${trip.id}`;

  return (
    <div className="itinerary-page">
      <Link to={shared ? '/' : `/trips/${trip.id}/build`} className="back-link">
        <ArrowLeft size={16} /> {shared ? 'GlobeTrotter' : 'Back to builder'}
      </Link>

      <section className="itinerary-cover">
        <SafeImage src={trip.cover} alt={trip.name} />
        <div className="itinerary-cover-overlay">
          <div>
            <span className="eyebrow light">{shared ? 'A shared journey' : 'Screen 9: Itinerary for a selected place'}</span>
            <h1>{trip.name}</h1>
            <p>{trip.stops.map((stop) => stop.city).join('  ·  ') || 'A journey waiting to happen'} <span>•</span> {formatDateRange(trip.startDate, trip.endDate)}</p>
          </div>
          <div className="itinerary-cover-actions">
            {!shared && <Link to={`/trips/${trip.id}/build`} className="button button-light">Edit itinerary</Link>}
            {shared && (
              <Button variant="light" icon={<Copy size={16} />} onClick={() => { const copy = copyTrip(trip.id); if (copy) window.location.href = `/trips/${copy.id}/build`; }}>
                Copy trip
              </Button>
            )}
            <Button variant="light" icon={<Printer size={16} />} onClick={() => window.print()}>
              Print PDF
            </Button>
            <Button variant="light" icon={<Share2 size={16} />} onClick={() => setShareModalOpen(true)}>
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {shareModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Share Itinerary</h3>
              <button onClick={() => setShareModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '16px' }}>
              Anyone with this link can view your itinerary details and timeline.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                readOnly
                value={shareUrl}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#f9fafb' }}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  addToast('Shareable link copied to clipboard!', 'success');
                }}
              >
                Copy Link
              </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShareModalOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      <div className="itinerary-summary">
        <div><span className="summary-icon"><CalendarDays size={18} /></span><span><small>Duration</small><strong>{tripDays(trip)} days</strong></span></div>
        <div><span className="summary-icon"><MapPin size={18} /></span><span><small>Destinations</small><strong>{trip.stops.length} cities</strong></span></div>
        <div><span className="summary-icon"><Wallet size={18} /></span><span><small>Estimated budget</small><strong>{formatMoney(trip.budget.total)}</strong></span></div>
        <div className="summary-spacer" />
        <div className="view-toggle" role="group" aria-label="Itinerary view">
          <button className={mode === 'timeline' ? 'active' : ''} onClick={() => setMode('timeline')}>Timeline</button>
          <button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>List</button>
        </div>
      </div>

      <div className="itinerary-body">
        <aside className="day-nav">
          <div className="day-nav-heading"><span className="eyebrow">Your days</span><span>{tripDays(trip)} total</span></div>
          {Array.from({ length: Math.min(tripDays(trip), 12) }, (_, index) => index + 1).map((number) => (
            <button key={number} className={day === number ? 'active' : ''} onClick={() => setDay(number)}>
              <span>Day {String(number).padStart(2, '0')}</span>
              <small>{dayLabel(trip, number)}</small>
              <ChevronRight size={15} />
            </button>
          ))}
        </aside>

        <main className={`day-itinerary ${mode}`}>
          <div className="day-title-row">
            <div>
              <span className="eyebrow">Itinerary for a selected place (Screen 9) · Day {String(day).padStart(2, '0')}</span>
              <h2>{dayLabel(trip, day)}</h2>
              <p className="muted">{dayActivities.length ? `${dayActivities.length} moments planned` : 'A little room for spontaneity'}</p>
            </div>
            <div className="day-nav-arrows">
              <Button variant="ghost" disabled={day <= 1} onClick={() => setDay((value) => value - 1)}><ChevronLeft size={16} /></Button>
              <Button variant="ghost" disabled={day >= tripDays(trip)} onClick={() => setDay((value) => value + 1)}><ChevronRight size={16} /></Button>
            </div>
          </div>

          <div className="day-location">
            <span className="location-line" />
            <MapPin size={15} />
            <strong>{dayActivities[0]?.stop.city ?? trip.stops[Math.min(day - 1, trip.stops.length - 1)]?.city ?? 'Open day'}</strong>
            <span>{dayActivities[0]?.stop.country ?? 'Explore at your own pace'}</span>
          </div>

          {/* Screen 9: Physical Activity & Expense Breakdown Side-by-Side */}
          {dayActivities.length ? (
            <div>
              <div className="activity-timeline">
                {dayActivities.sort((a, b) => a.time.localeCompare(b.time)).map((item) => (
                  <div className="timeline-item" key={item.id}>
                    <div className="timeline-time">{item.time}<small>{item.duration}</small></div>
                    <div className="timeline-rail"><span /><i /></div>
                    <article className="timeline-card">
                      <SafeImage src={item.image} alt={item.name} />
                      <div>
                        <div className="timeline-card-top">
                          <Badge tone="amber">{item.category}</Badge>
                          <span>{formatMoney(item.price)} / person</span>
                        </div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className="timeline-extra">
                          <span><Clock3 size={13} /> {item.duration}</span>
                          <span><MapPin size={13} /> {item.stop.city}</span>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              {/* Screen 9 Expense Line Items Table */}
              <div style={{ marginTop: '28px', padding: '20px', borderRadius: '14px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CircleDollarSign size={18} color="#d97706" /> Day {day} Expense Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dayActivities.map((act) => (
                    <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px dashed #e5e7eb' }}>
                      <span><strong>Physical Activity:</strong> {act.name} ({act.category})</span>
                      <strong style={{ color: '#059669' }}>{formatMoney(act.price)}</strong>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, paddingTop: '8px', color: '#111827' }}>
                    <span>Total Day {day} Expense</span>
                    <span style={{ color: '#d97706' }}>{formatMoney(dayActivities.reduce((sum, a) => sum + a.price, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="day-empty">
              <div className="empty-icon">✦</div>
              <h3>Leave a little room for wonder</h3>
              <p>No activities are pinned to this day yet. That can be intentional.</p>
            </div>
          )}

          <div className="travel-note">
            <Train size={18} />
            <div>
              <strong>Travel note</strong>
              <p>Remember to leave a little buffer between each beautiful thing.</p>
            </div>
            <Utensils size={18} />
          </div>
        </main>
      </div>
    </div>
  );
}

function dayLabel(trip: NonNullable<ReturnType<typeof useApp>['selectedTrip']>, day: number) {
  if (!trip) return 'Open day';
  const date = new Date(new Date(`${trip.startDate}T12:00:00`).getTime() + (day - 1) * 86400000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
