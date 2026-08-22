import { ArrowLeft, ArrowRight, CalendarRange, Check, MapPin, Plus, Share2, Sparkles, Trash2, Edit3, DollarSign, Search, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { StopCard } from '../../components/trips/StopCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useApp, formatDateRange, formatMoney, tripDays, generateDestinationActivities } from '../../context/AppContext';
import type { ItinerarySection } from '../../types';

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
    updateTrip,
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

  // Dynamic per-trip section calculation & update
  const currentTripSections = useMemo(() => {
    if (!trip) return [];
    if (trip.sections && trip.sections.length > 0) return trip.sections;

    // Dynamically derive initial sections for THIS specific trip
    const city = trip.stops[0]?.city || trip.name;
    const days = tripDays(trip);
    return [
      {
        id: `sec-${trip.id}-1`,
        title: `Section 1: Transport & Arrival to ${city}`,
        description: `Flight bookings, local transfers, and airport pickup details for ${city}.`,
        startDate: 'Day 1',
        endDate: 'Day 1',
        budget: Math.round((trip.budget?.total || 50000) * 0.25)
      },
      {
        id: `sec-${trip.id}-2`,
        title: `Section 2: Hotel & Accommodation in ${city}`,
        description: `Boutique hotel stay in city center with breakfast & amenities.`,
        startDate: 'Day 1',
        endDate: `Day ${days}`,
        budget: Math.round((trip.budget?.total || 50000) * 0.45)
      },
      {
        id: `sec-${trip.id}-3`,
        title: `Section 3: Guided Tours & Culinary Experiences`,
        description: `Private city tours, sightseeing visits, and fine dining reservations.`,
        startDate: 'Day 1',
        endDate: `Day ${days}`,
        budget: Math.round((trip.budget?.total || 50000) * 0.3)
      }
    ];
  }, [trip]);

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

  const handleFinishPlanning = () => {
    if (!trip) return;

    updateTrip({
      ...trip,
      sections: currentTripSections,
    });

    setSelectedTripId(trip.id);
    addToast(`✦ Trip "${trip.name}" saved to My Trips with all activities & budget!`, 'success');
    navigate('/trips');
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !newSection.title) return;
    const sec: ItinerarySection = {
      id: `sec-${Date.now()}`,
      title: newSection.title,
      description: newSection.description || 'Custom itinerary section details.',
      startDate: newSection.startDate,
      endDate: newSection.endDate,
      budget: Number(newSection.budget) || 5000,
    };

    const updatedSections = [...currentTripSections, sec];
    updateTrip({ ...trip, sections: updatedSections });
    setNewSection({ title: '', description: '', startDate: 'Day 1', endDate: 'Day 2', budget: 5000 });
    setModal(null);
    addToast(`Added section "${sec.title}" to ${trip.name}!`, 'success');
  };

  const removeSection = (secId: string) => {
    if (!trip) return;
    const updatedSections = currentTripSections.filter((s) => s.id !== secId);
    updateTrip({ ...trip, sections: updatedSections });
    addToast('Itinerary section removed.', 'info');
  };

  const totalActivityCost = trip.stops.flatMap((stop) => stop.activities).reduce((sum, activity) => sum + activity.price, 0);

  return (
    <div className="builder-page">
      <Link to="/trips" className="back-link"><ArrowLeft size={16} /> All trips</Link>

      <div className="builder-hero">
        <div>
          <span className="eyebrow">Itinerary Builder</span>
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
          <Button icon={<Check size={16} />} onClick={handleFinishPlanning}>
            Finish & Save to My Trips
          </Button>
        </div>
      </div>

      <div className="builder-stepper">
        <span className="completed"><b>01</b> Trip details <Check size={14} /></span>
        <i />
        <span className="active"><b>02</b> Destinations & Sections</span>
        <i />
        <span className="active"><b>03</b> Curated Activities</span>
        <i />
        <span><b>04</b> Review & Save</span>
      </div>

      {/* Screen 5: Section-Based Itinerary Builder */}
      <section style={{ marginBottom: '32px' }}>
        <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p className="eyebrow">Section-Based Builder</p>
            <h2>Itinerary Sections & Budget Breakdown</h2>
          </div>
          <Button variant="secondary" icon={<Plus size={15} />} onClick={() => setModal('section')}>
            + Add another Section
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentTripSections.map((sec) => (
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
              <h2>Route Stops & Daily Experiences</h2>
            </div>
            <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setModal('stop')}>
              Add destination stop
            </Button>
          </div>
          {trip.stops.length === 0 ? (
            <div className="card empty-stops">
              <MapPin size={24} />
              <h3>No route stops added yet</h3>
              <p>Add your first city or country stop to start customizing daily activities and budgets.</p>
              <Button icon={<Plus size={16} />} onClick={() => setModal('stop')}>
                Add destination stop
              </Button>
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

      {/* Bottom Save & Finish Planning Action Bar */}
      <div
        className="card"
        style={{
          marginTop: '32px',
          marginBottom: '32px',
          padding: '24px 32px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a34 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--amber)', letterSpacing: '0.05em' }}>
            ✦ Finalize Itinerary
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '4px 0 6px 0', color: '#ffffff' }}>
            Finished Planning {trip.name}?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Save this trip along with all curated activities, stops, and budget breakdown to your <strong>My Trips</strong> section.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            to={`/trips/${trip.id}/view`}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Preview Itinerary
          </Link>
          <Button
            style={{ background: 'var(--amber)', color: '#ffffff', fontWeight: 700, padding: '10px 24px' }}
            icon={<Check size={17} />}
            onClick={handleFinishPlanning}
          >
            Finish & Save to My Trips
          </Button>
        </div>
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
        {(() => {
          const currentStopObj = trip.stops.find((s) => s.id === stopForActivity);
          const stopCity = currentStopObj?.city || '';
          const stopCountry = currentStopObj?.country || '';

          const matchedSeed = activities.filter((a) => {
            const actCity = (a.city || '').toLowerCase();
            const actCountry = (a.country || '').toLowerCase();
            const sc = stopCity.toLowerCase();
            const sctry = stopCountry.toLowerCase();
            return (sc && actCity.includes(sc)) || (sctry && actCountry.includes(sctry));
          });

          const modalActivities = matchedSeed.length > 0 ? matchedSeed : generateDestinationActivities(stopCity, stopCountry);

          return (
            <>
              <p className="modal-copy">Choose an experience curated specifically for <strong>{stopCity || 'this stop'}</strong> ({stopCountry}).</p>
              <div className="modal-activity-list">
                {modalActivities.map((activity) => (
                  <div key={activity.id} className="modal-activity">
                    <img src={activity.image} alt={activity.name} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block' }}>{activity.name}</strong>
                      <small style={{ color: 'var(--ink-muted)' }}>{activity.city} · {formatMoney(activity.price)}</small>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (stopForActivity) addActivity(trip.id, stopForActivity, activity);
                        setModal(null);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
