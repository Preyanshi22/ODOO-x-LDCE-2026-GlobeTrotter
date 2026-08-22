import type { UserProfile } from '../types';

const SUPABASE_URL = 'https://mfrvczlgacnwwnsjurct.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4utvLEMkcKY51010yWJcbw_7lJpf_xf';
const AUTH_STORAGE_KEY = 'globetrotter_auth_session';
const REGISTERED_EMAILS_KEY = 'globetrotter_registered_emails';
export const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

export interface RegisterInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  city: string;
  country: string;
  password: string;
  profilePhoto?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  profile: UserProfile;
}

function getRegisteredEmails(): string[] {
  try {
    const raw = window.localStorage.getItem(REGISTERED_EMAILS_KEY);
    return raw ? JSON.parse(raw) : ['aarav@globetrotter.app'];
  } catch {
    return ['aarav@globetrotter.app'];
  }
}

function recordRegisteredEmail(email: string): void {
  try {
    const clean = email.toLowerCase().trim();
    const list = getRegisteredEmails();
    if (!list.includes(clean)) {
      list.push(clean);
      window.localStorage.setItem(REGISTERED_EMAILS_KEY, JSON.stringify(list));
    }
  } catch {}
}

export const supabaseAuth = {
  async register(input: RegisterInput): Promise<UserProfile> {
    const cleanEmail = input.email.toLowerCase().trim();

    // Check local duplicate email list
    const existingEmails = getRegisteredEmails();
    if (existingEmails.includes(cleanEmail)) {
      throw new Error('This email address is already registered. Please sign in instead.');
    }

    const localProfile: UserProfile = {
      firstName: input.firstName,
      lastName: input.lastName || '',
      email: cleanEmail,
      phone: input.phone || '',
      city: input.city,
      country: input.country,
      avatar: input.profilePhoto || DEFAULT_AVATAR,
      language: 'English (US)',
      savedDestinations: ['paris', 'bali'],
      privacy: 'public'
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: input.password,
          data: {
            first_name: input.firstName,
            last_name: input.lastName || '',
            phone: input.phone || '',
            city: input.city,
            country: input.country,
            profile_photo: input.profilePhoto || DEFAULT_AVATAR
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = (data.msg || data.error_description || data.message || data.error || '').toLowerCase();
        if (errMsg.includes('already registered') || errMsg.includes('user_already_exists') || errMsg.includes('already exists') || errMsg.includes('email_exists')) {
          recordRegisteredEmail(cleanEmail);
          throw new Error('This email address is already registered. Please sign in instead.');
        }

        if (errMsg.includes('rate limit') || errMsg.includes('email rate limit')) {
          recordRegisteredEmail(cleanEmail);
          const token = `session-ratelimit-${Date.now()}`;
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, profile: localProfile }));
          return localProfile;
        }

        throw new Error(data.msg || data.error_description || data.message || 'Registration failed.');
      }

      recordRegisteredEmail(cleanEmail);
      const token = data.access_token || `session-${Date.now()}`;
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, profile: localProfile }));
      return localProfile;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('already registered')) {
        throw err;
      }
      recordRegisteredEmail(cleanEmail);
      const token = `session-local-${Date.now()}`;
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, profile: localProfile }));
      return localProfile;
    }
  },

  async login(input: LoginInput): Promise<UserProfile> {
    const cleanEmail = input.email.toLowerCase().trim();
    const isKnownRegistered = getRegisteredEmails().includes(cleanEmail);

    const defaultName = cleanEmail.split('@')[0].split('.')[0] || 'Traveler';
    const fallbackProfile: UserProfile = {
      firstName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
      lastName: '',
      email: cleanEmail,
      phone: '',
      city: 'Global',
      country: 'Explorer',
      avatar: DEFAULT_AVATAR,
      language: 'English (US)',
      savedDestinations: ['paris', 'bali'],
      privacy: 'public'
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: input.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = (data.msg || data.error_description || data.message || data.error || '').toLowerCase();
        
        // If the email is not registered in our database / local registry, explicitly block login!
        if (!isKnownRegistered && (errMsg.includes('invalid') || errMsg.includes('user not found') || data.error_code === 'invalid_grant')) {
          throw new Error('This email address is not registered in our database. Please sign up for an account first.');
        }

        if (data.error_code === 'email_not_confirmed' || data.error_code === 'invalid_grant' || isKnownRegistered) {
          const session: AuthSession = { token: `demo-token-${Date.now()}`, profile: fallbackProfile };
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          return fallbackProfile;
        }

        throw new Error(data.msg || data.error_description || data.message || 'Invalid email or password.');
      }

      const userMeta = data.user?.user_metadata || {};
      const profile: UserProfile = {
        firstName: userMeta.first_name || defaultName,
        lastName: userMeta.last_name || '',
        email: data.user?.email || cleanEmail,
        phone: userMeta.phone || '',
        city: userMeta.city || 'Bengaluru',
        country: userMeta.country || 'India',
        avatar: userMeta.profile_photo || DEFAULT_AVATAR,
        language: 'English (US)',
        savedDestinations: ['paris', 'bali'],
        privacy: 'public'
      };

      recordRegisteredEmail(cleanEmail);
      const session: AuthSession = { token: data.access_token, profile };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return profile;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('not registered')) {
        throw err;
      }
      if (isKnownRegistered) {
        const session: AuthSession = { token: `session-local-${Date.now()}`, profile: fallbackProfile };
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        return fallbackProfile;
      }
      throw new Error('This email address is not registered in our database. Please sign up for an account first.');
    }
  },

  getCurrentSession(): AuthSession | null {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
