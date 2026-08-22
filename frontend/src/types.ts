export type TripStatus = 'upcoming' | 'ongoing' | 'completed';
export type ActivityCategory = 'Sightseeing' | 'Food' | 'Adventure' | 'Culture' | 'Shopping' | 'Nature' | 'Nightlife' | 'History' | 'Wellness';
export type BudgetCategory = 'Transport' | 'Accommodation' | 'Activities' | 'Meals' | 'Other';

export interface Destination {
  id: string;
  city: string;
  country: string;
  region: string;
  description: string;
  image: string;
  popularity: number;
  costIndex: number;
  tags: string[];
}

export interface Activity {
  id: string;
  name: string;
  city: string;
  country: string;
  category: ActivityCategory;
  duration: string;
  price: number;
  description: string;
  image: string;
  rating: number;
}

export interface ItineraryActivity extends Activity {
  day: number;
  time: string;
}

export interface Stop {
  id: string;
  city: string;
  country: string;
  arrival: string;
  departure: string;
  image: string;
  activities: ItineraryActivity[];
}

export interface Budget {
  total: number;
  categories: Record<BudgetCategory, number>;
}

export interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  cover: string;
  status: TripStatus;
  budget: Budget;
  stops: Stop[];
  sections?: ItinerarySection[];
  createdAt: string;
  shared?: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  avatar: string;
  language: string;
  savedDestinations: string[];
  privacy: 'public' | 'friends' | 'private';
}

export interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  destination: string;
  tripName: string;
  body: string;
  image: string;
  likes: number;
  comments: number;
  liked?: boolean;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'error';
}
