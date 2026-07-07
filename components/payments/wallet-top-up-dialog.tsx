'use client';

import { useEffect, useRef, useState } from 'react';
import { PixPaymentPanel } from '@/components/payments/pix-payment-panel';
import { PendingPaymentPanel } from '@/components/payments/pending-payment-panel';
import { MpCardForm, type MpCardFormHandle } from '@/components/payments/mp-card-form';
import { MpSavedCardForm, type MpSavedCardFormHandle } from '@/components/payments/mp-saved-card-form';
import { CardBrandLogo } from '@/components/card-brand-logo';
import { Button } from '@/components/ui/button';
import { topUpWallet, fetchWallet } from '@/lib/api/wallet';
import { hasPendingPix, hasPendingCardPayment } from '@/lib/api/normalize-payment';
import { getErrorMessage } from '@/lib/api/errors';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import { useWallet } from '@/lib/wallet-context';
import type { CardPaymentType, PaymentInfo } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

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
  const { savedCards, defaultCard, refreshWallet } = useWallet();
  const mpFormRef = useRef<MpCardFormHandle>(null);
  const savedCardFormRef = useRef<MpSavedCardFormHandle>(null);

  const [amount, setAmount] = useState('50');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asyncPayment, setAsyncPayment] = useState<PaymentInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [cardMode, setCardMode] = useState<'saved' | 'new'>('saved');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [mpFormReady, setMpFormReady] = useState(false);
  const [savedCardFormReady, setSavedCardFormReady] = useState(false);

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount >= 1;
  const mpEnabled = config.enabled && Boolean(config.publicKey);
  const pixEnabled = config.pixEnabled || config.topUpEnabled;
  const cardEnabled = config.cardEnabled && (mpEnabled || savedCards.length > 0);
  const canUseSavedCard = savedCards.length > 0;

  useEffect(() => {
    if (defaultCard) {
      setSelectedCardId(defaultCard.id);
    } else if (savedCards[0]) {
      setSelectedCardId(savedCards[0].id);
    }
  }, [defaultCard, savedCards]);

  useEffect(() => {
    if (savedCards.length === 0) {
      setCardMode('new');
    } else {
      setCardMode('saved');
    }
  }, [savedCards.length]);

  const canPay =
    amountValid &&
    (paymentMethod === 'pix'
      ? pixEnabled
      : cardMode === 'saved'
        ? canUseSavedCard && Boolean(selectedCardId) && (!mpEnabled || savedCardFormReady)
        : (!mpEnabled || (mpEnabled && mpFormReady)));

  if (!open) return null;

  const handleTopUp = async () => {
    if (!canPay) return;
    setSubmitting(true);
    setError(null);

    try {
      let cardToken: string | undefined;
      let paymentMethodId: string | undefined;
      let paymentMethodType: CardPaymentType | undefined;
      let installments = 1;

      if (paymentMethod === 'card') {
        if (cardMode === 'new' && mpEnabled) {
          const tokenResult = await mpFormRef.current?.createToken();
          if (!tokenResult) {
            throw new Error('Formulário de cartão indisponível.');
          }
          cardToken = tokenResult.token;
          paymentMethodId = tokenResult.paymentMethodId;
          paymentMethodType = tokenResult.paymentMethodType;
          installments = tokenResult.installments;
        } else if (cardMode === 'saved' && mpEnabled) {
          const token = await savedCardFormRef.current?.createToken();
          if (!token) {
            throw new Error('Não foi possível validar o CVV do cartão.');
          }
          cardToken = token;
        }
      }

      const result = await topUpWallet({
        amount: parsedAmount,
        paymentMethod: paymentMethod === 'pix' ? 'pix' : 'credit_card',
        cardId: paymentMethod === 'card' && cardMode === 'saved' ? selectedCardId : null,
        cardToken: cardToken ?? null,
        paymentMethodId: paymentMethodId ?? null,
        paymentMethodType: paymentMethodType ?? null,
        installments,
        saveCard: paymentMethod === 'card' && cardMode === 'new' ? saveCard : false,
      });

      if (hasPendingPix(result.payment) || hasPendingCardPayment(result.payment)) {
        setAsyncPayment(result.payment);
        return;
      }

      if (result.payment.status === 'rejected') {
        throw new Error('Pagamento recusado.');
      }

      await refreshWallet();
      onSuccess(result.balance);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível concluir a recarga.'));
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
          await refreshWallet();
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
          <PendingPaymentPanel {...panelProps} />
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

        <div className="space-y-6">
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

          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Forma de pagamento
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                disabled={!pixEnabled}
                className={cn(
                  'flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors',
                  paymentMethod === 'pix'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                  !pixEnabled && 'cursor-not-allowed opacity-50'
                )}
              >
                PIX
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                disabled={!cardEnabled}
                className={cn(
                  'flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors',
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                  !cardEnabled && 'cursor-not-allowed opacity-50'
                )}
              >
                Cartão de crédito
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-4">
                {savedCards.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCardMode('saved');
                        setSavedCardFormReady(false);
                      }}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        cardMode === 'saved'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      Cartão salvo ({savedCards.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardMode('new')}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        cardMode === 'new'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      Novo cartão
                    </button>
                  </div>
                )}

                {cardMode === 'saved' && canUseSavedCard ? (
                  <div className="space-y-3">
                    {savedCards.map((card) => {
                      const selected = selectedCardId === card.id;
                      return (
                        <div
                          key={card.id}
                          className={cn(
                            'rounded-xl border transition-all',
                            selected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border bg-background hover:border-border/80'
                          )}
                        >
                          <label className="flex cursor-pointer items-center gap-3 p-3">
                            <input
                              type="radio"
                              name="topup-payment-card"
                              checked={selected}
                              onChange={() => {
                                setSelectedCardId(card.id);
                                setSavedCardFormReady(false);
                              }}
                              className="h-4 w-4 accent-primary"
                            />
                            <CardBrandLogo brand={card.brand} className="h-8 w-12 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-sm font-medium text-foreground">
                                •••• {card.lastFour}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {card.holderName}
                              </p>
                            </div>
                            {card.isDefault && (
                              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                Padrão
                              </span>
                            )}
                          </label>
                          {selected && mpEnabled && config.publicKey && (
                            <div className="border-t border-primary/10 bg-background/60 px-3 py-3 rounded-b-xl space-y-1.5">
                              <label className="text-xs font-semibold text-foreground">
                                Código de segurança (CVV)
                              </label>
                              <div className="max-w-[180px]">
                                <MpSavedCardForm
                                  key={card.id}
                                  ref={savedCardFormRef}
                                  publicKey={config.publicKey}
                                  card={card}
                                  onReadyChange={setSavedCardFormReady}
                                  onError={setError}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : mpEnabled && config.publicKey ? (
                  <div className="space-y-4">
                    <MpCardForm
                      ref={mpFormRef}
                      publicKey={config.publicKey}
                      amount={amountValid ? parsedAmount.toFixed(2) : '1.00'}
                      showInstallments={false}
                      onReadyChange={setMpFormReady}
                      onError={setError}
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(event) => setSaveCard(event.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      Salvar cartão para próximas compras
                    </label>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cartões indisponíveis ou Mercado Pago não configurado.
                  </p>
                )}
              </div>
            )}
          </div>

          {!pixEnabled && !cardEnabled && (
            <p className="text-sm text-muted-foreground">
              Nenhuma forma de pagamento disponível no momento.
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            disabled={submitting || !canPay}
            onClick={() => void handleTopUp()}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {submitting
              ? 'Processando...'
              : paymentMethod === 'pix'
                ? 'Pagar com PIX'
                : 'Pagar com Cartão'}
          </Button>
        </div>
      </div>
    </div>
  );
}
