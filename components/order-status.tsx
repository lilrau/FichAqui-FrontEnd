'use client';

import { motion } from 'framer-motion';
import { Order } from '@/lib/mock-data';
import { statusConfig } from '@/lib/order-status-config';
import { QrCodeMock } from '@/components/qr-code-mock';
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
        Mostre esta ficha na barraca
      </h3>

      <QrCodeMock qrCode={order.qrCode} />

      <p className="mt-4 text-sm text-muted-foreground font-mono">
        {order.qrCode}
      </p>
    </motion.div>
  );
}
