'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Bell } from 'lucide-react';
import { Order } from '@/lib/mock-data';
import { statusConfig } from '@/lib/order-status-config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const generateMockOrders = (eventId: string): Order[] => [
  {
    id: 'adm-1',
    eventId,
    number: '1247',
    items: [],
    total: 34,
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 1),
    qrCode: 'QR-1',
  },
  {
    id: 'adm-2',
    eventId,
    number: '1246',
    items: [],
    total: 48,
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 3),
    qrCode: 'QR-2',
  },
  {
    id: 'adm-3',
    eventId,
    number: '1245',
    items: [],
    total: 20,
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    qrCode: 'QR-3',
  },
  {
    id: 'adm-4',
    eventId,
    number: '1244',
    items: [],
    total: 12,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    qrCode: 'QR-4',
  },
  {
    id: 'adm-5',
    eventId,
    number: '1243',
    items: [],
    total: 25,
    status: 'available',
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
    qrCode: 'QR-5',
  },
];

type StatusFilter = 'all' | 'available' | 'delivered';

export default function AdminPedidosPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const [orders, setOrders] = useState<Order[]>(() => generateMockOrders(eventId));
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 3000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  const updateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const getNextStatus = (current: Order['status']): Order['status'] | null => {
    if (current === 'available') return 'delivered';
    return null;
  };

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    return `${minutes} min`;
  };

  const filterButtons: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'Todos', value: 'all', count: orders.length },
    {
      label: 'Disponível',
      value: 'available',
      count: orders.filter((o) => o.status === 'available').length,
    },
    {
      label: 'Entregue',
      value: 'delivered',
      count: orders.filter((o) => o.status === 'delivered').length,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push(`/admin/${eventId}`)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Pedidos</h1>
          <div className="relative">
            <Bell
              className={cn(
                'h-5 w-5',
                newOrderAlert ? 'text-primary animate-bounce' : 'text-muted-foreground'
              )}
            />
            {newOrderAlert && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
            )}
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                filter === btn.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {btn.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-xs',
                  filter === btn.value ? 'bg-primary-foreground/20' : 'bg-foreground/10'
                )}
              >
                {btn.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        <AnimatePresence>
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status];
            const Icon = status.icon;
            const nextStatus = getNextStatus(order.status);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                layout
                className="rounded-2xl bg-card p-4 shadow-sm border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        status.bgColor
                      )}
                    >
                      <Icon className={cn('h-6 w-6', status.color)} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">#{order.number}</p>
                      <p className="text-xs text-muted-foreground">
                        há {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium',
                      status.bgColor,
                      status.color
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  {order.items.map((cartItem) => (
                    <div key={cartItem.item.id} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{cartItem.item.image}</span>
                      <span className="font-medium text-foreground">{cartItem.quantity}x</span>
                      <span className="text-muted-foreground">{cartItem.item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-bold text-foreground">R$ {order.total.toFixed(2)}</span>
                  {nextStatus && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, nextStatus)}
                      className="rounded-xl"
                    >
                      Confirmar entrega
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
              📋
            </div>
            <p className="mt-4 font-semibold text-foreground">Nenhum pedido</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Não há pedidos com este filtro
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
