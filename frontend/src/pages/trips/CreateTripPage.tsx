import { ArrowLeft, ArrowRight, CalendarDays, Check, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

const defaultCover = 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85';

export function CreateTripPage() {
  const { createTrip, addToast } = useApp();
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
          <span className="eyebrow">A blank canvas</span>
          <h1>Where will your<br /><em>story take you?</em></h1>
          <p>Start with the basics or use AI to generate your complete route & itinerary instantly.</p>
          <div className="creation-progress">
            <div className="progress-step active"><span>01</span><div><strong>Trip details</strong><small>Name your adventure</small></div></div>
            <div className="progress-line" />
            <div className="progress-step"><span>02</span><div><strong>Destinations</strong><small>Shape your route</small></div></div>
            <div className="progress-line" />
            <div className="progress-step"><span>03</span><div><strong>Experiences</strong><small>Fill the days</small></div></div>
            <div className="progress-line" />
            <div className="progress-step"><span>04</span><div><strong>Review</strong><small>Make it yours</small></div></div>
          </div>
        </div>

        <form className="create-trip-form card" onSubmit={submit}>
          <div className="form-card-heading">
            <div className="form-icon"><Sparkles size={20} /></div>
            <div>
              <h2>Tell us about the trip</h2>
              <p>A few details to give it shape, or let AI design it for you.</p>
            </div>
          </div>

          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="trip-name" style={{ margin: 0 }}>Trip name / Destination <i>*</i></label>
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
                {aiGenerating ? 'Generating with AI...' : '✦ Auto-Generate with AI'}
              </button>
            </div>
            <input id="trip-name" value={form.name} onChange={set('name')} placeholder="e.g. Japanese Odyssey or Paris Escape" autoFocus />
            <small>Give it a name or destination you'll be happy to see in your calendar.</small>
          </div>

          <div className="form-grid form-grid-two">
            <div className="field">
              <label htmlFor="start-date">Start date <i>*</i></label>
              <div className="input-icon"><CalendarDays size={16} /><input id="start-date" type="date" value={form.startDate} onChange={set('startDate')} /></div>
            </div>
            <div className="field">
              <label htmlFor="end-date">End date <i>*</i></label>
              <div className="input-icon"><CalendarDays size={16} /><input id="end-date" type="date" value={form.endDate} onChange={set('endDate')} /></div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="trip-description">A short description</label>
            <textarea id="trip-description" value={form.description} onChange={set('description')} placeholder="What are you hoping to feel, taste, or discover?" rows={4} />
            <span className="field-count">{form.description.length}/180</span>
          </div>

          <div className="field">
            <label htmlFor="trip-cover">Cover image</label>
            <div className="input-icon"><ImageIcon size={16} /><input id="trip-cover" value={form.cover.startsWith('data:') ? '' : form.cover} onChange={set('cover')} placeholder="Paste an Unsplash image URL" /></div>
            <label className="file-upload"><ImageIcon size={15} /><span>Or upload from your device</span><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, cover: String(reader.result) })); reader.readAsDataURL(file); }} /></label>
            <div className="cover-preview"><img src={form.cover || defaultCover} alt="Trip cover preview" onError={(event) => { event.currentTarget.src = defaultCover; }} /><span>Preview</span></div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-submit-row">
            <span><Check size={15} /> You can edit everything later</span>
            <Button type="submit" loading={loading}>{loading ? 'Creating your trip' : 'Create trip'} {!loading && <ArrowRight size={16} />}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
