'use client';

import type { ReactNode } from 'react';
import { useAppReady } from '@/lib/event-context';

export function AppReadyGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const ready = useAppReady();

  if (!ready) {
    return (
      fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )
    );
  }

  return <>{children}</>;
}
