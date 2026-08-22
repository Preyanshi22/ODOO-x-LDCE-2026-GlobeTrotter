import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus, Rows3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatMoney, useApp } from '../../context/AppContext';

export function CalendarPage() {
  const { trips } = useApp();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10));
  const [view, setView] = useState<'month' | 'agenda'>('month');

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + days }, (_, index) => (index < firstDay ? null : index - firstDay + 1));

  const toKey = (day: number) =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const events = useMemo(
    () =>
      trips.flatMap((trip) =>
        trip.stops.flatMap((stop) =>
          stop.activities.map((activity) => ({
            ...activity,
            trip,
            stop,
            date: new Date(new Date(`${trip.startDate}T12:00:00`).getTime() + (activity.day - 1) * 86400000)
              .toISOString()
              .slice(0, 10),
          }))
        )
      ),
    [trips]
  );

  const selectedEvents = events.filter((event) => event.date === selected);

  return (
    <div className="calendar-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">Your travel rhythm</p>
          <h1>Calendar</h1>
          <p className="lede">See every place, plan, and possibility in one gentle view.</p>
        </div>
        <Link to="/trips/new" className="button button-primary">
          <Plus size={17} /> Plan a trip
        </Link>
      </div>

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
                  const trip = trips.find((item) => item.startDate === key || item.endDate === key);
                  return (
                    <button
                      key={`${key}-${index}`}
                      className={`calendar-cell ${day && key === selected ? 'selected' : ''} ${!day ? 'blank' : ''}`}
                      disabled={!day}
                      onClick={() => day && setSelected(key)}
                    >
                      {day && (
                        <>
                          <span className="calendar-day-number">{day}</span>
                          {trip && <span className="calendar-trip-chip">{trip.name}</span>}
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
                <button key={event.id} className="agenda-item" onClick={() => setSelected(event.date)}>
                  <span className="agenda-date">
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <span className="agenda-line" />
                  <span>
                    <strong>{event.name}</strong>
                    <small>
                      {event.stop.city} · {event.time}
                    </small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="calendar-side">
          <div className="card selected-day-card">
            <div className="selected-day-heading">
              <div>
                <span className="eyebrow">Selected day</span>
                <h2>{new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
              </div>
              <CalendarDays size={20} />
            </div>

            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <div className="selected-event" key={event.id}>
                  <div className="event-time">
                    <strong>{event.time}</strong>
                    <small>{event.duration}</small>
                  </div>
                  <div>
                    <Badge tone="amber">{event.category}</Badge>
                    <h3>{event.name}</h3>
                    <p>
                      <MapPin size={13} /> {event.stop.city}
                    </p>
                    <strong className="event-price">{formatMoney(event.price)}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="calendar-empty">
                <div>✦</div>
                <h3>Room to wander</h3>
                <p>Nothing is planned for this day yet. Sometimes that’s the plan.</p>
              </div>
            )}

            <Button
              className="button-wide"
              variant="secondary"
              onClick={() => {
                const trip = trips[0];
                if (trip) window.location.href = `/trips/${trip.id}/build`;
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
