import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, ExternalLink, MapPin, Pencil, Plus, Rows3, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SafeImage } from '../../components/ui/Image';
import { formatDateRange, formatMoney, tripDays, useApp } from '../../context/AppContext';

export function CalendarPage() {
  const { trips } = useApp();
  const today = new Date();

  // Find nearest or first trip to set default active month
  const initialTrip = useMemo(() => trips[0], [trips]);
  const defaultMonthDate = useMemo(() => {
    if (initialTrip?.startDate) {
      const d = new Date(`${initialTrip.startDate}T12:00:00`);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [initialTrip, today]);

  const [month, setMonth] = useState(defaultMonthDate);
  const [selected, setSelected] = useState(() => {
    if (initialTrip?.startDate) return initialTrip.startDate;
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [view, setView] = useState<'month' | 'agenda'>('month');

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + days }, (_, index) => (index < firstDay ? null : index - firstDay + 1));

  const toKey = (day: number) => {
    const y = month.getFullYear();
    const m = String(month.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Map all activities from all trips to their exact calendar date
  const events = useMemo(
    () =>
      trips.flatMap((trip) =>
        trip.stops.flatMap((stop) =>
          stop.activities.map((activity) => {
            const startMs = new Date(`${trip.startDate}T12:00:00`).getTime();
            const actMs = startMs + (activity.day - 1) * 86400000;
            const actDate = new Date(actMs);
            const y = actDate.getFullYear();
            const m = String(actDate.getMonth() + 1).padStart(2, '0');
            const d = String(actDate.getDate()).padStart(2, '0');
            return {
              ...activity,
              trip,
              stop,
              date: `${y}-${m}-${d}`,
            };
          })
        )
      ),
    [trips]
  );

  const selectedEvents = events.filter((event) => event.date === selected);

  // Active trip encompassing the selected date
  const activeTripForSelected = useMemo(() => {
    return trips.find((t) => selected >= t.startDate && selected <= t.endDate);
  }, [trips, selected]);

  // Jump calendar view directly to a trip
  const jumpToTrip = (tripStartDate: string) => {
    const d = new Date(`${tripStartDate}T12:00:00`);
    if (!isNaN(d.getTime())) {
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      setSelected(tripStartDate);
    }
  };

  return (
    <div className="calendar-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">Your travel rhythm</p>
          <h1>Calendar</h1>
          <p className="lede">See every trip, place, activity, and spending schedule in one view.</p>
        </div>
        <Link to="/trips/new" className="button button-primary">
          <Plus size={17} /> Plan a trip
        </Link>
      </div>

      {/* Trip Quick Jump Bar */}
      {trips.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '12px 18px',
            background: 'var(--surface-soft)',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid var(--line)'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Jump to Trip:
          </span>
          {trips.map((t) => {
            const isActive = selected >= t.startDate && selected <= t.endDate;
            return (
              <button
                key={t.id}
                onClick={() => jumpToTrip(t.startDate)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: isActive ? '1px solid var(--amber)' : '1px solid var(--line)',
                  background: isActive ? 'var(--amber-soft)' : '#ffffff',
                  color: isActive ? 'var(--amber-dark)' : 'var(--navy)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sparkles size={13} />
                <span>{t.name}</span>
                <small style={{ opacity: 0.75 }}>({formatDateRange(t.startDate, t.endDate)})</small>
              </button>
            );
          })}
        </div>
      )}

      <div className="calendar-layout">
        <section className="card calendar-main">
          <div className="calendar-toolbar">
            <div className="month-switch">
              <Button variant="ghost" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                <ChevronLeft size={17} />
              </Button>
              <h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <Button variant="ghost" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                <ChevronRight size={17} />
              </Button>
            </div>
            <div className="view-toggle">
              <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>
                <CalendarDays size={15} /> Month
              </button>
              <button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')}>
                <Rows3 size={15} /> Agenda
              </button>
            </div>
          </div>

          {view === 'month' ? (
            <>
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {cells.map((day, index) => {
                  const key = day ? toKey(day) : '';
                  const dayEvents = events.filter((event) => event.date === key);

                  // Check if key falls within ANY trip date range
                  const matchingTrip = trips.find((item) => key >= item.startDate && key <= item.endDate);
                  const isTripStart = matchingTrip && matchingTrip.startDate === key;
                  const isTripEnd = matchingTrip && matchingTrip.endDate === key;

                  return (
                    <button
                      key={`${key}-${index}`}
                      className={`calendar-cell ${day && key === selected ? 'selected' : ''} ${!day ? 'blank' : ''} ${
                        matchingTrip ? 'has-trip-range' : ''
                      }`}
                      disabled={!day}
                      onClick={() => day && setSelected(key)}
                      style={{
                        background: matchingTrip && key === selected ? 'var(--amber-soft)' : matchingTrip ? 'rgba(232, 160, 68, 0.08)' : undefined,
                        borderColor: matchingTrip ? 'var(--amber)' : undefined
                      }}
                    >
                      {day && (
                        <>
                          <span className="calendar-day-number">{day}</span>

                          {matchingTrip && (
                            <span
                              className="calendar-trip-chip"
                              style={{
                                background: isTripStart || isTripEnd ? 'var(--navy)' : 'var(--amber)',
                                color: '#ffffff',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {isTripStart ? `✦ ${matchingTrip.name}` : isTripEnd ? `End: ${matchingTrip.name}` : matchingTrip.name}
                            </span>
                          )}

                          {dayEvents.slice(0, 2).map((event) => (
                            <span className="calendar-event-chip" key={event.id}>
                              <i />
                              {event.name}
                            </span>
                          ))}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="agenda-list">
              {events.map((event) => (
                <button key={event.id} className="agenda-item" onClick={() => jumpToTrip(event.date)}>
                  <span className="agenda-date">
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="agenda-line" />
                  <span style={{ textAlign: 'left', flex: 1 }}>
                    <strong>{event.name}</strong>
                    <small>
                      {event.trip.name} · {event.stop.city} · {event.time}
                    </small>
                  </span>
                  <Badge tone="amber">{event.category}</Badge>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Selected Day Details Side Panel */}
        <aside className="calendar-side" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Trip Header Card (if selected date is inside a trip) */}
          {activeTripForSelected && (
            <div
              className="card"
              style={{
                padding: '20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a34 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <Badge tone="amber">✦ Active Trip</Badge>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {formatDateRange(activeTripForSelected.startDate, activeTripForSelected.endDate)}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
                {activeTripForSelected.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 16px 0' }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                {activeTripForSelected.stops.map((s) => s.city).join(' · ') || activeTripForSelected.description}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  to={`/trips/${activeTripForSelected.id}/build`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--amber)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Pencil size={13} /> Edit Trip
                </Link>
                <Link
                  to={`/trips/${activeTripForSelected.id}/view`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  View Itinerary <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* Selected Day Schedule Details */}
          <div className="card selected-day-card">
            <div className="selected-day-heading">
              <div>
                <span className="eyebrow">Selected day</span>
                <h2>{new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
              </div>
              <CalendarDays size={20} />
            </div>

            {selectedEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedEvents.map((event) => (
                  <div className="selected-event" key={event.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {event.image && (
                      <div style={{ width: '54px', height: '54px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <SafeImage src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <Badge tone="amber">{event.category}</Badge>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> {event.time}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 4px', color: 'var(--navy)' }}>{event.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', margin: '0 0 6px' }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} /> {event.stop.city} ({event.trip.name})
                      </p>
                      <strong className="event-price" style={{ color: 'var(--amber-dark)', fontSize: '0.9rem' }}>
                        {formatMoney(event.price)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="calendar-empty">
                <div>✦</div>
                <h3>{activeTripForSelected ? `Day on ${activeTripForSelected.name}` : 'Room to wander'}</h3>
                <p>
                  {activeTripForSelected
                    ? `Part of your trip to ${activeTripForSelected.name}. Click below to add an activity.`
                    : 'Nothing is planned for this day yet. Sometimes that’s the plan.'}
                </p>
              </div>
            )}

            <Button
              className="button-wide"
              variant="secondary"
              onClick={() => {
                const targetTrip = activeTripForSelected || trips[0];
                if (targetTrip) window.location.href = `/trips/${targetTrip.id}/build`;
              }}
            >
              Add an activity <Plus size={15} />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
