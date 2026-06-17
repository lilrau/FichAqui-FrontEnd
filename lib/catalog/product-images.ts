import { seedCatalogProducts } from '@/lib/seed/global-catalog';

const productImageById = Object.fromEntries(
  seedCatalogProducts.map((product) => [product.id, product.image])
);

/** Resolve API image slug to display emoji (until backend serves asset URLs). */
export function resolveProductImage(imageOrSlug: string, productId?: string): string {
  if (imageOrSlug.startsWith('http://') || imageOrSlug.startsWith('https://')) {
    return imageOrSlug;
  }
  if (productImageById[imageOrSlug]) {
    return productImageById[imageOrSlug];
  }
  if (productId && productImageById[productId]) {
    return productImageById[productId];
  }
  return '🍽️';
}
