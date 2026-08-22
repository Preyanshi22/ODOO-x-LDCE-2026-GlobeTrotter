import { ArrowLeft, ArrowRight, CalendarDays, Check, Image as ImageIcon, MapPin, Sparkles, Wand2, Plus, Star } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/Image';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useApp, formatMoney } from '../../context/AppContext';
import { api } from '../../services/api';

const defaultCover = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85';

export function CreateTripPage() {
  const { createTrip, destinations, activities, addToast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    place: '',
    startDate: '',
    endDate: '',
    description: '',
    cover: defaultCover
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const set = (key: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleAIGenerate = async () => {
    const target = form.place || form.name;
    if (!target) {
      return setError('Please select a place or enter a trip name first (e.g. Paris, Tokyo, Zurich).');
    }
    setError('');
    setAiGenerating(true);

    try {
      const aiData = await api.generateAIItinerary({
        destination: target,
        days: 5,
        budget: 75000,
        travel_style: 'balanced'
      });

      if (aiData) {
        setForm((prev) => ({
          ...prev,
          name: aiData.title || `${target} Journey`,
          description: `AI-generated ${target} itinerary with curated local experiences and stays.`
        }));
        addToast(`✦ Auto-generated custom itinerary for ${target}!`, 'success');
      }
    } catch {
      setForm((prev) => ({
        ...prev,
        name: `${target} Discovery`,
        description: `Curated multicity journey for ${target} covering top cultural landmarks & local dining.`
      }));
      addToast('✦ Applied AI itinerary template.', 'info');
    } finally {
      setAiGenerating(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const tripName = form.name || (form.place ? `${form.place} Trip` : '');

    if (!tripName || !form.startDate || !form.endDate) {
      return setError('Please specify a place or trip name, start date, and end date before continuing.');
    }
    if (form.endDate < form.startDate) {
      return setError('Your return date must be after your departure date.');
    }

    setLoading(true);
    const trip = await createTrip({
      name: tripName,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description || `Exploring ${form.place || tripName}`,
      cover: form.cover
    });
    setLoading(false);
    navigate(`/trips/${trip.id}/build`);
  };

  // 12 Expanded suggestion cards for places & activities (including Hawaii, Iceland, Maldives, etc.)
  const suggestions = [
    {
      id: 'sug-hawaii',
      title: 'Honolulu (Hawaii)',
      country: 'USA',
      category: 'Beach & Adventure',
      price: 12800,
      popularity: 99,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85',
      desc: 'Waikiki sunset helicopter tours, Diamond Head hikes, and private surfing.'
    },
    {
      id: 'sug-iceland',
      title: 'Reykjavik',
      country: 'Iceland',
      category: 'Nature & Spa',
      price: 9500,
      popularity: 96,
      image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=85',
      desc: 'Blue Lagoon geothermal baths and guided night hunts for Northern Lights.'
    },
    {
      id: 'sug-maldives',
      title: 'Malé (Maldives)',
      country: 'Maldives',
      category: 'Luxury & Reefs',
      price: 8900,
      popularity: 98,
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=85',
      desc: 'Overwater bungalows, manta ray snorkeling, and sunset catamaran cruises.'
    },
    {
      id: 'sug-thailand',
      title: 'Phuket',
      country: 'Thailand',
      category: 'Beach & Food',
      price: 4200,
      popularity: 94,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=85',
      desc: 'Phi Phi island speedboats, Maya Bay beaches, and night markets.'
    },
    {
      id: 'sug-egypt',
      title: 'Cairo',
      country: 'Egypt',
      category: 'History & Nile',
      price: 3800,
      popularity: 93,
      image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=85',
      desc: 'Great Pyramids of Giza, Sphinx tours, and Nile felucca cruises.'
    },
    {
      id: 'sug-nz',
      title: 'Queenstown',
      country: 'New Zealand',
      category: 'Alpine Adventure',
      price: 16800,
      popularity: 95,
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=85',
      desc: 'Milford Sound fiord flights, glacier hikes, and mountain lake cruises.'
    },
    {
      id: 'sug-peru',
      title: 'Cusco (Machu Picchu)',
      country: 'Peru',
      category: 'History & Trail',
      price: 7400,
      popularity: 94,
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=85',
      desc: 'Sacred Valley train journeys and Incan stone citadel expeditions.'
    },
    {
      id: 'sug-norway',
      title: 'Tromsø',
      country: 'Norway',
      category: 'Arctic & Sledding',
      price: 9200,
      popularity: 92,
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=85',
      desc: 'Arctic husky dog sledding, Sami campfire nights, and Aurora hunts.'
    },
    {
      id: 'sug-1',
      title: 'Paris',
      country: 'France',
      category: 'Sightseeing',
      price: 3500,
      popularity: 98,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=85',
      desc: 'Eiffel Tower sunsets, Louver art, and riverside cafes.'
    },
    {
      id: 'sug-2',
      title: 'Tokyo',
      country: 'Japan',
      category: 'Food & Culture',
      price: 6500,
      popularity: 96,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=85',
      desc: 'Tsukiji sushi masterclasses, neon nights, and quiet shrines.'
    },
    {
      id: 'sug-3',
      title: 'Zurich',
      country: 'Switzerland',
      category: 'Adventure',
      price: 15400,
      popularity: 94,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=85',
      desc: 'Swiss Alps glacier flights, alpine hiking, and mountain lakes.'
    },
    {
      id: 'sug-6',
      title: 'Bali',
      country: 'Indonesia',
      category: 'Nature & Sea',
      price: 5300,
      popularity: 97,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85',
      desc: 'Nusa Penida catamaran trips, manta rays, and cliff views.'
    }
  ];

  return (
    <div className="create-trip-screen4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Link
        to="/trips"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--ink-muted)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '20px',
          textDecoration: 'none'
        }}
      >
        <ArrowLeft size={16} /> Back to My Trips
      </Link>

      {/* Screen 4 Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow" style={{ color: 'var(--amber-dark)', fontWeight: 700, fontSize: '12px' }}>
          Plan a New Trip
        </span>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: 'var(--navy)',
            margin: '4px 0 6px',
            fontFamily: "'Fraunces', Georgia, serif"
          }}
        >
          GlobalTrotter Planner
        </h1>
      </div>

      {/* Top Box: Plan a new trip (Screen 4 Form Section) */}
      <form
        onSubmit={submit}
        className="card screen4-plan-box"
        style={{
          borderRadius: '24px',
          padding: '32px',
          background: '#ffffff',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: '40px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
              Plan a new trip
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: '4px 0 0' }}>
              Set your travel dates, place, and itinerary parameters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiGenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #ebdcc2',
              borderRadius: '99px',
              padding: '8px 16px',
              background: 'var(--amber-soft)',
              color: 'var(--amber-dark)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Wand2 size={15} />
            {aiGenerating ? 'Generating...' : '✦ Auto-Generate with AI'}
          </button>
        </div>

        {/* Screen 4 Input Fields Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px 24px',
            marginBottom: '20px'
          }}
        >
          {/* Select a Place */}
          <div className="field">
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Select a Place:
            </label>
            <CustomSelect
              value={form.place || 'Choose destination...'}
              onChange={(val) => {
                const found = suggestions.find((s) => s.title === val);
                setForm((prev) => ({
                  ...prev,
                  place: val,
                  name: prev.name || `${val} Trip`,
                  cover: found ? found.image : prev.cover
                }));
              }}
              options={[
                'Choose destination...',
                'Honolulu (Hawaii)',
                'Reykjavik',
                'Malé (Maldives)',
                'Phuket',
                'Cairo',
                'Queenstown',
                'Cusco (Machu Picchu)',
                'Tromsø',
                'Paris',
                'Tokyo',
                'Zurich',
                'Bali'
              ]}
              ariaLabel="Select a Place"
            />
          </div>

          {/* Trip Name */}
          <div className="field">
            <label htmlFor="screen4-name" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Trip Name:
            </label>
            <input
              id="screen4-name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. European Summer Exploration"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '11px',
                border: '1px solid var(--line)',
                outline: 'none'
              }}
            />
          </div>

          {/* Start Date */}
          <div className="field">
            <label htmlFor="screen4-start" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              Start Date:
            </label>
            <div className="input-icon">
              <CalendarDays size={16} />
              <input
                id="screen4-start"
                type="date"
                value={form.startDate}
                onChange={set('startDate')}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '11px', border: '1px solid var(--line)', outline: 'none' }}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="field">
            <label htmlFor="screen4-end" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
              End Date:
            </label>
            <div className="input-icon">
              <CalendarDays size={16} />
              <input
                id="screen4-end"
                type="date"
                value={form.endDate}
                onChange={set('endDate')}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '11px', border: '1px solid var(--line)', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert" style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
          <Button type="submit" loading={loading} icon={<ArrowRight size={16} />}>
            {loading ? 'Creating trip...' : 'Create Trip & Start Planning'}
          </Button>
        </div>
      </form>

      {/* Bottom Section: Suggestion for Places to Visit/Activities to perform (Screen 4 Grid) */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--navy)',
              margin: '0 0 4px',
              fontFamily: "'Fraunces', Georgia, serif"
            }}
          >
            Suggestion for Places to Visit/Activities to perform
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
            Click any suggested place to automatically select it into your trip plan.
          </p>
        </div>

        {/* 6-Card Grid (3 columns x 2 rows) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {suggestions.map((item) => {
            const isSelected = form.place === item.title;
            return (
              <div
                key={item.id}
                className="card suggestion-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: isSelected ? '2px solid var(--amber)' : '1px solid var(--line)',
                  boxShadow: isSelected
                    ? '0 6px 20px rgba(229, 155, 62, 0.2)'
                    : '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
                  <SafeImage src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(20, 29, 25, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '99px'
                    }}
                  >
                    ♥ {item.popularity}% Popularity
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'var(--sage)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
                      {item.title}
                    </h3>
                    <strong style={{ fontSize: '14px', color: 'var(--amber-dark)' }}>
                      {formatMoney(item.price)}
                    </strong>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {item.country}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      style={{ width: '100%', justifyContent: 'center' }}
                      icon={isSelected ? <Check size={15} /> : <Plus size={15} />}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          place: item.title,
                          name: prev.name || `${item.title} Trip`,
                          cover: item.image
                        }));
                        addToast(`✦ Selected ${item.title} for your trip plan!`, 'info');
                      }}
                    >
                      {isSelected ? 'Place Selected' : 'Select Place'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
