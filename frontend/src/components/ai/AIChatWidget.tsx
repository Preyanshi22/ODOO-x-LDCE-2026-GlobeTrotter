import { Bot, Compass, Send, Sparkles, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
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

      const aiData = await api.generateAIItinerary({
        destination,
        days: 4,
        budget,
        travel_style: 'balanced',
      });

      const responseText = aiData?.title
        ? `✦ AI Recommendation for ${activeTrip ? activeTrip.name : destination}:\n\n` +
          aiData.activities
            .slice(0, 4)
            .map((act: any) => `• Day ${act.day_number}: ${act.name} (₹${act.cost})`)
            .join('\n')
        : `GlobeTrotter AI tip for ${destination}: Plan 3-4 days exploring key landmarks, reserve local boutique stays, and allocate ~40% to lodging & 25% to culinary experiences.`;

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
        text: `For ${activeTrip ? activeTrip.name : text}, I recommend visiting during spring/autumn. Allocate your budget towards historic tours, local transport, and curated dining experiences.`,
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
