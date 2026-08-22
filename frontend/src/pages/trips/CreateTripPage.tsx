import { ArrowLeft, ArrowRight, CalendarDays, Check, Image as ImageIcon, Sparkles, Wand2, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

const defaultCover = 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85';

export function CreateTripPage() {
  const { createTrip, destinations, activities, addToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '', cover: defaultCover });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleAIGenerate = async () => {
    if (!form.name) return setError('Please enter a destination or trip name first (e.g. Kyoto, Paris, Santorini).');
    setError('');
    setAiGenerating(true);

    try {
      const aiData = await api.generateAIItinerary({
        destination: form.name,
        days: 5,
        budget: 75000,
        travel_style: 'balanced',
      });

      if (aiData) {
        setForm((prev) => ({
          ...prev,
          name: aiData.title || prev.name,
          description: `AI-generated ${aiData.stops?.[0]?.city_name ?? form.name} itinerary featuring ${aiData.activities?.length ?? 4} curated experiences & luxury stays.`,
        }));
        addToast(`✦ Generated custom AI itinerary for ${form.name}!`, 'success');
      }
    } catch {
      setForm((prev) => ({
        ...prev,
        description: `Curated 5-day journey for ${form.name} covering historic temples, scenic tours, and local gourmet dining.`,
      }));
      addToast('✦ Applied AI itinerary template.', 'info');
    } finally {
      setAiGenerating(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return setError('Give your trip a name and dates before continuing.');
    if (form.endDate < form.startDate) return setError('Your return date must be after your departure.');

    setLoading(true);
    const trip = await createTrip(form);
    setLoading(false);
    navigate(`/trips/${trip.id}/build`);
  };

  return (
    <div className="create-trip-page">
      <Link to="/trips" className="back-link"><ArrowLeft size={16} /> Back to my trips</Link>
      <div className="create-trip-layout">
        <div className="create-trip-copy">
          <span className="eyebrow">Plan a new trip (Screen 4)</span>
          <h1>Where will your<br /><em>story take you?</em></h1>
          <p>Select your dates, destination, and pick from suggested places to visit and activities.</p>
          
          <div className="creation-progress">
            <div className="progress-step active"><span>01</span><div><strong>Trip details</strong><small>Name & dates</small></div></div>
            <div className="progress-line" />
            <div className="progress-step"><span>02</span><div><strong>Destinations</strong><small>Places to visit</small></div></div>
            <div className="progress-line" />
            <div className="progress-step"><span>03</span><div><strong>Experiences</strong><small>Suggested activities</small></div></div>
          </div>

          {/* Screen 4: Suggestion for Places to Visit / Activities to perform */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
              Suggested Places & Activities
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {destinations.slice(0, 4).map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => setForm((prev) => ({ ...prev, name: dest.city, cover: dest.image }))}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: form.name === dest.city ? '2px solid #d97706' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <img src={dest.image} alt={dest.city} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>{dest.city}</strong>
                    <small style={{ color: '#6b7280', fontSize: '0.72rem' }}>{dest.country}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form className="create-trip-form card" onSubmit={submit}>
          <div className="form-card-heading">
            <div className="form-icon"><Sparkles size={20} /></div>
            <div>
              <h2>Plan a new trip</h2>
              <p>Fill in your itinerary parameters or auto-generate with AI.</p>
            </div>
          </div>

          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="trip-name" style={{ margin: 0 }}>Select a Place / Trip Name <i>*</i></label>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiGenerating}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d97706',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Wand2 size={13} />
                {aiGenerating ? 'Generating...' : '✦ Auto-Generate with AI'}
              </button>
            </div>
            <input id="trip-name" value={form.name} onChange={set('name')} placeholder="e.g. Kyoto, Paris, or Mediterranean Summer" autoFocus />
            <small>Type a destination name or pick from the suggested places on the left.</small>
          </div>

          <div className="form-grid form-grid-two">
            <div className="field">
              <label htmlFor="start-date">Start Date <i>*</i></label>
              <div className="input-icon"><CalendarDays size={16} /><input id="start-date" type="date" value={form.startDate} onChange={set('startDate')} /></div>
            </div>
            <div className="field">
              <label htmlFor="end-date">End Date <i>*</i></label>
              <div className="input-icon"><CalendarDays size={16} /><input id="end-date" type="date" value={form.endDate} onChange={set('endDate')} /></div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="trip-description">Short Description & Details</label>
            <textarea id="trip-description" value={form.description} onChange={set('description')} placeholder="What experiences or places are you planning to visit?" rows={3} />
          </div>

          <div className="field">
            <label htmlFor="trip-cover">Cover Image URL</label>
            <div className="input-icon"><ImageIcon size={16} /><input id="trip-cover" value={form.cover.startsWith('data:') ? '' : form.cover} onChange={set('cover')} placeholder="Paste an Unsplash image URL" /></div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-submit-row">
            <span><Check size={15} /> All details can be edited later</span>
            <Button type="submit" loading={loading}>{loading ? 'Creating trip...' : 'Create Trip & Build Itinerary'} {!loading && <ArrowRight size={16} />}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
