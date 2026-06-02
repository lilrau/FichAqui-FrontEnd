'use client';

import { Suspense, type ReactNode } from 'react';
import { AppReadyGate } from '@/components/app-ready-gate';
import { EventStoreProvider } from '@/lib/event-store';
import { EventProvider } from '@/lib/event-context';
import { CartProvider } from '@/lib/cart-context';

function ProvidersInner({ children }: { children: ReactNode }) {
  return (
    <EventProvider>
      <CartProvider>
        <AppReadyGate>{children}</AppReadyGate>
      </CartProvider>
    </EventProvider>
  );
}

export function EventProviders({ children }: { children: ReactNode }) {
  return (
    <EventStoreProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <ProvidersInner>{children}</ProvidersInner>
      </Suspense>
    </EventStoreProvider>
  );
}
