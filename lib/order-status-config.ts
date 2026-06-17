import { Check, Package, LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/lib/types/event-domain';

export const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
  }
> = {
  available: {
    label: 'Disponível',
    description: 'Retire seu pedido na barraca',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  delivered: {
    label: 'Entregue',
    description: 'Pedido entregue com sucesso',
    icon: Check,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
};
