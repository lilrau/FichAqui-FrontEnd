'use client';

import { AlertCircle, Share2 } from 'lucide-react';
import { Ficha } from '@/lib/mock-data';
import { statusConfig } from '@/lib/order-status-config';
import { QrCodeMock } from '@/components/qr-code-mock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FichaCardProps {
  ficha: Ficha;
  compact?: boolean;
  excludedFromEvent?: boolean;
}

export function FichaCard({
  ficha,
  compact = false,
  excludedFromEvent = false,
}: FichaCardProps) {
  const status = statusConfig[ficha.status];
  const StatusIcon = status.icon;
  const isDelivered = ficha.status === 'delivered';
  const showQr = !isDelivered && !excludedFromEvent;

  return (
    <div
      className={cn(
        'rounded-xl bg-secondary/50 p-4 border border-border',
        excludedFromEvent && 'opacity-90'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{ficha.itemImage}</span>
          <p className="font-semibold text-foreground truncate">{ficha.itemName}</p>
        </div>
        {excludedFromEvent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs font-semibold shrink-0 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            Não faz parte desse evento
          </span>
        ) : (
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
        )}
      </div>

      {showQr && (
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
