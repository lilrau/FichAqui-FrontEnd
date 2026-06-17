'use client';

import { AlertCircle, Share2 } from 'lucide-react';
import { Ficha } from '@/lib/mock-data';
import type { SavedPaymentCard } from '@/lib/types/wallet';
import { statusConfig } from '@/lib/order-status-config';
import { QrCodeMock } from '@/components/qr-code-mock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FichaCardProps {
  ficha: Ficha;
  compact?: boolean;
  excludedFromEvent?: boolean;
  eventName?: string;
}

export function FichaCard({
  ficha,
  compact = false,
  excludedFromEvent = false,
  eventName,
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
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{ficha.itemName}</p>
            <p className="text-xs text-muted-foreground truncate">{ficha.stallName}</p>
          </div>
        </div>
        {excludedFromEvent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-1 text-xs font-semibold shrink-0 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            De outro lugar
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

      {excludedFromEvent && eventName && (
        <p className="mt-3 text-sm text-muted-foreground">
          Esta ficha é de outro evento ou estabelecimento e não pode ser utilizada em{' '}
          <span className="font-medium text-foreground">{eventName}</span>
        </p>
      )}

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
