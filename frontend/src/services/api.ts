const API_BASE_URL = 'http://localhost:8000/api';

export interface TripApiData {
  id?: string;
  title: string;
  user_id?: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  stops?: any[];
  activities?: any[];
  is_public?: boolean;
}

export interface AIGenerateRequest {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}

export interface UserRegisterData {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  password: string;
  profile_photo?: string;
  additional_info?: string;
}

export const api = {
  async health(): Promise<{ status: string }> {
    try {
      const res = await fetch('http://localhost:8000/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async registerUser(data: UserRegisterData): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json();
  },

  async loginUser(credentials: { email: string; password: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Invalid email or password');
    }
    return await res.json();
  },

  async fetchUserProfile(email: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Profile fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchTrips(userId?: string): Promise<any[]> {
    try {
      const url = userId ? `${API_BASE_URL}/trips?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/trips`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch trips');
      return await res.json();
    } catch (err) {
      console.warn('API fetchTrips fallback triggered:', err);
      return [];
    }
  },

  async createTrip(data: TripApiData): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return await res.json();
  },

  async updateTrip(id: string, data: Partial<TripApiData>): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update trip');
    return await res.json();
  },

  async deleteTrip(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete trip');
    return await res.json();
  },

  async fetchTripBudget(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/trips/${id}/budget`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchDestinationCatalog(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/destinations`);
      if (!res.ok) throw new Error('Failed to fetch catalog');
      return await res.json();
    } catch {
      return [];
    }
  },

  async generateAIItinerary(data: AIGenerateRequest): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/ai/generate-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate AI itinerary');
    return await res.json();
  },

  async fetchCommunityPosts(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/community`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createCommunityPost(data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/community`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return await res.json();
  },

  async updateUserProfile(data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return await res.json();
  },

  async fetchAdminStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return await res.json();
    } catch {
      return { users: 0, trips: 0, posts: 0 };
    }
  },
};
