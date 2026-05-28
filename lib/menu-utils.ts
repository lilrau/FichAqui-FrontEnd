import type { MenuItem, MenuProduct, MenuVariant } from '@/lib/mock-data';

export function hasMultipleVariants(product: MenuProduct): boolean {
  return product.variants.length > 1;
}

export function getAvailableVariants(product: MenuProduct): MenuVariant[] {
  return product.variants.filter((variant) => variant.available);
}

export function getProductPriceDisplay(product: MenuProduct): string {
  const prices = getAvailableVariants(product).map((variant) => variant.price);

  if (prices.length === 0) return 'Indisponível';

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === 0 && max === 0) return 'Grátis';
  if (min === max) return `R$ ${min.toFixed(2)}`;
  return `A partir de R$ ${min.toFixed(2)}`;
}

export function variantToMenuItem(product: MenuProduct, variant: MenuVariant): MenuItem {
  const name = hasMultipleVariants(product)
    ? `${product.name} — ${variant.label}`
    : product.name;

  return {
    id: variant.id,
    productId: product.id,
    name,
    description: product.description,
    price: variant.price,
    category: product.category,
    estimatedTime: product.estimatedTime,
    image: product.image,
    badge: variant.badge ?? product.badge,
    available: product.available && variant.available,
    stallId: product.stallId,
    variantLabel: variant.label,
  };
}

export function getProductCartQuantity(
  product: MenuProduct,
  cartItems: { item: MenuItem; quantity: number }[]
): number {
  const variantIds = new Set(product.variants.map((variant) => variant.id));

  return cartItems.reduce((sum, cartItem) => {
    if (variantIds.has(cartItem.item.id)) {
      return sum + cartItem.quantity;
    }
    return sum;
  }, 0);
}

export function getProductById(
  products: MenuProduct[],
  productId: string
): MenuProduct | undefined {
  return products.find((product) => product.id === productId);
}

export function productMatchesSearch(product: MenuProduct, query: string): boolean {
  const normalized = query.toLowerCase();

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized) ||
    product.variants.some((variant) =>
      variant.label.toLowerCase().includes(normalized)
    )
  );
}
