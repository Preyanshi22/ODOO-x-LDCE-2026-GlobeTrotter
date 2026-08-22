import { Clock3, MapPin, Plus, Star } from 'lucide-react';
import type { Activity } from '../../types';
import { useApp, formatMoney } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/Image';
import { useNavigate } from 'react-router-dom';

export function ActivityCard({ activity, tripId, stopId }: { activity: Activity; tripId?: string; stopId?: string }) {
  const { selectedTripId, selectedTrip, trips, addActivity, addToast } = useApp();
  const navigate = useNavigate();

  const activeTrip = tripId ? trips.find((t) => t.id === tripId) : selectedTrip || trips[0];
  const targetStop = stopId || activeTrip?.stops[0]?.id;

  const handleAdd = () => {
    if (activeTrip && targetStop) {
      addActivity(activeTrip.id, targetStop, activity);
    } else if (activeTrip && activeTrip.stops.length === 0) {
      addToast('Please add a destination stop to your trip first!', 'info');
      navigate(`/trips/${activeTrip.id}/build`);
    } else {
      addToast('Please create or select a trip first!', 'info');
      navigate('/trips/new');
    }
  };

  return (
    <article className="activity-card">
      <SafeImage src={activity.image} alt={activity.name} className="activity-image" />
      <div className="activity-body">
        <div className="activity-topline">
          <span className="category-pill">{activity.category}</span>
          <span className="rating">
            <Star size={13} fill="currentColor" /> {activity.rating}
          </span>
        </div>
        <h3>{activity.name}</h3>
        <p className="activity-location">
          <MapPin size={13} /> {activity.city}, {activity.country}
        </p>
        <p className="activity-description">{activity.description}</p>
        <div className="activity-meta">
          <span>
            <Clock3 size={14} /> {activity.duration}
          </span>
          <strong>
            {formatMoney(activity.price)} <small>/ person</small>
          </strong>
        </div>
        <Button className="button-small" variant="secondary" icon={<Plus size={15} />} onClick={handleAdd}>
          Add activity
        </Button>
      </div>
    </article>
  );
}
