'use client';

import { useEffect, useRef, useState } from 'react';
import type { CardPaymentType } from '@/lib/types/payment';
import { PendingPaymentPanel } from '@/components/payments/pending-payment-panel';
import { PixPaymentPanel } from '@/components/payments/pix-payment-panel';
import { MpCardForm, type MpCardFormHandle } from '@/components/payments/mp-card-form';
import { Button } from '@/components/ui/button';
import { CardBrandLogo } from '@/components/card-brand-logo';
import { topUpWallet, fetchWallet } from '@/lib/api/wallet';
import { hasPendingCardPayment, hasPendingPix } from '@/lib/api/normalize-payment';
import { getErrorMessage } from '@/lib/api/errors';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import type { PaymentInfo } from '@/lib/types/payment';
import type { SavedPaymentCard } from '@/lib/types/wallet';
import { cn } from '@/lib/utils';

interface WalletTopUpDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (balance: number) => void;
  savedCards: SavedPaymentCard[];
  defaultCardId?: string;
}

type TopUpMethod = 'pix' | 'card';
type CardMode = 'saved' | 'new';

export function WalletTopUpDialog({
  open,
  onClose,
  onSuccess,
  savedCards,
  defaultCardId,
}: WalletTopUpDialogProps) {
  const { config } = usePaymentsConfig();
  const mpFormRef = useRef<MpCardFormHandle>(null);
  const [amount, setAmount] = useState('50');
  const [method, setMethod] = useState<TopUpMethod>('pix');
  const [cardMode, setCardMode] = useState<CardMode>('saved');
  const [selectedCardId, setSelectedCardId] = useState(defaultCardId ?? '');
  const [saveCard, setSaveCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asyncPayment, setAsyncPayment] = useState<PaymentInfo | null>(null);

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount >= 1;
  const mpEnabled = config.enabled && Boolean(config.publicKey);
  const canUsePix = config.pixEnabled;
  const canUseCard = config.cardEnabled && mpEnabled;
  const canUseSavedCard = canUseCard && savedCards.length > 0 && !mpEnabled;

  useEffect(() => {
    if (!open) return;
    if (mpEnabled || savedCards.length === 0) {
      setCardMode('new');
    } else {
      setCardMode('saved');
    }
  }, [open, mpEnabled, savedCards.length]);

  useEffect(() => {
    if (mpEnabled) {
      setSaveCard(false);
    }
  }, [mpEnabled]);

  if (!open) return null;

  const handleTopUp = async (
    cardToken?: string,
    paymentMethodId?: string,
    paymentMethodType?: CardPaymentType,
    installments = 1
  ) => {
    if (!amountValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await topUpWallet({
        amount: parsedAmount,
        paymentMethod: method === 'pix' ? 'pix' : 'credit_card',
        cardId: method === 'card' && cardMode === 'saved' ? selectedCardId : null,
        cardToken: cardToken ?? null,
        paymentMethodId: paymentMethodId ?? null,
        paymentMethodType: paymentMethodType ?? null,
        installments,
        saveCard: method === 'card' && cardMode === 'new' && !mpEnabled ? saveCard : false,
      });

      if (hasPendingPix(result.payment)) {
        setAsyncPayment(result.payment);
        return;
      }

      if (hasPendingCardPayment(result.payment)) {
        setAsyncPayment(result.payment);
        return;
      }

      if (result.payment.status === 'rejected') {
        throw new Error('Pagamento recusado.');
      }

      onSuccess(result.balance);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível concluir a recarga.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (method === 'card' && cardMode === 'new') {
      if (!mpFormRef.current?.isReady()) {
        setError('Aguarde o formulário de cartão carregar.');
        return;
      }
      try {
        setSubmitting(true);
        const token = await mpFormRef.current.createToken();
        await handleTopUp(
          token.token,
          token.paymentMethodId,
          token.paymentMethodType,
          token.installments
        );
      } catch (err) {
        setError(getErrorMessage(err, 'Não foi possível validar o cartão.'));
        setSubmitting(false);
      }
      return;
    }

    await handleTopUp();
  };

  if (asyncPayment) {
    const panelProps = {
      payment: asyncPayment,
      approvedMessage: 'Atualizando sua carteira?',
      onApproved: () => {
        void (async () => {
          const wallet = await fetchWallet();
          onSuccess(wallet.balance);
          onClose();
        })();
      },
      onRejected: () => {
        setError(
          hasPendingPix(asyncPayment)
            ? 'PIX expirado ou recusado.'
            : 'Pagamento recusado ou não confirmado.'
        );
        setAsyncPayment(null);
      },
      onCancel: () => {
        setAsyncPayment(null);
        onClose();
      },
    };

    return (
      <div className="fixed inset-0 z-50 bg-background">
        {hasPendingPix(asyncPayment) ? (
          <PixPaymentPanel {...panelProps} />
        ) : (
          <PendingPaymentPanel
            {...panelProps}
            title="Confirmando recarga"
            message="Estamos aguardando a confirmação do seu cartão. O saldo será creditado assim que o pagamento for aprovado."
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Adicionar créditos</h2>
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Forma de pagamento</p>
            {canUsePix && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
                <input
                  type="radio"
                  checked={method === 'pix'}
                  onChange={() => setMethod('pix')}
                  className="accent-primary"
                />
                <span>PIX</span>
              </label>
            )}
            {canUseCard && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
                <input
                  type="radio"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="accent-primary"
                />
                <span>Cartão de crédito</span>
              </label>
            )}
            {!canUsePix && !canUseCard && (
              <p className="text-sm text-muted-foreground">
                Recarga indisponível até o Mercado Pago ser configurado no backend.
              </p>
            )}
          </div>

          {method === 'card' && canUseCard && (
            <div className="space-y-3">
              {savedCards.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={mpEnabled}
                      onClick={() => setCardMode('saved')}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-sm',
                        cardMode === 'saved' && 'border-primary bg-primary/5',
                        mpEnabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      Cartão salvo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardMode('new')}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-sm',
                        cardMode === 'new' && 'border-primary bg-primary/5'
                      )}
                    >
                      Novo cartão
                    </button>
                  </div>
                  {mpEnabled && (
                    <p className="text-xs text-muted-foreground">
                      Cartão salvo: disponível em breve.
                    </p>
                  )}
                </div>
              )}

              {cardMode === 'saved' && canUseSavedCard ? (
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <label
                      key={card.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3',
                        selectedCardId === card.id && 'border-primary bg-primary/5'
                      )}
                    >
                      <input
                        type="radio"
                        checked={selectedCardId === card.id}
                        onChange={() => setSelectedCardId(card.id)}
                        className="accent-primary"
                      />
                      <CardBrandLogo brand={card.brand} className="h-8 w-12" />
                      <span className="font-mono text-sm">•••• {card.lastFour}</span>
                    </label>
                  ))}
                </div>
              ) : config.publicKey ? (
                <>
                  <MpCardForm
                    ref={mpFormRef}
                    publicKey={config.publicKey}
                    amount={amountValid ? parsedAmount.toFixed(2) : '1.00'}
                    onError={setError}
                  />
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        disabled={mpEnabled}
                        onChange={(event) => setSaveCard(event.target.checked)}
                        className="accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      Salvar cartão para próximas compras
                    </label>
                    {mpEnabled && (
                      <p className="text-xs text-muted-foreground">Disponível em breve.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            disabled={submitting || !amountValid || (!canUsePix && !canUseCard)}
            onClick={() => void handleConfirm()}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {submitting ? 'Processando…' : 'Confirmar recarga'}
          </Button>
        </div>
      </div>
    </div>
  );
}
