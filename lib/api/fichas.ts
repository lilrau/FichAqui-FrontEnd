import { apiRequest } from '@/lib/api/client';
import { resolveProductImage } from '@/lib/catalog/product-images';
import type { Ficha } from '@/lib/types/event-domain';

interface ApiFicha {
  id: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  stallId: string;
  stallName: string;
  qrCode: string;
  status: Ficha['status'];
}

function normalizeFicha(dto: ApiFicha): Ficha {
  return {
    id: dto.id,
    orderId: dto.orderId,
    itemName: dto.itemName,
    itemImage: resolveProductImage(dto.itemImage),
    stallId: dto.stallId,
    stallName: dto.stallName,
    qrCode: dto.qrCode,
    status: dto.status,
  };
}

export async function lookupFichaByQr(qrCode: string): Promise<Ficha> {
  const query = encodeURIComponent(qrCode.trim());
  const data = await apiRequest<ApiFicha>(`/api/fichas?qr=${query}`, { auth: true });
  return normalizeFicha(data);
}

export async function consumeFicha(fichaId: string, qrCode: string): Promise<Ficha> {
  const query = encodeURIComponent(qrCode.trim());
  const data = await apiRequest<ApiFicha>(`/api/fichas/${fichaId}/consume?qr=${query}`, {
    method: 'POST',
    auth: true,
  });
  return normalizeFicha(data);
}
