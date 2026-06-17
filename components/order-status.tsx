'use client';

import { motion } from 'framer-motion';
import type { Order } from '@/lib/types/event-domain';
import { statusConfig } from '@/lib/order-status-config';
import { FichaQrCode } from '@/components/ficha-qr-code';
import { cn } from '@/lib/utils';

interface OrderStatusProps {
  order: Order;
}

export function OrderStatus({ order }: OrderStatusProps) {
  const status = statusConfig[order.status];
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card p-6 shadow-md border border-border"
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl',
            status.bgColor
          )}
        >
          <Icon className={cn('h-7 w-7', status.color)} />
        </div>
        <div>
          <h3 className={cn('text-xl font-bold', status.color)}>{status.label}</h3>
          <p className="text-sm text-muted-foreground">{status.description}</p>
        </div>
      </div>

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
  if (order.status === 'delivered') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-card p-6 shadow-md border border-border text-center"
    >
      <h3 className="font-bold text-lg text-card-foreground mb-4">
        Mostre esta ficha na barraca
      </h3>

      <FichaQrCode qrCode={order.qrCode} />

      <p className="mt-4 text-sm text-muted-foreground font-mono">
        {order.qrCode}
      </p>
    </motion.div>
  );
}
