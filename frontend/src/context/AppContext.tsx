import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockApi } from '../services/mockApi';
import { api, type UserRegisterData } from '../services/api';
import type { Activity, CommunityPost, Destination, ItineraryActivity, Stop, ToastMessage, Trip, TripStatus, UserProfile } from '../types';

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
  registerUser: (data: UserRegisterData) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  toggleLike: (postId: string) => void;
  addPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'liked' | 'createdAt'>) => void;
  addToast: (message: string, tone?: ToastMessage['tone']) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  clearAllUserData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE = 'globetrotter-frontend-state';
const USER_STORAGE = 'gt_active_user';

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
    const parsed = saved ? (JSON.parse(saved) as Partial<AppContextValue>) : null;
    const savedUser = window.localStorage.getItem(USER_STORAGE);
    const currentUserObj = savedUser ? JSON.parse(savedUser) : null;

    Promise.all([
      api.fetchTrips(currentUserObj?.id || currentUserObj?.email),
      api.fetchCommunityPosts(),
      mockApi.destinations.list(),
      mockApi.activities.list(),
    ]).then(([backendTrips, backendPosts, seedDestinations, seedActivities]) => {
      let finalTrips: Trip[] = [];
      if (backendTrips && backendTrips.length > 0) {
        finalTrips = backendTrips.map((bt: any) => ({
          id: bt.id || String(bt._id),
          name: bt.title || bt.name || 'Untitled Trip',
          description: bt.description || 'Custom Travel Itinerary',
          startDate: bt.start_date || '2026-09-01',
          endDate: bt.end_date || '2026-09-05',
          cover: bt.cover || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85',
          status: 'upcoming' as TripStatus,
          createdAt: new Date().toISOString(),
          budget: {
            total: bt.total_budget || 50000,
            categories: {
              Transport: Math.round((bt.total_budget || 50000) * 0.2),
              Accommodation: Math.round((bt.total_budget || 50000) * 0.4),
              Activities: Math.round((bt.total_budget || 50000) * 0.2),
              Meals: Math.round((bt.total_budget || 50000) * 0.15),
              Other: Math.round((bt.total_budget || 50000) * 0.05),
            },
          },
          stops: (bt.stops || []).map((s: any, idx: number) => ({
            id: `stop-${idx}`,
            city: s.city_name || s.city || 'City',
            country: s.country || 'Destination',
            arrival: s.start_date || bt.start_date || '2026-09-01',
            departure: s.end_date || bt.end_date || '2026-09-05',
            image: s.image || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
            activities: (bt.activities || []).map((act: any, actIdx: number) => ({
              id: `act-${actIdx}`,
              name: act.name || 'Activity',
              category: act.category || 'Sightseeing',
              price: act.cost || 1000,
              duration: '2 hours',
              rating: 4.8,
              city: s.city_name || 'City',
              country: 'Country',
              description: 'Curated moment.',
              image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
              day: act.day_number || 1,
              time: '10:00',
            })),
          })),
        }));
      }

      let activeProfile: UserProfile = {
        firstName: 'Guest',
        lastName: 'User',
        email: 'guest@globetrotter.app',
        phone: '',
        city: 'Explore',
        country: 'World',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        language: 'English (US)',
        savedDestinations: [],
        privacy: 'public',
      };

      if (currentUserObj) {
        activeProfile = {
          firstName: currentUserObj.first_name || currentUserObj.firstName || 'User',
          lastName: currentUserObj.last_name || currentUserObj.lastName || '',
          email: currentUserObj.email || '',
          phone: currentUserObj.phone || '',
          city: currentUserObj.city || '',
          country: currentUserObj.country || '',
          avatar: currentUserObj.profile_photo || activeProfile.avatar,
          language: 'English (US)',
          savedDestinations: [],
          privacy: 'public',
        };
      } else if (parsed?.profile) {
        activeProfile = parsed.profile;
      }

      const initialPosts: CommunityPost[] = backendPosts && backendPosts.length > 0 ? backendPosts : [
        {
          id: 'post-1',
          user: 'Aarav Mehta',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          destination: 'Kyoto, Japan',
          tripName: 'Zen Temples & Gardens',
          body: 'Morning light filtering through the Bamboo Grove in Arashiyama. Pure serenity before the crowds arrive.',
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          likes: 38,
          comments: 6,
          createdAt: '2 hours ago',
        }
      ];

      setTrips(finalTrips);
      setDestinations(seedDestinations);
      setActivities(seedActivities);
      setProfile(activeProfile);
      setPosts(initialPosts);
      setSelectedTripId(finalTrips[0]?.id ?? '');
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

  const clearAllUserData = useCallback(() => {
    setTrips([]);
    window.localStorage.removeItem(STORAGE);
    window.localStorage.removeItem(USER_STORAGE);
    sessionStorage.clear();
    setProfile({
      firstName: 'Guest',
      lastName: 'User',
      email: 'guest@globetrotter.app',
      phone: '',
      city: 'Explore',
      country: 'World',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      language: 'English (US)',
      savedDestinations: [],
      privacy: 'public',
    });
    addToast('All mock data cleared.', 'info');
  }, [addToast]);

  const registerUser = useCallback(
    async (data: UserRegisterData) => {
      const res = await api.registerUser(data);
      const u = res.user;
      const newProfile: UserProfile = {
        firstName: u.first_name,
        lastName: u.last_name || '',
        email: u.email,
        phone: u.phone || '',
        city: u.city || '',
        country: u.country || '',
        avatar: u.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        language: 'English (US)',
        savedDestinations: [],
        privacy: 'public',
      };
      setProfile(newProfile);
      setTrips([]);
      window.localStorage.setItem(USER_STORAGE, JSON.stringify(u));
    },
    []
  );

  const loginUser = useCallback(
    async (email: string, pass: string) => {
      const res = await api.loginUser({ email, password: pass });
      const u = res.user;
      const newProfile: UserProfile = {
        firstName: u.first_name,
        lastName: u.last_name || '',
        email: u.email,
        phone: u.phone || '',
        city: u.city || '',
        country: u.country || '',
        avatar: u.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        language: 'English (US)',
        savedDestinations: [],
        privacy: 'public',
      };
      setProfile(newProfile);
      window.localStorage.setItem(USER_STORAGE, JSON.stringify(u));

      const userTrips = await api.fetchTrips(u.id || u.email);
      const formatted: Trip[] = (userTrips || []).map((bt: any) => ({
        id: bt.id || String(bt._id),
        name: bt.title || bt.name || 'Untitled Trip',
        description: bt.description || 'Custom Travel Itinerary',
        startDate: bt.start_date || '2026-09-01',
        endDate: bt.end_date || '2026-09-05',
        cover: bt.cover || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85',
        status: 'upcoming' as TripStatus,
        createdAt: new Date().toISOString(),
        budget: {
          total: bt.total_budget || 50000,
          categories: { Transport: 10000, Accommodation: 20000, Activities: 10000, Meals: 7500, Other: 2500 },
        },
        stops: [],
      }));
      setTrips(formatted);
      setSelectedTripId(formatted[0]?.id ?? '');
    },
    []
  );

  const updateProfile = useCallback(
    async (updated: UserProfile) => {
      setProfile(updated);
      try {
        await api.updateUserProfile({
          first_name: updated.firstName,
          last_name: updated.lastName,
          email: updated.email,
          phone: updated.phone,
          city: updated.city,
          country: updated.country,
          profile_photo: updated.avatar,
        });
      } catch (err) {
        console.warn('Backend sync update profile warning:', err);
      }
    },
    []
  );

  const updateTrip = useCallback(
    async (updated: Trip) => {
      setTrips((current) => current.map((trip) => (trip.id === updated.id ? updated : trip)));
      try {
        await api.updateTrip(updated.id, {
          title: updated.name,
          start_date: updated.startDate,
          end_date: updated.endDate,
          total_budget: updated.budget.total,
        });
      } catch (err) {
        console.warn('Backend sync update warning:', err);
      }
    },
    []
  );

  const createTrip = useCallback(
    async (input: Pick<Trip, 'name' | 'description' | 'startDate' | 'endDate' | 'cover'>) => {
      let createdId = `trip-${Date.now()}`;
      const savedUserStr = window.localStorage.getItem(USER_STORAGE);
      const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const user_id = currentUser?.id || profile?.email || 'user_guest';

      try {
        const backendRes = await api.createTrip({
          title: input.name,
          user_id,
          start_date: input.startDate,
          end_date: input.endDate,
          total_budget: 50000,
          stops: [{ city_name: input.name, start_date: input.startDate, end_date: input.endDate }],
        });
        if (backendRes?.id) createdId = backendRes.id;
      } catch (err) {
        console.warn('Backend sync create warning:', err);
      }

      const trip: Trip = {
        ...input,
        id: createdId,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        budget: {
          total: 50000,
          categories: { Transport: 10000, Accommodation: 20000, Activities: 10000, Meals: 7500, Other: 2500 },
        },
        stops: [],
      };

      setTrips((current) => [trip, ...current]);
      setSelectedTripId(trip.id);
      addToast('Your new trip has been created and saved.', 'success');
      return trip;
    },
    [addToast, profile?.email]
  );

  const deleteTrip = useCallback(
    async (id: string) => {
      setTrips((current) => current.filter((trip) => trip.id !== id));
      setSelectedTripId((current) => (current === id ? (trips.find((trip) => trip.id !== id)?.id ?? '') : current));
      addToast('Trip deleted.', 'info');
      try {
        await api.deleteTrip(id);
      } catch (err) {
        console.warn('Backend delete warning:', err);
      }
    },
    [addToast, trips]
  );

  const addStop = useCallback(
    (tripId: string, destination: Destination) => {
      setTrips((current) =>
        current.map((trip) => {
          if (trip.id !== tripId || trip.stops.some((stop) => stop.city === destination.city)) return trip;
          const last = trip.stops[trip.stops.length - 1];
          const arrival = last?.departure ?? trip.startDate;
          const departure = last?.departure ?? trip.endDate;
          const stop: Stop = {
            id: `stop-${Date.now()}`,
            city: destination.city,
            country: destination.country,
            arrival,
            departure,
            image: destination.image,
            activities: [],
          };
          return { ...trip, stops: [...trip.stops, stop] };
        })
      );
      addToast(`${destination.city} added to your route.`, 'success');
    },
    [addToast]
  );

  const copyTrip = useCallback(
    (id: string) => {
      const original = trips.find((trip) => trip.id === id);
      if (!original) return undefined;
      const copy = {
        ...original,
        id: `trip-${Date.now()}`,
        name: `${original.name} (copy)`,
        createdAt: new Date().toISOString(),
        shared: false,
        stops: original.stops.map((stop) => ({
          ...stop,
          id: `stop-${Date.now()}-${stop.id}`,
          activities: stop.activities.map((activity) => ({ ...activity, id: `${activity.id}-copy` })),
        })),
      };
      setTrips((current) => [copy, ...current]);
      setSelectedTripId(copy.id);
      addToast('A copy was added to your trips.', 'success');
      return copy;
    },
    [trips, addToast]
  );

  const updateStop = useCallback((tripId: string, stopId: string, dates: Pick<Stop, 'arrival' | 'departure'>) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId
          ? { ...trip, stops: trip.stops.map((stop) => (stop.id === stopId ? { ...stop, ...dates } : stop)) }
          : trip
      )
    );
  }, []);

  const removeStop = useCallback(
    (tripId: string, stopId: string) => {
      setTrips((current) =>
        current.map((trip) => (trip.id === tripId ? { ...trip, stops: trip.stops.filter((stop) => stop.id !== stopId) } : trip))
      );
      addToast('Stop removed from your route.', 'info');
    },
    [addToast]
  );

  const moveStop = useCallback((tripId: string, stopId: string, direction: -1 | 1) => {
    setTrips((current) =>
      current.map((trip) => {
        if (trip.id !== tripId) return trip;
        const index = trip.stops.findIndex((stop) => stop.id === stopId);
        const next = index + direction;
        if (index < 0 || next < 0 || next >= trip.stops.length) return trip;
        const stops = [...trip.stops];
        [stops[index], stops[next]] = [stops[next], stops[index]];
        return { ...trip, stops };
      })
    );
  }, []);

  const addActivity = useCallback(
    (tripId: string, stopId: string, activity: Activity) => {
      setTrips((current) =>
        current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                stops: trip.stops.map((stop) =>
                  stop.id === stopId
                    ? {
                        ...stop,
                        activities: [
                          ...stop.activities,
                          { ...activity, id: `${activity.id}-${Date.now()}`, day: 1, time: '10:00' },
                        ],
                      }
                    : stop
                ),
              }
            : trip
        )
      );
      addToast(`${activity.name} added to your itinerary.`, 'success');
    },
    [addToast]
  );

  const removeActivity = useCallback((tripId: string, stopId: string, activityId: string) => {
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              stops: trip.stops.map((stop) =>
                stop.id === stopId ? { ...stop, activities: stop.activities.filter((act) => act.id !== activityId) } : stop
              ),
            }
          : trip
      )
    );
  }, []);

  const toggleLike = useCallback(
    (postId: string) =>
      setPosts((current) =>
        current.map((post) => (post.id === postId ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post))
      ),
    []
  );

  const addPost = useCallback(
    async (postData: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'liked' | 'createdAt'>) => {
      const newPost: CommunityPost = {
        ...postData,
        id: `post-${Date.now()}`,
        likes: 0,
        comments: 0,
        liked: false,
        createdAt: 'Just now',
      };
      setPosts((current) => [newPost, ...current]);
      addToast('Your story has been published to the community!', 'success');

      try {
        await api.createCommunityPost(newPost);
      } catch (err) {
        console.warn('Backend createCommunityPost warning:', err);
      }
    },
    [addToast]
  );

  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === selectedTripId), [trips, selectedTripId]);

  const value = useMemo(
    () => ({
      trips,
      destinations,
      activities,
      profile,
      posts,
      selectedTrip,
      selectedTripId,
      setSelectedTripId,
      createTrip,
      copyTrip,
      updateTrip,
      deleteTrip,
      addStop,
      updateStop,
      removeStop,
      moveStop,
      addActivity,
      removeActivity,
      updateProfile,
      registerUser,
      loginUser,
      toggleLike,
      addPost,
      addToast,
      toasts,
      dismissToast,
      clearAllUserData,
    }),
    [
      trips,
      destinations,
      activities,
      profile,
      posts,
      selectedTrip,
      selectedTripId,
      createTrip,
      copyTrip,
      updateTrip,
      deleteTrip,
      addStop,
      updateStop,
      removeStop,
      moveStop,
      addActivity,
      removeActivity,
      updateProfile,
      registerUser,
      loginUser,
      toggleLike,
      addPost,
      addToast,
      toasts,
      dismissToast,
      clearAllUserData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function formatDateRange(start: string, end: string) {
  return `${new Date(`${start}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(
    `${end}T12:00:00`
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function tripDays(trip: Trip) {
  return Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1);
}

export type { ItineraryActivity };
