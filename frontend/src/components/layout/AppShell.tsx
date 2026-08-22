import { Bell, BriefcaseBusiness, CalendarDays, Compass, LayoutDashboard, Menu, MessageCircle, Search, Settings, Sparkles, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { IconButton } from '../ui/Button';
import { SafeImage } from '../ui/Image';
import { AIChatWidget } from '../ai/AIChatWidget';

const links = [{ to: '/', label: 'Overview', icon: LayoutDashboard }, { to: '/trips', label: 'My trips', icon: BriefcaseBusiness }, { to: '/explore', label: 'Explore', icon: Compass }, { to: '/calendar', label: 'Calendar', icon: CalendarDays }, { to: '/community', label: 'Community', icon: MessageCircle }];

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, selectedTripId, setSelectedTripId, trips, toasts, dismissToast } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const close = () => setMobileOpen(false);

  const avatarSrc = profile?.avatar && profile.avatar.trim() !== '' ? profile.avatar : DEFAULT_AVATAR;

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <NavLink className="brand" to="/" onClick={close}>
            <span className="brand-symbol">✦</span>
            <span>Globe<span>Trotter</span></span>
          </NavLink>
          <IconButton label="Close navigation" className="mobile-close" onClick={close}>
            <X size={19} />
          </IconButton>
        </div>
        <div className="sidebar-section">
          <p className="nav-caption">Workspace</p>
          <nav className="main-nav">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={close} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={18} strokeWidth={isActive(location.pathname, to) ? 2.5 : 1.8} />
                <span>{label}</span>
                {label === 'Community' && <span className="nav-dot" />}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sidebar-section trip-switcher">
          <p className="nav-caption">Currently planning</p>
          <select aria-label="Choose current trip" value={selectedTripId} onChange={(event) => { setSelectedTripId(event.target.value); navigate(`/trips/${event.target.value}/build`); }}>
            <option value="">Choose a trip</option>
            {trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.name}</option>)}
          </select>
        </div>
        <div className="sidebar-bottom">
          <NavLink to="/profile" onClick={close} className="profile-mini">
            <SafeImage src={avatarSrc} alt="" />
            <span><strong>{profile?.firstName ?? 'Traveller'}</strong><small>View profile</small></span>
            <Settings size={16} />
          </NavLink>
          <div className="sidebar-note">
            <Sparkles size={15} />
            <span>Good trips start with a little curiosity.</span>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={close} />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <IconButton label="Open navigation" className="mobile-menu" onClick={() => setMobileOpen(true)}>
              <Menu size={21} />
            </IconButton>
            <div className="breadcrumb">
              <span className="breadcrumb-mark">✦</span>
              <span>{pageName(location.pathname)}</span>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input placeholder="Search trips, cities..." aria-label="Search trips and cities" onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/explore?search=${encodeURIComponent(event.currentTarget.value)}`); }} />
            </label>
            <IconButton label="Notifications" className="notification-button">
              <Bell size={18} />
              <span />
            </IconButton>
            <NavLink to="/profile" className="top-avatar">
              <SafeImage src={avatarSrc} alt={profile ? `${profile.firstName} ${profile.lastName}` : 'Profile'} />
            </NavLink>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>

      {/* Floating AI Chatbot Widget */}
      <AIChatWidget />

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <button key={toast.id} className={`toast toast-${toast.tone}`} onClick={() => dismissToast(toast.id)}>
            {toast.tone === 'success' ? '✓' : 'i'}
            <span>{toast.message}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function isActive(path: string, to: string) { return to === '/' ? path === '/' : path.startsWith(to); }
function pageName(path: string) {
  if (path.startsWith('/trips')) return 'My trips';
  if (path.startsWith('/explore')) return 'Explore';
  if (path.startsWith('/calendar')) return 'Calendar';
  if (path.startsWith('/community')) return 'Community';
  if (path.startsWith('/profile')) return 'Profile & settings';
  if (path.startsWith('/budget')) return 'Budget';
  if (path.startsWith('/admin')) return 'Analytics';
  if (path.startsWith('/shared')) return 'Shared itinerary';
  return 'Overview';
}
