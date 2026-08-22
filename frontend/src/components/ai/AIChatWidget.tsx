import { Bot, Compass, Send, Sparkles, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp, formatMoney } from '../../context/AppContext';
import { api } from '../../services/api';
import type { Trip } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface DestinationInfo {
  name: string;
  country: string;
  places: string[];
  activities: { name: string; cost: number; duration: string }[];
  insiderTip: string;
}

const DESTINATION_KNOWLEDGE: Record<string, DestinationInfo> = {
  hawaii: {
    name: 'Honolulu, Hawaii',
    country: 'United States',
    places: [
      'Waikiki Beach & Diamond Head Volcanic Crater',
      'Pearl Harbor National Memorial & USS Arizona',
      'Hanauma Bay Nature Preserve (Coral Reefs)',
      'North Shore Surf Beaches & Haleiwa Historic Town',
      'Nuʻuanu Pali Lookout & Manoa Falls Trail',
    ],
    activities: [
      { name: 'Diamond Head Sunrise Summit Hike', cost: 2500, duration: '2.5 hrs' },
      { name: 'Sunset Ocean Catamaran & Manta Ray Snorkel', cost: 6800, duration: '3.5 hrs' },
      { name: 'Traditional Hawaiian Luau Dinner & Fire Dance', cost: 9500, duration: '4 hrs' },
      { name: 'Oahu Scenic Helicopter Tour over Sacred Falls', cost: 16500, duration: '1 hr' },
    ],
    insiderTip: 'Reserve Hanauma Bay entry tickets 48 hours in advance; grab authentic shave ice at Matsumoto’s in North Shore!',
  },
  japan: {
    name: 'Tokyo & Kyoto',
    country: 'Japan',
    places: [
      'Senso-ji Temple & Asakusa Historic District (Tokyo)',
      'Shibuya Crossing & Meiji Jingu Shrine (Tokyo)',
      'Fushimi Inari Shrine & 10,000 Torii Gates (Kyoto)',
      'Arashiyama Bamboo Grove & Tenryu-ji Temple (Kyoto)',
      'Tsukiji Outer Seafood Market & Ginza District',
    ],
    activities: [
      { name: 'Traditional Tea Ceremony & Kimono Fitting in Gion', cost: 4800, duration: '2 hrs' },
      { name: 'Shinkansen Bullet Train Day Excursion to Mt. Fuji', cost: 11200, duration: 'Full Day' },
      { name: 'Morning Sumo Wrestling Stables Practice Tour', cost: 5500, duration: '2 hrs' },
      { name: 'Omoide Yokocho Alleyway Ramen & Yakitori Crawl', cost: 3200, duration: '3 hrs' },
    ],
    insiderTip: 'Purchase a Suica/Pasmo IC card for seamless subway travel; visit Fushimi Inari before 07:30 AM for quiet photo opportunities!',
  },
  france: {
    name: 'Paris',
    country: 'France',
    places: [
      'Eiffel Tower & Champ de Mars Gardens',
      'Louvre Museum & Tuileries Garden',
      'Montmartre Village & Sacré-Cœur Basilica',
      'Sainte-Chapelle & Notre-Dame Cathedral',
      'Palace of Versailles & Grand Trianon Estates',
    ],
    activities: [
      { name: 'Sunset Champagne River Cruise along the Seine', cost: 5400, duration: '1.5 hrs' },
      { name: 'French Macaron & Pastry Workshop at Maison Ladurée', cost: 7200, duration: '2.5 hrs' },
      { name: 'Vintage Citroën 2CV Open-Top Paris City Tour', cost: 8900, duration: '2 hrs' },
      { name: 'Sommelier Wine & Cheese Tasting in Le Marais', cost: 6500, duration: '2 hrs' },
    ],
    insiderTip: 'Book Louvre timed tickets online to skip the main Pyramid line; enjoy afternoon coffee at Café de Flore in Saint-Germain!',
  },
  switzerland: {
    name: 'Zurich & Interlaken',
    country: 'Switzerland',
    places: [
      'Jungfraujoch – Top of Europe (3,454m Glacier Peak)',
      'Lauterbrunnen Valley & 72 Alpine Waterfalls',
      'Grindelwald First Cliff Walk & Alpine Lake Bachalpsee',
      'Lake Zurich Old Town & Bahnhofstrasse Promenade',
      'Zermatt & The Icon Matterhorn Viewpoints',
    ],
    activities: [
      { name: 'Scenic Open-Window Glacier Express Train Ride', cost: 14500, duration: 'Full Day' },
      { name: 'Interlaken Tandem Paragliding over Alpine Lakes', cost: 18200, duration: '2 hrs' },
      { name: 'Authentic Swiss Cheese Fondue Sunset Lake Cruise', cost: 6800, duration: '3 hrs' },
      { name: 'First Flyer Zip-Line Adventure in Grindelwald', cost: 5200, duration: '2 hrs' },
    ],
    insiderTip: 'Get a Swiss Travel Pass for unlimited train, boat, and cable car rides; pack extra thermal layers even during summer!',
  },
  italy: {
    name: 'Rome & Amalfi Coast',
    country: 'Italy',
    places: [
      'Colosseum, Roman Forum & Palatine Hill (Rome)',
      'Vatican Museums, Sistine Chapel & St. Peter’s Basilica',
      'Trevi Fountain & Spanish Steps (Rome)',
      'Positano Cliffside Village & Ravello Gardens (Amalfi)',
      'Capri Island & Blue Grotto Sea Cave',
    ],
    activities: [
      { name: 'Colosseum Underground & Arena Floor VIP Access', cost: 6200, duration: '3 hrs' },
      { name: 'Handmade Pasta & Gelato Masterclass in Trastevere', cost: 5800, duration: '3 hrs' },
      { name: 'Private Sunset Catamaran Sail along Capri Coast', cost: 13500, duration: '4 hrs' },
      { name: 'Vintage Vespa Scooter Guided City Tour of Rome', cost: 8400, duration: '3 hrs' },
    ],
    insiderTip: 'Throw a coin in Trevi Fountain over your left shoulder; grab lemon granita at Cove of Positano overlooking the sea!',
  },
  bali: {
    name: 'Ubud & Nusa Penida',
    country: 'Indonesia',
    places: [
      'Tegallalang Emerald Rice Terraces & Jungle Swings (Ubud)',
      'Sacred Monkey Forest Sanctuary (Ubud)',
      'Uluwatu Cliffside Temple & Kecak Fire Dance Arena',
      'Nusa Penida Island (Kelingking T-Rex Beach & Broken Beach)',
      'Mount Batur Volcanic Crater',
    ],
    activities: [
      { name: 'Mount Batur Sunrise Volcano Trek & Crater Breakfast', cost: 4500, duration: '6 hrs' },
      { name: 'Nusa Penida Catamaran & Manta Ray Snorkeling Coves', cost: 7200, duration: 'Full Day' },
      { name: 'Traditional Balinese Spa & Flower Bath Ceremony', cost: 3800, duration: '2 hrs' },
      { name: 'Ubud Artisanal Silver Making & Wood Carving Class', cost: 3200, duration: '3 hrs' },
    ],
    insiderTip: 'Rent a scooter or hire a private local driver for stress-free island exploring; dress respectfully at temples with sarongs!',
  },
  iceland: {
    name: 'Reykjavik & Golden Circle',
    country: 'Iceland',
    places: [
      'Blue Lagoon Silica Geothermal Spa',
      'Gullfoss Golden Waterfall & Geysir Hot Springs',
      'Thingvellir National Park (Tectonic Rift Valley)',
      'Reynisfjara Black Sand Beach & Basalt Columns (Vík)',
      'Jökulsárlón Glacier Lagoon & Diamond Beach',
    ],
    activities: [
      { name: 'Magical Aurora Borealis Northern Lights Super-Jeep Hunt', cost: 9800, duration: '4 hrs' },
      { name: 'Langjökull Glacier Snowmobiling & Ice Cave Tour', cost: 17500, duration: '5 hrs' },
      { name: 'Blue Lagoon Premium Geothermal Soak & Algae Mask', cost: 8500, duration: '3 hrs' },
      { name: 'Golden Circle & Kerid Volcanic Crater Guided Loop', cost: 7400, duration: 'Full Day' },
    ],
    insiderTip: 'Check the Vedur aurora forecast nightly; waterproof shoes and windproof jackets are mandatory year-round!',
  },
  morocco: {
    name: 'Marrakech & Sahara',
    country: 'Morocco',
    places: [
      'Jemaa el-Fnaa Medina Square & Spice Souks',
      'Jardin Majorelle & Yves Saint Laurent Museum',
      'Bahia Palace & Saadian Tombs',
      'Sahara Desert Dunes (Erg Chebbi, Merzouga)',
      'Aït Benhaddou Historic Ksar Village',
    ],
    activities: [
      { name: 'Sunset Camel Trek & Luxury Sahara Desert Glamping', cost: 14200, duration: '2 Days' },
      { name: 'Traditional Moroccan Eucalyptus Hammam & Spa', cost: 4200, duration: '2 hrs' },
      { name: 'Medina Culinary Food Walk & Tagine Masterclass', cost: 3900, duration: '4 hrs' },
      { name: 'Hot Air Balloon Ride over Marrakech Palms at Sunrise', cost: 16800, duration: '3 hrs' },
    ],
    insiderTip: 'Haggle politely with souk vendors; sip fresh mint tea on a rooftop terrace overlooking Jemaa el-Fnaa at sunset!',
  },
  dubai: {
    name: 'Dubai',
    country: 'United Arab Emirates',
    places: [
      'Burj Khalifa (Observation Deck at 148th Floor)',
      'The Dubai Mall & Fountain Show',
      'Palm Jumeirah & Atlantis The Royal',
      'Dubai Creek Historic Al Fahidi & Gold Souk',
      'Dubai Desert Conservation Reserve',
    ],
    activities: [
      { name: '4x4 Luxury Dune Bashing & BBQ Bedouin Camp Show', cost: 6800, duration: '6 hrs' },
      { name: 'Private Sunset Yacht Cruise around Dubai Marina', cost: 12500, duration: '2 hrs' },
      { name: 'Tandem Skydiving over Palm Jumeirah Coastal Drops', cost: 24500, duration: '3 hrs' },
      { name: 'Museum of the Future Interactive Sci-Fi Experience', cost: 4200, duration: '2 hrs' },
    ],
    insiderTip: 'Watch the Dubai Fountain show from the Apple Store balcony; visit the Gold and Spice Souks in the cooler evening hours!',
  },
};

