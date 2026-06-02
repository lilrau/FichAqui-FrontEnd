'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { useConsumerScope } from '@/lib/consumer-scope';
import { useAuth } from '@/lib/auth-context';

const CONSUMER_PATH_PREFIXES = [
  '/carteira',
  '/cardapio',
  '/historico',
  '/perfil',
  '/metodos-pagamento',
] as const;

const HIDDEN_PATH_PREFIXES = ['/admin', '/pedido', '/meus-pedidos'] as const;

function isConsumerPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return CONSUMER_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function useShouldShowNav(): boolean {
  const pathname = usePathname();
  const { isAuthenticated, hydrated } = useAuth();

  if (HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  if (pathname === '/login') return false;

  if (!isConsumerPath(pathname)) return false;

  if (pathname === '/') {
    return hydrated && isAuthenticated;
  }

  return true;
}

function useNavVariant(): 'home' | 'event' {
  const pathname = usePathname();
  const scope = useConsumerScope();
  const { isAuthenticated, hydrated } = useAuth();

  if (pathname === '/') return 'home';
  if (scope === 'global' && hydrated && isAuthenticated) return 'home';
  return 'event';
}

export function GlobalConsumerNav() {
  const shouldShow = useShouldShowNav();
  const variant = useNavVariant();

  if (!shouldShow) return null;

  return <BottomNav variant={variant} />;
}
