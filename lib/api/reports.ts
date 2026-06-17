import { apiRequest } from '@/lib/api/client';
import { resolveProductImage } from '@/lib/catalog/product-images';
import type { EventReport } from '@/lib/types/event-report';

interface ApiEventReport extends EventReport {}

export async function fetchEventReport(eventId: string): Promise<EventReport> {
  const data = await apiRequest<ApiEventReport>(`/api/events/${eventId}/relatorios`, {
    auth: true,
  });
  return {
    ...data,
    topProducts: data.topProducts.map((product) => ({
      ...product,
      image: resolveProductImage(product.image),
    })),
  };
}
