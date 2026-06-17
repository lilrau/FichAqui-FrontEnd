'use client';

import { useContext, useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

function usePreviousValue<T>(value: T): T | undefined {
  const prevValue = useRef<T>();

  useEffect(() => {
    prevValue.current = value;
    return () => {
      prevValue.current = undefined;
    };
  });

  return prevValue.current;
}

/**
 * Keeps the outgoing route mounted while AnimatePresence runs exit animations.
 * Without this, Next.js swaps layout router state before Framer Motion finishes.
 */
export function FrozenRoute({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) ?? null;

  const pathname = usePathname();
  const prevPathname = usePreviousValue(pathname);

  const routeChanged =
    pathname !== prevPathname &&
    pathname !== undefined &&
    prevPathname !== undefined;

  return (
    <LayoutRouterContext.Provider value={routeChanged ? prevContext : context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}
