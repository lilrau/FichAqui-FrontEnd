'use client';

import { Suspense, type ReactNode } from 'react';
import { AppReadyGate } from '@/components/app-ready-gate';
import { GlobalConsumerNav } from '@/components/global-consumer-nav';
import { NavigationProvider } from '@/components/navigation-provider';
import { PageTransition } from '@/components/page-transition';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { CityProvider } from '@/lib/city-context';
import { EventStoreProvider } from '@/lib/event-store';
import { EventProvider } from '@/lib/event-context';
import { CartProvider } from '@/lib/cart-context';

function ProvidersInner({ children }: { children: ReactNode }) {
  return (
    <EventProvider>
      <CartProvider>
        <NavigationProvider>
          <AppReadyGate>
            <PageTransition>{children}</PageTransition>
            <Suspense fallback={null}>
              <GlobalConsumerNav />
            </Suspense>
          </AppReadyGate>
        </NavigationProvider>
      </CartProvider>
    </EventProvider>
  );
}

export function EventProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CityProvider>
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
        </CityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
