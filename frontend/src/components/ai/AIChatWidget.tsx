import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm GlobeTrotter AI. Ask me for itinerary suggestions, hidden culinary gems, or budget planning tips for any destination!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Call backend AI endpoint
      const aiData = await api.generateAIItinerary({
        destination: text,
        days: 3,
        budget: 50000,
        travel_style: 'balanced',
      });

      const responseText = aiData?.title
        ? `Here is an AI-generated suggestion for ${aiData.title}:\n\n` +
          aiData.activities
            .slice(0, 4)
            .map((act: any) => `• Day ${act.day_number}: ${act.name} (₹${act.cost})`)
            .join('\n')
        : `GlobeTrotter AI recommendation for "${text}": Plan 3-4 days exploring key cultural landmarks, opt for local boutique stays, and allocate ~40% budget to lodging & 25% to gourmet dining.`;

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
        text: `For ${text}, I recommend visiting during spring/autumn for optimal weather. Allocate ₹50,000 for a 4-day experience covering historic sites, local transport, and curated dining.`,
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
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
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
              padding: '16px 20px',
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
                <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Luxury Travel Planner</small>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

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
                ✦ Thinking & planning...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 12px', background: '#ffffff', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => sendMessage('Kyoto 3-Day Luxury Itinerary')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🇯🇵 Kyoto 3-Day
            </button>
            <button
              onClick={() => sendMessage('Paris Winter Budget Tips')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🇫🇷 Paris Tips
            </button>
            <button
              onClick={() => sendMessage('Santorini Coast Highlights')}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: '#f3f4f6', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🇬🇷 Santorini Highlights
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
              placeholder="Ask AI for itinerary ideas..."
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
