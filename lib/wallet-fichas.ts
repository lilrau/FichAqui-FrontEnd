import {
  getFichasFromOrder,
  isFichaValid,
  mockAvailableFichas,
} from '@/lib/mock-data';
import {
  MILHO_VERDE_FICHA_ID,
  MILHO_VERDE_VARIANT_ID,
  WALLET_FICHA_IDS,
  type ConsumerScope,
} from '@/lib/consumer-scope';
import type { Ficha, Order } from '@/lib/types/event-domain';

export function isMilhoVerdeFicha(ficha: Ficha): boolean {
  if (ficha.id === MILHO_VERDE_FICHA_ID) return true;
  if (ficha.itemName === 'Milho Verde') return true;
  return ficha.qrCode.includes(MILHO_VERDE_VARIANT_ID);
}

export function filterWalletFichas(fichas: Ficha[]): Ficha[] {
  return fichas.filter((f) => WALLET_FICHA_IDS.includes(f.id as (typeof WALLET_FICHA_IDS)[number]));
}

export function resolveWalletFichas(orders: Order[]): Ficha[] {
  const fromOrders = orders.flatMap(getFichasFromOrder).filter(isFichaValid);
  if (fromOrders.length > 0) {
    return fromOrders;
  }
  return filterWalletFichas(mockAvailableFichas);
}

export function isFichaExcludedFromEvent(ficha: Ficha, scope: ConsumerScope): boolean {
  return scope === 'event' && isMilhoVerdeFicha(ficha);
}
