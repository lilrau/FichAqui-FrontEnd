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
import { buildMenuItemsFromProducts } from '@/lib/catalog/menu-catalog';
import {
  createDefaultMenuProductsForEvent,
  createDefaultStallsForEvent,
  parseStoredOrders,
  seedEvents,
  seedMenuProducts,
  seedOrders,
  seedStalls,
} from '@/lib/seed';
import { loadJson, saveJson } from '@/lib/storage';
import type {
  Event,
  MenuItem,
  MenuProduct,
  Order,
  OrderStatus,
  Stall,
} from '@/lib/types/event-domain';

const EVENTS_KEY = 'event-app:events';
const STALLS_KEY = 'event-app:stalls';
const PRODUCTS_KEY = 'event-app:products';
const ORDERS_KEY = 'event-app:orders';

export type CreateEventInput = Omit<Event, 'id'> & { id?: string };

interface EventStoreContextType {
  hydrated: boolean;
  events: Event[];
  stalls: Stall[];
  menuProducts: MenuProduct[];
  orders: Order[];
  getEventById: (id: string) => Event | undefined;
  getStallsByEventId: (eventId: string) => Stall[];
  getMenuProductsByEventId: (eventId: string) => MenuProduct[];
  getMenuItemsByEventId: (eventId: string) => MenuItem[];
  getOrdersByEventId: (eventId: string) => Order[];
  createEvent: (input: CreateEventInput) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  addStall: (eventId: string, stall: Omit<Stall, 'id' | 'eventId'> & { id?: string }) => Stall;
  updateStall: (stallId: string, patch: Partial<Stall>) => void;
  deleteStall: (stallId: string) => void;
  addOrder: (order: Order) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [stalls, setStalls] = useState<Stall[]>(seedStalls);
  const [menuProducts, setMenuProducts] = useState<MenuProduct[]>(seedMenuProducts);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEvents(loadJson(EVENTS_KEY, seedEvents));
    setStalls(loadJson(STALLS_KEY, seedStalls));
    setMenuProducts(loadJson(PRODUCTS_KEY, seedMenuProducts));
    setOrders(parseStoredOrders(loadJson(ORDERS_KEY, seedOrders)));
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

  useEffect(() => {
    if (!hydrated) return;
    saveJson(ORDERS_KEY, orders);
  }, [orders, hydrated]);

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

  const getMenuItemsByEventId = useCallback(
    (eventId: string) => buildMenuItemsFromProducts(getMenuProductsByEventId(eventId)),
    [getMenuProductsByEventId]
  );

  const getOrdersByEventId = useCallback(
    (eventId: string) =>
      orders
        .filter((o) => o.eventId === eventId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [orders]
  );

  const createEvent = useCallback((input: CreateEventInput) => {
    const id = input.id ?? `event-${Date.now()}`;
    const event: Event = {
      icon: '🎪',
      ...input,
      id,
    } as Event;

    const defaultStalls = createDefaultStallsForEvent(id);
    const defaultProducts = createDefaultMenuProductsForEvent(
      id,
      defaultStalls[0].id
    );

    setEvents((prev) => [...prev, event]);
    setStalls((prev) => [...prev, ...defaultStalls]);
    setMenuProducts((prev) => [...prev, ...defaultProducts]);
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

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      events,
      stalls,
      menuProducts,
      orders,
      getEventById,
      getStallsByEventId,
      getMenuProductsByEventId,
      getMenuItemsByEventId,
      getOrdersByEventId,
      createEvent,
      updateEvent,
      addStall,
      updateStall,
      deleteStall,
      addOrder,
      updateOrderStatus,
    }),
    [
      hydrated,
      events,
      stalls,
      menuProducts,
      orders,
      getEventById,
      getStallsByEventId,
      getMenuProductsByEventId,
      getMenuItemsByEventId,
      getOrdersByEventId,
      createEvent,
      updateEvent,
      addStall,
      updateStall,
      deleteStall,
      addOrder,
      updateOrderStatus,
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
