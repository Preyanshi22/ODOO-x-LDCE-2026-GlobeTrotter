import { ArrowUpRight, MapPin, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Destination } from '../../types';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/Image';

export function DestinationCard({ destination, compact = false }: { destination: Destination; compact?: boolean }) {
  const { trips, selectedTripId, addStop, addToast } = useApp();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering card navigation if button inside card was clicked
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/explore?search=${encodeURIComponent(destination.city)}`);
  };

  const handleAddStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetTripId = selectedTripId || (trips.length > 0 ? trips[0].id : null);

    if (targetTripId) {
      addStop(targetTripId, destination);
      setAdded(true);
      addToast(`Added ${destination.city} to your trip route!`, 'success');
      setTimeout(() => setAdded(false), 2500);
    } else {
      addToast(`Starting new trip with ${destination.city}`, 'info');
      navigate(`/trips/new?destination=${encodeURIComponent(destination.city)}`);
    }
  };

  return (
    <article
      className={`destination-card ${compact ? 'destination-compact' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="destination-image-wrap">
        <SafeImage src={destination.image} alt={`${destination.city}, ${destination.country}`} className="destination-image" />
        <span className="image-badge">
          {destination.costIndex <= 2 ? 'Easy on budget' : destination.costIndex === 3 ? 'Mid-range' : 'Premium'}
        </span>
        <button
          className="image-arrow"
          aria-label={`View ${destination.city}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/explore?search=${encodeURIComponent(destination.city)}`);
          }}
        >
          <ArrowUpRight size={17} />
        </button>
      </div>

      <div className="destination-body">
        <div className="destination-kicker">
          <span>
            <MapPin size={13} /> {destination.country}
          </span>
          <span>♥ {destination.popularity}%</span>
        </div>
        <h3>{destination.city}</h3>
        <p>{destination.description}</p>
        {!compact && (
          <div className="destination-footer">
            <span className="tag-row">
              {destination.tags.slice(0, 2).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </span>
            <Button
              variant={added ? 'secondary' : 'secondary'}
              icon={added ? <Check size={15} color="var(--sage)" /> : <Plus size={15} />}
              onClick={handleAddStop}
            >
              {added ? 'Added!' : 'Add to trip'}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
