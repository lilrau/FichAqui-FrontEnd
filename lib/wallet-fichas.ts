import type { Ficha } from '@/lib/types/event-domain';
import { type ConsumerScope } from '@/lib/consumer-scope';

export function isMilhoVerdeFicha(ficha: Ficha): boolean {
  if (ficha.itemName === 'Milho Verde') return true;
  return ficha.qrCode.includes('milho-verde');
}

export function isFichaExcludedFromEvent(ficha: Ficha, scope: ConsumerScope): boolean {
  return scope === 'event' && isMilhoVerdeFicha(ficha);
}
