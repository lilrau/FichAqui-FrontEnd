import { apiRequest } from '@/lib/api/client';
import { resolveProductImage } from '@/lib/catalog/product-images';
import type { AdminOrder } from '@/lib/types/admin-order';
import type { Ficha, MenuItem, Order, OrderStatus } from '@/lib/types/event-domain';
import type { ConsumerOrder, ConsumerOrderSummaryItem } from '@/lib/types/consumer-order';

export type ApiPaymentMethod = 'credit_card' | 'pix' | 'wallet';

export type CheckoutPaymentMethod = 'pix' | 'card' | 'wallet';

export function toApiPaymentMethod(method: CheckoutPaymentMethod): ApiPaymentMethod {
  if (method === 'card') return 'credit_card';
  return method;
}

export type CreateOrderItemPayload = {
  offeringId: string;
  variantId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  items: CreateOrderItemPayload[];
  paymentMethod: ApiPaymentMethod;
  cardId?: string | null;
};

interface ApiOrderSummaryItem {
  name: string;
  quantity: number;
  stallName: string;
}

interface ApiFicha {
  id: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  stallId: string;
  stallName: string;
  qrCode: string;
  status: OrderStatus;
}

interface ApiOrder {
  id: string;
  eventId: string;
  number: string;
  items: ApiOrderSummaryItem[] | { item: MenuItem; quantity: number }[];
  fichas?: ApiFicha[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  qrCode: string;
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

function normalizeSummaryItems(
  items: ApiOrder['items']
): ConsumerOrderSummaryItem[] {
  return items.map((entry) => {
    if ('name' in entry && 'stallName' in entry) {
      return {
        name: entry.name,
        quantity: entry.quantity,
        stallName: entry.stallName,
      };
    }

    const line = entry as { item: MenuItem; quantity: number };
    return {
      name: line.item.name,
      quantity: line.quantity,
      stallName: line.item.stallName,
    };
  });
}

export function normalizeConsumerOrder(dto: ApiOrder): ConsumerOrder {
  return {
    id: dto.id,
    eventId: dto.eventId,
    number: dto.number,
    summaryItems: normalizeSummaryItems(dto.items),
    total: dto.total,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    qrCode: dto.qrCode,
    fichas: (dto.fichas ?? []).map(normalizeFicha),
  };
}

export async function fetchUserPedidos(includeFichas = true): Promise<ConsumerOrder[]> {
  const query = includeFichas ? '?include_fichas=true' : '';
  const data = await apiRequest<ApiOrder[]>(`/api/user/pedidos${query}`, { auth: true });
  return data.map(normalizeConsumerOrder);
}

export async function fetchUserFichas(): Promise<Ficha[]> {
  const data = await apiRequest<ApiFicha[]>('/api/user/fichas', { auth: true });
  return data.map(normalizeFicha);
}

export function normalizeApiOrder(
  dto: ApiOrder,
  cartItems: { item: MenuItem; quantity: number }[],
  eventId: string
): Order {
  return {
    id: dto.id,
    eventId: dto.eventId ?? eventId,
    number: dto.number,
    items: cartItems,
    total: dto.total,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    qrCode: dto.qrCode,
    fichas: dto.fichas?.map(normalizeFicha),
  };
}

interface ApiAdminOrder extends ApiOrder {
  fichaCounts?: {
    available: number;
    delivered: number;
  };
}

export function normalizeAdminOrder(dto: ApiAdminOrder): AdminOrder {
  return {
    id: dto.id,
    eventId: dto.eventId,
    number: dto.number,
    status: dto.status,
    total: dto.total,
    createdAt: new Date(dto.createdAt),
    qrCode: dto.qrCode,
    items: normalizeSummaryItems(dto.items),
    fichaCounts: dto.fichaCounts,
  };
}

export async function fetchEventPedidos(eventId: string): Promise<AdminOrder[]> {
  const data = await apiRequest<ApiAdminOrder[]>(`/api/events/${eventId}/pedidos`, {
    auth: true,
  });
  return data.map(normalizeAdminOrder);
}

export async function createOrderApi(
  eventId: string,
  payload: CreateOrderPayload
): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/api/events/${eventId}/pedidos`, {
    method: 'POST',
    auth: true,
    body: payload,
  });
}
