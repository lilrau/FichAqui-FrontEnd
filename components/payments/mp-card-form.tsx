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
import {
  InteractiveCreditCard,
  type CardHighlightField,
} from '@/components/interactive-credit-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createMercadoPago,
  loadMercadoPagoSdk,
  type MpIdentificationType,
  type MpInstallmentOption,
  type MpIssuer,
  type MpPaymentMethod,
  type MpSecureField,
} from '@/lib/mercadopago/load-sdk';
import type { CardPaymentType, CardTokenResult } from '@/lib/types/payment';
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
  showInstallments?: boolean;
  submitLabel?: string;
  disabled?: boolean;
  onReadyChange?: (ready: boolean) => void;
  onError?: (message: string) => void;
  onToken?: (result: CardTokenResult) => Promise<void> | void;
}

const inputClassName = 'h-11 rounded-xl';
const TOKEN_TIMEOUT_MS = 30_000;

const CARD_PAYMENT_TYPES = new Set<CardPaymentType>(['credit_card', 'debit_card']);

function normalizeCardPaymentType(value: string | undefined): CardPaymentType {
  if (value && CARD_PAYMENT_TYPES.has(value as CardPaymentType)) {
    return value as CardPaymentType;
  }
  return 'credit_card';
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export const MpCardForm = forwardRef<MpCardFormHandle, MpCardFormProps>(
  function MpCardForm(
    {
      publicKey,
      amount,
      className,
      showSubmit = false,
      showInstallments = true,
      submitLabel = 'Confirmar cartão',
      disabled = false,
      onReadyChange,
      onError,
      onToken,
    },
    ref
  ) {
    const uid = useId().replace(/:/g, '');
    const cardNumberMountId = `mp-card-number-${uid}`;
    const expirationMountId = `mp-card-expiry-${uid}`;
    const securityMountId = `mp-card-cvv-${uid}`;

    const cardNumberMountRef = useRef<HTMLDivElement>(null);
    const expirationMountRef = useRef<HTMLDivElement>(null);
    const securityMountRef = useRef<HTMLDivElement>(null);

    const mpRef = useRef<ReturnType<typeof createMercadoPago> | null>(null);
    const paymentMethodIdRef = useRef('');
    const paymentTypeIdRef = useRef('credit_card');
    const currentBinRef = useRef('');

    const [ready, setReady] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [holderCpf, setHolderCpf] = useState('');
    const [holderName, setHolderName] = useState('');
    const [identificationType, setIdentificationType] = useState('CPF');
    const [identificationTypes, setIdentificationTypes] = useState<MpIdentificationType[]>([]);
    const [issuers, setIssuers] = useState<MpIssuer[]>([]);
    const [selectedIssuerId, setSelectedIssuerId] = useState('');
    const [issuerRequired, setIssuerRequired] = useState(false);
    const [installmentOptions, setInstallmentOptions] = useState<MpInstallmentOption[]>([]);
    const [selectedInstallments, setSelectedInstallments] = useState(1);
    const [paymentTypeId, setPaymentTypeId] = useState<CardPaymentType>('credit_card');
    const [cardHighlight, setCardHighlight] = useState<CardHighlightField>(null);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [displayDigits, setDisplayDigits] = useState('');
    const [cvv, setCvv] = useState('');

    const clearIssuerAndInstallments = () => {
      setIssuers([]);
      setSelectedIssuerId('');
      setIssuerRequired(false);
      setInstallmentOptions([]);
      setSelectedInstallments(1);
      paymentTypeIdRef.current = 'credit_card';
      setPaymentTypeId('credit_card');
    };

    const updateIssuer = async (
      mp: ReturnType<typeof createMercadoPago>,
      paymentMethod: MpPaymentMethod,
      bin: string
    ) => {
      const additional = paymentMethod.additional_info_needed ?? [];
      const needsIssuer = additional.includes('issuer_id');
      let issuerOptions: MpIssuer[] = [];

      if (paymentMethod.issuer) {
        issuerOptions = [paymentMethod.issuer];
      }

      if (needsIssuer) {
        issuerOptions = await mp.getIssuers({
          paymentMethodId: paymentMethod.id,
          bin,
        });
      }

      setIssuerRequired(needsIssuer);
      setIssuers(issuerOptions);
      if (issuerOptions.length === 1) {
        setSelectedIssuerId(String(issuerOptions[0].id));
      } else {
        setSelectedIssuerId('');
      }
    };

    const updateInstallments = async (
      mp: ReturnType<typeof createMercadoPago>,
      bin: string,
      paymentTypeId: string
    ) => {
      const installments = await mp.getInstallments({
        amount,
        bin,
        paymentTypeId,
      });
      const options = installments[0]?.payer_costs ?? [];
      setInstallmentOptions(options);
      const defaultInstallments =
        paymentTypeId === 'debit_card'
          ? 1
          : (options[0]?.installments ?? 1);
      setSelectedInstallments(defaultInstallments);
    };

    const createToken = async (): Promise<CardTokenResult> => {
      if (!mpRef.current) {
        throw new Error('Formulário de cartão ainda não carregou.');
      }

      if (!holderName.trim()) {
        throw new Error('Informe o nome do titular.');
      }
      if (holderCpf.replace(/\D/g, '').length !== 11) {
        throw new Error('Informe um CPF válido.');
      }
      if (!paymentMethodIdRef.current) {
        throw new Error('Informe um número de cartão válido.');
      }
      if (issuerRequired && issuers.length > 0 && !selectedIssuerId) {
        throw new Error('Selecione o banco emissor.');
      }
      if (showInstallments && paymentTypeId !== 'debit_card' && installmentOptions.length === 0) {
        throw new Error('Aguarde o carregamento das parcelas.');
      }

      const tokenOptions: {
        cardholderName: string;
        identificationType: string;
        identificationNumber: string;
        issuerId?: string;
      } = {
        cardholderName: holderName.trim(),
        identificationType,
        identificationNumber: holderCpf.replace(/\D/g, ''),
      };

      if (selectedIssuerId) {
        tokenOptions.issuerId = selectedIssuerId;
      }

      const token = await Promise.race([
        mpRef.current.fields.createCardToken(tokenOptions),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error('Tempo esgotado ao validar o cartão. Tente novamente.')),
            TOKEN_TIMEOUT_MS
          );
        }),
      ]);

      if (!token.id) {
        throw new Error('Não foi possível tokenizar o cartão.');
      }

      return {
        token: token.id,
        paymentMethodId: paymentMethodIdRef.current,
        paymentMethodType: normalizeCardPaymentType(paymentTypeIdRef.current),
        installments:
          paymentTypeIdRef.current === 'debit_card' ? 1 : selectedInstallments,
      };
    };

    useImperativeHandle(ref, () => ({
      createToken,
      isReady: () => ready,
    }));

    useEffect(() => {
      onReadyChange?.(ready);
    }, [ready, onReadyChange]);

    useEffect(() => {
      let cancelled = false;
      let cardNumberField: MpSecureField | null = null;
      let expirationField: MpSecureField | null = null;
      let securityField: MpSecureField | null = null;

      const updateDisplayDigits = (bin: string) => {
        setDisplayDigits(bin);
      };

      const mountFields = async () => {
        try {
          await loadMercadoPagoSdk();
          if (cancelled) return;

          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          if (cancelled) return;

          if (
            !document.getElementById(cardNumberMountId) ||
            !document.getElementById(expirationMountId) ||
            !document.getElementById(securityMountId)
          ) {
            onError?.('Não foi possível montar os campos do cartão.');
            return;
          }

          const mp = createMercadoPago(publicKey);
          if (cancelled) return;
          mpRef.current = mp;

          cardNumberField = mp.fields.create('cardNumber', {
            placeholder: '0000 0000 0000 0000',
          });
          cardNumberField.mount(cardNumberMountId);

          expirationField = mp.fields.create('expirationDate', {
            placeholder: 'MM/AA',
          });
          expirationField.mount(expirationMountId);

          securityField = mp.fields.create('securityCode', {
            placeholder: '123',
          });
          securityField.mount(securityMountId);

          cardNumberField.on('focus', () => {
            setCardFlipped(false);
            setCardHighlight('number');
          });
          cardNumberField.on('blur', () => setCardHighlight(null));
          cardNumberField.on('binChange', async (data) => {
            const bin = data.bin ?? '';
            updateDisplayDigits(bin);

            if (!bin) {
              paymentMethodIdRef.current = '';
              currentBinRef.current = '';
              clearIssuerAndInstallments();
              return;
            }

            if (bin === currentBinRef.current) {
              return;
            }

            currentBinRef.current = bin;

            try {
              const { results } = await mp.getPaymentMethods({ bin });
              const paymentMethod = results[0];
              if (!paymentMethod) return;

              paymentMethodIdRef.current = paymentMethod.id;
              const nextPaymentType = normalizeCardPaymentType(paymentMethod.payment_type_id);
              paymentTypeIdRef.current = nextPaymentType;
              setPaymentTypeId(nextPaymentType);

              const settings = paymentMethod.settings?.[0];
              if (settings?.card_number) {
                cardNumberField?.update({ settings: settings.card_number });
              }
              if (settings?.security_code) {
                securityField?.update({ settings: settings.security_code });
              }

              await updateIssuer(mp, paymentMethod, bin);
              if (showInstallments) {
                await updateInstallments(mp, bin, paymentTypeIdRef.current);
              }
            } catch {
              paymentMethodIdRef.current = '';
              clearIssuerAndInstallments();
            }
          });

          expirationField.on('focus', () => {
            setCardFlipped(false);
            setCardHighlight('expire');
          });
          expirationField.on('blur', () => setCardHighlight(null));

          securityField.on('focus', () => {
            setCardFlipped(true);
            setCardHighlight('cvv');
          });
          securityField.on('blur', () => {
            setCardFlipped(false);
            setCardHighlight(null);
          });
          securityField.on('change', (data) => {
            const length = data.fieldLength ?? 0;
            setCvv(length > 0 ? '*'.repeat(length) : '');
          });

          const types = await mp.getIdentificationTypes();
          if (cancelled) return;
          setIdentificationTypes(types);
          const defaultType = types.find((type) => type.id === 'CPF') ?? types[0];
          if (defaultType) {
            setIdentificationType(defaultType.id);
          }
          setReady(true);
        } catch (err) {
          if (!cancelled) {
            setReady(false);
            onError?.(
              err instanceof Error
                ? err.message
                : 'Mercado Pago indisponível no momento.'
            );
          }
        }
      };

      void mountFields();

      return () => {
        cancelled = true;
        cardNumberField?.unmount();
        expirationField?.unmount();
        securityField?.unmount();
        mpRef.current = null;
        currentBinRef.current = '';
        setReady(false);
      };
    }, [
      publicKey,
      amount,
      showInstallments,
      cardNumberMountId,
      expirationMountId,
      securityMountId,
      onError,
    ]);

    useEffect(() => {
      const mp = mpRef.current;
      const bin = currentBinRef.current;
      if (!mp || !bin || !showInstallments) return;

      void updateInstallments(mp, bin, paymentTypeIdRef.current).catch(() => {
        setInstallmentOptions([]);
        setSelectedInstallments(1);
      });
    }, [amount, showInstallments]);

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
        onSubmit={(event) => void handleSubmit(event)}
        className={cn('space-y-5', className)}
      >
        <InteractiveCreditCard
          numberDigits={displayDigits}
          holderName={holderName}
          expiryMonth=""
          expiryYear=""
          cvv={cvv}
          highlight={cardHighlight}
          flipped={cardFlipped}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-holder-cpf`}>CPF do titular</Label>
            <Input
              id={`${uid}-holder-cpf`}
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={holderCpf}
              onChange={(event) => setHolderCpf(formatCpf(event.target.value))}
              className={inputClassName}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={cardNumberMountId}>Número do cartão</Label>
            <div
              id={cardNumberMountId}
              ref={cardNumberMountRef}
              className="mp-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${uid}-holder-name`}>Nome do titular</Label>
            <Input
              id={`${uid}-holder-name`}
              placeholder="Como está no cartão"
              value={holderName}
              onFocus={() => {
                setCardFlipped(false);
                setCardHighlight('holder');
              }}
              onBlur={() => setCardHighlight(null)}
              onChange={(event) => {
                setHolderName(event.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''));
              }}
              className={inputClassName}
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={expirationMountId}>Validade</Label>
              <div
                id={expirationMountId}
                ref={expirationMountRef}
                className="mp-field"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={securityMountId}>CVV</Label>
              <div
                id={securityMountId}
                ref={securityMountRef}
                className="mp-field"
              />
            </div>
          </div>

          {identificationTypes.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor={`${uid}-doc-type`}>Tipo de documento</Label>
              <Select
                value={identificationType}
                onValueChange={setIdentificationType}
                disabled={disabled}
              >
                <SelectTrigger id={`${uid}-doc-type`} className={`${inputClassName} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {identificationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {issuers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={`${uid}-issuer`}>Banco emissor</Label>
              <Select
                value={selectedIssuerId}
                onValueChange={setSelectedIssuerId}
                disabled={disabled}
              >
                <SelectTrigger id={`${uid}-issuer`} className={`${inputClassName} w-full`}>
                  <SelectValue placeholder="Selecione o banco emissor" />
                </SelectTrigger>
                <SelectContent>
                  {issuers.map((issuer) => (
                    <SelectItem key={String(issuer.id)} value={String(issuer.id)}>
                      {issuer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showInstallments && installmentOptions.length > 0 && paymentTypeId !== 'debit_card' && (
            <div className="space-y-2">
              <Label htmlFor={`${uid}-installments`}>Parcelas</Label>
              <Select
                value={String(selectedInstallments)}
                onValueChange={(value) => setSelectedInstallments(Number.parseInt(value, 10))}
                disabled={disabled}
              >
                <SelectTrigger id={`${uid}-installments`} className={`${inputClassName} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {installmentOptions.map((option) => (
                    <SelectItem
                      key={option.installments}
                      value={String(option.installments)}
                    >
                      {option.recommended_message}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
