'use client';

import { Share2 } from 'lucide-react';
import type { Ficha } from '@/lib/types/event-domain';
import { statusConfig } from '@/lib/order-status-config';
import { FichaQrCode } from '@/components/ficha-qr-code';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FichaCardProps {
  ficha: Ficha;
  compact?: boolean;
}

export function FichaCard({ ficha, compact = false }: FichaCardProps) {
  const status = statusConfig[ficha.status];
  const StatusIcon = status.icon;
  const isDelivered = ficha.status === 'delivered';
  const showQr = !isDelivered;

  return (
    <div className="rounded-xl bg-secondary/50 p-4 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ProductImage
            src={ficha.itemImage}
            alt={ficha.itemName}
            emojiClassName="text-xl"
            className="h-8 w-8 rounded-lg"
          />
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{ficha.itemName}</p>
            <p className="text-xs text-muted-foreground truncate">{ficha.stallName}</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0',
            status.bgColor,
            status.color
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>

      {showQr && (
        <>
          <div className={cn('mt-4 text-center', compact && 'mt-3')}>
            <FichaQrCode qrCode={ficha.qrCode} size={compact ? 'sm' : 'md'} />
            <p className="mt-3 text-xs text-muted-foreground font-mono break-all select-all">
              {ficha.qrCode}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full rounded-xl"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ text: ficha.qrCode });
              } else {
                void navigator.clipboard.writeText(ficha.qrCode);
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </>
      )}
    </div>
  );
}
