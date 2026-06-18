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
import {
  parseEventIdFromPath,
  readStoredActiveEventId,
  writeStoredActiveEventId,
} from '@/lib/event-routing';
import { useEventStore } from '@/lib/event-store';
import type { Event } from '@/lib/types/event-domain';

interface EventContextType {
  hydrated: boolean;
  activeEventId: string;
  activeEvent: Event | null;
  setActiveEventId: (id: string | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

function resolveActiveEventId(
  adminEventId: string | null,
  queryEventId: string | null,
  storedId: string | null,
  isEventValid: (id: string) => boolean,
  events: Event[]
): string {
  const candidates = [adminEventId, queryEventId, storedId];
  for (const id of candidates) {
    if (id && isEventValid(id)) return id;
  }
  const fallback =
    events.find((event) => event.status === 'active' || event.status === 'published') ??
    events[0];
  return fallback?.id ?? '';
}

export function EventProvider({ children }: { children: ReactNode }) {
  const {
    getEventById,
    hydrated: storeHydrated,
    ensureEventLoaded,
    isEventScopeLoaded,
    events,
  } = useEventStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const adminEventId = parseEventIdFromPath(pathname);
  const eventFromQuery = searchParams.get('event');

  const [activeEventId, setActiveEventIdState] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [scopeReady, setScopeReady] = useState(false);

  const isEventValid = useCallback(
    (id: string) => Boolean(getEventById(id)),
    [getEventById]
  );

  useEffect(() => {
    if (!storeHydrated) return;
    const resolved = resolveActiveEventId(
      adminEventId,
      eventFromQuery,
      readStoredActiveEventId(),
      isEventValid,
      events
    );
    setActiveEventIdState(resolved);
    writeStoredActiveEventId(resolved);
    setHydrated(true);
  }, [storeHydrated, adminEventId, eventFromQuery, isEventValid, events]);

  useEffect(() => {
    if (!storeHydrated || !hydrated) return;

    if (!activeEventId || !isEventValid(activeEventId)) {
      setScopeReady(true);
      return;
    }

    let cancelled = false;
    setScopeReady(false);

    ensureEventLoaded(activeEventId)
      .then(() => {
        if (!cancelled) setScopeReady(true);
      })
      .catch(() => {
        if (!cancelled) setScopeReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [storeHydrated, hydrated, activeEventId, ensureEventLoaded, isEventValid]);

  const setActiveEventId = useCallback(
    (id: string | null) => {
      const nextId = id && isEventValid(id) ? id : '';
      setActiveEventIdState(nextId);
      writeStoredActiveEventId(nextId || null);

      if (pathname?.startsWith('/admin/') && adminEventId) {
        const suffix = pathname.replace(/^\/admin\/[^/]+/, '') || '';
        router.push(`/admin/${nextId}${suffix}`);
      }
    },
    [isEventValid, pathname, adminEventId, router]
  );

  const activeEvent = useMemo(
    () => getEventById(activeEventId) ?? null,
    [activeEventId, getEventById]
  );

  const primaryColor = activeEvent?.primaryColor ?? '#d97706';

  const eventScopeReady =
    !activeEventId || !isEventValid(activeEventId) || isEventScopeLoaded(activeEventId);

  const value = useMemo(
    () => ({
      hydrated: hydrated && scopeReady && eventScopeReady,
      activeEventId,
      activeEvent,
      setActiveEventId,
    }),
    [hydrated, scopeReady, eventScopeReady, activeEventId, activeEvent, setActiveEventId]
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

export function useEventId(): string {
  const { activeEventId, hydrated } = useActiveEvent();
  const { hydrated: storeHydrated } = useEventStore();
  return storeHydrated && hydrated ? activeEventId : '';
}

export function useAppReady(): boolean {
  const { hydrated } = useActiveEvent();
  const { hydrated: storeHydrated } = useEventStore();
  return hydrated && storeHydrated;
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
