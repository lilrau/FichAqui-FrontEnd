import type {
  CardapioProduct,
  CatalogProduct,
  MenuItem,
  Offering,
  Stall,
} from '@/lib/types/event-domain';

export function buildMenuItemId(offeringId: string, templateId: string): string {
  return `${offeringId}:${templateId}`;
}

export function buildMenuItem(
  product: CatalogProduct,
  offering: Offering,
  stall: Stall,
  templateId: string,
  label: string,
  price: number,
  available: boolean,
  badge?: string
): MenuItem {
  const hasMultipleVariants =
    offering.variants.filter((variant) => variant.available).length > 1 ||
    product.variantTemplates.length > 1;

  const name = hasMultipleVariants ? `${product.name} — ${label}` : product.name;

  return {
    id: buildMenuItemId(offering.id, templateId),
    productId: product.id,
    offeringId: offering.id,
    name,
    description: product.description,
    price,
    category: product.category,
    image: product.image,
    badge: badge ?? product.badge,
    available: offering.available && available,
    stallId: stall.id,
    stallName: stall.name,
    variantLabel: label,
  };
}

export function buildMenuItemsFromOfferings(
  catalog: CatalogProduct[],
  offerings: Offering[],
  stalls: Stall[]
): MenuItem[] {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));
  const stallsById = new Map(stalls.map((stall) => [stall.id, stall]));

  return offerings.flatMap((offering) => {
    const product = catalogById.get(offering.productId);
    const stall = stallsById.get(offering.stallId);
    if (!product || !stall) return [];

    return offering.variants.flatMap((variant) => {
      const template = product.variantTemplates.find((entry) => entry.id === variant.templateId);
      if (!template) return [];

      return [
        buildMenuItem(
          product,
          offering,
          stall,
          template.id,
          template.label,
          variant.price,
          variant.available,
          variant.badge
        ),
      ];
    });
  });
}

export function findMenuItemById(
  catalog: CatalogProduct[],
  offerings: Offering[],
  stalls: Stall[],
  menuItemId: string
): MenuItem | undefined {
  return buildMenuItemsFromOfferings(catalog, offerings, stalls).find(
    (item) => item.id === menuItemId
  );
}

export function getActiveOfferingsForEvent(
  offerings: Offering[],
  stalls: Stall[],
  eventId: string
): Offering[] {
  const openStallIds = new Set(
    stalls.filter((stall) => stall.eventId === eventId && stall.status === 'open').map((s) => s.id)
  );

  return offerings.filter(
    (offering) =>
      offering.eventId === eventId && offering.available && openStallIds.has(offering.stallId)
  );
}

export function buildCardapioForEvent(
  catalog: CatalogProduct[],
  offerings: Offering[],
  stalls: Stall[],
  eventId: string
): CardapioProduct[] {
  const activeOfferings = getActiveOfferingsForEvent(offerings, stalls, eventId);
  const offeringsByProduct = new Map<string, Offering[]>();

  for (const offering of activeOfferings) {
    const list = offeringsByProduct.get(offering.productId) ?? [];
    list.push(offering);
    offeringsByProduct.set(offering.productId, list);
  }

  return catalog
    .filter((product) => offeringsByProduct.has(product.id))
    .map((product) => ({
      product,
      offerings: offeringsByProduct.get(product.id) ?? [],
    }));
}

/** @deprecated */
export function buildMenuItemsFromProducts(): MenuItem[] {
  return [];
}
