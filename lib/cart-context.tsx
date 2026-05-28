'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MenuItem, Order, generateOrderNumber, generateQRCode } from '@/lib/mock-data';

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.item.id !== itemId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.item.id === itemId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const createOrder = useCallback(() => {
    if (items.length === 0) return null;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      number: generateOrderNumber(),
      items: [...items],
      total,
      status: 'pending',
      createdAt: new Date(),
      qrCode: generateQRCode(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    clearCart();

    // Simular mudança de status
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === newOrder.id ? { ...o, status: 'preparing' } : o
        )
      );
      setCurrentOrder((prev) =>
        prev?.id === newOrder.id ? { ...prev, status: 'preparing' } : prev
      );
    }, 3000);

    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === newOrder.id ? { ...o, status: 'ready' } : o
        )
      );
      setCurrentOrder((prev) =>
        prev?.id === newOrder.id ? { ...prev, status: 'ready' } : prev
      );
    }, 8000);

    return newOrder;
  }, [items, total, clearCart]);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
