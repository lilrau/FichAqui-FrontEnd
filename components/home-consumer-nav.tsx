'use client';

import { BottomNav } from '@/components/bottom-nav';
import { useAuth } from '@/lib/auth-context';

export function HomeConsumerNav() {
  const { isAuthenticated, hydrated } = useAuth();

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return <BottomNav variant="home" />;
}
