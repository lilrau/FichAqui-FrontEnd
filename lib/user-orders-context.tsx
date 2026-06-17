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
import { useAuth } from '@/lib/auth-context';
import { fetchUserFichas, fetchUserPedidos } from '@/lib/api/orders';
import { getErrorMessage } from '@/lib/api/errors';
import type { Ficha } from '@/lib/types/event-domain';
import type { ConsumerOrder } from '@/lib/types/consumer-order';

interface UserOrdersContextType {
  hydrated: boolean;
  loadError: string | null;
  orders: ConsumerOrder[];
  availableFichas: Ficha[];
  refreshUserOrders: () => Promise<void>;
  getOrdersByEventId: (eventId: string) => ConsumerOrder[];
  getAvailableFichasForEvent: (eventId: string | null) => Ficha[];
}

const UserOrdersContext = createContext<UserOrdersContextType | undefined>(undefined);

export function UserOrdersProvider({ children }: { children: ReactNode }) {
  const { hydrated: authHydrated, isAuthenticated } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [availableFichas, setAvailableFichas] = useState<Ficha[]>([]);

  const refreshUserOrders = useCallback(async () => {
    const [pedidos, fichas] = await Promise.all([
      fetchUserPedidos(true),
      fetchUserFichas(),
    ]);
    setOrders(pedidos);
    setAvailableFichas(fichas);
    setLoadError(null);
  }, []);

  useEffect(() => {
    if (!authHydrated) return;

    let cancelled = false;

    (async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setOrders([]);
          setAvailableFichas([]);
          setLoadError(null);
          setHydrated(true);
        }
        return;
      }

      try {
        await refreshUserOrders();
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, 'Não foi possível carregar seus pedidos.'));
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, refreshUserOrders]);

  const getOrdersByEventId = useCallback(
    (eventId: string) => orders.filter((order) => order.eventId === eventId),
    [orders]
  );

  const getAvailableFichasForEvent = useCallback(
    (eventId: string | null) => {
      if (!eventId) return availableFichas;
      const orderIds = new Set(
        orders.filter((order) => order.eventId === eventId).map((order) => order.id)
      );
      return availableFichas.filter((ficha) => orderIds.has(ficha.orderId));
    },
    [availableFichas, orders]
  );

  const value = useMemo(
    () => ({
      hydrated,
      loadError,
      orders,
      availableFichas,
      refreshUserOrders,
      getOrdersByEventId,
      getAvailableFichasForEvent,
    }),
    [
      hydrated,
      loadError,
      orders,
      availableFichas,
      refreshUserOrders,
      getOrdersByEventId,
      getAvailableFichasForEvent,
    ]
  );

  return (
    <UserOrdersContext.Provider value={value}>{children}</UserOrdersContext.Provider>
  );
}

export function useUserOrders() {
  const ctx = useContext(UserOrdersContext);
  if (!ctx) {
    throw new Error('useUserOrders must be used within UserOrdersProvider');
  }
  return ctx;
}
