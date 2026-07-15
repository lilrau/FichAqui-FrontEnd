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
import { useAuth } from '@/lib/auth-context';
import { fetchCatalog } from '@/lib/api/catalog';
import { createEventApi, fetchEvents, updateEventApi } from '@/lib/api/events';
import {
  fetchOfferings,
  replaceStallOfferingsApi,
  toUpsertOfferingPayload,
} from '@/lib/api/offerings';
import { createStallApi, fetchStalls, updateStallApi } from '@/lib/api/stalls';
import { ApiError, getErrorMessage } from '@/lib/api/errors';
import {
  buildCardapioForEvent,
  buildMenuItemsFromOfferings,
} from '@/lib/catalog/menu-catalog';
import type {
  CardapioProduct,
  CatalogProduct,
  Category,
  Event,
  MenuItem,
  Offering,
  Stall,
} from '@/lib/types/event-domain';

export type CreateEventInput = Omit<Event, 'id'> & { id?: string };

interface EventStoreContextType {
  hydrated: boolean;
  loadError: string | null;
  categories: Category[];
  events: Event[];
  stalls: Stall[];
  catalogProducts: CatalogProduct[];
  offerings: Offering[];
  isEventScopeLoaded: (eventId: string) => boolean;
  ensureEventLoaded: (eventId: string) => Promise<void>;
  refreshEventScope: (eventId: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getStallsByEventId: (eventId: string) => Stall[];
  getOfferingsByEventId: (eventId: string) => Offering[];
  getOfferingsByStallId: (stallId: string) => Offering[];
  getCardapioByEventId: (eventId: string) => CardapioProduct[];
  getMenuItemsByEventId: (eventId: string) => MenuItem[];
  getPublicEvents: () => Event[];
  getEventsByCityId: (cityId: string, options?: { publicOnly?: boolean }) => Event[];
  getEventsByOrganizerId: (organizerId: string) => Event[];
  createEvent: (input: CreateEventInput) => Promise<Event>;
  updateEvent: (id: string, patch: Partial<Event>) => Promise<void>;
  replaceEvent: (event: Event) => void;
  addStall: (
    eventId: string,
    stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }
  ) => Promise<Stall>;
  updateStall: (stallId: string, patch: Partial<Stall>) => Promise<void>;
  deleteStall: (stallId: string) => void;
  saveStallOfferings: (stallId: string, offerings: Offering[]) => Promise<Offering[]>;
  addOffering: (offering: Offering) => Promise<Offering>;
  updateOffering: (offeringId: string, patch: Partial<Offering>) => Promise<void>;
  deleteOffering: (offeringId: string) => Promise<void>;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const { hydrated: authHydrated, user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedEventIds, setLoadedEventIds] = useState<Set<string>>(() => new Set());

  const loadedEventIdsRef = useRef<Set<string>>(new Set());
  const loadingEventIdsRef = useRef<Set<string>>(new Set());

  const refreshEvents = useCallback(async () => {
    const list = await fetchEvents(
      user?.organizerId ? { organizerId: user.organizerId } : { publicOnly: true }
    );
    setEvents(list);
  }, [user?.organizerId]);

  useEffect(() => {
    if (!authHydrated) return;

    let cancelled = false;

    (async () => {
      try {
        const [catalog, eventList] = await Promise.all([
          fetchCatalog(),
          fetchEvents(
            user?.organizerId ? { organizerId: user.organizerId } : { publicOnly: true }
          ),
        ]);
        if (cancelled) return;
        setCategories(catalog.categories);
        setCatalogProducts(catalog.catalogProducts);
        setEvents(eventList);
        setLoadError(null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, 'Não foi possível carregar os dados.'));
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, user?.id, user?.organizerId]);

  const markEventLoaded = useCallback((eventId: string) => {
    loadedEventIdsRef.current.add(eventId);
    setLoadedEventIds(new Set(loadedEventIdsRef.current));
  }, []);

  const ensureEventLoaded = useCallback(
    async (eventId: string) => {
      if (!eventId) return;
      if (loadedEventIdsRef.current.has(eventId)) return;
      if (loadingEventIdsRef.current.has(eventId)) return;

      loadingEventIdsRef.current.add(eventId);
      try {
        const [stallsData, offeringsData] = await Promise.all([
          fetchStalls(eventId),
          fetchOfferings(eventId),
        ]);
        setStalls((prev) => [...prev.filter((stall) => stall.eventId !== eventId), ...stallsData]);
        setOfferings((prev) => [
          ...prev.filter((offering) => offering.eventId !== eventId),
          ...offeringsData,
        ]);
        markEventLoaded(eventId);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setStalls((prev) => prev.filter((stall) => stall.eventId !== eventId));
          setOfferings((prev) => prev.filter((offering) => offering.eventId !== eventId));
          markEventLoaded(eventId);
          return;
        }
        throw error;
      } finally {
        loadingEventIdsRef.current.delete(eventId);
      }
    },
    [markEventLoaded]
  );

  const refreshEventScope = useCallback(async (eventId: string) => {
    if (!eventId) return;

    const [stallsData, offeringsData] = await Promise.all([
      fetchStalls(eventId),
      fetchOfferings(eventId),
    ]);
    setStalls((prev) => [...prev.filter((stall) => stall.eventId !== eventId), ...stallsData]);
    setOfferings((prev) => [
      ...prev.filter((offering) => offering.eventId !== eventId),
      ...offeringsData,
    ]);
    markEventLoaded(eventId);
  }, [markEventLoaded]);

  const isEventScopeLoaded = useCallback(
    (eventId: string) => loadedEventIds.has(eventId),
    [loadedEventIds]
  );

  const replaceStallOfferings = useCallback(
    async (stallId: string, nextStallOfferings: Offering[]): Promise<Offering[]> => {
      const stall = stalls.find((entry) => entry.id === stallId);
      if (!stall) return [];

      const updated = await replaceStallOfferingsApi(
        stall.eventId,
        stallId,
        nextStallOfferings.map(toUpsertOfferingPayload)
      );
      setOfferings((prev) => [
        ...prev.filter((offering) => offering.stallId !== stallId),
        ...updated,
      ]);
      return updated;
    },
    [stalls]
  );

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
      buildCardapioForEvent(catalogProducts, offerings, stalls, eventId),
    [catalogProducts, offerings, stalls]
  );

