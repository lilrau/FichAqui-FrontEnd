import type { MenuItem, MenuProduct } from '@/lib/types/event-domain';

export function buildMenuItemsFromProducts(products: MenuProduct[]): MenuItem[] {
  return products.flatMap((product) =>
    product.variants.map((variant) => {
      const name =
        product.variants.length > 1
          ? `${product.name} — ${variant.label}`
          : product.name;

      return {
        id: variant.id,
        productId: product.id,
        name,
        description: product.description,
        price: variant.price,
        category: product.category,
        image: product.image,
        badge: variant.badge ?? product.badge,
        available: product.available && variant.available,
        stallId: product.stallId,
        variantLabel: variant.label,
      };
    })
  );
}

export function findMenuItemById(
  products: MenuProduct[],
  variantId: string
): MenuItem | undefined {
  return buildMenuItemsFromProducts(products).find((item) => item.id === variantId);
}
