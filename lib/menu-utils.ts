import type {
  CardapioProduct,
  CatalogProduct,
  MenuItem,
  Offering,
  OfferingVariant,
  Stall,
} from '@/lib/types/event-domain';
import { buildMenuItem, buildMenuItemId } from '@/lib/catalog/menu-catalog';

export function hasMultipleVariants(product: CatalogProduct): boolean {
  return product.variantTemplates.length > 1;
}

export function getActiveOfferingVariants(offering: Offering): OfferingVariant[] {
  return offering.variants.filter((variant) => variant.available);
}

export function isVariantPurchasable(variant: OfferingVariant): boolean {
  return variant.available && variant.stock > 0;
}

export function isVariantEsgotada(variant: OfferingVariant): boolean {
  return variant.available && variant.stock === 0;
}

export function getCardapioPriceParts(entry: CardapioProduct):
  | { kind: 'unavailable' }
  | { kind: 'free' }
  | { kind: 'single'; price: string }
  | { kind: 'from'; price: string } {
  const prices = entry.offerings.flatMap((offering) =>
    getActiveOfferingVariants(offering)
      .filter(isVariantPurchasable)
      .map((variant) => variant.price)
  );

  if (prices.length === 0) return { kind: 'unavailable' };

  const min = Math.min(...prices);

  if (min === 0 && prices.every((price) => price === 0)) return { kind: 'free' };
  if (prices.length === 1 || new Set(prices).size === 1) {
    return { kind: 'single', price: `R$ ${min.toFixed(2)}` };
  }

  return { kind: 'from', price: `R$ ${min.toFixed(2)}` };
}

export function getCardapioPriceDisplay(entry: CardapioProduct): string {
  const parts = getCardapioPriceParts(entry);

  if (parts.kind === 'unavailable') return 'Indisponível';
  if (parts.kind === 'free') return 'Grátis';
  if (parts.kind === 'single') return parts.price;
  return `A partir de ${parts.price}`;
}

export function offeringVariantToMenuItem(
  product: CatalogProduct,
  offering: Offering,
  stall: Stall,
  variant: OfferingVariant
): MenuItem | null {
  const template = product.variantTemplates.find((entry) => entry.id === variant.templateId);
  if (!template) return null;

  return buildMenuItem(
    product,
    offering,
    stall,
    template.id,
    template.label,
    variant.price,
    variant.available && variant.stock > 0,
    variant.badge,
    variant.stock
  );
}

export function getPurchasableMenuItems(entry: CardapioProduct, stalls: Stall[]): MenuItem[] {
  const stallsById = new Map(stalls.map((stall) => [stall.id, stall]));

  return entry.offerings.flatMap((offering) => {
    const stall = stallsById.get(offering.stallId);
    if (!stall || stall.status !== 'open' || !offering.available) return [];

    return offering.variants.flatMap((variant) => {
      if (!isVariantPurchasable(variant)) return [];
      const menuItem = offeringVariantToMenuItem(entry.product, offering, stall, variant);
      return menuItem ? [menuItem] : [];
    });
  });
}

export function canQuickAddFromCardapio(entry: CardapioProduct, stalls: Stall[]): MenuItem | null {
  const purchasable = getPurchasableMenuItems(entry, stalls);
  return purchasable.length === 1 ? purchasable[0] : null;
}

export function getProductCartQuantity(
  entry: CardapioProduct,
  cartItems: { item: MenuItem; quantity: number }[]
): number {
  return cartItems.reduce((sum, cartItem) => {
    if (cartItem.item.productId === entry.product.id) {
      return sum + cartItem.quantity;
    }
    return sum;
  }, 0);
}

export function getCardapioByProductId(
  cardapio: CardapioProduct[],
  productId: string
): CardapioProduct | undefined {
  return cardapio.find((entry) => entry.product.id === productId);
}

export function cardapioMatchesSearch(entry: CardapioProduct, query: string): boolean {
  const normalized = query.toLowerCase();
  const { product } = entry;

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized) ||
    product.variantTemplates.some((template) =>
      template.label.toLowerCase().includes(normalized)
    )
  );
}

export function getOfferingVariantLabel(
  product: CatalogProduct,
  templateId: string
): string {
  return product.variantTemplates.find((template) => template.id === templateId)?.label ?? templateId;
}

export function getStallById(stalls: Stall[], stallId: string): Stall | undefined {
  return stalls.find((stall) => stall.id === stallId);
}

export function buildMenuItemIdForOfferingVariant(
  offeringId: string,
  templateId: string
): string {
  return buildMenuItemId(offeringId, templateId);
}
