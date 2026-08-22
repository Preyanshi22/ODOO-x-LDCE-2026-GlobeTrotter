import { ArrowUpRight, MapPin, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Destination } from '../../types';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/Image';

export function DestinationCard({ destination, compact = false }: { destination: Destination; compact?: boolean }) {
  const { trips, selectedTripId, setSelectedTripId, createTrip, addStop, addToast } = useApp();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering card navigation if button inside card was clicked
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/explore?search=${encodeURIComponent(destination.city)}`);
  };

  const handleAddStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

    if (activeTrip) {
      addStop(activeTrip.id, destination);
      setSelectedTripId(activeTrip.id);
      addToast(`Added ${destination.city} with curated activities to ${activeTrip.name}!`, 'success');
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      navigate('/trips');
    } else {
      const today = new Date();
      const startDateStr = today.toISOString().slice(0, 10);
      const nextWeek = new Date(today.getTime() + 7 * 86400000);
      const endDateStr = nextWeek.toISOString().slice(0, 10);

      const newTrip = await createTrip({
        name: `${destination.city} Trip`,
        description: destination.description || `Curated journey through ${destination.city}, ${destination.country}.`,
        startDate: startDateStr,
        endDate: endDateStr,
        cover: destination.image,
      });

      setSelectedTripId(newTrip.id);
      addToast(`Created new ${destination.city} trip with curated activities!`, 'success');
      navigate('/trips');
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
