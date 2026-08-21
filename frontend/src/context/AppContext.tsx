import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockApi } from '../services/mockApi';
import type { Activity, CommunityPost, Destination, ItineraryActivity, Stop, ToastMessage, Trip, UserProfile } from '../types';

interface AppContextValue {
  trips: Trip[];
  destinations: Destination[];
  activities: Activity[];
  profile: UserProfile;
  posts: CommunityPost[];
  selectedTrip: Trip | undefined;
  selectedTripId: string;
  setSelectedTripId: (id: string) => void;
  createTrip: (input: Pick<Trip, 'name' | 'description' | 'startDate' | 'endDate' | 'cover'>) => Promise<Trip>;
  copyTrip: (id: string) => Trip | undefined;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addStop: (tripId: string, destination: Destination) => void;
  updateStop: (tripId: string, stopId: string, dates: Pick<Stop, 'arrival' | 'departure'>) => void;
  removeStop: (tripId: string, stopId: string) => void;
  moveStop: (tripId: string, stopId: string, direction: -1 | 1) => void;
  addActivity: (tripId: string, stopId: string, activity: Activity) => void;
  removeActivity: (tripId: string, stopId: string, activityId: string) => void;
  updateProfile: (profile: UserProfile) => void;
  toggleLike: (postId: string) => void;
  addToast: (message: string, tone?: ToastMessage['tone']) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE = 'globetrotter-frontend-state';

export function AppProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<UserProfile>(null as unknown as UserProfile);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE);
    const parsed = saved ? JSON.parse(saved) as Partial<AppContextValue> : null;
    Promise.all([mockApi.trips.list(), mockApi.destinations.list(), mockApi.activities.list(), mockApi.profile.get(), mockApi.community.list()]).then(([seedTrips, seedDestinations, seedActivities, seedProfile, seedPosts]) => {
      setTrips(parsed?.trips ?? seedTrips); setDestinations(seedDestinations); setActivities(seedActivities); setProfile(parsed?.profile ?? seedProfile); setPosts(seedPosts);
      setSelectedTripId(parsed?.selectedTripId ?? (parsed?.trips?.[0]?.id ?? seedTrips[0]?.id ?? ''));
    });
  }, []);

  useEffect(() => {
    if (!profile) return;
    window.localStorage.setItem(STORAGE, JSON.stringify({ trips, profile, selectedTripId }));
  }, [trips, profile, selectedTripId]);

  const addToast = useCallback((message: string, tone: ToastMessage['tone'] = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const updateTrip = useCallback((updated: Trip) => setTrips((current) => current.map((trip) => trip.id === updated.id ? updated : trip)), []);
  const createTrip = useCallback(async (input: Pick<Trip, 'name' | 'description' | 'startDate' | 'endDate' | 'cover'>) => {
    const trip: Trip = { ...input, id: `trip-${Date.now()}`, status: 'upcoming', createdAt: new Date().toISOString(), budget: { total: 2500, categories: { Transport: 500, Accommodation: 900, Activities: 300, Meals: 600, Other: 200 } }, stops: [] };
    setTrips((current) => [trip, ...current]); setSelectedTripId(trip.id); addToast('Your new trip is ready to shape.'); return trip;
  }, [addToast]);
  const deleteTrip = useCallback((id: string) => { setTrips((current) => current.filter((trip) => trip.id !== id)); setSelectedTripId((current) => current === id ? (trips.find((trip) => trip.id !== id)?.id ?? '') : current); addToast('Trip moved to the archive.', 'info'); }, [addToast, trips]);
  const addStop = useCallback((tripId: string, destination: Destination) => {
    setTrips((current) => current.map((trip) => {
      if (trip.id !== tripId || trip.stops.some((stop) => stop.city === destination.city)) return trip;
      const last = trip.stops[trip.stops.length - 1];
      const arrival = last?.departure ?? trip.startDate; const departure = last?.departure ?? trip.endDate;
      const stop: Stop = { id: `stop-${Date.now()}`, city: destination.city, country: destination.country, arrival, departure, image: destination.image, activities: [] };
      return { ...trip, stops: [...trip.stops, stop] };
    })); addToast(`${destination.city} added to your route.`);
  }, [addToast]);
  const copyTrip = useCallback((id: string) => { const original = trips.find((trip) => trip.id === id); if (!original) return undefined; const copy = { ...original, id: `trip-${Date.now()}`, name: `${original.name} (copy)`, createdAt: new Date().toISOString(), shared: false, stops: original.stops.map((stop) => ({ ...stop, id: `stop-${Date.now()}-${stop.id}`, activities: stop.activities.map((activity) => ({ ...activity, id: `${activity.id}-copy` })) })) }; setTrips((current) => [copy, ...current]); setSelectedTripId(copy.id); addToast('A copy was added to your trips.'); return copy; }, [trips, addToast]);
  const updateStop = useCallback((tripId: string, stopId: string, dates: Pick<Stop, 'arrival' | 'departure'>) => { setTrips((current) => current.map((trip) => trip.id === tripId ? { ...trip, stops: trip.stops.map((stop) => stop.id === stopId ? { ...stop, ...dates } : stop) } : trip)); }, []);
  const removeStop = useCallback((tripId: string, stopId: string) => { setTrips((current) => current.map((trip) => trip.id === tripId ? { ...trip, stops: trip.stops.filter((stop) => stop.id !== stopId) } : trip)); addToast('Stop removed from your route.', 'info'); }, [addToast]);
  const moveStop = useCallback((tripId: string, stopId: string, direction: -1 | 1) => { setTrips((current) => current.map((trip) => { if (trip.id !== tripId) return trip; const index = trip.stops.findIndex((stop) => stop.id === stopId); const next = index + direction; if (index < 0 || next < 0 || next >= trip.stops.length) return trip; const stops = [...trip.stops]; [stops[index], stops[next]] = [stops[next], stops[index]]; return { ...trip, stops }; })); }, []);
  const addActivity = useCallback((tripId: string, stopId: string, activity: Activity) => { setTrips((current) => current.map((trip) => trip.id === tripId ? { ...trip, stops: trip.stops.map((stop) => stop.id === stopId ? { ...stop, activities: [...stop.activities, { ...activity, id: `${activity.id}-${Date.now()}`, day: 1, time: '10:00' }] } : stop) } : trip)); addToast(`${activity.name} added to your itinerary.`); }, [addToast]);
  const removeActivity = useCallback((tripId: string, stopId: string, activityId: string) => { setTrips((current) => current.map((trip) => trip.id === tripId ? { ...trip, stops: trip.stops.map((stop) => stop.id === stopId ? { ...stop, activities: stop.activities.filter((activity) => activity.id !== activityId) } : stop) } : trip)); }, []);
  const toggleLike = useCallback((postId: string) => setPosts((current) => current.map((post) => post.id === postId ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post)), []);
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === selectedTripId), [trips, selectedTripId]);
  const value = useMemo(() => ({ trips, destinations, activities, profile, posts, selectedTrip, selectedTripId, setSelectedTripId, createTrip, copyTrip, updateTrip, deleteTrip, addStop, updateStop, removeStop, moveStop, addActivity, removeActivity, updateProfile: setProfile, toggleLike, addToast, toasts, dismissToast }), [trips, destinations, activities, profile, posts, selectedTrip, selectedTripId, createTrip, copyTrip, updateTrip, deleteTrip, addStop, updateStop, removeStop, moveStop, addActivity, removeActivity, toggleLike, addToast, toasts, dismissToast]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('useApp must be used within AppProvider'); return value; }
export function formatMoney(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value); }
export function formatDateRange(start: string, end: string) { return `${new Date(`${start}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(`${end}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`; }
export function tripDays(trip: Trip) { return Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1); }
export type { ItineraryActivity };
