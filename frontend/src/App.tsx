import { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LogoSplash } from './components/auth/LogoSplash';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TripsPage } from './pages/trips/TripsPage';
import { CreateTripPage } from './pages/trips/CreateTripPage';
import { TripBuilderPage } from './pages/trips/TripBuilderPage';
import { ItineraryViewPage } from './pages/itinerary/ItineraryViewPage';
import { SharedItineraryPage } from './pages/itinerary/SharedItineraryPage';
import { ExplorePage } from './pages/explore/ExplorePage';
import { BudgetPage } from './pages/budget/BudgetPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { CommunityPage } from './pages/community/CommunityPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';

function ShellRoute({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Session check for splash screen presentation
    const seen = sessionStorage.getItem('gt_splash_seen');
    if (seen === 'true') {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('gt_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <LogoSplash onFinish={handleSplashFinish} />}
      
      <div
        style={{
          animation: showSplash ? 'none' : 'slideInFromBottom 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ShellRoute><DashboardPage /></ShellRoute>} />
          <Route path="/trips" element={<ShellRoute><TripsPage /></ShellRoute>} />
          <Route path="/trips/new" element={<ShellRoute><CreateTripPage /></ShellRoute>} />
          <Route path="/trips/:id/build" element={<ShellRoute><TripBuilderPage /></ShellRoute>} />
          <Route path="/trips/:id/view" element={<ShellRoute><ItineraryViewPage /></ShellRoute>} />
          <Route path="/shared/:id" element={<SharedItineraryPage />} />
          <Route path="/shared/itinerary/:id" element={<SharedItineraryPage />} />
          <Route path="/explore" element={<ShellRoute><ExplorePage /></ShellRoute>} />
          <Route path="/explore/cities" element={<ShellRoute><ExplorePage type="cities" /></ShellRoute>} />
          <Route path="/explore/cities/:id" element={<ShellRoute><ExplorePage type="cities" /></ShellRoute>} />
          <Route path="/explore/activities" element={<ShellRoute><ExplorePage type="activities" /></ShellRoute>} />
          <Route path="/budget/:id" element={<ShellRoute><BudgetPage /></ShellRoute>} />
          <Route path="/calendar" element={<ShellRoute><CalendarPage /></ShellRoute>} />
          <Route path="/community" element={<ShellRoute><CommunityPage /></ShellRoute>} />
          <Route path="/profile" element={<ShellRoute><ProfilePage /></ShellRoute>} />
          <Route path="/admin" element={<ShellRoute><AdminPage /></ShellRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <style>{`
        @keyframes slideInFromBottom {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
