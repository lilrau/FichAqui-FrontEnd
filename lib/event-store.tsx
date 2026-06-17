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
  buildCardapioForEvent,
  buildMenuItemsFromOfferings,
} from '@/lib/catalog/menu-catalog';
import { seedCatalogProducts } from '@/lib/seed/global-catalog';
import {
  createDefaultOfferingForEvent,
  createDefaultStallsForEvent,
  seedEvents,
  seedOfferings,
  seedOrders,
  seedStalls,
} from '@/lib/seed';
import {
  migrateEvents,
  migrateOfferings,
  migrateOrders,
  migrateStalls,
} from '@/lib/seed/migrate-store';
import { loadJson, saveJson } from '@/lib/storage';
import type {
  CardapioProduct,
  CatalogProduct,
  Event,
  MenuItem,
  MenuProduct,
  Offering,
  Order,
  Stall,
} from '@/lib/types/event-domain';

const EVENTS_KEY = 'event-app:events';
const STALLS_KEY = 'event-app:stalls';
const OFFERINGS_KEY = 'event-app:offerings';
const LEGACY_PRODUCTS_KEY = 'event-app:products';
const ORDERS_KEY = 'event-app:orders';

export type CreateEventInput = Omit<Event, 'id'> & { id?: string };

interface EventStoreContextType {
  hydrated: boolean;
  events: Event[];
  stalls: Stall[];
  catalogProducts: CatalogProduct[];
  offerings: Offering[];
  orders: Order[];
  getEventById: (id: string) => Event | undefined;
  getStallsByEventId: (eventId: string) => Stall[];
  getOfferingsByEventId: (eventId: string) => Offering[];
  getOfferingsByStallId: (stallId: string) => Offering[];
  getCardapioByEventId: (eventId: string) => CardapioProduct[];
  getMenuItemsByEventId: (eventId: string) => MenuItem[];
  getOrdersByEventId: (eventId: string) => Order[];
  getPublicEvents: () => Event[];
  getEventsByCityId: (cityId: string, options?: { publicOnly?: boolean }) => Event[];
  getEventsByOrganizerId: (organizerId: string) => Event[];
  createEvent: (input: CreateEventInput) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  addStall: (eventId: string, stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }) => Stall;
  updateStall: (stallId: string, patch: Partial<Stall>) => void;
  deleteStall: (stallId: string) => void;
  addOffering: (offering: Offering) => Offering;
  updateOffering: (offeringId: string, patch: Partial<Offering>) => void;
  deleteOffering: (offeringId: string) => void;
  addOrder: (order: Order) => Order;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [stalls, setStalls] = useState<Stall[]>(seedStalls);
  const [offerings, setOfferings] = useState<Offering[]>(seedOfferings);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEvents(migrateEvents(loadJson<Event[] | null>(EVENTS_KEY, null)));
    setStalls(migrateStalls(loadJson<Stall[] | null>(STALLS_KEY, null)));

    const storedOfferings = loadJson<Offering[] | MenuProduct[] | null>(OFFERINGS_KEY, null);
    const legacyProducts = loadJson<MenuProduct[] | null>(LEGACY_PRODUCTS_KEY, null);
    setOfferings(migrateOfferings(storedOfferings ?? legacyProducts));

    setOrders(migrateOrders(loadJson<Order[] | null>(ORDERS_KEY, null)));
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
    saveJson(OFFERINGS_KEY, offerings);
  }, [offerings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(ORDERS_KEY, orders);
  }, [orders, hydrated]);

  const getEventById = useCallback(
    (id: string) => events.find((event) => event.id === id),
    [events]
  );

  const getStallsByEventId = useCallback(
    (eventId: string) => stalls.filter((stall) => stall.eventId === eventId),
    [stalls]
  );

  const getOfferingsByEventId = useCallback(
    (eventId: string) => offerings.filter((offering) => offering.eventId === eventId),
    [offerings]
  );

  const getOfferingsByStallId = useCallback(
    (stallId: string) => offerings.filter((offering) => offering.stallId === stallId),
    [offerings]
  );

  const getCardapioByEventId = useCallback(
    (eventId: string) =>
      buildCardapioForEvent(seedCatalogProducts, offerings, stalls, eventId),
    [offerings, stalls]
  );

  const getMenuItemsByEventId = useCallback(
    (eventId: string) => {
      const eventOfferings = offerings.filter((offering) => offering.eventId === eventId);
      const eventStalls = stalls.filter((stall) => stall.eventId === eventId);
      return buildMenuItemsFromOfferings(seedCatalogProducts, eventOfferings, eventStalls);
    },
    [offerings, stalls]
  );

  const getOrdersByEventId = useCallback(
    (eventId: string) =>
      orders
        .filter((order) => order.eventId === eventId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [orders]
  );

  const getPublicEvents = useCallback(() => {
    return events.filter((event) => event.status === 'active' || event.status === 'published');
  }, [events]);

  const getEventsByCityId = useCallback(
    (cityId: string, options?: { publicOnly?: boolean }) => {
      const list = events.filter((event) => event.cityId === cityId);
      if (!options?.publicOnly) return list;
      return list.filter((event) => event.status === 'active' || event.status === 'published');
    },
    [events]
  );

  const getEventsByOrganizerId = useCallback(
    (organizerId: string) => events.filter((event) => event.organizerId === organizerId),
    [events]
  );

  const createEvent = useCallback((input: CreateEventInput) => {
    const id = input.id ?? `event-${Date.now()}`;
    const event: Event = {
      icon: '🎪',
      ...input,
      id,
    } as Event;

    const defaultStalls = createDefaultStallsForEvent(id);
    const defaultOffering = createDefaultOfferingForEvent(id, defaultStalls[0].id);

    setEvents((prev) => [...prev, event]);
    setStalls((prev) => [...prev, ...defaultStalls]);
    setOfferings((prev) => [...prev, defaultOffering]);
    return event;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Event>) => {
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, ...patch } : event)));
  }, []);

  const addStall = useCallback(
    (eventId: string, stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }): Stall => {
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
      prev.map((stall) => (stall.id === stallId ? { ...stall, ...patch } : stall))
    );
  }, []);

  const deleteStall = useCallback((stallId: string) => {
    setStalls((prev) => prev.filter((stall) => stall.id !== stallId));
    setOfferings((prev) => prev.filter((offering) => offering.stallId !== stallId));
  }, []);

  const addOffering = useCallback((offering: Offering) => {
    setOfferings((prev) => [...prev, offering]);
    return offering;
  }, []);

  const updateOffering = useCallback((offeringId: string, patch: Partial<Offering>) => {
    setOfferings((prev) =>
      prev.map((offering) =>
        offering.id === offeringId ? { ...offering, ...patch } : offering
      )
    );
  }, []);

  const deleteOffering = useCallback((offeringId: string) => {
    setOfferings((prev) => prev.filter((offering) => offering.id !== offeringId));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      events,
      stalls,
      catalogProducts: seedCatalogProducts,
      offerings,
      orders,
      getEventById,
      getStallsByEventId,
      getOfferingsByEventId,
      getOfferingsByStallId,
      getCardapioByEventId,
      getMenuItemsByEventId,
      getOrdersByEventId,
      getPublicEvents,
      getEventsByCityId,
      getEventsByOrganizerId,
      createEvent,
      updateEvent,
      addStall,
      updateStall,
      deleteStall,
      addOffering,
      updateOffering,
      deleteOffering,
      addOrder,
    }),
    [
      hydrated,
      events,
      stalls,
      offerings,
      orders,
      getEventById,
      getStallsByEventId,
      getOfferingsByEventId,
      getOfferingsByStallId,
      getCardapioByEventId,
      getMenuItemsByEventId,
      getOrdersByEventId,
      getPublicEvents,
      getEventsByCityId,
      getEventsByOrganizerId,
      createEvent,
      updateEvent,
      addStall,
      updateStall,
      deleteStall,
      addOffering,
      updateOffering,
      deleteOffering,
      addOrder,
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
