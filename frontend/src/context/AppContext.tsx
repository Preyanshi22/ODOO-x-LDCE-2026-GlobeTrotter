import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockApi } from '../services/mockApi';
import { initialPosts, initialTrips } from '../data/mockData';
import { api, type UserRegisterData } from '../services/api';
import { supabaseAuth } from '../services/supabaseAuth';
import type { Activity, Budget, CommunityPost, Destination, ItineraryActivity, Stop, ToastMessage, Trip, TripStatus, UserProfile } from '../types';

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

export function getMatchingActivitiesForLocation(
  city: string,
  country: string,
  daysCount: number,
  allActivities: Activity[]
): ItineraryActivity[] {
  const normCity = (city || '').toLowerCase();
  const normCountry = (country || '').toLowerCase();

  let matches = (allActivities || []).filter(
    (a: Activity) =>
      (a.city && normCity.includes(a.city.toLowerCase())) ||
      (a.city && a.city.toLowerCase().includes(normCity)) ||
      (a.country && normCountry.includes(a.country.toLowerCase())) ||
      (a.country && a.country.toLowerCase().includes(normCountry))
  );

  if (matches.length < 2) {
    matches = [...matches, ...(allActivities || []).slice(0, 4)];
  }

  const unique = Array.from(new Map(matches.map((a: Activity) => [a.id, a])).values()).slice(0, Math.min(8, Math.max(2, daysCount * 2)));
  const times = ['09:30 AM', '02:00 PM', '05:30 PM', '11:00 AM', '03:30 PM'];

  return unique.map((act: Activity, index: number) => {
    const day = (index % Math.max(1, daysCount)) + 1;
    const time = times[index % times.length];
    return {
      ...act,
      id: `act-auto-${Date.now()}-${index}`,
      day,
      time
    };
  });
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
      let mappedBackendTrips: Trip[] = [];
      if (backendTrips && backendTrips.length > 0) {
        mappedBackendTrips = backendTrips.map((bt: any) => ({
          id: bt.id || String(bt._id),
          name: bt.title || bt.name || 'Untitled Trip',
          description: bt.description || 'Custom Travel Itinerary',
          startDate: bt.start_date || '2026-09-01',
          endDate: bt.end_date || '2026-09-05',
          cover: bt.cover || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=85',
          status: 'upcoming' as TripStatus,
          createdAt: new Date().toISOString(),
          budget: bt.total_budget && bt.total_budget !== 50000
            ? {
                total: bt.total_budget,
                categories: {
                  Transport: Math.round(bt.total_budget * 0.25),
                  Accommodation: Math.round(bt.total_budget * 0.40),
                  Activities: Math.round(bt.total_budget * 0.20),
                  Meals: Math.round(bt.total_budget * 0.10),
                  Other: Math.round(bt.total_budget * 0.05),
                },
              }
            : calculateTripBudget(bt.title || bt.name || '', bt.start_date || '2026-09-01', bt.end_date || '2026-09-05'),
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

      // Merge initial seed trips, backend trips, and local storage saved trips!
      const localTrips: Trip[] = Array.isArray(parsed?.trips) ? parsed!.trips : [];
      const mergedMap = new Map<string, Trip>();

      // Seed initial trips first
      initialTrips.forEach((t: Trip) => mergedMap.set(t.id, t));

      // Add backend trips
      mappedBackendTrips.forEach((t: Trip) => mergedMap.set(t.id, t));

      // Add local stored trips (so user-created trips are NEVER lost on refresh!)
      localTrips.forEach((t: Trip) => mergedMap.set(t.id, t));

      const finalTrips = Array.from(mergedMap.values());

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

      const communityPosts: CommunityPost[] = backendPosts && backendPosts.length > 0 ? backendPosts : initialPosts;

      setTrips(finalTrips);
      setDestinations(seedDestinations);
      setActivities(seedActivities);
      setProfile(activeProfile);
      setPosts(communityPosts);
      setSelectedTripId(parsed?.selectedTripId || finalTrips[0]?.id || '');
    });
  }, []);

  useEffect(() => {
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
      try {
        const newProfile = await supabaseAuth.register({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          city: data.city || 'Bengaluru',
          country: data.country || 'India',
          password: data.password,
          profilePhoto: data.profile_photo
        });
        setProfile(newProfile);
        setTrips([]);
      } catch (err) {
        if (err instanceof Error && (err.message.includes('already registered') || err.message.includes('already exists'))) {
          throw err;
        }
        const fallback: UserProfile = {
          firstName: data.first_name || 'Traveler',
          lastName: data.last_name || '',
          email: data.email,
          phone: data.phone || '',
          city: data.city || 'Bengaluru',
          country: data.country || 'India',
          avatar: data.profile_photo || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
          language: 'English (US)',
          savedDestinations: [],
          privacy: 'public',
        };
        setProfile(fallback);
        setTrips([]);
      }
    },
    []
  );

  const loginUser = useCallback(
    async (email: string, pass: string) => {
      try {
        const newProfile = await supabaseAuth.login({ email, password: pass });
        setProfile(newProfile);
      } catch (err) {
        if (err instanceof Error && err.message.includes('not registered')) {
          throw err;
        }
        const defaultName = email.split('@')[0].split('.')[0] || 'Traveler';
        const fallback: UserProfile = {
          firstName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          lastName: '',
          email: email,
          phone: '',
          city: 'Bengaluru',
          country: 'India',
          avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
          language: 'English (US)',
          savedDestinations: [],
          privacy: 'public',
        };
        setProfile(fallback);
      }
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

      const daysCount = Math.max(1, Math.round((new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / 86400000) + 1);
      const placeBudget = calculateTripBudget(input.name + ' ' + (input.description || ''), input.startDate, input.endDate);

      // Auto-populate location activities for the trip
      const autoActivities = getMatchingActivitiesForLocation(input.name, input.description || '', daysCount, activities);
      const autoActivitiesSum = autoActivities.reduce((sum: number, a: ItineraryActivity) => sum + (a.price || 0), 0);

      const autoStops: Stop[] = [
        {
          id: `stop-${Date.now()}-0`,
          city: input.name,
          country: input.description || 'Destination',
          arrival: input.startDate,
          departure: input.endDate,
          image: input.cover,
          activities: autoActivities,
        },
      ];

      const updatedCategories = {
        ...placeBudget.categories,
        Activities: Math.max(placeBudget.categories.Activities, autoActivitiesSum),
      };
      const totalBudget = Object.values(updatedCategories).reduce((a, b) => a + b, 0);

      try {
        const backendRes = await api.createTrip({
          title: input.name,
          user_id,
          start_date: input.startDate,
          end_date: input.endDate,
          total_budget: totalBudget,
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
        budget: { total: totalBudget, categories: updatedCategories },
        stops: autoStops,
      };

      setTrips((current) => [trip, ...current]);
      setSelectedTripId(trip.id);
      addToast(`Trip created with ${autoActivities.length} curated activities!`, 'success');
      return trip;
    },
    [activities, addToast, profile?.email]
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
          const daysCount = tripDays(trip);

          const autoActivities = getMatchingActivitiesForLocation(destination.city, destination.country, daysCount, activities);

          const stop: Stop = {
            id: `stop-${Date.now()}`,
            city: destination.city,
            country: destination.country,
            arrival,
            departure,
            image: destination.image,
            activities: autoActivities,
          };

          const newStops = [...trip.stops, stop];
          const allActsCost = newStops.flatMap((s) => s.activities).reduce((sum, a) => sum + (a.price || 0), 0);
          const updatedCategories = {
            ...trip.budget.categories,
            Activities: Math.max(trip.budget.categories.Activities, allActsCost),
          };
          const totalBudget = Object.values(updatedCategories).reduce((a, b) => a + b, 0);

          return {
            ...trip,
            budget: { total: totalBudget, categories: updatedCategories },
            stops: newStops,
          };
        })
      );
      addToast(`${destination.city} and curated experiences added to your route!`, 'success');
    },
    [activities, addToast]
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
        current.map((trip) => {
          if (trip.id !== tripId) return trip;
          const newStops = trip.stops.filter((stop) => stop.id !== stopId);
          const allActsCost = newStops.flatMap((s) => s.activities).reduce((sum, a) => sum + (a.price || 0), 0);
          const updatedCategories = {
            ...trip.budget.categories,
            Activities: Math.max(0, allActsCost),
          };
          const totalBudget = Object.values(updatedCategories).reduce((a, b) => a + b, 0);

          return {
            ...trip,
            stops: newStops,
            budget: { total: totalBudget, categories: updatedCategories },
          };
        })
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
        current.map((trip) => {
          if (trip.id !== tripId) return trip;
          const newStops = trip.stops.map((stop) =>
            stop.id === stopId
              ? {
                  ...stop,
                  activities: [
                    ...stop.activities,
                    { ...activity, id: `${activity.id}-${Date.now()}`, day: 1, time: '10:00 AM' },
                  ],
                }
              : stop
          );
          const allActsCost = newStops.flatMap((s) => s.activities).reduce((sum, a) => sum + (a.price || 0), 0);
          const updatedCategories = {
            ...trip.budget.categories,
            Activities: Math.max(0, allActsCost),
          };
          const totalBudget = Object.values(updatedCategories).reduce((a, b) => a + b, 0);

          return {
            ...trip,
            stops: newStops,
            budget: { total: totalBudget, categories: updatedCategories },
          };
        })
      );
      addToast(`${activity.name} added to your itinerary.`, 'success');
    },
    [addToast]
  );

  const removeActivity = useCallback(
    (tripId: string, stopId: string, activityId: string) => {
      setTrips((current) =>
        current.map((trip) => {
          if (trip.id !== tripId) return trip;
          const newStops = trip.stops.map((stop) =>
            stop.id === stopId ? { ...stop, activities: stop.activities.filter((act) => act.id !== activityId) } : stop
          );
          const allActsCost = newStops.flatMap((s) => s.activities).reduce((sum, a) => sum + (a.price || 0), 0);
          const updatedCategories = {
            ...trip.budget.categories,
            Activities: Math.max(0, allActsCost),
          };
          const totalBudget = Object.values(updatedCategories).reduce((a, b) => a + b, 0);

          return {
            ...trip,
            stops: newStops,
            budget: { total: totalBudget, categories: updatedCategories },
          };
        })
      );
      addToast('Activity removed.', 'info');
    },
    [addToast]
  );

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

  const tripsWithDynamicStatus = useMemo(() => {
    return trips.map((trip) => ({
      ...trip,
      status: getDynamicTripStatus(trip.startDate, trip.endDate)
    }));
  }, [trips]);

  const selectedTrip = useMemo(() => tripsWithDynamicStatus.find((trip) => trip.id === selectedTripId), [tripsWithDynamicStatus, selectedTripId]);

  const value = useMemo(
    () => ({
      trips: tripsWithDynamicStatus,
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
      tripsWithDynamicStatus,
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

export function getDynamicTripStatus(startDateStr: string, endDateStr: string): TripStatus {
  if (!startDateStr || !endDateStr) return 'upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T23:59:59`);

  if (today > end) {
    return 'completed';
  } else if (today >= start && today <= end) {
    return 'ongoing';
  } else {
    return 'upcoming';
  }
}

export function calculateTripBudget(placeOrName: string, startDateStr: string, endDateStr: string): Budget {
  const name = (placeOrName || '').toLowerCase();
  
  // Base daily rate estimation according to place cost index & tier
  let dailyRate = 7500; // default medium-tier

  if (name.includes('switzerland') || name.includes('zurich') || name.includes('hawaii') || name.includes('honolulu') || name.includes('maldives') || name.includes('tokyo') || name.includes('japan') || name.includes('london') || name.includes('iceland') || name.includes('reykjavik') || name.includes('new zealand') || name.includes('queenstown')) {
    dailyRate = 14500; // Premium Luxury Destinations
  } else if (name.includes('paris') || name.includes('france') || name.includes('rome') || name.includes('italy') || name.includes('dubai') || name.includes('uae') || name.includes('singapore') || name.includes('sydney') || name.includes('norway') || name.includes('tromsø') || name.includes('canada') || name.includes('banff')) {
    dailyRate = 11000; // High-Cost Destinations
  } else if (name.includes('barcelona') || name.includes('spain') || name.includes('prague') || name.includes('istanbul') || name.includes('bali') || name.includes('indonesia') || name.includes('cusco') || name.includes('peru')) {
    dailyRate = 6500; // Moderate Destinations
  } else if (name.includes('phuket') || name.includes('thailand') || name.includes('cairo') || name.includes('egypt') || name.includes('morocco') || name.includes('marrakech') || name.includes('vietnam') || name.includes('goa') || name.includes('india')) {
    dailyRate = 4200; // Budget-Friendly Destinations
  }

  // Duration in days
  let days = 4;
  if (startDateStr && endDateStr) {
    const startMs = new Date(`${startDateStr}T00:00:00`).getTime();
    const endMs = new Date(`${endDateStr}T23:59:59`).getTime();
    if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
      days = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));
    }
  }

  const total = Math.round(dailyRate * days);

  return {
    total,
    categories: {
      Transport: Math.round(total * 0.25),
      Accommodation: Math.round(total * 0.40),
      Activities: Math.round(total * 0.20),
      Meals: Math.round(total * 0.10),
      Other: Math.round(total * 0.05),
    }
  };
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
