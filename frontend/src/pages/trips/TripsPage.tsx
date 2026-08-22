import { ArrowDownUp, ListFilter, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TripCard } from '../../components/trips/TripCard';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import type { Trip, TripStatus } from '../../types';

export function TripsPage() {
  const { trips, deleteTrip } = useApp();
  const [tab, setTab] = useState<'all' | TripStatus>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [pending, setPending] = useState<Trip | null>(null);

  const filtered = useMemo(
    () =>
      trips
        .filter(
          (trip) =>
            (tab === 'all' || trip.status === tab) &&
            `${trip.name} ${trip.stops.map((stop) => stop.city).join(' ')}`.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt))),
    [trips, tab, query, sort]
  );

  const ongoingTrips = useMemo(() => filtered.filter((t) => t.status === 'ongoing'), [filtered]);
  const upcomingTrips = useMemo(() => filtered.filter((t) => t.status === 'upcoming'), [filtered]);
  const completedTrips = useMemo(() => filtered.filter((t) => t.status === 'completed'), [filtered]);

  return (
    <div className="trips-page">
      <div className="page-heading-row">
        <div>
          <p className="eyebrow">User Trip Listing (Screen 6)</p>
          <h1>My trips</h1>
          <p className="lede">Categorized by Ongoing, Up-coming, and Completed status.</p>
        </div>
        <Link to="/trips/new" className="button button-primary"><Plus size={17} /> Plan a trip</Link>
      </div>

      <div className="trip-overview-row">
        <div className="mini-trip-stat"><strong>{trips.length}</strong><span>All trips</span></div>
        <div className="mini-trip-stat"><strong>{trips.filter((trip) => trip.status === 'ongoing').length}</strong><span>Ongoing</span></div>
        <div className="mini-trip-stat"><strong>{trips.filter((trip) => trip.status === 'upcoming').length}</strong><span>Up-coming</span></div>
        <div className="mini-trip-stat"><strong>{trips.filter((trip) => trip.status === 'completed').length}</strong><span>Completed</span></div>
      </div>

      {/* Screen 6: Toolbar with Search, Group By / Filter / Sort By */}
      <div className="trip-toolbar-main">
        <div className="tabs" role="tablist">
          {[
            ['all', 'All trips'],
            ['ongoing', 'Ongoing'],
            ['upcoming', 'Up-coming'],
            ['completed', 'Completed'],
          ].map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={tab === value}
              className={tab === value ? 'active' : ''}
              onClick={() => setTab(value as typeof tab)}
            >
              {label}
              <span>{value === 'all' ? trips.length : trips.filter((trip) => trip.status === value).length}</span>
            </button>
          ))}
        </div>

        <div className="filter-actions">
          <label className="inline-search">
            <Search size={15} />
            <input placeholder="Search trips" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button className="filter-button"><SlidersHorizontal size={15} /> Group by / Filter</button>
          <label className="sort-select">
            <ArrowDownUp size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort trips">
              <option value="recent">Recently added</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {/* Screen 6 Categorized Trip Layout */}
      {filtered.length > 0 ? (
        tab === 'all' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Ongoing Section */}
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                Ongoing Trips ({ongoingTrips.length})
              </h2>
              {ongoingTrips.length > 0 ? (
                <div className="trip-card-grid">{ongoingTrips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={setPending} />)}</div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No ongoing trips at the moment.</p>
              )}
            </div>

            {/* Up-coming Section */}
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#d97706', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                Up-coming Trips ({upcomingTrips.length})
              </h2>
              {upcomingTrips.length > 0 ? (
                <div className="trip-card-grid">{upcomingTrips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={setPending} />)}</div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No upcoming trips planned.</p>
              )}
            </div>

            {/* Completed Section */}
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#4b5563', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#9ca3af' }} />
                Completed Trips ({completedTrips.length})
              </h2>
              {completedTrips.length > 0 ? (
                <div className="trip-card-grid">{completedTrips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={setPending} />)}</div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No completed trips recorded.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="trip-card-grid">{filtered.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={setPending} />)}</div>
        )
      ) : (
        <div className="card empty-card">
          <ListFilter size={28} />
          <h2>No trips found</h2>
          <p>Try another search, or start a brand new story.</p>
          <Link to="/trips/new" className="button button-primary">Create a trip</Link>
        </div>
      )}

      <Modal open={Boolean(pending)} title="Archive this trip?" onClose={() => setPending(null)}>
        <p className="modal-copy">“{pending?.name}” will be removed from your trips. This can’t be undone in the demo.</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setPending(null)}>Keep trip</Button>
          <Button variant="danger" onClick={() => { if (pending) deleteTrip(pending.id); setPending(null); }}>Yes, archive it</Button>
        </div>
      </Modal>
    </div>
  );
}