  const getMenuItemsByEventId = useCallback(
    (eventId: string) => {
      const eventOfferings = offerings.filter((offering) => offering.eventId === eventId);
      const eventStalls = stalls.filter((stall) => stall.eventId === eventId);
      return buildMenuItemsFromOfferings(catalogProducts, eventOfferings, eventStalls);
    },
    [catalogProducts, offerings, stalls]
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

  const createEvent = useCallback(
    async (input: CreateEventInput) => {
      const { event, stalls: createdStalls, offerings: createdOfferings } = await createEventApi({
        name: input.name,
        cityId: input.cityId,
        location: input.location,
        description: input.description,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        banner: input.banner,
        status: input.status,
        capacity: input.capacity,
        primaryColor: input.primaryColor,
        icon: input.icon,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      setEvents((prev) => [...prev, event]);
      setStalls((prev) => [...prev, ...createdStalls]);
      setOfferings((prev) => [...prev, ...createdOfferings]);
      markEventLoaded(event.id);
      return event;
    },
    [markEventLoaded]
  );

  const updateEvent = useCallback(async (id: string, patch: Partial<Event>) => {
    const updated = await updateEventApi(id, patch);
    setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)));
  }, []);

  const replaceEvent = useCallback((event: Event) => {
    setEvents((prev) => prev.map((entry) => (entry.id === event.id ? event : entry)));
  }, []);

  const addStall = useCallback(
    async (
      eventId: string,
      stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }
    ): Promise<Stall> => {
      const { id: _id, ...payload } = stall;
      void _id;
      const created = await createStallApi(eventId, payload);
      setStalls((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updateStall = useCallback(async (stallId: string, patch: Partial<Stall>) => {
    const stall = stalls.find((entry) => entry.id === stallId);
    if (!stall) return;

    const updated = await updateStallApi(stall.eventId, stallId, patch);
    setStalls((prev) =>
      prev.map((entry) => (entry.id === stallId ? updated : entry))
    );
  }, [stalls]);

  const deleteStall = useCallback((stallId: string) => {
    setStalls((prev) => prev.filter((stall) => stall.id !== stallId));
    setOfferings((prev) => prev.filter((offering) => offering.stallId !== stallId));
  }, []);

  const addOffering = useCallback(
    async (offering: Offering) => {
      const stallOfferings = offerings.filter((entry) => entry.stallId === offering.stallId);
      const updated = await replaceStallOfferings(offering.stallId, [
        ...stallOfferings,
        offering,
      ]);
      return updated[updated.length - 1] ?? offering;
    },
    [offerings, replaceStallOfferings]
  );

  const updateOffering = useCallback(
    async (offeringId: string, patch: Partial<Offering>) => {
      const target = offerings.find((entry) => entry.id === offeringId);
      if (!target) return;

      const stallOfferings = offerings
        .filter((entry) => entry.stallId === target.stallId)
        .map((entry) => (entry.id === offeringId ? { ...entry, ...patch } : entry));

      await replaceStallOfferings(target.stallId, stallOfferings);
    },
    [offerings, replaceStallOfferings]
  );

  const deleteOffering = useCallback(
    async (offeringId: string) => {
      const target = offerings.find((entry) => entry.id === offeringId);
      if (!target) return;

      const stallOfferings = offerings.filter(
        (entry) => entry.stallId === target.stallId && entry.id !== offeringId
      );
      await replaceStallOfferings(target.stallId, stallOfferings);
    },
    [offerings, replaceStallOfferings]
  );

  const value = useMemo(
    () => ({
      hydrated,
      loadError,
      categories,
      events,
      stalls,
      catalogProducts,
      offerings,
      isEventScopeLoaded,
      ensureEventLoaded,
      refreshEventScope,
      refreshEvents,
      getEventById,
      getStallsByEventId,
      getOfferingsByEventId,
      getOfferingsByStallId,
      getCardapioByEventId,
      getMenuItemsByEventId,
      getPublicEvents,
      getEventsByCityId,
      getEventsByOrganizerId,
      createEvent,
      updateEvent,
      replaceEvent,
      addStall,
      updateStall,
      deleteStall,
      saveStallOfferings: replaceStallOfferings,
      addOffering,
      updateOffering,
      deleteOffering,
    }),
    [
      hydrated,
      loadError,
      categories,
      events,
      stalls,
      catalogProducts,
      offerings,
      isEventScopeLoaded,
      ensureEventLoaded,
      refreshEventScope,
      refreshEvents,
      getEventById,
      getStallsByEventId,
      getOfferingsByEventId,
      getOfferingsByStallId,
      getCardapioByEventId,
      getMenuItemsByEventId,
      getPublicEvents,
      getEventsByCityId,
      getEventsByOrganizerId,
      createEvent,
      updateEvent,
      replaceEvent,
      addStall,
      updateStall,
      deleteStall,
      replaceStallOfferings,
      addOffering,
      updateOffering,
      deleteOffering,
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
