'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useActiveEvent } from '@/lib/event-context';

export type ConsumerScope = 'global' | 'event';

/** Fichas exibidas na carteira (fora do mock completo). */
export const WALLET_FICHA_IDS = ['ficha-1', 'ficha-2'] as const;
export const MILHO_VERDE_FICHA_ID = 'ficha-2';

const GLOBAL_ONLY_PATHS = ['/metodos-pagamento'] as const;

/** Rotas que funcionam com ou sem evento ativo (via ?event=). */
const EVENT_OPTIONAL_PATHS = ['/carteira', '/perfil'] as const;

function isEventOptionalPath(pathname: string): boolean {
  return EVENT_OPTIONAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isGlobalConsumerPath(
  pathname: string,
  eventParam: string | null
): boolean {
  if (GLOBAL_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (isEventOptionalPath(pathname)) {
    return !eventParam;
  }
  return false;
}

export function useConsumerScope(): ConsumerScope {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event');
  return isGlobalConsumerPath(pathname, eventParam) ? 'global' : 'event';
}

/** ID do evento quando o consumidor está no fluxo do evento (query ou contexto). */
export function useConsumerEventId(): string | null {
  const scope = useConsumerScope();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event');
  const { activeEventId } = useActiveEvent();

  if (scope === 'global') return null;
  return eventParam ?? activeEventId;
}

export function buildConsumerEventHref(
  path: string,
  eventId: string,
  params?: Record<string, string>
): string {
  const search = new URLSearchParams({ event: eventId, ...params });
  return `${path}?${search.toString()}`;
}