function generateSmartAIResponse(userPrompt: string, activeTrip?: Trip): string {
  const promptLower = userPrompt.toLowerCase();

  // Find matching destination key from prompt or active trip
  let matchedKey = '';
  const searchString = (userPrompt + ' ' + (activeTrip?.name || '') + ' ' + (activeTrip?.stops.map((s) => s.city + ' ' + s.country).join(' ') || '')).toLowerCase();

  if (searchString.includes('hawaii') || searchString.includes('honolulu')) matchedKey = 'hawaii';
  else if (searchString.includes('japan') || searchString.includes('tokyo') || searchString.includes('kyoto')) matchedKey = 'japan';
  else if (searchString.includes('france') || searchString.includes('paris')) matchedKey = 'france';
  else if (searchString.includes('switzerland') || searchString.includes('zurich') || searchString.includes('interlaken') || searchString.includes('alps')) matchedKey = 'switzerland';
  else if (searchString.includes('italy') || searchString.includes('rome') || searchString.includes('amalfi') || searchString.includes('positano')) matchedKey = 'italy';
  else if (searchString.includes('bali') || searchString.includes('indonesia') || searchString.includes('ubud')) matchedKey = 'bali';
  else if (searchString.includes('iceland') || searchString.includes('reykjavik')) matchedKey = 'iceland';
  else if (searchString.includes('morocco') || searchString.includes('marrakech')) matchedKey = 'morocco';
  else if (searchString.includes('dubai') || searchString.includes('uae')) matchedKey = 'dubai';

  const destData = matchedKey ? DESTINATION_KNOWLEDGE[matchedKey] : null;

  // Extract explicit city/country name if given in prompt
  let placeName = destData ? destData.name : activeTrip ? activeTrip.stops.map((s) => s.city).join(', ') || activeTrip.name : '';
  if (!placeName) {
    const words = userPrompt.replace(/[^\w\s]/gi, '').split(' ');
    const capitalWords = words.filter((w) => w.length > 2 && w[0] === w[0].toUpperCase());
    placeName = capitalWords.join(' ') || 'your destination';
  }

  // 1. Budget & Cost query
  if (promptLower.includes('budget') || promptLower.includes('cost') || promptLower.includes('price') || promptLower.includes('spend')) {
    const budgetTotal = activeTrip?.budget?.total || (destData ? 75000 : 50000);
    return (
      `💰 GlobeTrotter AI Budget Breakdown for ${placeName}:\n\n` +
      `• Total Trip Budget: ${formatMoney(budgetTotal)}\n` +
      `• Accommodation (40%): ${formatMoney(Math.round(budgetTotal * 0.4))} (Hotels & Stays)\n` +
      `• Transport & Flights (25%): ${formatMoney(Math.round(budgetTotal * 0.25))} (Rail & Flights)\n` +
      `• Activities & Tours (20%): ${formatMoney(Math.round(budgetTotal * 0.2))} (Excursions)\n` +
      `• Culinary & Dining (10%): ${formatMoney(Math.round(budgetTotal * 0.1))} (Local Cuisine)\n` +
      `• Reserve (5%): ${formatMoney(Math.round(budgetTotal * 0.05))}\n\n` +
      `💡 Insider Tip: ${destData ? destData.insiderTip : 'Book tickets 2-3 weeks early to secure early-bird pricing!'}`
    );
  }

  // 2. Destination Specific Places & Activities Engine
  if (destData) {
    return (
      `✦ GlobeTrotter AI Guide for ${destData.name}:\n\n` +
      `🏛️ Top Places to Visit:\n` +
      destData.places.map((p, i) => `${i + 1}. ${p}`).join('\n') +
      `\n\n✨ Recommended Activities to Do:\n` +
      destData.activities.map((a) => `• ${a.name} (${a.duration} · ${formatMoney(a.cost)})`).join('\n') +
      `\n\n💡 Local Insider Secret:\n${destData.insiderTip}`
    );
  }

  // 3. Fallback for any other custom city/country
  return (
    `✦ GlobeTrotter AI Travel Guide for ${placeName}:\n\n` +
    `🏛️ Top Places to Visit in ${placeName}:\n` +
    `1. ${placeName} Historic Old Town & Central Square\n` +
    `2. Panoramic Scenic Viewpoint & Botanical Gardens\n` +
    `3. Local Heritage Museum & Artisan Cultural Quarter\n` +
    `4. Scenic Waterfront Promenade or Mountain Ridge\n\n` +
    `✨ Must-Do Activities:\n` +
    `• Guided Old Town Walking & Food Tasting Tour (3 hrs · ${formatMoney(3500)})\n` +
    `• Sunset Panorama Cruise / Cable Car Ride (2 hrs · ${formatMoney(4800)})\n` +
    `• Traditional Craft & Culinary Masterclass (2.5 hrs · ${formatMoney(4200)})\n` +
    `• Full-Day Countryside Landmark Excursion (Full Day · ${formatMoney(8500)})\n\n` +
    `💡 Local Tip: Explore major attractions early in the morning before 09:30 AM to enjoy peaceful photo opportunities!`
  );
}

