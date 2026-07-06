'use client';

import { useState } from 'react';
import { PixPaymentPanel } from '@/components/payments/pix-payment-panel';
import { Button } from '@/components/ui/button';
import { topUpWallet, fetchWallet } from '@/lib/api/wallet';
import { hasPendingPix } from '@/lib/api/normalize-payment';
import { getErrorMessage } from '@/lib/api/errors';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import type { PaymentInfo } from '@/lib/types/payment';

interface WalletTopUpDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (balance: number) => void;
}

export function WalletTopUpDialog({
  open,
  onClose,
  onSuccess,
}: WalletTopUpDialogProps) {
  const { config } = usePaymentsConfig();
  const [amount, setAmount] = useState('50');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asyncPayment, setAsyncPayment] = useState<PaymentInfo | null>(null);

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount >= 1;
  const canUsePix = config.pixEnabled || config.topUpEnabled;

  if (!open) return null;

  const handleTopUp = async () => {
    if (!amountValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await topUpWallet({
        amount: parsedAmount,
        paymentMethod: 'pix',
      });

      if (hasPendingPix(result.payment)) {
        setAsyncPayment(result.payment);
        return;
      }

      if (result.payment.status === 'rejected') {
        throw new Error('Pagamento recusado.');
      }

      onSuccess(result.balance);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'N\u00e3o foi poss\u00edvel concluir a recarga.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (asyncPayment) {
    const panelProps = {
      payment: asyncPayment,
      approvedMessage: 'Atualizando sua carteira...',
      onApproved: () => {
        void (async () => {
          const wallet = await fetchWallet();
          onSuccess(wallet.balance);
          onClose();
        })();
      },
      onRejected: () => {
        setError('PIX expirado ou recusado.');
        setAsyncPayment(null);
      },
      onCancel: () => {
        setAsyncPayment(null);
        onClose();
      },
    };

    return (
      <div className="fixed inset-0 z-50 bg-background">
        <PixPaymentPanel {...panelProps} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Adicionar cr{'\u00e9'}ditos</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Valor (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-lg font-semibold"
              placeholder="50,00"
            />
          </div>

          {!canUsePix && (
            <p className="text-sm text-muted-foreground">
              Recarga indispon{'\u00ed'}vel at{'\u00e9'} o Mercado Pago ser configurado no backend.
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            disabled={submitting || !amountValid || !canUsePix}
            onClick={() => void handleTopUp()}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {submitting ? 'Gerando PIX...' : 'Pagar com PIX'}
          </Button>
        </div>
      </div>
    </div>
  );
}
