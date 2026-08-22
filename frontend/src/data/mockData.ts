import type { Activity, CommunityPost, Destination, Trip, UserProfile } from '../types';

export const destinations: Destination[] = [
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    description: 'Cafés, quiet gardens, and the warm evening light by the Seine.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85',
    popularity: 98,
    costIndex: 4,
    tags: ['Culture', 'Food', 'Romance']
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    description: 'A thousand tiny discoveries between glowing neon streets and peaceful wooden shrines.',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=85',
    popularity: 96,
    costIndex: 4,
    tags: ['Food', 'Nightlife', 'Culture']
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    description: 'Futuristic skylines, desert horizons, and world-class luxury experiences.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85',
    popularity: 91,
    costIndex: 5,
    tags: ['Luxury', 'Adventure', 'Shopping']
  },
  {
    id: 'london',
    city: 'London',
    country: 'UK',
    region: 'Europe',
    description: 'Big city energy, iconic historic landmarks, and vibrant local neighborhood markets.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85',
    popularity: 94,
    costIndex: 4,
    tags: ['Culture', 'History', 'Food']
  },
  {
    id: 'rome',
    city: 'Rome',
    country: 'Italy',
    region: 'Europe',
    description: 'Ancient monuments, leisurely trattoria lunches, and cobblestone alleys.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=85',
    popularity: 93,
    costIndex: 3,
    tags: ['History', 'Food', 'Art']
  },
  {
    id: 'bali',
    city: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    description: 'Emerald rice terraces, clifftop ocean temples, and peaceful tropical mornings.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85',
    popularity: 95,
    costIndex: 2,
    tags: ['Nature', 'Wellness', 'Adventure']
  },
  {
    id: 'santorini',
    city: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    description: 'White-washed hillside villages perched over the deep blue Aegean sea.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85',
    popularity: 97,
    costIndex: 4,
    tags: ['Beach', 'Romance', 'Views']
  },
  {
    id: 'kyoto',
    city: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    description: 'Torii gate pathways, bamboo groves, and ancient tea ceremony traditions.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85',
    popularity: 95,
    costIndex: 3,
    tags: ['Culture', 'History', 'Nature']
  },
  {
    id: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    description: 'A lush garden metropolis where world-class hawker food meets futuristic architecture.',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=85',
    popularity: 88,
    costIndex: 4,
    tags: ['Food', 'Nature', 'Design']
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'USA',
    region: 'North America',
    description: 'Find your rhythm in a magnetic metropolis with endless culture and energy.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=85',
    popularity: 97,
    costIndex: 5,
    tags: ['Food', 'Culture', 'Nightlife']
  },
  {
    id: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    description: 'Sun-drenched Mediterranean beaches, Gaudí architecture, and vibrant tapas bars.',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85',
    popularity: 92,
    costIndex: 3,
    tags: ['Beach', 'Art', 'Food']
  },
  {
    id: 'zurich',
    city: 'Zurich',
    country: 'Switzerland',
    region: 'Europe',
    description: 'Crystal-clear alpine lake waters, mountain views, and historic old town charm.',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=85',
    popularity: 86,
    costIndex: 5,
    tags: ['Nature', 'Slow travel', 'Adventure']
  }
];

