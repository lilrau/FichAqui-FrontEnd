'use client';

import { Suspense, type ReactNode } from 'react';
import { EventStoreProvider } from '@/lib/event-store';
import { EventProvider } from '@/lib/event-context';
import { CartProvider } from '@/lib/cart-context';

export function EventProviders({ children }: { children: ReactNode }) {
  return (
    <EventStoreProvider>
      <Suspense fallback={null}>
        <EventProvider>
          <CartProvider>{children}</CartProvider>
        </EventProvider>
      </Suspense>
    </EventStoreProvider>
  );
}
