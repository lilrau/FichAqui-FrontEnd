'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useConsumerEventId } from '@/lib/consumer-scope';
import { getFichasFromConsumerOrder } from '@/lib/types/consumer-order';
import { useUserOrders } from '@/lib/user-orders-context';
import { statusConfig } from '@/lib/order-status-config';
import { FichaCard } from '@/components/ficha-card';

export default function HistoricoPage() {
  const { isAuthenticated } = useAuth();
  const eventId = useConsumerEventId();
  const { orders, loadError, hydrated, getOrdersByEventId } = useUserOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const visibleOrders = eventId ? getOrdersByEventId(eventId) : orders;

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId((current) => (current === orderId ? null : orderId));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <h1 className="font-bold text-foreground text-lg">Histórico</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-semibold text-foreground">Entre para ver seu histórico</p>
          </div>
        ) : !hydrated ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : loadError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        ) : visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
              📋
            </div>
            <p className="mt-4 font-semibold text-foreground">Nenhum pedido ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seus pedidos aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order, index) => {
              const status = statusConfig[order.status];
              const Icon = status.icon;
              const fichas = getFichasFromConsumerOrder(order);
              const isDelivered = order.status === 'delivered';
              const isExpanded = !isDelivered && expandedOrderId === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl bg-card p-4 shadow-md border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${status.bgColor}`}>
                        <Icon className={`h-5 w-5 ${status.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Pedido #{order.number}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.summaryItems.map((item) => (
                      <div
                        key={`${order.id}-${item.name}-${item.stallName}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-lg">🎫</span>
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                          <span className="text-xs"> · {item.stallName}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>

                  {isDelivered ? (
                    <p className="mt-4 w-full rounded-xl bg-secondary px-4 py-3 text-center text-sm font-semibold text-muted-foreground">
                      Todas as fichas já resgatadas
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleOrder(order.id)}
                      className="mt-4 w-full flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground"
                    >
                      <span>
                        {isExpanded ? 'Ocultar fichas' : `Ver fichas (${fichas.length})`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`fichas-${order.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          {fichas.map((ficha, fichaIndex) => (
                            <motion.div
                              key={ficha.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: fichaIndex * 0.05,
                                duration: 0.22,
                                ease: [0.4, 0, 0.2, 1],
                              }}
                            >
                              <FichaCard ficha={ficha} compact />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
