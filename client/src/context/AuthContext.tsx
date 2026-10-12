import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { api, setToken, clearToken, getToken } from '../api/client';
import type { User } from '../lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  /** True while the initial session restore (GET /auth/me) is in flight */
  loading: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'owner' | 'investor') => Promise<void>;
  logout:   () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // starts true until /me resolves

  // On mount, restore session using the stored token.
  // If the token is missing, expired, or the user was deleted, we silently
  // clear it and let the user land on the public page.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())  // bad token — clear silently
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: User }>(
      '/api/auth/login',
      { email, password },
      { auth: false } // no token to attach yet
    );
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: 'owner' | 'investor') => {
      const { token, user } = await api.post<{ token: string; user: User }>(
        '/api/auth/register',
        { name, email, password, role },
        { auth: false }
      );
      setToken(token);
      setUser(user);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