export function AIChatWidget() {
  const { trips, selectedTripId, setSelectedTripId } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm GlobeTrotter AI. Select a trip or ask me for itinerary suggestions, hidden culinary gems, or budget planning tips!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeTrip = trips.find((t) => t.id === selectedTripId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: activeTrip ? `[${activeTrip.name}] ${text}` : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const destination = activeTrip
        ? activeTrip.stops.map((s) => s.city).join(', ') || activeTrip.name
        : text;

      const budget = activeTrip?.budget?.total ?? 50000;

      // Try backend AI service
      let responseText = '';
      try {
        const aiData = await api.generateAIItinerary({
          destination,
          days: 4,
          budget,
          travel_style: 'balanced',
        });

        if (aiData && aiData.activities && aiData.activities.length > 0) {
          responseText =
            `✦ GlobeTrotter AI Plan for ${activeTrip ? activeTrip.name : destination}:\n\n` +
            aiData.activities
              .slice(0, 4)
              .map((act: any) => `• Day ${act.day_number}: ${act.name} (₹${act.cost})`)
              .join('\n') +
            `\n\n💡 Estimated Total: ₹${budget.toLocaleString()}`;
        }
      } catch (backendError) {
        console.info('Backend AI API fallback triggered:', backendError);
      }

      // If backend didn't return or user asked specific question, use smart response engine
      if (!responseText) {
        responseText = generateSmartAIResponse(text, activeTrip);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: generateSmartAIResponse(text, activeTrip),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="ai-widget-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open GlobeTrotter AI Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
        }}
      >
        <Sparkles size={18} style={{ color: '#f59e0b' }} />
        <span>Ask GlobeTrotter AI</span>
      </button>

      {/* Expandable Chat Drawer */}
      {open && (
        <div
          className="ai-widget-window"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 48px)',
            height: '540px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 9999,
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} style={{ color: '#f59e0b' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>GlobeTrotter AI</strong>
                <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Luxury Travel Assistant</small>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Trip Selector Bar */}
          <div
            style={{
              padding: '8px 14px',
              background: '#1f2937',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #374151',
              fontSize: '0.8rem',
            }}
          >
            <Compass size={14} style={{ color: '#f59e0b' }} />
            <span style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>Active Trip:</span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              style={{
                flex: 1,
                background: '#374151',
                color: '#ffffff',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">General Advice (No Trip Selected)</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name} ({trip.stops.map((s) => s.city).join(', ') || 'Plan'})
                </option>
              ))}
            </select>
          </div>

          {/* Active Trip Info Badge */}
          {activeTrip && (
            <div style={{ padding: '6px 14px', background: '#fffbe6', borderBottom: '1px solid #ffe58f', fontSize: '0.75rem', color: '#873800' }}>
              📍 <strong>Focusing AI on:</strong> {activeTrip.name} (Budget: ₹{activeTrip.budget.total.toLocaleString()})
            </div>
          )}

          {/* Chat Messages Container */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9fafb' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.sender === 'user' ? '#111827' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1f2937',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.sender === 'ai' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {msg.text}
                <div style={{ fontSize: '0.68rem', marginTop: '4px', textAlign: 'right', opacity: 0.6 }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '14px', background: '#ffffff', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#6b7280' }}>
                ✦ Analyzing {activeTrip ? activeTrip.name : 'destination'}...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 12px', background: '#ffffff', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => sendMessage('Give me budget breakdown advice')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              💰 Budget Advice
            </button>
            <button
              onClick={() => sendMessage('Suggest top 3 culinary spots')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🍷 Culinary Spots
            </button>
            <button
              onClick={() => sendMessage('Highlight hidden local gems')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ✨ Hidden Gems
            </button>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{ padding: '12px', background: '#ffffff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeTrip ? `Ask AI about ${activeTrip.name}...` : 'Ask AI for itinerary ideas...'}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#111827',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
