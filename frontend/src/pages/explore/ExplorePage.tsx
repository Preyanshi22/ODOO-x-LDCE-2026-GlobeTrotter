import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Compass, Filter, Search, SlidersHorizontal, Sparkles, MapPin, X, Globe2, Tag } from 'lucide-react';
import { DestinationCard } from '../../components/discovery/DestinationCard';
import { ActivityCard } from '../../components/discovery/ActivityCard';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function ExplorePage({ type = 'cities' }: { type?: 'cities' | 'activities' }) {
  const { destinations, activities, trips, selectedTripId, addStop } = useApp();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'cities' | 'activities'>(type);
  const [query, setQuery] = useState(params.get('search') ?? '');
  const [region, setRegion] = useState('All regions');
  const [costIndex, setCostIndex] = useState('Any cost');
  const [category, setCategory] = useState('All types');
  const [priceRange, setPriceRange] = useState('Any price');
  const [durationFilter, setDurationFilter] = useState('Any length');
  const [location, setLocation] = useState('All locations');
  const [sort, setSort] = useState('popular');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const isCities = activeTab === 'cities';

  // Quick Tags
  const quickTags = [
    'Historic', 'Architecture', 'Romantic', 'Mountains', 'Art', 'Food', 'Culture', 'Temples', 'Nature'
  ];

  const cityResults = useMemo(() => {
    return destinations
      .filter((item) => {
        const textMatch = `${item.city} ${item.country} ${item.description} ${item.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const regionMatch = region === 'All regions' || item.region === region;
        const tagMatch = !selectedTag || item.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        const costMatch =
          costIndex === 'Any cost' ||
          (costIndex === 'Budget'
            ? item.costIndex <= 2
            : costIndex === 'Mid-range'
            ? item.costIndex === 3
            : item.costIndex >= 4);

        return textMatch && regionMatch && tagMatch && costMatch;
      })
      .sort((a, b) => {
        if (sort === 'name') return a.city.localeCompare(b.city);
        if (sort === 'cost-asc') return a.costIndex - b.costIndex;
        if (sort === 'cost-desc') return b.costIndex - a.costIndex;
        return b.popularity - a.popularity;
      });
  }, [destinations, query, region, selectedTag, costIndex, sort]);

  const activityResults = useMemo(() => {
    return activities
      .filter((item) => {
        const textMatch = `${item.name} ${item.city} ${item.country} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const catMatch = category === 'All types' || item.category === category;
        const locMatch = location === 'All locations' || item.city === location;
        const priceMatch =
          priceRange === 'Any price' ||
          (priceRange === 'Under ₹4,000'
            ? item.price < 4000
            : priceRange === '₹4,000–₹7,000'
            ? item.price >= 4000 && item.price <= 7000
            : item.price > 7000);
        const durationMatch =
          durationFilter === 'Any length' ||
          (durationFilter === 'Under 2 hours'
            ? item.duration.includes('1') || item.duration.includes('2')
            : !item.duration.includes('1') && !item.duration.includes('2'));

        return textMatch && catMatch && locMatch && priceMatch && durationMatch;
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'cost-asc') return a.price - b.price;
        if (sort === 'cost-desc') return b.price - a.price;
        return b.rating - a.rating;
      });
  }, [activities, query, category, location, priceRange, durationFilter, sort]);

  const resultsCount = isCities ? cityResults.length : activityResults.length;

  const resetFilters = () => {
    setQuery('');
    setRegion('All regions');
    setCostIndex('Any cost');
    setCategory('All types');
    setPriceRange('Any price');
    setDurationFilter('Any length');
    setLocation('All locations');
    setSelectedTag(null);
    setSort('popular');
  };

  const hasActiveFilters =
    query ||
    region !== 'All regions' ||
    costIndex !== 'Any cost' ||
    category !== 'All types' ||
    priceRange !== 'Any price' ||
    durationFilter !== 'Any length' ||
    location !== 'All locations' ||
    selectedTag !== null;

  return (
    <div className="explore-page">
      {/* Header Banner */}
      <div className="explore-heading">
        <div>
          <span className="eyebrow">
            <Compass size={14} /> Curated Discoveries
          </span>
          <h1>
            {isCities ? (
              <>
                Find somewhere<br />
                <em>that calls you.</em>
              </>
            ) : (
              <>
                Make the journey<br />
                <em>the destination.</em>
              </>
            )}
          </h1>
          <p className="lede">
            {isCities
              ? 'A collection of extraordinary destinations, thoughtfully curated for unforgettable journeys.'
              : 'Immersive cultural moments, guided explorations, and signature experiences around the globe.'}
          </p>
        </div>
        <div className="explore-count">
          <strong>{resultsCount}</strong>
          <span>{isCities ? 'destinations found' : 'experiences available'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="explore-tabs">
        <button
          type="button"
          className={isCities ? 'active' : ''}
          onClick={() => {
            setActiveTab('cities');
            setParams({ tab: 'cities' });
          }}
        >
          <Globe2 size={16} />
          <span>Destinations & Cities</span>
        </button>
        <button
          type="button"
          className={!isCities ? 'active' : ''}
          onClick={() => {
            setActiveTab('activities');
            setParams({ tab: 'activities' });
          }}
        >
          <Sparkles size={16} />
          <span>Activities & Experiences</span>
        </button>
      </div>

      {/* Quick Tag Pills */}
      {isCities && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                border: '1px solid',
                borderColor: selectedTag === tag ? 'var(--amber)' : 'var(--line)',
                background: selectedTag === tag ? 'var(--amber-soft)' : 'var(--surface)',
                color: selectedTag === tag ? 'var(--amber-dark)' : 'var(--ink-muted)',
                borderRadius: '99px',
                padding: '6px 13px',
                fontSize: '11px',
                fontWeight: selectedTag === tag ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Tag size={12} /> {tag}
            </button>
          ))}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="explore-toolbar">
        <label className="explore-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isCities
                ? 'Search cities, countries, landmarks, or vibes...'
                : 'Search activities, culinary tours, adventures...'
            }
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </label>

        <div className="explore-filters">
          {/* Region / Category Filter */}
          <CustomSelect
            value={isCities ? region : category}
            onChange={(val) => (isCities ? setRegion(val) : setCategory(val))}
            icon={<SlidersHorizontal size={15} />}
            options={
              isCities
                ? ['All regions', 'Europe', 'Asia', 'Middle East', 'North America', 'Mediterranean']
                : ['All types', 'Sightseeing', 'Food', 'Adventure', 'Culture', 'Shopping', 'Nature', 'Nightlife']
            }
            ariaLabel="Filter by category or region"
          />

          {/* Cost / Price Filter */}
          {isCities ? (
            <CustomSelect
              value={costIndex}
              onChange={setCostIndex}
              options={['Any cost', 'Budget', 'Mid-range', 'Premium']}
              ariaLabel="Filter by cost index"
            />
          ) : (
            <>
              <CustomSelect
                value={priceRange}
                onChange={setPriceRange}
                options={['Any price', 'Under ₹4,000', '₹4,000–₹7,000', 'Over ₹7,000']}
                ariaLabel="Filter by price"
              />

              <CustomSelect
                value={durationFilter}
                onChange={setDurationFilter}
                options={['Any length', 'Under 2 hours', 'Half day+']}
                ariaLabel="Filter by duration"
              />

              <CustomSelect
                value={location}
                onChange={setLocation}
                options={['All locations', ...Array.from(new Set(activities.map((item) => item.city)))]}
                ariaLabel="Filter by location"
              />
            </>
          )}

          {/* Sort Filter */}
          <CustomSelect
            value={sort}
            onChange={setSort}
            icon={<Filter size={15} />}
            options={[
              { value: 'popular', label: 'Most popular' },
              { value: 'name', label: 'Name A–Z' },
              { value: 'cost-asc', label: 'Price: Low to High' },
              { value: 'cost-desc', label: 'Price: High to Low' },
            ]}
            ariaLabel="Sort results"
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                border: '1px solid var(--line)',
                background: 'var(--surface-soft)',
                color: 'var(--ink-muted)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid Results */}
      {resultsCount > 0 ? (
        isCities ? (
          <div className="destination-grid explore-grid">
            {cityResults.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        ) : (
          <div className="activity-grid explore-activity-grid">
            {activityResults.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )
      ) : (
        <div className="card empty-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Search size={36} color="var(--amber)" style={{ margin: '0 auto 12px' }} />
          <h2>No matching discoveries</h2>
          <p className="muted" style={{ maxWidth: '360px', margin: '0 auto 18px' }}>
            We couldn't find anything matching your exact filter criteria. Try adjusting your query or resetting filters.
          </p>
          <Button variant="secondary" onClick={resetFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