export const activities: Activity[] = [
  {
    id: 'alps-flight',
    name: 'Swiss Alps Glacier Flight & Hike',
    city: 'Zurich',
    country: 'Switzerland',
    category: 'Adventure',
    duration: '5 hours',
    price: 185,
    description: 'Soar past snowy peaks and hike high-alpine glacier trails with panoramic mountain lake views.',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=85',
    rating: 5.0
  },
  {
    id: 'eiffel',
    name: 'Eiffel Tower Sunset Experience',
    city: 'Paris',
    country: 'France',
    category: 'Sightseeing',
    duration: '2 hours',
    price: 42,
    description: 'Watch Paris turn gold from the observation deck as twilight sparkles over the Seine.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=85',
    rating: 4.9
  },
  {
    id: 'sushi',
    name: 'Tsukiji Sushi Masterclass',
    city: 'Tokyo',
    country: 'Japan',
    category: 'Food',
    duration: '3 hours',
    price: 78,
    description: 'Learn authentic knife techniques and Edomae sushi crafting with a Tokyo master chef.',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=85',
    rating: 4.8
  },
  {
    id: 'desert',
    name: 'Red Dune Desert Safari & Sunset',
    city: 'Dubai',
    country: 'UAE',
    category: 'Adventure',
    duration: '6 hours',
    price: 95,
    description: 'Golden dunes, camel trekking, and a traditional Bedouin barbecue camp under the desert stars.',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=85',
    rating: 4.7
  },
  {
    id: 'colosseum',
    name: 'Colosseum & Roman Forum Night Tour',
    city: 'Rome',
    country: 'Italy',
    category: 'History' as Activity['category'],
    duration: '2.5 hours',
    price: 58,
    description: 'Explore underground gladiator chambers beneath illumination after public closing hours.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=85',
    rating: 4.9
  },
  {
    id: 'ceramics',
    name: 'Montjuïc Ceramic Artisan Workshop',
    city: 'Barcelona',
    country: 'Spain',
    category: 'Culture',
    duration: '2 hours',
    price: 54,
    description: 'Craft custom ceramic glazed souvenirs alongside a local Catalan studio artist.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=85',
    rating: 4.8
  },
  {
    id: 'nusa',
    name: 'Nusa Penida Coastal Catamaran Trip',
    city: 'Bali',
    country: 'Indonesia',
    category: 'Nature',
    duration: '9 hours',
    price: 64,
    description: 'Snorkel in turquoise coves with manta rays and visit Kelingking cliff viewpoints.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85',
    rating: 4.8
  },
  {
    id: 'borough',
    name: 'Borough Food Market Tasting Tour',
    city: 'London',
    country: 'UK',
    category: 'Food',
    duration: '2 hours',
    price: 38,
    description: 'Sample artisanal cheeses, fresh oysters, and famous pastries with a local foodie guide.',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=85',
    rating: 4.7
  },
  {
    id: 'gardens',
    name: 'Gardens by the Bay Supertree Light Show',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Nature',
    duration: '2 hours',
    price: 29,
    description: 'Experience the magical evening light and music show beneath giant illuminated futuristic trees.',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=85',
    rating: 4.8
  },
  {
    id: 'tea-ceremony',
    name: 'Traditional Kyoto Tea Ceremony',
    city: 'Kyoto',
    country: 'Japan',
    category: 'Culture',
    duration: '1.5 hours',
    price: 45,
    description: 'Participate in an authentic matcha preparation in a historic 150-year-old wooden machiya.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=85',
    rating: 4.9
  }
];

const paris = destinations[0];
const rome = destinations[4];
const tokyo = destinations[1];

export const initialTrips: Trip[] = [
  {
    id: 'trip-europe',
    name: 'The Slow European Summer',
    description: 'A week of art, long lunches, and wandering through three timeless cities.',
    startDate: '2025-06-12',
    endDate: '2025-06-23',
    cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85',
    status: 'upcoming',
    shared: true,
    createdAt: '2025-01-14',
    budget: { total: 3450, categories: { Transport: 680, Accommodation: 1320, Activities: 420, Meals: 780, Other: 160 } },
    stops: [
      {
        id: 'stop-paris',
        city: paris.city,
        country: paris.country,
        arrival: '2025-06-12',
        departure: '2025-06-16',
        image: paris.image,
        activities: [
          { ...activities[1], day: 1, time: '17:30' },
          { ...activities[5], day: 3, time: '10:00' },
        ]
      },
      {
        id: 'stop-rome',
        city: rome.city,
        country: rome.country,
        arrival: '2025-06-16',
        departure: '2025-06-23',
        image: rome.image,
        activities: [
          { ...activities[4], day: 5, time: '18:00' },
        ]
      },
    ],
  },
  {
    id: 'trip-japan',
    name: 'A First Taste of Japan',
    description: 'Neon nights, quiet temples, and everything delicious in between.',
    startDate: '2025-09-04',
    endDate: '2025-09-14',
    cover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
    status: 'upcoming',
    createdAt: '2025-02-01',
    budget: { total: 4100, categories: { Transport: 1250, Accommodation: 1450, Activities: 520, Meals: 680, Other: 200 } },
    stops: [
      {
        id: 'stop-tokyo',
        city: tokyo.city,
        country: tokyo.country,
        arrival: '2025-09-04',
        departure: '2025-09-14',
        image: tokyo.image,
        activities: [{ ...activities[2], day: 2, time: '11:00' }]
      }
    ],
  },
  {
    id: 'trip-bali',
    name: 'Island Time in Bali',
    description: 'A restorative long weekend with saltwater mornings and lush jungle views.',
    startDate: '2024-11-10',
    endDate: '2024-11-16',
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85',
    status: 'completed',
    createdAt: '2024-07-09',
    budget: { total: 1850, categories: { Transport: 520, Accommodation: 620, Activities: 290, Meals: 310, Other: 110 } },
    stops: [
      {
        id: 'stop-bali',
        city: 'Bali',
        country: 'Indonesia',
        arrival: '2024-11-10',
        departure: '2024-11-16',
        image: destinations[5].image,
        activities: [{ ...activities[6], day: 3, time: '07:00' }]
      }
    ],
  },
];

