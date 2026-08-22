import { ArrowDownUp, ArrowRight, Compass, Globe2, Layers, MapPin, Plus, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DestinationCard } from '../../components/discovery/DestinationCard';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { formatDateRange, formatMoney, useApp } from '../../context/AppContext';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function DashboardPage() {
  const { trips, destinations, profile } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');

  const regions = [
    {
      id: 'europe',
      name: 'Europe',
      subtitle: 'Paris, Rome, Swiss Alps',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      badge: '5 Destinations',
      query: 'Europe'
    },
    {
      id: 'east-asia',
      name: 'East Asia',
      subtitle: 'Kyoto, Tokyo, Osaka',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      badge: '4 Destinations',
      query: 'Japan'
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean',
      subtitle: 'Santorini, Amalfi Coast',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
      badge: '3 Destinations',
      query: 'Greece'
    },
    {
      id: 'americas',
      name: 'Americas',
      subtitle: 'New York, Vancouver',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
      badge: '4 Destinations',
      query: 'Americas'
    },
    {
      id: 'oceania',
      name: 'Oceania & Pacific',
      subtitle: 'Sydney, Bali, Fiji',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
      badge: '3 Destinations',
      query: 'Australia'
    }
  ];

  // 1. Live Filtered Regional Selections
  const filteredRegions = useMemo(() => {
    let result = regions;
    if (selectedRegionFilter !== 'all') {
      const rf = selectedRegionFilter.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(rf) ||
          r.subtitle.toLowerCase().includes(rf) ||
          r.query.toLowerCase().includes(rf)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.query.toLowerCase().includes(q)
      );
    }
    return result;
  }, [regions, searchQuery, selectedRegionFilter]);

  // 2. Live Filtered Trips
  const processedTrips = useMemo(() => {
    return trips
      .filter((trip) => {
        if (groupBy === 'upcoming' && trip.status !== 'upcoming') return false;
        if (groupBy === 'completed' && trip.status !== 'completed') return false;

        const textMatch = !searchQuery.trim() || `${trip.name} ${trip.stops.map((s) => `${s.city} ${s.country}`).join(' ')} ${trip.description || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
        const regionMatch = selectedRegionFilter === 'all' || trip.stops.some((s) => s.country.toLowerCase().includes(selectedRegionFilter.toLowerCase()));
        return textMatch && regionMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'budget') return b.budget.total - a.budget.total;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [trips, searchQuery, selectedRegionFilter, groupBy, sortBy]);

  // 3. Live Filtered Destinations
  const filteredDestinations = useMemo(() => {
    let result = destinations;
    if (selectedRegionFilter !== 'all') {
      const rf = selectedRegionFilter.toLowerCase();
      result = result.filter(
        (d) =>
          d.country.toLowerCase().includes(rf) ||
          d.region.toLowerCase().includes(rf) ||
          d.city.toLowerCase().includes(rf)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result.slice(0, 4);
  }, [destinations, searchQuery, selectedRegionFilter]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!profile) {
    return (
      <div className="loading-screen">
        <div className="loading-orb" />
        <p>Gathering your travel profile...</p>
      </div>
    );
  }

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="overview-wireframe-container">
      {/* 1. Full-Width Banner Image */}
      <section className="overview-banner-hero">
        <div className="banner-overlay-content">
          <div className="banner-tag">
            <Sparkles size={15} />
            <span>Curated Travel Scrapbook</span>
          </div>
          <h1>Discover Your Next Horizon</h1>
          <p>Plan bespoke multi-stop routes, balance budgets, and turn "one day" into your real itinerary.</p>
        </div>
      </section>

      {/* 2. Search Bar + Action Controls Row */}
      <section className="overview-search-toolbar">
        <form className="overview-search-input" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon-svg" onClick={handleSearchSubmit} style={{ cursor: 'pointer' }} />
          <input
            type="text"
            placeholder="Search bar ... (type city, country, or route & press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>

        <div className="overview-toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CustomSelect
            value={groupBy}
            onChange={setGroupBy}
            icon={<Layers size={15} />}
            options={[
              { value: 'all', label: 'Group by (All)' },
              { value: 'upcoming', label: 'Upcoming Trips' },
              { value: 'completed', label: 'Completed Trips' }
            ]}
            ariaLabel="Group by option"
          />

          <button
            type="button"
            className={`toolbar-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: showFilters ? '1px solid #ebdcc2' : '1px solid #e2ddd3',
              borderRadius: '99px',
              padding: '10px 18px',
              background: showFilters ? 'var(--amber-soft)' : '#ffffff',
              color: showFilters ? 'var(--amber-dark)' : 'var(--ink)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
          </button>

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            icon={<ArrowDownUp size={15} />}
            options={[
              { value: 'recent', label: 'Sort by...' },
              { value: 'name', label: 'Name (A–Z)' },
              { value: 'budget', label: 'Budget (High–Low)' }
            ]}
            ariaLabel="Sort by option"
          />
        </div>
      </section>

      {/* Active Search Results Banner */}
      {isSearching && (
        <div className="search-active-banner">
          <span>Showing results for "<strong>{searchQuery}</strong>" — Found {processedTrips.length} trip(s), {filteredRegions.length} region(s), {filteredDestinations.length} destination(s)</span>
          <button onClick={() => setSearchQuery('')}>Clear Search</button>
        </div>
      )}

      {/* Expanded Filter Panel when Filter button clicked */}
      {showFilters && (
        <div className="overview-filter-panel">
          <span>Filter by Region:</span>
          {['all', 'Europe', 'Japan', 'Greece', 'Indonesia'].map((region) => (
            <button
              key={region}
              className={selectedRegionFilter === region ? 'active' : ''}
              onClick={() => setSelectedRegionFilter(region)}
            >
              {region === 'all' ? 'All Regions' : region}
            </button>
          ))}
        </div>
      )}

      {/* 3. Section 1: Top Regional Selections */}
      <section className="overview-wireframe-section">
        <div className="section-divider-header">
          <h2>Top Regional Selections</h2>
          <div className="divider-line" />
        </div>

        {filteredRegions.length > 0 ? (
          <div className="regional-grid-5">
            {filteredRegions.map((reg) => (
              <div
                key={reg.id}
                className="regional-card"
                onClick={() => navigate(`/explore?search=${encodeURIComponent(reg.query)}`)}
              >
                <SafeImage src={reg.image} alt={reg.name} className="regional-card-img" />
                <div className="regional-card-overlay">
                  <span className="regional-badge">{reg.badge}</span>
                  <h3>{reg.name}</h3>
                  <p>{reg.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-search-match">No regional selections match "{searchQuery}".</p>
        )}
      </section>

      {/* 4. Section 2: Previous Trips & Floating "+ Plan a trip" Button */}
      <section className="overview-wireframe-section previous-trips-section">
        <div className="section-divider-header">
          <h2>Previous Trips</h2>
          <div className="divider-line" />
        </div>

        {processedTrips.length > 0 ? (
          <div className="previous-trips-grid">
            {processedTrips.map((trip) => (
              <article className="trip-overview-card" key={trip.id}>
                <div className="trip-overview-cover">
                  <SafeImage src={trip.cover} alt={trip.name} />
                  <span className={`badge badge-${trip.status === 'upcoming' ? 'amber' : 'green'}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="trip-overview-body">
                  <span className="trip-overview-stops">
                    <MapPin size={13} />
                    {trip.stops.map((s) => s.city).join(' · ') || 'Route in progress'}
                  </span>
                  <h3>{trip.name}</h3>
                  <div className="trip-overview-meta">
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    <strong>{formatMoney(trip.budget.total)}</strong>
                  </div>
                  <div className="trip-overview-footer">
                    <Button
                      variant="primary"
                      className="button-small"
                      onClick={() => navigate(`/trips/${trip.id}/build`)}
                    >
                      Build / View Trip <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-trips-card">
            <Compass size={32} />
            <h3>No trips match "{searchQuery || 'your criteria'}"</h3>
            <p>Try searching another city or create a brand new travel route.</p>
          </div>
        )}

        {/* Floating / Anchored "+ Plan a trip" Button at Bottom Right */}
        <div className="plan-trip-bottom-row">
          <Link to="/trips/new" className="button button-primary button-large plan-trip-btn">
            <Plus size={19} /> Plan a trip
          </Link>
        </div>
      </section>

      {/* 5. Curated Destinations */}
      <section className="overview-wireframe-section">
        <div className="section-divider-header">
          <h2>Curated Destinations</h2>
          <div className="divider-line" />
        </div>

        {filteredDestinations.length > 0 ? (
          <div className="destination-grid">
            {filteredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        ) : (
          <p className="no-search-match">No curated destinations match "{searchQuery}".</p>
        )}
      </section>
    </div>
  );
}
