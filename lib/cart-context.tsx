'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import { useEventId } from '@/lib/event-context';
import { loadJson, saveJson } from '@/lib/storage';
import type { MenuItem, Order } from '@/lib/types/event-domain';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  fulfillOrder: (order: Order) => Order;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CARTS_STORAGE_KEY = 'fichaqui-frontend:carts';

type CartsByEvent = Record<string, CartItem[]>;
type CurrentOrderByEvent = Record<string, Order | null>;

export function CartProvider({ children }: { children: ReactNode }) {
  const eventId = useEventId();

  const [cartsByEvent, setCartsByEvent] = useState<CartsByEvent>({});
  const [currentOrderByEvent, setCurrentOrderByEvent] = useState<CurrentOrderByEvent>({});
  const [persistReady, setPersistReady] = useState(false);

  useEffect(() => {
    setCartsByEvent(loadJson<CartsByEvent>(CARTS_STORAGE_KEY, {}));
    setPersistReady(true);
  }, []);

  useEffect(() => {
    if (!persistReady) return;
    saveJson(CARTS_STORAGE_KEY, cartsByEvent);
  }, [cartsByEvent, persistReady]);

  const items = cartsByEvent[eventId] ?? [];
  const currentOrder = currentOrderByEvent[eventId] ?? null;

  const setItemsForEvent = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setCartsByEvent((prev) => ({
        ...prev,
        [eventId]: updater(prev[eventId] ?? []),
      }));
    },
    [eventId]
  );

  const addItem = useCallback(
    (item: MenuItem) => {
      setItemsForEvent((prev) => {
        const existing = prev.find((i) => i.item.id === item.id);
        if (existing) {
          const nextQuantity = Math.min(existing.quantity + 1, item.stock);
          return prev.map((i) =>
            i.item.id === item.id ? { ...i, quantity: nextQuantity } : i
          );
        }
        if (item.stock < 1) return prev;
        return [...prev, { item, quantity: 1 }];
      });
    },
    [setItemsForEvent]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItemsForEvent((prev) => prev.filter((i) => i.item.id !== itemId));
    },
    [setItemsForEvent]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        setItemsForEvent((prev) => prev.filter((i) => i.item.id !== itemId));
      } else {
        setItemsForEvent((prev) =>
          prev.map((i) => {
            if (i.item.id !== itemId) return i;
            return { ...i, quantity: Math.min(quantity, i.item.stock) };
          })
        );
      }
    },
    [setItemsForEvent]
  );

  const clearCart = useCallback(() => {
    setCartsByEvent((prev) => ({ ...prev, [eventId]: [] }));
  }, [eventId]);

  const total = items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const setCurrentOrder = useCallback(
    (order: Order | null) => {
      setCurrentOrderByEvent((prev) => ({ ...prev, [eventId]: order }));
    },
    [eventId]
  );

  const fulfillOrder = useCallback(
    (order: Order) => {
      setCurrentOrder(order);
      clearCart();
      return order;
    },
    [clearCart, setCurrentOrder]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      fulfillOrder,
      currentOrder,
      setCurrentOrder,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      fulfillOrder,
      currentOrder,
      setCurrentOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
