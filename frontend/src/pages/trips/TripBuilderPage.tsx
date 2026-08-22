import { ArrowLeft, ArrowRight, CalendarRange, Check, MapPin, Plus, Share2, Sparkles, Trash2, Edit3, DollarSign, Search, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StopCard } from '../../components/trips/StopCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useApp, formatDateRange, formatMoney, tripDays } from '../../context/AppContext';

interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export function TripBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    trips,
    selectedTrip,
    destinations,
    activities,
    setSelectedTripId,
    addStop,
    updateStop,
    removeStop,
    moveStop,
    addActivity,
    removeActivity,
    addToast,
  } = useApp();

  const trip = trips.find((item) => item.id === id) ?? selectedTrip;
  const [modal, setModal] = useState<'stop' | 'activity' | 'section' | null>(null);
  const [stopForActivity, setStopForActivity] = useState('');

  // Modal City Search State
  const [modalCitySearch, setModalCitySearch] = useState('');
  const [modalCityRegion, setModalCityRegion] = useState('all');
  const [modalCityCost, setModalCityCost] = useState('all');

  const filteredModalDestinations = (destinations || []).filter((dest) => {
    const q = modalCitySearch.toLowerCase().trim();
    const textMatch = !q || `${dest.city} ${dest.country} ${dest.region} ${dest.tags.join(' ')}`.toLowerCase().includes(q);
    const regionMatch = modalCityRegion === 'all' || dest.region.toLowerCase() === modalCityRegion.toLowerCase();
    const costMatch = modalCityCost === 'all' || (modalCityCost === 'budget' ? dest.costIndex <= 2 : modalCityCost === 'mid' ? dest.costIndex === 3 : dest.costIndex >= 4);
    return textMatch && regionMatch && costMatch;
  });

  // Screen 5 Section Builder State
  const [sections, setSections] = useState<ItinerarySection[]>([
    {
      id: 'sec-1',
      title: 'Section 1: Transport & Arrival Transfers',
      description: 'Flight bookings, local train station transfers, and airport pickup details.',
      startDate: 'Day 1',
      endDate: 'Day 1',
      budget: 15000,
    },
    {
      id: 'sec-2',
      title: 'Section 2: Boutique Hotel & Accommodation',
      description: 'Luxury hotel stay in city center with breakfast & amenities.',
      startDate: 'Day 1',
      endDate: 'Day 4',
      budget: 25000,
    },
    {
      id: 'sec-3',
      title: 'Section 3: Guided Tours & Culinary Experiences',
      description: 'Private city tours, temple visits, and fine dining reservations.',
      startDate: 'Day 2',
      endDate: 'Day 4',
      budget: 10000,
    },
  ]);

  const [newSection, setNewSection] = useState({ title: '', description: '', startDate: 'Day 1', endDate: 'Day 2', budget: 5000 });

  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTripId(trip.id);
  }, [trip, selectedTrip?.id, setSelectedTripId]);

  if (!trip)
    return (
      <div className="loading-screen">
        <p>Finding that trip...</p>
      </div>
    );

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.title) return;
    const sec: ItinerarySection = {
      id: `sec-${Date.now()}`,
      title: newSection.title,
      description: newSection.description || 'All necessary information about this section.',
      startDate: newSection.startDate,
      endDate: newSection.endDate,
      budget: Number(newSection.budget) || 5000,
    };
    setSections((prev) => [...prev, sec]);
    setNewSection({ title: '', description: '', startDate: 'Day 1', endDate: 'Day 2', budget: 5000 });
    setModal(null);
    addToast('New itinerary section added!', 'success');
  };

  const removeSection = (secId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== secId));
    addToast('Section removed.', 'info');
  };

  const totalActivityCost = trip.stops.flatMap((stop) => stop.activities).reduce((sum, activity) => sum + activity.price, 0);

  return (
    <div className="builder-page">
      <Link to="/trips" className="back-link"><ArrowLeft size={16} /> All trips</Link>

      <div className="builder-hero">
        <div>
          <span className="eyebrow">Build Itinerary Screen (Screen 5)</span>
          <h1>{trip.name}</h1>
          <p>{trip.description}</p>
          <div className="builder-meta">
            <span><CalendarRange size={15} /> {formatDateRange(trip.startDate, trip.endDate)}</span>
            <span><MapPin size={15} /> {trip.stops.length} {trip.stops.length === 1 ? 'stop' : 'stops'}</span>
            <span><Sparkles size={15} /> {tripDays(trip)} days</span>
          </div>
        </div>
        <div className="builder-actions">
          <Button
            variant="secondary"
            icon={<Share2 size={16} />}
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/shared/${trip.id}`);
              addToast('Share link copied.', 'info');
            }}
          >
            Share
          </Button>
          <Button icon={<Check size={16} />} onClick={() => navigate(`/trips/${trip.id}/view`)}>
            Finish planning
          </Button>
        </div>
      </div>

      <div className="builder-stepper">
        <span className="completed"><b>01</b> Trip details <Check size={14} /></span>
        <i />
        <span className="active"><b>02</b> Destinations & Sections</span>
        <i />
        <span><b>03</b> Activities</span>
        <i />
        <span><b>04</b> Review</span>
      </div>

      {/* Screen 5: Section-Based Itinerary Builder */}
      <section style={{ marginBottom: '32px' }}>
        <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p className="eyebrow">Screen 5 Requirement</p>
            <h2>Itinerary Sections & Budget Breakdown</h2>
          </div>
          <Button variant="secondary" icon={<Plus size={15} />} onClick={() => setModal('section')}>
            + Add another Section
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', margin: 0 }}>{sec.title}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706', background: '#fffbe6', padding: '4px 10px', borderRadius: '8px' }}>
                    Budget: {formatMoney(sec.budget)}
                  </span>
                  <button onClick={() => removeSection(sec.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '0 0 12px 0' }}>{sec.description}</p>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', gap: '16px' }}>
                <span><strong>Date Range:</strong> {sec.startDate} to {sec.endDate}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setModal('section')}>
            + Add another Section
          </Button>
        </div>
      </section>

      <div className="builder-content">
        <section className="stops-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The journey</p>
              <h2>Your stops</h2>
            </div>
            <Button variant="secondary" icon={<Plus size={15} />} onClick={() => setModal('stop')}>
              Add stop
            </Button>
          </div>
          {trip.stops.length === 0 ? (
            <div className="card builder-empty">
              <div className="empty-icon"><MapPin size={22} /></div>
              <h3>Every great route starts somewhere.</h3>
              <p>Choose your first city and begin connecting the dots.</p>
              <Button onClick={() => setModal('stop')}>Add your first stop</Button>
            </div>
          ) : (
            <div className="stops-list">
              {trip.stops.map((stop, index) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={index}
                  total={trip.stops.length}
                  onRemove={() => removeStop(trip.id, stop.id)}
                  onMove={(direction) => moveStop(trip.id, stop.id, direction)}
                  onAddActivity={() => { setStopForActivity(stop.id); setModal('activity'); }}
                  onRemoveActivity={(activityId) => removeActivity(trip.id, stop.id, activityId)}
                  onDatesChange={(dates) => updateStop(trip.id, stop.id, dates)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="builder-aside">
          <div className="card next-step-card">
            <div className="next-step-icon"><Sparkles size={18} /></div>
            <span className="eyebrow">Next up</span>
            <h3>Fill your days with moments</h3>
            <p>Find activities that turn a destination into a memory.</p>
            <Button className="button-wide" variant="dark" onClick={() => { setStopForActivity(trip.stops[0]?.id ?? ''); setModal('activity'); }}>
              Browse experiences <ArrowRight size={15} />
            </Button>
          </div>

          <div className="card builder-budget-card">
            <div className="section-heading">
              <h3>Budget snapshot</h3>
              <Link to={`/budget/${trip.id}`}><ArrowRight size={15} /></Link>
            </div>
            <strong>{formatMoney(trip.budget.total)}</strong>
            <p className="muted">Estimated trip budget</p>
            <div className="mini-breakdown">
              {Object.entries(trip.budget.categories).slice(0, 4).map(([name, value]) => (
                <span key={name}><i /> {name}<b>{formatMoney(value)}</b></span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Add Section Modal */}
      <Modal open={modal === 'section'} title="Add Itinerary Section" onClose={() => setModal(null)}>
        <form onSubmit={handleAddSection} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Section Title *</label>
            <input
              required
              placeholder="e.g. Section 4: Day Trips & Guided Excursions"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Section Details / Information</label>
            <textarea
              rows={3}
              placeholder="All necessary information about this section (train station, hotel, or any activity)..."
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Start Date Range</label>
              <input
                placeholder="e.g. Day 3"
                value={newSection.startDate}
                onChange={(e) => setNewSection({ ...newSection, startDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>End Date Range</label>
              <input
                placeholder="e.g. Day 5"
                value={newSection.endDate}
                onChange={(e) => setNewSection({ ...newSection, endDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Section Budget (₹)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={newSection.budget}
              onChange={(e) => setNewSection({ ...newSection, budget: Number(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" type="button" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit">Save Section</Button>
          </div>
        </form>
      </Modal>

      {/* Add Stop Modal with Complete City Search Interface */}
      <Modal open={modal === 'stop'} title="Add a destination to your route" onClose={() => setModal(null)}>
        <div className="city-search-modal-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p className="modal-copy" style={{ margin: 0 }}>
            Search curated destinations by city, country, or region — or add a custom city.
          </p>

          {/* Search Input Bar */}
          <div className="overview-search-input" style={{ width: '100%', padding: '10px 16px' }}>
            <Search size={16} color="var(--amber-dark)" />
            <input
              type="text"
              placeholder="Search city, country, or region (e.g. Paris, Japan)..."
              value={modalCitySearch}
              onChange={(e) => setModalCitySearch(e.target.value)}
              style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontSize: '13px' }}
            />
            {modalCitySearch && (
              <button
                type="button"
                onClick={() => setModalCitySearch('')}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--ink-muted)' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={modalCityRegion}
              onChange={(e) => setModalCityRegion(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '11px', background: '#fff', fontWeight: 600 }}
              aria-label="Filter by region"
            >
              <option value="all">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Middle East">Middle East</option>
              <option value="North America">North America</option>
            </select>

            <select
              value={modalCityCost}
              onChange={(e) => setModalCityCost(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '11px', background: '#fff', fontWeight: 600 }}
              aria-label="Filter by budget"
            >
              <option value="all">Any Budget</option>
              <option value="budget">Budget ($)</option>
              <option value="mid">Mid-range ($$)</option>
              <option value="premium">Premium ($$$)</option>
            </select>
          </div>

          {/* City Results List */}
          <div className="modal-destination-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredModalDestinations.length > 0 ? (
              filteredModalDestinations.map((destination) => {
                const isAdded = trip.stops.some((stop) => stop.city.toLowerCase() === destination.city.toLowerCase());
                return (
                  <div
                    key={destination.id}
                    className="modal-destination-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--line)',
                      background: '#fff',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <img
                      src={destination.image}
                      alt={destination.city}
                      style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{destination.city}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{destination.country}</span>
                        <span className="badge badge-amber" style={{ fontSize: '9px', padding: '2px 6px', marginLeft: 'auto' }}>
                          ♥ {destination.popularity}% Popularity
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--ink-faint)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--sage)' }}>
                          {destination.costIndex <= 2 ? 'Budget ($)' : destination.costIndex === 3 ? 'Mid-range ($$)' : 'Premium ($$$)'}
                        </span>
                        <span>•</span>
                        <span>{destination.region}</span>
                        <span>•</span>
                        <span>{destination.tags.join(', ')}</span>
                      </div>
                    </div>

                    <Button
                      variant={isAdded ? 'secondary' : 'primary'}
                      className="button-small"
                      disabled={isAdded}
                      onClick={() => {
                        addStop(trip.id, destination);
                        addToast(`Added ${destination.city} to ${trip.name}!`, 'success');
                        setModal(null);
                      }}
                    >
                      {isAdded ? 'Added' : <><Plus size={14} /> Add</>}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface-soft)', borderRadius: '12px', color: 'var(--ink-muted)' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px' }}>No pre-curated cities match "{modalCitySearch}".</p>
                {modalCitySearch.trim() && (
                  <Button
                    variant="primary"
                    className="button-small"
                    onClick={() => {
                      const customDest = {
                        id: `custom-${Date.now()}`,
                        city: modalCitySearch.trim(),
                        country: 'Custom Destination',
                        region: 'Global',
                        description: 'Custom travel stop added by user.',
                        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
                        popularity: 90,
                        costIndex: 3,
                        tags: ['Custom', 'Explore']
                      };
                      addStop(trip.id, customDest);
                      addToast(`Added ${customDest.city} to your trip itinerary!`, 'success');
                      setModalCitySearch('');
                      setModal(null);
                    }}
                  >
                    <Plus size={14} /> Add "{modalCitySearch.trim()}" as Custom Stop
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal open={modal === 'activity'} title="Add an experience" onClose={() => setModal(null)}>
        <p className="modal-copy">Choose something to make {trip.stops.find((stop) => stop.id === stopForActivity)?.city ?? 'this stop'} feel like yours.</p>
        <div className="modal-activity-list">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="modal-activity">
              <img src={activity.image} alt="" />
              <div><strong>{activity.name}</strong><small>{activity.city} · {formatMoney(activity.price)}</small></div>
              <Button variant="secondary" onClick={() => { if (stopForActivity) addActivity(trip.id, stopForActivity, activity); setModal(null); }}>Add</Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
