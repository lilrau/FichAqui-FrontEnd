import { apiRequest } from '@/lib/api/client';
import { normalizeCatalogProduct, normalizeCategory } from '@/lib/api/normalize';
import type { CatalogProduct, Category } from '@/lib/types/event-domain';

export interface CatalogResponse {
  categories: Category[];
  catalogProducts: CatalogProduct[];
}

export async function fetchCatalog(): Promise<CatalogResponse> {
  const data = await apiRequest<CatalogResponse>('/api/catalog');
  return {
    categories: data.categories.map(normalizeCategory),
    catalogProducts: data.catalogProducts.map(normalizeCatalogProduct),
  };
}
