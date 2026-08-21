import { activities, destinations, initialPosts, initialProfile, initialTrips } from '../data/mockData';
import type { Activity, CommunityPost, Destination, Trip, UserProfile } from '../types';

const delay = <T,>(value: T, ms = 180) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), ms));

export const mockApi = {
  auth: {
    login: async (email: string) => delay({ email, firstName: email.split('@')[0] || 'Traveller' }),
    register: async (profile: Partial<UserProfile>) => delay({ email: profile.email ?? '', firstName: profile.firstName ?? 'Traveller' }),
  },
  trips: {
    list: async (): Promise<Trip[]> => delay(initialTrips),
    save: async (trips: Trip[]) => delay(trips),
  },
  destinations: {
    list: async (): Promise<Destination[]> => delay(destinations),
  },
  activities: {
    list: async (): Promise<Activity[]> => delay(activities),
  },
  profile: {
    get: async (): Promise<UserProfile> => delay(initialProfile),
    save: async (profile: UserProfile) => delay(profile),
  },
  community: {
    list: async (): Promise<CommunityPost[]> => delay(initialPosts),
  },
};
