/**
 * Auth context - login, logout, persist tokens (7-day session)
 * Matches backend auth flow; uses AsyncStorage for persistence
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthApi from '../api/auth';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}

const ACCESS_TOKEN_KEY = '@auth_access_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const USER_KEY = '@auth_user';
const SESSION_EXPIRES_AT_KEY = '@auth_session_expires_at';

const SESSION_DAYS = 7;

function getSessionExpiresAt(): number {
  return Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(async () => {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, SESSION_EXPIRES_AT_KEY]);
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;
      const res = await AuthApi.refreshToken(refreshToken);
      if (res.success && res.data?.accessToken) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const expiresAt = await AsyncStorage.getItem(SESSION_EXPIRES_AT_KEY);
      if (expiresAt && Date.now() > Number(expiresAt)) {
        await clearAuth();
        setLoading(false);
        return;
      }

      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!accessToken) {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const ok = await refreshAccessToken();
          if (ok) {
            const newToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
            if (newToken) {
              const me = await AuthApi.getMe(newToken);
              if (me.success && me.data?.user) {
                setUser(me.data.user);
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(me.data.user));
              } else await clearAuth();
            } else await clearAuth();
          } else await clearAuth();
        }
        setLoading(false);
        return;
      }

      const me = await AuthApi.getMe(accessToken);
      if (me.success && me.data?.user) {
        setUser(me.data.user);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(me.data.user));
      } else {
        const ok = await refreshAccessToken();
        if (ok) {
          const newToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
          if (newToken) {
            const retry = await AuthApi.getMe(newToken);
            if (retry.success && retry.data?.user) {
              setUser(retry.data.user);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(retry.data.user));
            } else await clearAuth();
          } else await clearAuth();
        } else await clearAuth();
      }
    } catch {
      await clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth, refreshAccessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await AuthApi.login(email, password);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Login failed');
      }
      const { user: u, accessToken, refreshToken } = res.data;
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
      await AsyncStorage.setItem(SESSION_EXPIRES_AT_KEY, String(getSessionExpiresAt()));
      setUser(u);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) await AuthApi.logout(token);
    } catch {
      // ignore
    } finally {
      await clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
