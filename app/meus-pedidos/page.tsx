'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { getFichasFromOrder, Order } from '@/lib/mock-data';
import { statusConfig } from '@/lib/order-status-config';
import { FichaCard } from '@/components/ficha-card';

const mockOrders: Order[] = [
  {
    id: 'order-1',
    number: '1234',
    items: [
      { item: { id: 'pastel-carne', productId: 'pastel', name: 'Pastel — Carne', description: '', price: 8, category: 'comidas', estimatedTime: '5min', image: '🥟', available: true, stallId: '1' }, quantity: 2 },
      { item: { id: 'milho-verde-unidade', productId: 'milho-verde', name: 'Milho Verde', description: '', price: 6, category: 'comidas', estimatedTime: '3min', image: '🌽', available: true, stallId: '2' }, quantity: 1 },
    ],
    total: 22,
    status: 'ready',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    qrCode: 'QR-12345',
  },
  {
    id: 'order-2',
    number: '1189',
    items: [
      { item: { id: 'quentao-copo', productId: 'quentao', name: 'Quentão', description: '', price: 6, category: 'bebidas', estimatedTime: '2min', image: '🍵', available: true, stallId: '4' }, quantity: 2 },
    ],
    total: 12,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    qrCode: 'QR-67890',
  },
  {
    id: 'order-3',
    number: '1156',
    items: [
      { item: { id: 'maca-amor-unidade', productId: 'maca-amor', name: 'Maçã do Amor', description: '', price: 8, category: 'doces', estimatedTime: '2min', image: '🍎', available: true, stallId: '3' }, quantity: 3 },
      { item: { id: 'bingo-cartela', productId: 'bingo', name: 'Cartela de Bingo', description: '', price: 5, category: 'brincadeiras', estimatedTime: '30min', image: '🎱', available: true, stallId: '6' }, quantity: 2 },
    ],
    total: 34,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    qrCode: 'QR-11111',
  },
];

export default function MeusPedidosPage() {
  const router = useRouter();
  const { orders: cartOrders } = useCart();
  const orders = cartOrders.length > 0 ? cartOrders : mockOrders;
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push('/cardapio')}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Meus Pedidos</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6">
        {orders.length === 0 ? (
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
            {orders.map((order, index) => {
              const status = statusConfig[order.status];
              const Icon = status.icon;
              const fichas = getFichasFromOrder(order);
              const isExpanded = expandedOrderId === order.id;

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
                    {order.items.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-lg">{cartItem.item.image}</span>
                        <span className="text-muted-foreground">
                          {cartItem.quantity}x {cartItem.item.name}
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

                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {fichas.map((ficha) => (
                        <FichaCard key={ficha.id} ficha={ficha} compact />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
