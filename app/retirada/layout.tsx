'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAppReady } from '@/lib/event-context';

export default function RetiradaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, hasRole, isAuthenticated } = useAuth();
  const ready = useAppReady();

  const canAccess =
    isAuthenticated && (hasRole('stall_manager') || hasRole('organizer'));

  useEffect(() => {
    if (!hydrated || !ready) return;
    if (!canAccess) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? '/retirada')}`);
    }
  }, [hydrated, ready, canAccess, router, pathname]);

  if (!hydrated || !ready || !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return children;
}
