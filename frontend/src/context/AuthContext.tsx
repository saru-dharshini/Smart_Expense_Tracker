import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api, { setAuthToken } from '../api/client';
import type { AuthResponse, Settings } from '../types';

interface AuthState {
  token: string;
  userId: string;
  email: string;
  fullName: string;
}

interface AuthContextValue {
  user?: AuthState;
  settings?: Settings;
  currency: string;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'paypulse_auth_state';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthState | undefined>(undefined);
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const [initializing, setInitializing] = useState(true);

  const persistUser = useCallback((auth?: AuthState) => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    if (!user?.token) {
      setSettings(undefined);
      return;
    }
    try {
      const { data } = await api.get<Settings>('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings', error);
      setSettings(undefined);
    }
  }, [user?.token]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: AuthState = JSON.parse(stored);
        setUser(parsed);
        setAuthToken(parsed.token);
      } catch (err) {
        console.warn('Failed to parse stored auth state', err);
        persistUser(undefined);
      }
    }
    setInitializing(false);
  }, [persistUser]);

  useEffect(() => {
    if (user?.token) {
      setAuthToken(user.token);
      loadSettings();
    } else {
      setAuthToken(undefined);
      setSettings(undefined);
    }
  }, [user?.token, loadSettings]);

  const handleAuthSuccess = useCallback(
    (response: AuthResponse) => {
      const authState: AuthState = {
        token: response.token,
        userId: response.userId,
        email: response.email,
        fullName: response.fullName,
      };
      setAuthToken(response.token);
      setUser(authState);
      persistUser(authState);
    },
    [persistUser]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthResponse>('/auth/signin', {
        email,
        password,
      });
      handleAuthSuccess(data);
    },
    [handleAuthSuccess]
  );

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data } = await api.post<AuthResponse>('/auth/signup', {
        fullName,
        email,
        password,
      });
      handleAuthSuccess(data);
    },
    [handleAuthSuccess]
  );

  const signOut = useCallback(() => {
    setUser(undefined);
    setSettings(undefined);
    persistUser(undefined);
    setAuthToken(undefined);
  }, [persistUser]);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  const currency = useMemo(() => settings?.baseCurrency ?? 'INR', [settings]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      settings,
      currency,
      initializing,
      signIn,
      signUp,
      signOut,
      refreshSettings,
    }),
    [currency, initializing, refreshSettings, settings, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

