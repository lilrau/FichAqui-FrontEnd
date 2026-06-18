import { Check, Clock, Package, XCircle, LucideIcon } from 'lucide-react';
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
  pending_payment: {
    label: 'Aguardando pagamento',
    description: 'Conclua o PIX para liberar suas fichas',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  payment_failed: {
    label: 'Pagamento falhou',
    description: 'O pedido foi registrado sem fichas',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
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
