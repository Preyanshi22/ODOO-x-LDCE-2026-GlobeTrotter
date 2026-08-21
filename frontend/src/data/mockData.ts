import type { Activity, CommunityPost, Destination, Trip, UserProfile } from '../types';

const img = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const destinations: Destination[] = [
  { id: 'paris', city: 'Paris', country: 'France', region: 'Europe', description: 'Cafés, quiet gardens, and the kind of light that makes you linger.', image: img('photo-1502602898657-3e91760cbb34'), popularity: 98, costIndex: 4, tags: ['Culture', 'Food', 'Romance'] },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', region: 'Asia', description: 'A thousand tiny discoveries between neon streets and peaceful shrines.', image: img('photo-1540959733332-eab4deabeeaf'), popularity: 96, costIndex: 4, tags: ['Food', 'Nightlife', 'Culture'] },
  { id: 'dubai', city: 'Dubai', country: 'UAE', region: 'Middle East', description: 'Skyline views, desert horizons, and unforgettable modern architecture.', image: img('photo-1512453979798-5ea266f8880c'), popularity: 91, costIndex: 5, tags: ['Luxury', 'Adventure', 'Shopping'] },
  { id: 'london', city: 'London', country: 'UK', region: 'Europe', description: 'Big city energy, beloved neighborhoods, and a story on every corner.', image: img('photo-1513635269975-59663e0ac1ad'), popularity: 94, costIndex: 4, tags: ['Culture', 'History', 'Food'] },
  { id: 'rome', city: 'Rome', country: 'Italy', region: 'Europe', description: 'Ancient wonders, long lunches, and streets made for getting lost.', image: img('photo-1552832230-c0197dd311b5'), popularity: 93, costIndex: 3, tags: ['History', 'Food', 'Art'] },
  { id: 'bali', city: 'Bali', country: 'Indonesia', region: 'Asia', description: 'Slow mornings, lush rice terraces, and a little more time to breathe.', image: img('photo-1537996194471-e657df975ab4'), popularity: 95, costIndex: 2, tags: ['Nature', 'Wellness', 'Adventure'] },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', region: 'Asia', description: 'A garden city where hawker stalls meet dazzling design.', image: img('photo-1525625293386-3f8f99389edd'), popularity: 88, costIndex: 4, tags: ['Food', 'Nature', 'Design'] },
  { id: 'new-york', city: 'New York', country: 'USA', region: 'North America', description: 'Find your rhythm in a city that rewards curiosity at every turn.', image: img('photo-1485871981521-5b1fd3805eee'), popularity: 97, costIndex: 5, tags: ['Food', 'Culture', 'Nightlife'] },
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', region: 'Europe', description: 'Mediterranean days, playful architecture, and tapas after sunset.', image: img('photo-1539037116277-4db20889f2d4'), popularity: 92, costIndex: 3, tags: ['Beach', 'Art', 'Food'] },
  { id: 'zurich', city: 'Switzerland', country: 'Switzerland', region: 'Europe', description: 'Lake views, mountain air, and the joy of a perfectly timed train.', image: img('photo-1527668752968-14dc70a27c95'), popularity: 86, costIndex: 5, tags: ['Nature', 'Slow travel', 'Adventure'] },
];

export const activities: Activity[] = [
  { id: 'eiffel', name: 'Eiffel Tower at golden hour', city: 'Paris', country: 'France', category: 'Sightseeing', duration: '2 hours', price: 42, description: 'Skip the lines and see Paris turn gold from the second floor.', image: img('photo-1543349689-9a4d426bee8e'), rating: 4.9 },
  { id: 'sushi', name: 'Tsukiji sushi masterclass', city: 'Tokyo', country: 'Japan', category: 'Food', duration: '3 hours', price: 78, description: 'Learn the rituals behind beautiful, honest Edomae sushi.', image: img('photo-1579871494447-9811cf80d66c'), rating: 4.8 },
  { id: 'desert', name: 'Red dune desert safari', city: 'Dubai', country: 'UAE', category: 'Adventure', duration: '6 hours', price: 95, description: 'Golden dunes, a sunset camp, and dinner beneath the stars.', image: img('photo-1470214304380-aadaedcfff1b'), rating: 4.7 },
  { id: 'colosseum', name: 'Colosseum after dark', city: 'Rome', country: 'Italy', category: 'History' as Activity['category'], duration: '2.5 hours', price: 58, description: 'Walk the ancient arena with stories that bring every stone alive.', image: img('photo-1552832230-c0197dd311b5'), rating: 4.9 },
  { id: 'ceramics', name: 'Montjuïc ceramic workshop', city: 'Barcelona', country: 'Spain', category: 'Culture', duration: '2 hours', price: 54, description: 'Make a small piece of Barcelona with a local ceramicist.', image: img('photo-1531058020387-3be344556be6'), rating: 4.8 },
  { id: 'nusa', name: 'Nusa Penida island day trip', city: 'Bali', country: 'Indonesia', category: 'Nature', duration: '9 hours', price: 64, description: 'Turquoise coves and dramatic cliffs on Bali’s wild neighbor.', image: img('photo-1539367628448-4bc5c9d171c8'), rating: 4.8 },
  { id: 'borough', name: 'Borough Market tasting walk', city: 'London', country: 'UK', category: 'Food', duration: '2 hours', price: 38, description: 'Meet the makers and taste your way through London’s favorite market.', image: img('photo-1513635269975-59663e0ac1ad'), rating: 4.7 },
  { id: 'gardens', name: 'Gardens by the Bay twilight walk', city: 'Singapore', country: 'Singapore', category: 'Nature', duration: '2 hours', price: 29, description: 'A relaxed evening under the Supertrees and city lights.', image: img('photo-1500534623283-312aade485b7'), rating: 4.8 },
];

