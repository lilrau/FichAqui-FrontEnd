import {
  getFichasFromOrder,
  isFichaValid,
  mockAvailableFichas,
} from '@/lib/mock-data';
import { MILHO_VERDE_FICHA_ID, WALLET_FICHA_IDS, type ConsumerScope } from '@/lib/consumer-scope';
import type { Ficha, Order } from '@/lib/types/event-domain';

export function filterWalletFichas(fichas: Ficha[]): Ficha[] {
  return fichas.filter((f) => WALLET_FICHA_IDS.includes(f.id as (typeof WALLET_FICHA_IDS)[number]));
}

export function resolveWalletFichas(orders: Order[]): Ficha[] {
  const fromOrders = orders.flatMap(getFichasFromOrder).filter(isFichaValid);
  const source = fromOrders.length > 0 ? fromOrders : mockAvailableFichas;
  return filterWalletFichas(source);
}

export function isFichaExcludedFromEvent(fichaId: string, scope: ConsumerScope): boolean {
  return scope === 'event' && fichaId === MILHO_VERDE_FICHA_ID;
}
