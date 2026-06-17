'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';

interface FichaQrCodeProps {
  qrCode: string;
  size?: 'sm' | 'md';
}

export function FichaQrCode({ qrCode, size = 'md' }: FichaQrCodeProps) {
  const [failed, setFailed] = useState(false);
  const dimension = size === 'sm' ? 128 : 192;

  if (failed || !qrCode.trim()) {
    return (
      <div className="rounded-xl bg-secondary p-4 text-center">
        <p className="text-xs font-medium text-muted-foreground mb-2">Código para retirada</p>
        <p className="text-sm font-mono break-all text-foreground select-all">{qrCode}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mx-auto rounded-2xl bg-white p-4 inline-flex',
        size === 'sm' ? 'max-w-[8rem]' : 'max-w-[12rem]'
      )}
    >
      <QRCode
        value={qrCode}
        size={dimension}
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  );
}
