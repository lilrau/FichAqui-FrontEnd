'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw } from 'lucide-react';
import { useEventPedidos } from '@/lib/hooks/use-event-pedidos';
import { statusConfig } from '@/lib/order-status-config';
import { AdminSubpageHeader } from '@/components/admin/admin-subpage-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'available' | 'delivered';

export function PedidosBoard({ eventId }: { eventId: string }) {
  const { orders, loadError, loading, refreshing, hasNewOrders, refresh } =
    useEventPedidos(eventId);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    return `${minutes} min`;
  };

  const filterButtons: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'Todos', value: 'all', count: orders.length },
    {
      label: 'Disponível',
      value: 'available',
      count: orders.filter((order) => order.status === 'available').length,
    },
    {
      label: 'Entregue',
      value: 'delivered',
      count: orders.filter((order) => order.status === 'delivered').length,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <AdminSubpageHeader
          eventId={eventId}
          title="Pedidos"
          right={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative rounded-xl"
                onClick={() => void refresh()}
                disabled={refreshing}
                aria-label="Atualizar pedidos"
              >
                <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
                {hasNewOrders && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                )}
              </Button>
              <Bell
                className={cn(
                  'h-5 w-5',
                  hasNewOrders ? 'text-primary' : 'text-muted-foreground'
                )}
              />
            </div>
          }
        />

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
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
      </div>

      <main className="px-4 py-4 space-y-3">
        {loadError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {loading && orders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">Carregando pedidos…</div>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const status = statusConfig[order.status];
              const Icon = status.icon;

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
                    {order.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Itens não detalhados</p>
                    ) : (
                      order.items.map((item) => (
                        <div key={`${order.id}-${item.name}-${item.stallName}`} className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">{item.quantity}x</span>
                          <span className="text-muted-foreground">
                            {item.name}
                            <span className="text-xs"> · {item.stallName}</span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {order.fichaCounts && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Fichas: {order.fichaCounts.available} disponíveis ·{' '}
                      {order.fichaCounts.delivered} entregues
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-bold text-foreground">R$ {order.total.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">Somente leitura</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && filteredOrders.length === 0 && (
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
