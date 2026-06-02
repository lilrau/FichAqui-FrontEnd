'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadJson, saveJson } from '@/lib/storage';
import {
  findUserByCredentials,
  type AppUser,
  type UserRole,
} from '@/lib/seed/users';

const SESSION_KEY = 'event-app:session';

type SessionUser = Omit<AppUser, 'password'>;

interface AuthContextType {
  hydrated: boolean;
  user: SessionUser | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (
    email: string,
    password: string
  ) => { ok: true; user: SessionUser } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toSessionUser(user: AppUser): SessionUser {
  const { password, ...session } = user;
  void password;
  return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadJson<SessionUser | null>(SESSION_KEY, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(SESSION_KEY, user);
  }, [user, hydrated]);

  const hasRole = useCallback(
    (role: UserRole) => Boolean(user?.roles.includes(role)),
    [user]
  );

  const login = useCallback((email: string, password: string) => {
    const match = findUserByCredentials(email, password);
    if (!match) {
      return { ok: false as const, error: 'E-mail ou senha incorretos.' };
    }
    const session = toSessionUser(match);
    setUser(session);
    return { ok: true as const, user: session };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      user,
      isAuthenticated: Boolean(user),
      hasRole,
      login,
      logout,
    }),
    [hydrated, user, hasRole, login, logout]
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
