import { Check, Clock, ChefHat, Package, LucideIcon } from 'lucide-react';
import { OrderStatus } from '@/lib/mock-data';

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
  pending: {
    label: 'Aguardando',
    description: 'Seu pedido foi recebido',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  preparing: {
    label: 'Preparando',
    description: 'Seu pedido está sendo preparado',
    icon: ChefHat,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  ready: {
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
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
};
