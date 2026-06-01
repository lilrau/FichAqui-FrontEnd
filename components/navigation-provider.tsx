'use client';

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

interface NavigationContextValue {
  isPending: boolean;
  startNav: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const startNav = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return (
    <NavigationContext.Provider value={{ isPending, startNav }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