const paris = destinations[0];
const rome = destinations[4];
const tokyo = destinations[1];

export const initialTrips: Trip[] = [
  {
    id: 'trip-europe', name: 'The slow European summer', description: 'A week of art, long lunches, and wandering through three timeless cities.', startDate: '2025-06-12', endDate: '2025-06-23', cover: img('photo-1502602898657-3e91760cbb34', 1200), status: 'upcoming', shared: true, createdAt: '2025-01-14',
    budget: { total: 3450, categories: { Transport: 680, Accommodation: 1320, Activities: 420, Meals: 780, Other: 160 } },
    stops: [
      { id: 'stop-paris', city: paris.city, country: paris.country, arrival: '2025-06-12', departure: '2025-06-16', image: paris.image, activities: [
        { ...activities[0], day: 1, time: '17:30' }, { ...activities[4], day: 3, time: '10:00' },
      ] },
      { id: 'stop-rome', city: rome.city, country: rome.country, arrival: '2025-06-16', departure: '2025-06-23', image: rome.image, activities: [
        { ...activities[3], day: 5, time: '18:00' },
      ] },
    ],
  },
  {
    id: 'trip-japan', name: 'A first taste of Japan', description: 'Neon nights, quiet temples, and everything delicious in between.', startDate: '2025-09-04', endDate: '2025-09-14', cover: img('photo-1540959733332-eab4deabeeaf', 1200), status: 'upcoming', createdAt: '2025-02-01',
    budget: { total: 4100, categories: { Transport: 1250, Accommodation: 1450, Activities: 520, Meals: 680, Other: 200 } },
    stops: [{ id: 'stop-tokyo', city: tokyo.city, country: tokyo.country, arrival: '2025-09-04', departure: '2025-09-14', image: tokyo.image, activities: [{ ...activities[1], day: 2, time: '11:00' }] }],
  },
  {
    id: 'trip-bali', name: 'Island time', description: 'A restorative long weekend with saltwater mornings.', startDate: '2024-11-10', endDate: '2024-11-16', cover: img('photo-1537996194471-e657df975ab4', 1200), status: 'completed', createdAt: '2024-07-09',
    budget: { total: 1850, categories: { Transport: 520, Accommodation: 620, Activities: 290, Meals: 310, Other: 110 } },
    stops: [{ id: 'stop-bali', city: 'Bali', country: 'Indonesia', arrival: '2024-11-10', departure: '2024-11-16', image: destinations[5].image, activities: [{ ...activities[5], day: 3, time: '07:00' }] }],
  },
];

export const initialProfile: UserProfile = { firstName: 'Aarav', lastName: 'Mehta', email: 'aarav@globetrotter.app', phone: '+91 98765 43210', city: 'Bengaluru', country: 'India', avatar: 'https://i.pravatar.cc/160?img=12', language: 'English (US)', savedDestinations: ['paris', 'bali'], privacy: 'friends' };

export const initialPosts: CommunityPost[] = [
  { id: 'post-1', user: 'Maya Chen', avatar: 'https://i.pravatar.cc/80?img=47', destination: 'Kyoto, Japan', tripName: 'The quiet side of Japan', body: 'The best travel days are the ones with room to get a little lost. Found this tiny tea house behind Gion and stayed for three hours.', image: img('photo-1493976040374-85c8e12f0c0e'), likes: 128, comments: 18, createdAt: '2h ago' },
  { id: 'post-2', user: 'Luca Rossi', avatar: 'https://i.pravatar.cc/80?img=68', destination: 'Amalfi Coast, Italy', tripName: 'Postcards from the coast', body: 'A slow afternoon in Ravello, lemon granita in hand. Saving this one for the days I need a little sunshine.', image: img('photo-1533105079780-92b9be482077'), likes: 94, comments: 11, createdAt: '1d ago' },
  { id: 'post-3', user: 'Sofia Williams', avatar: 'https://i.pravatar.cc/80?img=32', destination: 'Marrakech, Morocco', tripName: 'A color study', body: 'Every corner is a different shade of warm. Three days here was not nearly enough.', image: img('photo-1548013146-72479768bada'), likes: 76, comments: 9, createdAt: '3d ago' },
];

export const analytics = { monthlyTrips: [{ month: 'Jan', trips: 26 }, { month: 'Feb', trips: 34 }, { month: 'Mar', trips: 31 }, { month: 'Apr', trips: 48 }, { month: 'May', trips: 62 }, { month: 'Jun', trips: 74 }], popularCities: [{ name: 'Paris', value: 32 }, { name: 'Tokyo', value: 26 }, { name: 'Bali', value: 22 }, { name: 'Rome', value: 18 }, { name: 'Dubai', value: 15 }], engagement: [{ month: 'Jan', active: 820, newUsers: 180 }, { month: 'Feb', active: 920, newUsers: 220 }, { month: 'Mar', active: 1050, newUsers: 265 }, { month: 'Apr', active: 1190, newUsers: 310 }, { month: 'May', active: 1380, newUsers: 370 }, { month: 'Jun', active: 1560, newUsers: 420 }] };

export const adminUsers = [
  { name: 'Aarav Mehta', email: 'aarav@globetrotter.app', trips: 8, status: 'Active', joined: 'Jan 12, 2025' },
  { name: 'Maya Chen', email: 'maya@example.com', trips: 12, status: 'Active', joined: 'Dec 28, 2024' },
  { name: 'Luca Rossi', email: 'luca@example.com', trips: 5, status: 'Active', joined: 'Nov 18, 2024' },
  { name: 'Sofia Williams', email: 'sofia@example.com', trips: 3, status: 'Paused', joined: 'Oct 04, 2024' },
];
