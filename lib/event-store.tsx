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
import {
  type Event,
  type MenuProduct,
  type Stall,
  seedEvents,
  seedMenuProducts,
  seedStalls,
} from '@/lib/mock-data';

const EVENTS_KEY = 'event-app:events';
const STALLS_KEY = 'event-app:stalls';
const PRODUCTS_KEY = 'event-app:products';

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export type CreateEventInput = Omit<Event, 'id'> & { id?: string };

interface EventStoreContextType {
  events: Event[];
  stalls: Stall[];
  menuProducts: MenuProduct[];
  getEventById: (id: string) => Event | undefined;
  getStallsByEventId: (eventId: string) => Stall[];
  getMenuProductsByEventId: (eventId: string) => MenuProduct[];
  createEvent: (input: CreateEventInput) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  addStall: (eventId: string, stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }) => Stall;
  updateStall: (stallId: string, patch: Partial<Stall>) => void;
  deleteStall: (stallId: string) => void;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [stalls, setStalls] = useState<Stall[]>(seedStalls);
  const [menuProducts, setMenuProducts] = useState<MenuProduct[]>(seedMenuProducts);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEvents(loadJson(EVENTS_KEY, seedEvents));
    setStalls(loadJson(STALLS_KEY, seedStalls));
    setMenuProducts(loadJson(PRODUCTS_KEY, seedMenuProducts));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(EVENTS_KEY, events);
  }, [events, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STALLS_KEY, stalls);
  }, [stalls, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(PRODUCTS_KEY, menuProducts);
  }, [menuProducts, hydrated]);

  const getEventById = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const getStallsByEventId = useCallback(
    (eventId: string) => stalls.filter((s) => s.eventId === eventId),
    [stalls]
  );

  const getMenuProductsByEventId = useCallback(
    (eventId: string) => menuProducts.filter((p) => p.eventId === eventId),
    [menuProducts]
  );

  const createEvent = useCallback((input: CreateEventInput) => {
    const id = input.id ?? `event-${Date.now()}`;
    const event: Event = { ...input, id } as Event;
    setEvents((prev) => [...prev, event]);
    return event;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const addStall = useCallback(
    (
      eventId: string,
      stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }
    ): Stall => {
      const newStall: Stall = {
        id: stall.id ?? `stall-${Date.now()}`,
        eventId,
        name: stall.name,
        category: stall.category,
        responsible: stall.responsible,
        color: stall.color,
        status: stall.status,
        stock: stall.stock,
      };
      setStalls((prev) => [...prev, newStall]);
      return newStall;
    },
    []
  );

  const updateStall = useCallback((stallId: string, patch: Partial<Stall>) => {
    setStalls((prev) =>
      prev.map((s) => (s.id === stallId ? { ...s, ...patch } : s))
    );
  }, []);

  const deleteStall = useCallback((stallId: string) => {
    setStalls((prev) => prev.filter((s) => s.id !== stallId));
  }, []);

  const value = useMemo(
    () => ({
      events,
      stalls,
      menuProducts,
      getEventById,
      getStallsByEventId,
      getMenuProductsByEventId,
      createEvent,
      updateEvent,
      addStall,
      updateStall,
      deleteStall,
    }),
    [
      events,
      stalls,
      menuProducts,
      getEventById,
      getStallsByEventId,
      getMenuProductsByEventId,
      createEvent,
      updateEvent,
      addStall,
      updateStall,
      deleteStall,
    ]
  );

  return (
    <EventStoreContext.Provider value={value}>{children}</EventStoreContext.Provider>
  );
}

export function useEventStore() {
  const ctx = useContext(EventStoreContext);
  if (!ctx) {
    throw new Error('useEventStore must be used within EventStoreProvider');
  }
  return ctx;
}
