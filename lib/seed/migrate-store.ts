import type { Event, MenuProduct, Order, Stall } from '@/lib/types/event-domain';
import { seedEvents } from '@/lib/seed/events';
import { seedStalls } from '@/lib/seed/stalls';
import { seedMenuProducts } from '@/lib/seed/menu-products';
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

export function migrateMenuProducts(stored: MenuProduct[] | null | undefined): MenuProduct[] {
  if (!Array.isArray(stored) || stored.length === 0) return seedMenuProducts;
  const seedIds = new Set(seedMenuProducts.map((p) => p.id));
  const extra = stored.filter((p) => p?.id && !seedIds.has(p.id));
  const merged = seedMenuProducts.map((seed) => {
    const found = stored.find((p) => p.id === seed.id);
    return found ? { ...seed, ...found, eventId: found.eventId ?? seed.eventId } : seed;
  });
  return [...merged, ...extra];
}

export function migrateOrders(stored: Order[] | null | undefined): Order[] {
  if (!Array.isArray(stored) || stored.length === 0) return seedOrders;
  return parseStoredOrders(stored);
}
