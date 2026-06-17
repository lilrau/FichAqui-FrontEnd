import type { Event, MenuProduct, Offering, Order, Stall } from '@/lib/types/event-domain';
import { seedEvents } from '@/lib/seed/events';
import { seedStalls } from '@/lib/seed/stalls';
import { seedOfferings } from '@/lib/seed/offerings';
import { seedOrders, parseStoredOrders } from '@/lib/seed/orders';

const DEFAULT_CITY_ID = 'curitiba-pr';
const DEFAULT_ORGANIZER_ID = 'org-paroquia';

/** Mescla evento salvo com seed para campos novos (cityId, organizerId, icon). */
export function migrateEvents(stored: Event[] | null | undefined): Event[] {
  const seedById = new Map(seedEvents.map((e) => [e.id, e]));
  const storedList = Array.isArray(stored) ? stored : [];

  const merged = new Map<string, Event>();

  for (const raw of storedList) {
    if (!raw?.id) continue;
    const seed = seedById.get(raw.id);
    merged.set(raw.id, {
      ...(seed ?? {}),
      ...raw,
      cityId: raw.cityId ?? seed?.cityId ?? DEFAULT_CITY_ID,
      organizerId: raw.organizerId ?? seed?.organizerId ?? DEFAULT_ORGANIZER_ID,
      icon: raw.icon ?? seed?.icon ?? '🎪',
    } as Event);
  }

  for (const seed of seedEvents) {
    if (!merged.has(seed.id)) {
      merged.set(seed.id, seed);
    }
  }

  return Array.from(merged.values());
}

export function migrateStalls(stored: Stall[] | null | undefined): Stall[] {
  if (!Array.isArray(stored) || stored.length === 0) return seedStalls;
  const seedIds = new Set(seedStalls.map((s) => s.id));
  const extra = stored.filter((s) => s?.id && !seedIds.has(s.id));
  const merged = seedStalls.map((seed) => {
    const found = stored.find((s) => s.id === seed.id);
    return found ? { ...seed, ...found, eventId: found.eventId ?? seed.eventId } : seed;
  });
  return [...merged, ...extra];
}

function isLegacyMenuProduct(value: unknown): value is MenuProduct {
  return (
    typeof value === 'object' &&
    value !== null &&
    'stallId' in value &&
    'variants' in value &&
    'eventId' in value &&
    !('productId' in value)
  );
}

function legacyVariantToTemplateId(variantId: string, productId: string): string {
  const prefix = `${productId}-`;
  if (variantId.startsWith(prefix)) {
    return variantId.slice(prefix.length);
  }
  return variantId;
}

function migrateLegacyMenuProducts(products: MenuProduct[]): Offering[] {
  return products.map((product) => ({
    id: `offering-${product.eventId}-${product.stallId}-${product.id}`,
    eventId: product.eventId,
    stallId: product.stallId,
    productId: product.id,
    available: product.available,
    variants: product.variants.map((variant) => ({
      templateId: legacyVariantToTemplateId(variant.id, product.id),
      price: variant.price,
      available: variant.available,
      badge: variant.badge,
    })),
  }));
}

export function migrateOfferings(
  stored: Offering[] | MenuProduct[] | null | undefined
): Offering[] {
  if (!Array.isArray(stored) || stored.length === 0) return seedOfferings;

  if (stored.some(isLegacyMenuProduct)) {
    return migrateLegacyMenuProducts(stored as MenuProduct[]);
  }

  const seedIds = new Set(seedOfferings.map((offering) => offering.id));
  const extra = (stored as Offering[]).filter(
    (offering) => offering?.id && !seedIds.has(offering.id)
  );
  const merged = seedOfferings.map((seed) => {
    const found = (stored as Offering[]).find((offering) => offering.id === seed.id);
    return found
      ? {
          ...seed,
          ...found,
          eventId: found.eventId ?? seed.eventId,
          stallId: found.stallId ?? seed.stallId,
          productId: found.productId ?? seed.productId,
        }
      : seed;
  });

  return [...merged, ...extra];
}

export function migrateOrders(stored: Order[] | null | undefined): Order[] {
  if (!Array.isArray(stored) || stored.length === 0) return seedOrders;
  return parseStoredOrders(stored);
}
