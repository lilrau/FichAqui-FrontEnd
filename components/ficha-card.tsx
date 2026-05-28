'use client';

import { Share2 } from 'lucide-react';
import { Ficha } from '@/lib/mock-data';
import { statusConfig } from '@/lib/order-status-config';
import { QrCodeMock } from '@/components/qr-code-mock';
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

  return (
    <div className="rounded-xl bg-secondary/50 p-4 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{ficha.itemImage}</span>
          <p className="font-semibold text-foreground truncate">{ficha.itemName}</p>
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

      {!isDelivered && (
        <>
          <div className={cn('mt-4 text-center', compact && 'mt-3')}>
            <QrCodeMock qrCode={ficha.qrCode} size={compact ? 'sm' : 'md'} />
            <p className="mt-3 text-xs text-muted-foreground font-mono break-all">{ficha.qrCode}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full rounded-xl"
            onClick={() => {}}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </>
      )}
    </div>
  );
}
