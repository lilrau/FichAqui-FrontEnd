'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import '@/app/(consumer)/metodos-pagamento/payment-card.css';
import { InteractiveCreditCard, type CardHighlightField } from '@/components/interactive-credit-card';
import { Button } from '@/components/ui/button';
import {
  createMercadoPago,
  loadMercadoPagoSdk,
  type MercadoPagoCardForm,
} from '@/lib/mercadopago/load-sdk';
import type { CardTokenResult } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

export interface MpCardFormHandle {
  createToken: () => Promise<CardTokenResult>;
  isReady: () => boolean;
}

interface MpCardFormProps {
  publicKey: string;
  amount: string;
  className?: string;
  showSubmit?: boolean;
  submitLabel?: string;
  disabled?: boolean;
  onReadyChange?: (ready: boolean) => void;
  onError?: (message: string) => void;
  onToken?: (result: CardTokenResult) => Promise<void> | void;
}

export const MpCardForm = forwardRef<MpCardFormHandle, MpCardFormProps>(
  function MpCardForm(
    {
      publicKey,
      amount,
      className,
      showSubmit = false,
      submitLabel = 'Confirmar cartão',
      disabled = false,
      onReadyChange,
      onError,
      onToken,
    },
    ref
  ) {
    const uid = useId().replace(/:/g, '');
    const formId = `form-checkout-${uid}`;
    const cardFormRef = useRef<MercadoPagoCardForm | null>(null);
    const [ready, setReady] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [highlight, setHighlight] = useState<CardHighlightField>(null);
    const [flipped, setFlipped] = useState(false);

    const createToken = async (): Promise<CardTokenResult> => {
      if (!cardFormRef.current) {
        throw new Error('Formulário de cartão ainda não carregou.');
      }
      const result = await cardFormRef.current.createCardToken();
      const token = result.token;
      const paymentMethodId = result.paymentMethodId ?? result.payment_method_id;
      if (!token || !paymentMethodId) {
        throw new Error('Não foi possível tokenizar o cartão.');
      }
      return { token, paymentMethodId };
    };

    useImperativeHandle(ref, () => ({
      createToken,
      isReady: () => ready,
    }));

    useEffect(() => {
      onReadyChange?.(ready);
    }, [ready, onReadyChange]);

    useEffect(() => {
      let mounted = true;

      (async () => {
        try {
          await loadMercadoPagoSdk();
          if (!mounted) return;

          const mp = createMercadoPago(publicKey);
          const cardForm = mp.cardForm({
            amount,
            iframe: true,
            form: {
              id: formId,
              cardNumber: {
                id: `${formId}__cardNumber`,
                placeholder: 'Número do cartão',
              },
              expirationDate: {
                id: `${formId}__expirationDate`,
                placeholder: 'MM/AA',
              },
              securityCode: {
                id: `${formId}__securityCode`,
                placeholder: 'CVV',
              },
              cardholderName: {
                id: `${formId}__cardholderName`,
                placeholder: 'Nome no cartão',
              },
              issuer: {
                id: `${formId}__issuer`,
                placeholder: 'Banco emissor',
              },
              installments: {
                id: `${formId}__installments`,
                placeholder: 'Parcelas',
              },
              identificationType: {
                id: `${formId}__identificationType`,
                placeholder: 'Tipo de documento',
              },
              identificationNumber: {
                id: `${formId}__identificationNumber`,
                placeholder: 'Número do documento',
              },
            },
            callbacks: {
              onFormMounted: (error: unknown) => {
                if (!mounted) return;
                if (error) {
                  setReady(false);
                  onError?.('Não foi possível carregar o formulário de cartão.');
                  return;
                }
                setReady(true);
              },
              onValidityChange: (
                _error: unknown,
                field: { field?: string } | string
              ) => {
                const name = typeof field === 'string' ? field : field.field;
                if (name === 'cardNumber') setHighlight('number');
                else if (name === 'expirationDate') setHighlight('expire');
                else if (name === 'securityCode') {
                  setHighlight('cvv');
                  setFlipped(true);
                } else if (name === 'cardholderName') setHighlight('holder');
              },
            },
          });

          cardFormRef.current = cardForm;
        } catch {
          if (mounted) {
            onError?.('Mercado Pago indisponível no momento.');
          }
        }
      })();

      return () => {
        mounted = false;
        cardFormRef.current = null;
      };
    }, [publicKey, amount, formId, onError]);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (disabled || submitting || !onToken) return;

      setSubmitting(true);
      try {
        const tokenResult = await createToken();
        await onToken(tokenResult);
      } catch (err) {
        onError?.(
          err instanceof Error ? err.message : 'Não foi possível validar o cartão.'
        );
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form
        id={formId}
        onSubmit={(event) => void handleSubmit(event)}
        className={cn('space-y-4', className)}
      >
        <div className="payment-card-shell pointer-events-none">
          <InteractiveCreditCard
            numberDigits=""
            holderName=""
            expiryMonth=""
            expiryYear=""
            cvv=""
            highlight={highlight}
            flipped={flipped}
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Número do cartão
            </label>
            <div id={`${formId}__cardNumber`} className="mp-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Validade
              </label>
              <div id={`${formId}__expirationDate`} className="mp-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                CVV
              </label>
              <div id={`${formId}__securityCode`} className="mp-field" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Titular
            </label>
            <div id={`${formId}__cardholderName`} className="mp-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Tipo de documento
              </label>
              <div id={`${formId}__identificationType`} className="mp-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Documento
              </label>
              <div id={`${formId}__identificationNumber`} className="mp-field" />
            </div>
          </div>
          <div className="hidden">
            <div id={`${formId}__issuer`} />
            <div id={`${formId}__installments`} />
          </div>
        </div>

        {showSubmit && (
          <Button
            type="submit"
            disabled={!ready || disabled || submitting}
            className="h-12 w-full rounded-xl font-semibold"
          >
            {submitting ? 'Validando…' : submitLabel}
          </Button>
        )}
      </form>
    );
  }
);