export const initialProfile: UserProfile = {
  firstName: 'Aarav',
  lastName: 'Mehta',
  email: 'aarav@globetrotter.app',
  phone: '+91 98765 43210',
  city: 'Bengaluru',
  country: 'India',
  avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
  language: 'English (US)',
  savedDestinations: ['paris', 'bali'],
  privacy: 'friends'
};

export const initialPosts: CommunityPost[] = [
  {
    id: 'post-1',
    user: 'Maya Chen',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    destination: 'Kyoto, Japan',
    tripName: 'The quiet side of Japan',
    body: 'The best travel days are the ones with room to get a little lost. Found this tiny tea house behind Gion and stayed for three hours.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=85',
    likes: 128,
    comments: 18,
    createdAt: '2h ago'
  },
  {
    id: 'post-2',
    user: 'Luca Rossi',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    destination: 'Amalfi Coast, Italy',
    tripName: 'Postcards from the coast',
    body: 'A slow afternoon in Ravello, lemon granita in hand. Saving this one for the days I need a little sunshine.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=85',
    likes: 94,
    comments: 11,
    createdAt: '1d ago'
  },
  {
    id: 'post-3',
    user: 'Sofia Williams',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    destination: 'Marrakech, Morocco',
    tripName: 'A color study',
    body: 'Every corner is a different shade of warm. Three days here was not nearly enough.',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=85',
    likes: 76,
    comments: 9,
    createdAt: '3d ago'
  },
];

export const analytics = {
  monthlyTrips: [
    { month: 'Jan', trips: 26 },
    { month: 'Feb', trips: 34 },
    { month: 'Mar', trips: 31 },
    { month: 'Apr', trips: 48 },
    { month: 'May', trips: 62 },
    { month: 'Jun', trips: 74 }
  ],
  popularCities: [
    { name: 'Paris', value: 32 },
    { name: 'Tokyo', value: 26 },
    { name: 'Bali', value: 22 },
    { name: 'Rome', value: 18 },
    { name: 'Dubai', value: 15 }
  ],
  engagement: [
    { month: 'Jan', active: 820, newUsers: 180 },
    { month: 'Feb', active: 920, newUsers: 220 },
    { month: 'Mar', active: 1050, newUsers: 265 },
    { month: 'Apr', active: 1190, newUsers: 310 },
    { month: 'May', active: 1380, newUsers: 370 },
    { month: 'Jun', active: 1560, newUsers: 420 }
  ]
};

export const adminUsers = [
  { name: 'Aarav Mehta', email: 'aarav@globetrotter.app', trips: 8, status: 'Active', joined: 'Jan 12, 2025' },
  { name: 'Maya Chen', email: 'maya@example.com', trips: 12, status: 'Active', joined: 'Dec 28, 2024' },
  { name: 'Luca Rossi', email: 'luca@example.com', trips: 5, status: 'Active', joined: 'Nov 18, 2024' },
  { name: 'Sofia Williams', email: 'sofia@example.com', trips: 3, status: 'Paused', joined: 'Oct 04, 2024' },
];
