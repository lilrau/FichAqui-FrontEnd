'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentStatusPoll } from '@/lib/hooks/use-payment-status-poll';
import type { PaymentInfo } from '@/lib/types/payment';

interface PixPaymentPanelProps {
  payment: PaymentInfo;
  onApproved: () => void;
  onRejected: () => void;
  onCancel: () => void;
}

export function PixPaymentPanel({
  payment,
  onApproved,
  onRejected,
  onCancel,
}: PixPaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const { payment: livePayment, isApproved, isRejected, error } = usePaymentStatusPoll(
    payment.id
  );

  const pix = livePayment?.pix ?? payment.pix;
  const copyPaste = pix?.copyPaste ?? '';

  useEffect(() => {
    if (isApproved) onApproved();
  }, [isApproved, onApproved]);

  useEffect(() => {
    if (isRejected) onRejected();
  }, [isRejected, onRejected]);

  const handleCopy = async () => {
    if (!copyPaste) return;
    try {
      await navigator.clipboard.writeText(copyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-foreground">Pague com PIX</h1>
            <p className="text-sm text-muted-foreground">
              Escaneie o QR code ou copie o código abaixo. Suas fichas serão liberadas após a
              confirmação.
            </p>
          </div>

          {pix?.qrCode && (
            <div className="flex justify-center rounded-2xl border border-border bg-card p-6">
              <img
                src={pix.qrCode.startsWith('data:') ? pix.qrCode : `data:image/png;base64,${pix.qrCode}`}
                alt="QR code PIX"
                className="h-48 w-48 object-contain"
              />
            </div>
          )}

          {copyPaste && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Pix copia e cola</p>
              <p className="break-all font-mono text-xs text-foreground">{copyPaste}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCopy()}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar código
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
            />
            Aguardando confirmação do pagamento…
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
            Voltar ao pagamento
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
