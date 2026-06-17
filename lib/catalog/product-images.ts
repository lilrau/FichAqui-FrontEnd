export const PRODUCT_IMAGE_FALLBACK = '🍽️';

export function isImageUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

/** Pass-through for API image (URL or emoji). No local catalog lookup. */
export function resolveProductImage(imageOrSlug: string): string {
  if (!imageOrSlug?.trim()) return PRODUCT_IMAGE_FALLBACK;
  if (isImageUrl(imageOrSlug)) return imageOrSlug;
  return imageOrSlug;
}
