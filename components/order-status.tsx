'use client';

import { motion } from 'framer-motion';
import { Check, Clock, ChefHat, Package } from 'lucide-react';
import { Order } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface OrderStatusProps {
  order: Order;
}

const statusConfig = {
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
    label: 'Pronto!',
    description: 'Retire seu pedido na barraca',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  delivered: {
    label: 'Entregue',
    description: 'Pedido entregue com sucesso',
    icon: Check,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
};

export function OrderStatus({ order }: OrderStatusProps) {
  const status = statusConfig[order.status];
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card p-6 shadow-md border border-border"
    >
      {/* Status Header */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={order.status === 'preparing' ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            status.bgColor
          )}
        >
          <Icon className={cn("h-7 w-7", status.color)} />
        </motion.div>
        <div>
          <h3 className={cn("text-xl font-bold", status.color)}>{status.label}</h3>
          <p className="text-sm text-muted-foreground">{status.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 flex items-center gap-2">
        {['pending', 'preparing', 'ready'].map((step, index) => {
          const isActive = ['pending', 'preparing', 'ready', 'delivered'].indexOf(order.status) >= index;
          return (
            <div key={step} className="flex-1">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={cn(
                  "h-2 rounded-full origin-left",
                  isActive ? "bg-primary" : "bg-border"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Order Number */}
      <div className="mt-6 rounded-xl bg-secondary p-4 text-center">
        <p className="text-sm text-muted-foreground">Número do pedido</p>
        <p className="text-3xl font-bold text-foreground">#{order.number}</p>
      </div>
    </motion.div>
  );
}

interface OrderQRCodeProps {
  order: Order;
}

export function OrderQRCode({ order }: OrderQRCodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-card p-6 shadow-md border border-border text-center"
    >
      <h3 className="font-bold text-lg text-card-foreground mb-4">
        Mostre este QR Code na barraca
      </h3>
      
      {/* Mock QR Code */}
      <div className="mx-auto w-48 h-48 bg-foreground rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute inset-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 49 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-sm",
                Math.random() > 0.4 ? "bg-background" : "bg-transparent"
              )}
            />
          ))}
        </div>
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-xl">
            🎪
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground font-mono">
        {order.qrCode}
      </p>
    </motion.div>
  );
}
