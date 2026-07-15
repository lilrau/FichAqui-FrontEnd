import { apiRequest } from '@/lib/api/client';
import type { Offering, OfferingVariant } from '@/lib/types/event-domain';

export type UpsertOfferingPayload = {
  productId: string;
  available?: boolean;
  variants: OfferingVariant[];
};

export async function fetchOfferings(eventId: string): Promise<Offering[]> {
  return apiRequest<Offering[]>(`/api/events/${eventId}/offerings`);
}

export async function replaceStallOfferingsApi(
  eventId: string,
  stallId: string,
  offerings: UpsertOfferingPayload[]
): Promise<Offering[]> {
  return apiRequest<Offering[]>(`/api/events/${eventId}/stalls/${stallId}/offerings`, {
    method: 'PUT',
    auth: true,
    body: offerings,
  });
}

export function toUpsertOfferingPayload(offering: Offering): UpsertOfferingPayload {
  return {
    productId: offering.productId,
    available: offering.available,
    variants: offering.variants.map((variant) => ({
      templateId: variant.templateId,
      price: Number(variant.price ?? 0),
      stock: Number(variant.stock ?? 0),
      available: Boolean(variant.available),
      ...(variant.badge ? { badge: variant.badge } : {}),
    })),
  };
}
