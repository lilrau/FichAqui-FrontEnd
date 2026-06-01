'use client';

import { BottomNav } from '@/components/bottom-nav';
import { NavigationProvider } from '@/components/navigation-provider';
import { PageTransition } from '@/components/page-transition';

export function ConsumerShell({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <PageTransition>{children}</PageTransition>
      <BottomNav />
    </NavigationProvider>
  );
}
