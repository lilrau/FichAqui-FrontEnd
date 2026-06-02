'use client';

import { Suspense } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { useConsumerScope } from '@/lib/consumer-scope';
import { useAuth } from '@/lib/auth-context';

function ConsumerBottomNav() {
  const scope = useConsumerScope();
  const { isAuthenticated, hydrated } = useAuth();
  const variant =
    scope === 'global' && hydrated && isAuthenticated ? 'home' : 'event';

  return <BottomNav variant={variant} />;
}

export function ConsumerShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <ConsumerBottomNav />
      </Suspense>
    </>
  );
}
