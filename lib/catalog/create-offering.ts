import type { Offering } from '@/lib/types/event-domain';

export function createOfferingFromCatalogProduct(
  eventId: string,
  stallId: string,
  productId: string
): Offering {
  return {
    id: `offering-${eventId}-${stallId}-${productId}`,
    eventId,
    stallId,
    productId,
    available: true,
    variants: [],
  };
}
