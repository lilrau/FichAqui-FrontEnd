'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchEventPedidos } from '@/lib/api/orders';
import { getErrorMessage } from '@/lib/api/errors';
import type { AdminOrder } from '@/lib/types/admin-order';

const POLL_MS = 30_000;

export function useEventPedidos(eventId: string) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const lastCountRef = useRef<number | null>(null);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!eventId) return;
      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const list = await fetchEventPedidos(eventId);
        if (lastCountRef.current !== null && list.length > lastCountRef.current) {
          setHasNewOrders(true);
        }
        lastCountRef.current = list.length;
        setOrders(list);
        setLoadError(null);
      } catch (error) {
        setLoadError(getErrorMessage(error, 'Não foi possível carregar os pedidos.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    lastCountRef.current = null;
    setHasNewOrders(false);
    void load();
  }, [load]);

  useEffect(() => {
    if (!eventId) return;

    const tick = () => {
      if (document.hidden) return;
      void load({ silent: true });
    };

    const interval = setInterval(tick, POLL_MS);
    return () => clearInterval(interval);
  }, [eventId, load]);

  const refresh = useCallback(async () => {
    setHasNewOrders(false);
    await load({ silent: true });
  }, [load]);

  return {
    orders,
    loadError,
    loading,
    refreshing,
    hasNewOrders,
    refresh,
  };
}
