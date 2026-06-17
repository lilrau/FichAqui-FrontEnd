'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { loginApi, logoutApi, meApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/errors';
import { getAuthToken } from '@/lib/api/token';
import type { SessionUser, UserRole } from '@/lib/types/user';

interface AuthContextType {
  hydrated: boolean;
  user: SessionUser | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setHydrated(true);
        return;
      }

      try {
        const profile = await meApi();
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => Boolean(user?.roles.includes(role)),
    [user]
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      const session = await loginApi(email, password);
      setUser(session);
      return { ok: true as const, user: session };
    } catch (error) {
      return { ok: false as const, error: getErrorMessage(error, 'E-mail ou senha incorretos.') };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Token already cleared on 401 or still remove locally.
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await meApi();
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      user,
      isAuthenticated: Boolean(user),
      hasRole,
      login,
      logout,
      refreshUser,
    }),
    [hydrated, user, hasRole, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export type { SessionUser, UserRole };
