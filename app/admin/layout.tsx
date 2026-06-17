'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAppReady } from '@/lib/event-context';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, hasRole, isAuthenticated } = useAuth();
  const ready = useAppReady();

  useEffect(() => {
    if (!hydrated || !ready) return;
    if (!isAuthenticated || !hasRole('organizer')) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? '/admin')}`);
    }
  }, [hydrated, ready, isAuthenticated, hasRole, router, pathname]);

  if (!hydrated || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  if (!isAuthenticated || !hasRole('organizer')) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return children;
}
