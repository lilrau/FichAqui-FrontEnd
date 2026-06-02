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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Event } from '@/lib/mock-data';
import { useEventStore } from '@/lib/event-store';

const ACTIVE_EVENT_KEY = 'event-app:active-event';

interface EventContextType {
  activeEventId: string | null;
  activeEvent: Event | null;
  setActiveEventId: (id: string | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

function readStoredActiveEventId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_EVENT_KEY);
  } catch {
    return null;
  }
}

function writeStoredActiveEventId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (id) localStorage.setItem(ACTIVE_EVENT_KEY, id);
    else localStorage.removeItem(ACTIVE_EVENT_KEY);
  } catch {
    // ignore
  }
}

export function EventProvider({ children }: { children: ReactNode }) {
  const { getEventById } = useEventStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const eventFromQuery = searchParams.get('event');
  const adminEventMatch = pathname?.match(/^\/admin\/([^/]+)/);
  const adminEventId =
    adminEventMatch &&
    adminEventMatch[1] !== 'novo' &&
    adminEventMatch[1] !== 'config'
      ? adminEventMatch[1]
      : null;

  const [activeEventId, setActiveEventIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromUrl = adminEventId ?? eventFromQuery ?? readStoredActiveEventId();
    if (fromUrl && getEventById(fromUrl)) {
      setActiveEventIdState(fromUrl);
    } else if (!fromUrl) {
      setActiveEventIdState('1');
    }
    setHydrated(true);
  }, [adminEventId, eventFromQuery, getEventById]);

  useEffect(() => {
    if (!hydrated) return;
    if (adminEventId && getEventById(adminEventId)) {
      setActiveEventIdState(adminEventId);
      writeStoredActiveEventId(adminEventId);
    }
  }, [adminEventId, getEventById, hydrated]);

  useEffect(() => {
    if (!hydrated || adminEventId) return;
    if (eventFromQuery && getEventById(eventFromQuery)) {
      setActiveEventIdState(eventFromQuery);
      writeStoredActiveEventId(eventFromQuery);
    }
  }, [eventFromQuery, adminEventId, getEventById, hydrated]);

  const setActiveEventId = useCallback(
    (id: string | null) => {
      if (id && !getEventById(id)) return;
      setActiveEventIdState(id);
      writeStoredActiveEventId(id);
      if (id && pathname?.startsWith('/admin/') && adminEventId) {
        const suffix = pathname.replace(/^\/admin\/[^/]+/, '') || '';
        router.push(`/admin/${id}${suffix}`);
      }
    },
    [getEventById, pathname, adminEventId, router]
  );

  const activeEvent = useMemo(
    () => (activeEventId ? getEventById(activeEventId) ?? null : null),
    [activeEventId, getEventById]
  );

  const primaryColor = activeEvent?.primaryColor ?? '#d97706';

  const value = useMemo(
    () => ({ activeEventId, activeEvent, setActiveEventId }),
    [activeEventId, activeEvent, setActiveEventId]
  );

  return (
    <EventContext.Provider value={value}>
      <div style={{ ['--event-primary' as string]: primaryColor }}>{children}</div>
    </EventContext.Provider>
  );
}

export function useActiveEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useActiveEvent must be used within EventProvider');
  }
  return ctx;
}

export function useRequireEvent() {
  const { activeEvent, activeEventId } = useActiveEvent();
  const router = useRouter();

  useEffect(() => {
    if (!activeEventId) {
      router.replace('/');
    }
  }, [activeEventId, router]);

  return activeEvent;
}
