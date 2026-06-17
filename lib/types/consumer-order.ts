import type { Ficha, OrderStatus } from '@/lib/types/event-domain';

export interface ConsumerOrderSummaryItem {
  name: string;
  quantity: number;
  stallName: string;
}

export interface ConsumerOrder {
  id: string;
  eventId: string;
  number: string;
  summaryItems: ConsumerOrderSummaryItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  qrCode: string;
  fichas: Ficha[];
}

export function getFichasFromConsumerOrder(order: ConsumerOrder): Ficha[] {
  if (order.fichas.length > 0) {
    return order.fichas;
  }
  return [];
}
