import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Copy,
  MapPin,
  Printer,
  Share2,
  X,
  Search,
  ArrowDown,
  CircleDollarSign,
  Wallet,
  Check
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { formatDateRange, formatMoney, tripDays, useApp } from '../../context/AppContext';

export function ItineraryViewPage({ shared = false }: { shared?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedTrip, trips, copyTrip, addToast } = useApp();
  const trip = trips.find((item) => item.id === id) ?? selectedTrip;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [sortBy, setSortBy] = useState('time');
  const [groupBy, setGroupBy] = useState('day');
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Flatten all activities with their associated stop & day info
  const allActivities = useMemo(() => {
    if (!trip) return [];
    return trip.stops.flatMap((stop) =>
      stop.activities.map((activity) => ({
        ...activity,
        stop
      }))
    );
  }, [trip]);

  // Group activities by Day number
  const daysCount = trip ? tripDays(trip) : 1;
  const daysArray = Array.from({ length: Math.min(daysCount, 14) }, (_, i) => i + 1);

  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      const matchSearch =
        act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.stop.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        categoryFilter === 'All categories' || act.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [allActivities, searchQuery, categoryFilter]);

  if (!trip)
    return (
      <div className="loading-screen">
        <p>Loading itinerary...</p>
      </div>
    );

  const shareUrl = `${window.location.origin}/shared/${trip.id}`;

  return (
    <div className="itinerary-page-screen9" style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link
          to={shared ? '/' : `/trips/${trip.id}/build`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--ink-muted)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> {shared ? 'GlobeTrotter Home' : 'Back to Builder'}
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!shared && (
            <Button variant="secondary" onClick={() => navigate(`/trips/${trip.id}/build`)}>
              Edit Itinerary
            </Button>
          )}
          {shared && (
            <Button
              variant="secondary"
              icon={<Copy size={16} />}
              onClick={() => {
                const copy = copyTrip(trip.id);
                if (copy) navigate(`/trips/${copy.id}/build`);
              }}
            >
              Copy Trip
            </Button>
          )}
          <Button variant="ghost" icon={<Printer size={16} />} onClick={() => window.print()}>
            Print PDF
          </Button>
          <Button variant="ghost" icon={<Share2 size={16} />} onClick={() => setShareModalOpen(true)}>
            Share
          </Button>
        </div>
      </div>

      {/* Screen 9 Toolbar / Top Bar */}
      <div
        className="screen9-toolbar card"
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
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px' }}>
          <Search size={18} color="var(--amber-dark)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bar ......"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--ink)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CustomSelect
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: 'day', label: 'Group by: Day' },
              { value: 'category', label: 'Group by: Category' },
              { value: 'city', label: 'Group by: City' }
            ]}
            ariaLabel="Group by option"
          />

          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              'All categories',
              'Adventure',
              'Sightseeing',
              'Food',
              'Culture',
              'Nature',
              'History'
            ]}
            ariaLabel="Filter category"
          />

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'time', label: 'Sort by: Time' },
              { value: 'price-desc', label: 'Sort by: Expense (High to Low)' },
              { value: 'price-asc', label: 'Sort by: Expense (Low to High)' }
            ]}
            ariaLabel="Sort by option"
          />
        </div>
      </div>

      {/* Screen 9 Title Banner */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span className="eyebrow" style={{ color: 'var(--amber-dark)', fontWeight: 700, fontSize: '12px' }}>
          Itinerary View Screen with budget section (Screen 9)
        </span>
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 600,
            color: 'var(--navy)',
            margin: '6px 0 8px',
            fontFamily: "'Fraunces', Georgia, serif"
          }}
        >
          Itinerary for {trip.name}
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontSize: '14px', margin: 0 }}>
          {trip.stops.map((s) => s.city).join(' · ') || 'Multicity Trip'} — {formatDateRange(trip.startDate, trip.endDate)}
        </p>
      </div>

      {/* Column Headers: Physical Activity | Expense */}
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

      {/* Day-by-Day Screen 9 Flow */}
      <div className="screen9-days-flow" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {daysArray.map((dayNum) => {
          let dayActs = filteredActivities.filter((a) => a.day === dayNum);

          if (sortBy === 'price-desc') dayActs = [...dayActs].sort((a, b) => b.price - a.price);
          else if (sortBy === 'price-asc') dayActs = [...dayActs].sort((a, b) => a.price - b.price);
          else dayActs = [...dayActs].sort((a, b) => a.time.localeCompare(b.time));

          const dayCity = dayActs[0]?.stop.city ?? trip.stops[Math.min(dayNum - 1, trip.stops.length - 1)]?.city ?? 'Exploration Day';
          const dayTotalExpense = dayActs.reduce((sum, a) => sum + a.price, 0);

          return (
            <div
              key={dayNum}
              className="screen9-day-section card"
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
                      {dayLabel(trip, dayNum)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage)', fontWeight: 700, fontSize: '14px' }}>
                  <CircleDollarSign size={18} />
                  <span>Day Expense: {formatMoney(dayTotalExpense)}</span>
                </div>
              </div>

              {/* Day Activities + Side-by-Side Expense Box */}
              {dayActs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {dayActs.map((activity, index) => (
                    <div key={activity.id || index}>
                      {/* Physical Activity (Left) + Expense (Right) */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 260px',
                          gap: '24px',
                          alignItems: 'stretch'
                        }}
                      >
                        {/* Physical Activity Box */}
                        <div
                          className="physical-activity-card"
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
                          className="expense-card-box"
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

                      {/* Down Arrow (↓) connecting to next activity in timeline */}
                      {index < dayActs.length - 1 && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px 0',
                            color: 'var(--amber)'
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              placeItems: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--amber-soft)',
                              border: '1px solid #ebdcc2'
                            }}
                          >
                            <ArrowDown size={16} color="var(--amber-dark)" />
                          </div>
                        </div>
                      )}
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
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Share Itinerary</h3>
              <button onClick={() => setShareModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '16px' }}>
              Anyone with this link can view your Screen 9 itinerary and expense details.
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
              <Button variant="secondary" onClick={() => setShareModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function dayLabel(trip: NonNullable<ReturnType<typeof useApp>['selectedTrip']>, day: number) {
  if (!trip) return 'Open day';
  const date = new Date(new Date(`${trip.startDate}T12:00:00`).getTime() + (day - 1) * 86400000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
