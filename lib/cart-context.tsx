'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { MenuItem, Order, generateOrderNumber, generateQRCode } from '@/lib/mock-data';
import { useActiveEvent } from '@/lib/event-context';

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
  orders: Order[];
  createOrder: () => Order | null;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartsByEvent = Record<string, CartItem[]>;
type OrdersByEvent = Record<string, Order[]>;
type CurrentOrderByEvent = Record<string, Order | null>;

export function CartProvider({ children }: { children: ReactNode }) {
  const { activeEventId } = useActiveEvent();
  const eventId = activeEventId ?? '1';

  const [cartsByEvent, setCartsByEvent] = useState<CartsByEvent>({});
  const [ordersByEvent, setOrdersByEvent] = useState<OrdersByEvent>({});
  const [currentOrderByEvent, setCurrentOrderByEvent] = useState<CurrentOrderByEvent>({});

  const items = cartsByEvent[eventId] ?? [];
  const orders = ordersByEvent[eventId] ?? [];
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
          return prev.map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
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
          prev.map((i) => (i.item.id === itemId ? { ...i, quantity } : i))
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

  const createOrder = useCallback(() => {
    if (items.length === 0) return null;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      eventId,
      number: generateOrderNumber(),
      items: [...items],
      total,
      status: 'available',
      createdAt: new Date(),
      qrCode: generateQRCode(),
    };

    setOrdersByEvent((prev) => ({
      ...prev,
      [eventId]: [newOrder, ...(prev[eventId] ?? [])],
    }));
    setCurrentOrder(newOrder);
    clearCart();

    return newOrder;
  }, [items, total, clearCart, eventId, setCurrentOrder]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      orders,
      createOrder,
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
      orders,
      createOrder,
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
