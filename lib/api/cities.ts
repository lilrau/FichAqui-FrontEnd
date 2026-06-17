import { apiRequest } from '@/lib/api/client';
import type { City } from '@/lib/types/city';

export async function fetchCities(): Promise<City[]> {
  return apiRequest<City[]>('/api/cities');
}
