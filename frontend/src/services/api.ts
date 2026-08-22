const API_BASE_URL = '/api';

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

export const api = {
  async health(): Promise<{ status: string }> {
    try {
      const res = await fetch('/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async registerUser(data: { name: string; email: string; password: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Registration failed');
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
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Invalid email or password');
    }
    return await res.json();
  },

  async fetchTrips(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/trips`);
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
  }
};
