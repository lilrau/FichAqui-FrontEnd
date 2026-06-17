import type { OrderStatus } from '@/lib/types/event-domain';
import type { ConsumerOrderSummaryItem } from '@/lib/types/consumer-order';

export interface AdminOrder {
  id: string;
  eventId: string;
  number: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  qrCode: string;
  items: ConsumerOrderSummaryItem[];
  fichaCounts?: {
    available: number;
    delivered: number;
  };
}
