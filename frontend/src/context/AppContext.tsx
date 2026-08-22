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

export function generateDestinationActivities(city: string, country: string): Activity[] {
  const locName = city || country || 'Destination';
  const ctryName = country || city || 'Local Area';
  const norm = (locName + ' ' + ctryName).toLowerCase();

  if (norm.includes('hawaii') || norm.includes('honolulu') || norm.includes('oahu') || norm.includes('waikiki')) {
    return [
      { id: `act-hi-1`, name: 'Waikiki Sunset Surf & Beachfront Experience', city: 'Honolulu', country: 'Hawaii', category: 'Adventure', duration: '3.5 hours', price: 6800, description: 'Catch waves along Waikiki Beach and relax with beachfront tropical refreshments at sunset.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-hi-2`, name: 'Diamond Head Crater Sunrise Summit Hike', city: 'Honolulu', country: 'Hawaii', category: 'Nature', duration: '2.5 hours', price: 2500, description: 'Hike to the volcanic crater summit for 360-degree panoramic views of Oahu coastline.', image: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
      { id: `act-hi-3`, name: 'Traditional Hawaiian Luau & Fire Dance Dinner', city: 'Honolulu', country: 'Hawaii', category: 'Culture', duration: '4 hours', price: 9500, description: 'Authentic Polynesian feast, ukulele music, and fire-knife dance performances.', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-hi-4`, name: 'North Shore Ocean Catamaran & Turtle Snorkel', city: 'Honolulu', country: 'Hawaii', category: 'Adventure', duration: '5 hours', price: 11200, description: 'Cruise pristine North Shore bays and swim alongside sea turtles and ocean wildlife.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85', rating: 5.0 },
    ];
  }

  if (norm.includes('paris') || norm.includes('france')) {
    return [
      { id: `act-fr-1`, name: 'Eiffel Tower Sunset & Champ de Mars Walk', city: 'Paris', country: 'France', category: 'Sightseeing', duration: '2.5 hours', price: 3500, description: 'Golden hour view of Paris from the Eiffel Tower observation deck followed by garden strolls.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-fr-2`, name: 'Sunset Champagne Seine River Cruise', city: 'Paris', country: 'France', category: 'Sightseeing', duration: '1.5 hours', price: 5400, description: 'Glide past Notre-Dame and Louvre monuments sipping artisanal French champagne.', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
      { id: `act-fr-3`, name: 'Louvre Museum Masterpieces Guided Tour', city: 'Paris', country: 'France', category: 'Culture', duration: '3 hours', price: 4800, description: 'Priority entrance to view the Mona Lisa, Venus de Milo, and French Renaissance art.', image: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-fr-4`, name: 'French Pastry & Macaron Masterclass in Le Marais', city: 'Paris', country: 'France', category: 'Food', duration: '2.5 hours', price: 6200, description: 'Bake authentic French macarons and croissants with a Parisian pastry chef.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
    ];
  }

  if (norm.includes('tokyo') || norm.includes('kyoto') || norm.includes('japan')) {
    return [
      { id: `act-jp-1`, name: 'Tsukiji Outer Market Seafood & Sushi Tasting', city: 'Tokyo', country: 'Japan', category: 'Food', duration: '3 hours', price: 6500, description: 'Sample fresh sashimi, tamagoyaki, and Edomae sushi crafted by Tokyo masters.', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-jp-2`, name: 'Senso-ji Temple & Asakusa Old Town Guided Walk', city: 'Tokyo', country: 'Japan', category: 'Culture', duration: '2.5 hours', price: 3200, description: 'Historic Buddhist temple exploration and Nakamise shopping street snacks.', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
      { id: `act-jp-3`, name: 'Traditional Matcha Tea Ceremony in Gion', city: 'Kyoto', country: 'Japan', category: 'Culture', duration: '2 hours', price: 4500, description: 'Authentic Japanese tea preparation and wagashi sweets tasting in a wooden machiya.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-jp-4`, name: 'Shinkansen Day Excursion to Mt. Fuji & Lake Kawaguchi', city: 'Tokyo', country: 'Japan', category: 'Adventure', duration: '8 hours', price: 11500, description: 'Scenic bullet train journey to iconic Mount Fuji view points and ropeway rides.', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=85', rating: 5.0 },
    ];
  }

  if (norm.includes('zurich') || norm.includes('switzerland') || norm.includes('alps') || norm.includes('interlaken')) {
    return [
      { id: `act-ch-1`, name: 'Swiss Alps Glacier Flight & Alpine Hike', city: 'Zurich', country: 'Switzerland', category: 'Adventure', duration: '5 hours', price: 15400, description: 'Soar past snowy peaks and hike high-alpine glacier trails with mountain lake views.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=85', rating: 5.0 },
      { id: `act-ch-2`, name: 'Jungfraujoch – Top of Europe Glacier Experience', city: 'Interlaken', country: 'Switzerland', category: 'Sightseeing', duration: '7 hours', price: 16800, description: 'Cogwheel train trip to 3,454m glacier observatory, ice palace, and snow plateau.', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-ch-3`, name: 'Lake Zurich Fondue Cruise & Old Town Tour', city: 'Zurich', country: 'Switzerland', category: 'Food', duration: '3 hours', price: 6800, description: 'Scenic boat cruise serving melted Swiss cheese fondue alongside lakeside sights.', image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
      { id: `act-ch-4`, name: 'Interlaken Tandem Paragliding over Alpine Lakes', city: 'Interlaken', country: 'Switzerland', category: 'Adventure', duration: '2 hours', price: 18500, description: 'Soar like a bird above Lake Thun and Lake Brienz with certified mountain pilots.', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=85', rating: 5.0 },
    ];
  }

  if (norm.includes('dubai') || norm.includes('uae')) {
    return [
      { id: `act-ae-1`, name: 'Red Dune Desert Safari & Sunset Bedouin Dinner', city: 'Dubai', country: 'UAE', category: 'Adventure', duration: '6 hours', price: 7900, description: 'Dune bashing in 4x4, camel riding, henna painting, and BBQ banquet under desert stars.', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-ae-2`, name: 'Burj Khalifa At The Top Observation Deck', city: 'Dubai', country: 'UAE', category: 'Sightseeing', duration: '2 hours', price: 4200, description: 'High-speed elevator ride to the 148th floor for panoramic views over Dubai skyline.', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
      { id: `act-ae-3`, name: 'Private Sunset Yacht Cruise in Dubai Marina', city: 'Dubai', country: 'UAE', category: 'Sightseeing', duration: '2.5 hours', price: 12500, description: 'Cruise past Palm Jumeirah and Atlantis The Royal with complimentary luxury appetizers.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
      { id: `act-ae-4`, name: 'Dubai Creek Old Town & Gold Souk Cultural Tour', city: 'Dubai', country: 'UAE', category: 'Culture', duration: '3 hours', price: 3400, description: 'Abra boat ride across Dubai Creek and guided walk through aromatic spice and gold markets.', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=85', rating: 4.7 },
    ];
  }

  // Fallback template for any other custom location
  return [
    { id: `act-gen-1`, name: `${locName} Historic Old Town & Heritage Walking Tour`, city: locName, country: ctryName, category: 'Culture', duration: '3 hours', price: 3200, description: `Discover ancient architecture, hidden plazas, and rich local history of ${locName}.`, image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
    { id: `act-gen-2`, name: `${locName} Sunset Panoramic Sightseeing Cruise`, city: locName, country: ctryName, category: 'Sightseeing', duration: '2 hours', price: 4800, description: `Enjoy breathtaking views of ${locName} landmarks as golden hour illuminates the skyline.`, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
    { id: `act-gen-3`, name: `${locName} Authentic Local Gastronomy Masterclass`, city: locName, country: ctryName, category: 'Food', duration: '2.5 hours', price: 4200, description: `Learn traditional culinary recipes and savor fresh regional specialties of ${ctryName}.`, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85', rating: 4.8 },
    { id: `act-gen-4`, name: `${locName} Scenic Nature Excursion & Viewpoint Hike`, city: locName, country: ctryName, category: 'Nature', duration: '4 hours', price: 5500, description: `Explore lush natural reserves, scenic mountain ridges, and pristine vistas near ${locName}.`, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=85', rating: 4.9 },
  ];
}

export function getMatchingActivitiesForLocation(
  city: string,
  country: string,
  daysCount: number,
  allActivities: Activity[]
): ItineraryActivity[] {
  const normCity = (city || '').toLowerCase();
  const normCountry = (country || '').toLowerCase();

  // 1. Search existing seed activities strictly matching city or country
  let matches = (allActivities || []).filter((a: Activity) => {
    const actCity = (a.city || '').toLowerCase();
    const actCountry = (a.country || '').toLowerCase();

    return (
      (normCity && (actCity.includes(normCity) || normCity.includes(actCity))) ||
      (normCountry && (actCountry.includes(normCountry) || normCountry.includes(actCountry)))
    );
  });

  // 2. If no direct seed matches, generate location-authentic activities specifically for THIS place
  if (matches.length < 2) {
    const generated = generateDestinationActivities(city, country);
    matches = [...matches, ...generated];
  }

  // Guarantee ZERO cross-country contamination
  const strictPool = matches.filter((a: Activity) => {
    if (!normCity && !normCountry) return true;
    const actCity = (a.city || '').toLowerCase();
    const actCountry = (a.country || '').toLowerCase();
    return (
      (normCity && (actCity.includes(normCity) || normCity.includes(actCity))) ||
      (normCountry && (actCountry.includes(normCountry) || normCountry.includes(actCountry)))
    );
  });

  const finalPool = strictPool.length > 0 ? strictPool : generateDestinationActivities(city, country);

  const unique = Array.from(new Map(finalPool.map((a: Activity) => [a.name, a])).values()).slice(
    0,
    Math.min(8, Math.max(2, daysCount * 2))
  );

  const times = ['09:30 AM', '02:00 PM', '05:30 PM', '11:00 AM', '03:30 PM'];

  return unique.map((act: Activity, index: number) => {
    const day = (index % Math.max(1, daysCount)) + 1;
    const time = times[index % times.length];
    return {
      ...act,
      id: `act-auto-${Date.now()}-${index}`,
      day,
      time,
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
