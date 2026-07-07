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
  type MpFieldStyle,
  type MpInstallmentOption,
  type MpIssuer,
  type MpPaymentMethod,
  type MpSecureField,
} from '@/lib/mercadopago/load-sdk';
import {
  detectCardNetwork,
  getCardNumberLength,
  type CardNetwork,
} from '@/lib/card-brand';
import {
  buildCardDisplayDigits,
  createCardNumberLengthTracker,
  createSimpleLengthTracker,
} from '@/lib/mercadopago/secure-field-preview';
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
const mpFieldClassName = cn(
  inputClassName,
  'mp-field flex w-full min-w-0 items-center border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
  'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
  'overflow-hidden p-0 cursor-text'
);
const TOKEN_TIMEOUT_MS = 30_000;
const IDENTIFICATION_TYPE = 'CPF';
const MP_CARD_FORM_DEBUG = process.env.NODE_ENV === 'development';
const EXPIRY_DISPLAY_LENGTH = 4;

function getCardDisplayMaxLength(bin: string, mpMax: number): number {
  const brand = detectCardNetwork(bin.replace(/\D/g, ''));
  return Math.min(mpMax, getCardNumberLength(brand));
}

function mpCardFormDebug(message: string, data?: Record<string, unknown>) {
  if (!MP_CARD_FORM_DEBUG) return;
  if (data) {
    console.debug(`[MpCardForm] ${message}`, data);
  } else {
    console.debug(`[MpCardForm] ${message}`);
  }
}

function resolveCssColor(customProperty: string): string | undefined {
  const probe = document.createElement('span');
  probe.style.color = `var(${customProperty})`;
  probe.style.display = 'none';
  document.documentElement.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || undefined;
}

function resolveMpFieldStyle(): {
  style: MpFieldStyle;
  customFonts: { src: string }[];
} {
  if (typeof window === 'undefined') {
    return {
      style: {
        width: '100%',
        height: '44px',
        fontSize: '16px',
        paddingLeft: '12px',
        paddingRight: '12px',
      },
      customFonts: [],
    };
  }

  const probe = document.createElement('input');
  probe.className = cn(
    inputClassName,
    'border border-input bg-transparent px-3 text-base shadow-xs md:text-sm'
  );
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe);
  const style: MpFieldStyle = {
    width: '100%',
    height: `${probe.offsetHeight}px`,
    fontSize: computed.fontSize,
    fontFamily: computed.fontFamily,
    fontWeight: computed.fontWeight,
    paddingLeft: computed.paddingLeft,
    paddingRight: computed.paddingRight,
    color: resolveCssColor('--foreground'),
    placeholderColor: resolveCssColor('--muted-foreground'),
  };
  probe.remove();

  return {
    style,
    customFonts: [
      {
        src: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap',
      },
    ],
  };
}

function expiryDisplayFromLength(length: number): { month: string; year: string } {
  if (length <= 0) {
    return { month: '', year: '' };
  }
  if (length <= 2) {
    return { month: '0'.repeat(length), year: '' };
  }
  return { month: '00', year: '0'.repeat(length - 2) };
}

function focusMpSecureField(
  mount: HTMLDivElement | null,
  field?: MpSecureField | null
) {
  if (field?.focus) {
    field.focus();
    return;
  }
  mount?.querySelector('iframe')?.focus();
}

const CARD_PAYMENT_TYPES = new Set<CardPaymentType>(['credit_card', 'debit_card']);

function normalizeCardPaymentType(value: string | undefined): CardPaymentType {
  if (value && CARD_PAYMENT_TYPES.has(value as CardPaymentType)) {
    return value as CardPaymentType;
  }
  return 'credit_card';
}

const NETWORK_TO_MP_PAYMENT_METHOD: Partial<Record<CardNetwork, string>> = {
  visa: 'visa',
  mastercard: 'master',
  amex: 'amex',
  elo: 'elo',
  hipercard: 'hipercard',
  diners: 'diners',
};

/** BINs dos cartões de teste oficiais do Mercado Pago (sandbox). */
const MP_SANDBOX_BIN_PREFIXES: ReadonlyArray<readonly [string, string]> = [
  ['5031', 'master'],
  ['4235', 'visa'],
  ['3753', 'amex'],
  ['5067', 'elo'],
];

function guessMpPaymentMethodId(bin: string): string | null {
  const digits = bin.replace(/\D/g, '');
  for (const [prefix, methodId] of MP_SANDBOX_BIN_PREFIXES) {
    if (digits.startsWith(prefix)) return methodId;
  }
  const network = detectCardNetwork(digits);
  if (!network) return null;
  return NETWORK_TO_MP_PAYMENT_METHOD[network] ?? null;
}

async function fetchPaymentMethodId(
  mp: ReturnType<typeof createMercadoPago>,
  bin: string
): Promise<string | null> {
  try {
    const { results } = await mp.getPaymentMethods({ bin });
    const methodId = results[0]?.id;
    if (methodId) return methodId;
  } catch (error) {
    mpCardFormDebug('fetchPaymentMethodId:error', {
      bin,
      message: error instanceof Error ? error.message : 'unknown',
    });
  }
  return guessMpPaymentMethodId(bin);
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
    const binResolveGenerationRef = useRef(0);
    const amountRef = useRef(amount);
    const cardNumberLengthRef = useRef(0);
    const cardMaxLengthRef = useRef(16);
    const expiryLengthRef = useRef(0);
    const cvvLengthRef = useRef(0);

    const [ready, setReady] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [holderCpf, setHolderCpf] = useState('');
    const [holderName, setHolderName] = useState('');
    const [issuers, setIssuers] = useState<MpIssuer[]>([]);
    const [selectedIssuerId, setSelectedIssuerId] = useState('');
    const [issuerRequired, setIssuerRequired] = useState(false);
    const [installmentOptions, setInstallmentOptions] = useState<MpInstallmentOption[]>([]);
    const [selectedInstallments, setSelectedInstallments] = useState(1);
    const [paymentTypeId, setPaymentTypeId] = useState<CardPaymentType>('credit_card');
    const [cardHighlight, setCardHighlight] = useState<CardHighlightField>(null);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [cardRevealKey, setCardRevealKey] = useState(0);
    const [committedDigits, setCommittedDigits] = useState('');
    const [committedExpiryLength, setCommittedExpiryLength] = useState(0);
    const [committedCvv, setCommittedCvv] = useState('');
    const [cardMaxLength, setCardMaxLength] = useState(16);
    const [cvvMaxLength, setCvvMaxLength] = useState(4);
    const cvvMaxLengthRef = useRef(4);

    const { month: expiryMonth, year: expiryYear } = expiryDisplayFromLength(
      committedExpiryLength
    );
    const cardDisplayMaxLength = getCardDisplayMaxLength(
      currentBinRef.current,
      cardMaxLength
    );

    const resetCardPreview = () => {
      setCommittedDigits('');
      setCommittedExpiryLength(0);
      setCommittedCvv('');
    };

    const tryRevealCardPreview = () => {
      const displayMax = getCardDisplayMaxLength(
        currentBinRef.current,
        cardMaxLengthRef.current
      );
      const numberLength = Math.min(cardNumberLengthRef.current, displayMax);
      const expiryLength = Math.min(expiryLengthRef.current, EXPIRY_DISPLAY_LENGTH);
      const cvvLength = Math.min(cvvLengthRef.current, cvvMaxLengthRef.current);

      if (
        numberLength < displayMax ||
        expiryLength < EXPIRY_DISPLAY_LENGTH ||
        cvvLength < cvvMaxLengthRef.current
      ) {
        return;
      }

      setCommittedDigits(
        buildCardDisplayDigits(currentBinRef.current, numberLength).slice(0, displayMax)
      );
      setCommittedExpiryLength(expiryLength);
      setCommittedCvv('0'.repeat(cvvLength));
      setCardRevealKey((key) => key + 1);
    };

    const syncCardNumberLength = (length: number) => {
      cardNumberLengthRef.current = length;
    };

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
    ): Promise<{
      issuerRequired: boolean;
      issuers: MpIssuer[];
      selectedIssuerId: string;
    }> => {
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

      const nextIssuerId =
        issuerOptions.length === 1 ? String(issuerOptions[0].id) : '';

      setIssuerRequired(needsIssuer);
      setIssuers(issuerOptions);
      setSelectedIssuerId(nextIssuerId);

      return {
        issuerRequired: needsIssuer,
        issuers: issuerOptions,
        selectedIssuerId: nextIssuerId,
      };
    };

    const updateInstallments = async (
      mp: ReturnType<typeof createMercadoPago>,
      bin: string,
      paymentTypeId: string
    ): Promise<MpInstallmentOption[]> => {
      const installments = await mp.getInstallments({
        amount: amountRef.current,
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
      return options;
    };

    const resolvePaymentMethodFromBin = async (
      mp: ReturnType<typeof createMercadoPago>,
      bin: string,
      cardNumberField: MpSecureField | null,
      securityField: MpSecureField | null,
      generation: number
    ): Promise<{
      issuerRequired: boolean;
      issuers: MpIssuer[];
      selectedIssuerId: string;
      installmentOptions: MpInstallmentOption[];
      selectedInstallments: number;
    } | null> => {
      mpCardFormDebug('resolvePaymentMethodFromBin:start', { bin, generation });

      const isStale = () => generation !== binResolveGenerationRef.current;

      let paymentMethod: MpPaymentMethod | null = null;

      try {
        const { results } = await mp.getPaymentMethods({ bin });
        paymentMethod = results[0] ?? null;
      } catch (error) {
        mpCardFormDebug('resolvePaymentMethodFromBin:getPaymentMethods-error', {
          bin,
          message: error instanceof Error ? error.message : 'unknown',
        });
      }

      if (!paymentMethod) {
        const guessedId = guessMpPaymentMethodId(bin);
        if (!guessedId) {
          if (!isStale()) {
            paymentMethodIdRef.current = '';
          }
          mpCardFormDebug('resolvePaymentMethodFromBin:no-results', { bin });
          return null;
        }
        if (!isStale()) {
          paymentMethodIdRef.current = guessedId;
        }
        mpCardFormDebug('resolvePaymentMethodFromBin:guessed', {
          bin,
          paymentMethodId: guessedId,
        });
        return {
          issuerRequired: false,
          issuers: [],
          selectedIssuerId: '',
          installmentOptions: [],
          selectedInstallments: 1,
        };
      }

      if (isStale()) return null;

      paymentMethodIdRef.current = paymentMethod.id;
      const nextPaymentType = normalizeCardPaymentType(paymentMethod.payment_type_id);
      paymentTypeIdRef.current = nextPaymentType;
      setPaymentTypeId(nextPaymentType);

      const settings = paymentMethod.settings?.[0];
      if (settings?.card_number) {
        cardNumberField?.update({ settings: settings.card_number });
        const cardSettings = settings.card_number as {
          length?: number | { min?: number; max?: number };
        };
        const configuredLength =
          typeof cardSettings.length === 'number'
            ? cardSettings.length
            : cardSettings.length?.max;
        if (configuredLength) {
          cardMaxLengthRef.current = configuredLength;
          setCardMaxLength(configuredLength);
          const displayMax = getCardDisplayMaxLength(bin, configuredLength);
          if (cardNumberLengthRef.current > displayMax) {
            syncCardNumberLength(displayMax);
          }
        }
      }
      if (settings?.security_code) {
        securityField?.update({ settings: settings.security_code });
        const codeLength = (settings.security_code as { length?: number }).length;
        if (codeLength) {
          cvvMaxLengthRef.current = codeLength;
          setCvvMaxLength(codeLength);
        }
      }

      let issuer = {
        issuerRequired: false,
        issuers: [] as MpIssuer[],
        selectedIssuerId: '',
      };
      try {
        issuer = await updateIssuer(mp, paymentMethod, bin);
      } catch (error) {
        mpCardFormDebug('resolvePaymentMethodFromBin:issuer-error', {
          bin,
          message: error instanceof Error ? error.message : 'unknown',
        });
      }

      if (isStale()) return null;

      let options: MpInstallmentOption[] = [];
      let installments = 1;
      if (showInstallments) {
        try {
          options = await updateInstallments(mp, bin, paymentTypeIdRef.current);
          installments =
            paymentTypeIdRef.current === 'debit_card'
              ? 1
              : (options[0]?.installments ?? 1);
        } catch (error) {
          mpCardFormDebug('resolvePaymentMethodFromBin:installments-error', {
            bin,
            message: error instanceof Error ? error.message : 'unknown',
          });
        }
      }

      if (isStale()) return null;

      mpCardFormDebug('resolvePaymentMethodFromBin:success', {
        bin,
        paymentMethodId: paymentMethod.id,
        paymentTypeId: paymentTypeIdRef.current,
      });
      return {
        ...issuer,
        installmentOptions: options,
        selectedInstallments: installments,
      };
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

      let issuerCheck = {
        issuerRequired,
        issuers,
        selectedIssuerId,
      };
      let installmentsForToken = selectedInstallments;
      let installmentOptionsForToken = installmentOptions;

      if (!paymentMethodIdRef.current && currentBinRef.current) {
        mpCardFormDebug('createToken:payment-method-missing', {
          bin: currentBinRef.current,
        });
        const generation = ++binResolveGenerationRef.current;
        const resolved = await resolvePaymentMethodFromBin(
          mpRef.current,
          currentBinRef.current,
          cardNumberFieldRef.current,
          securityFieldRef.current,
          generation
        );
        if (resolved) {
          issuerCheck = resolved;
          installmentOptionsForToken = resolved.installmentOptions;
          installmentsForToken = resolved.selectedInstallments;
        }
      }

      if (
        paymentMethodIdRef.current &&
        issuerCheck.issuerRequired &&
        issuerCheck.issuers.length > 0 &&
        !issuerCheck.selectedIssuerId &&
        !selectedIssuerId
      ) {
        throw new Error('Selecione o banco emissor.');
      }

      if (
        paymentMethodIdRef.current &&
        showInstallments &&
        paymentTypeIdRef.current !== 'debit_card'
      ) {
        if (installmentOptionsForToken.length === 0 && currentBinRef.current) {
          try {
            installmentOptionsForToken = await updateInstallments(
              mpRef.current,
              currentBinRef.current,
              paymentTypeIdRef.current
            );
            installmentsForToken = selectedInstallments;
          } catch {
            // Parcelas indisponíveis; segue com 1x no token.
          }
        }
        if (
          installmentOptionsForToken.length === 0 &&
          installmentOptions.length === 0
        ) {
          installmentsForToken = 1;
        } else if (installmentOptionsForToken.length === 0) {
          throw new Error('Aguarde o carregamento das parcelas.');
        }
      }

      const tokenOptions: {
        cardholderName: string;
        identificationType: string;
        identificationNumber: string;
        issuerId?: string;
      } = {
        cardholderName: holderName.trim(),
        identificationType: IDENTIFICATION_TYPE,
        identificationNumber: holderCpf.replace(/\D/g, ''),
      };

      const issuerIdForToken = selectedIssuerId || issuerCheck.selectedIssuerId;
      if (issuerIdForToken) {
        tokenOptions.issuerId = issuerIdForToken;
      }

      mpCardFormDebug('createToken:tokenize', {
        paymentMethodId: paymentMethodIdRef.current,
        bin: currentBinRef.current,
        issuerId: issuerIdForToken || null,
      });

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

      if (!paymentMethodIdRef.current) {
        const binForMethod =
          token.first_six_digits || currentBinRef.current || '';
        if (binForMethod) {
          currentBinRef.current = binForMethod;
          const methodId = await fetchPaymentMethodId(mpRef.current, binForMethod);
          if (methodId) {
            paymentMethodIdRef.current = methodId;
            mpCardFormDebug('createToken:resolved-payment-method', {
              paymentMethodId: methodId,
              bin: binForMethod,
            });
          }
        }
      }

      if (!paymentMethodIdRef.current) {
        throw new Error('Informe um número de cartão válido.');
      }

      if (
        issuerCheck.issuerRequired &&
        issuerCheck.issuers.length > 0 &&
        !issuerIdForToken
      ) {
        throw new Error('Selecione o banco emissor.');
      }

      if (showInstallments && paymentTypeIdRef.current !== 'debit_card') {
        if (installmentOptionsForToken.length === 0 && currentBinRef.current) {
          try {
            installmentOptionsForToken = await updateInstallments(
              mpRef.current,
              currentBinRef.current,
              paymentTypeIdRef.current
            );
            installmentsForToken = selectedInstallments;
          } catch {
            installmentsForToken = 1;
          }
        }
        if (installmentOptionsForToken.length === 0) {
          installmentsForToken = 1;
        }
      }

      mpCardFormDebug('createToken:success', {
        paymentMethodId: paymentMethodIdRef.current,
        paymentTypeId: paymentTypeIdRef.current,
        installments: installmentsForToken,
      });

      return {
        token: token.id,
        paymentMethodId: paymentMethodIdRef.current,
        paymentMethodType: normalizeCardPaymentType(paymentTypeIdRef.current),
        installments:
          paymentTypeIdRef.current === 'debit_card' ? 1 : installmentsForToken,
        cardholderName: holderName.trim(),
        cardholderCpf: holderCpf.replace(/\D/g, ''),
      };
    };

    const cardNumberFieldRef = useRef<MpSecureField | null>(null);
    const expirationFieldRef = useRef<MpSecureField | null>(null);
    const securityFieldRef = useRef<MpSecureField | null>(null);

    useImperativeHandle(ref, () => ({
      createToken,
      isReady: () => ready,
    }));

    useEffect(() => {
      onReadyChange?.(ready);
    }, [ready, onReadyChange]);

    useEffect(() => {
      amountRef.current = amount;
    }, [amount]);

    useEffect(() => {
      let cancelled = false;
      let cardNumberField: MpSecureField | null = null;
      let expirationField: MpSecureField | null = null;
      let securityField: MpSecureField | null = null;
      let cardLengthTracker: ReturnType<typeof createCardNumberLengthTracker> | null =
        null;
      let expiryTracker: ReturnType<typeof createSimpleLengthTracker> | null = null;
      let cvvTracker: ReturnType<typeof createSimpleLengthTracker> | null = null;

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

          const { style: fieldStyle, customFonts } = resolveMpFieldStyle();
          const fieldOptions = { style: fieldStyle, customFonts };

          cardNumberField = mp.fields.create('cardNumber', {
            placeholder: '0000 0000 0000 0000',
            ...fieldOptions,
          });
          cardNumberField.mount(cardNumberMountId);
          cardNumberFieldRef.current = cardNumberField;

          expirationField = mp.fields.create('expirationDate', {
            placeholder: 'MM/AA',
            ...fieldOptions,
          });
          expirationField.mount(expirationMountId);
          expirationFieldRef.current = expirationField;

          securityField = mp.fields.create('securityCode', {
            placeholder: '123',
            ...fieldOptions,
          });
          securityField.mount(securityMountId);
          securityFieldRef.current = securityField;

          cardLengthTracker = createCardNumberLengthTracker(
            () =>
              getCardDisplayMaxLength(
                currentBinRef.current,
                cardMaxLengthRef.current
              ),
            syncCardNumberLength
          );
          expiryTracker = createSimpleLengthTracker(
            () => EXPIRY_DISPLAY_LENGTH,
            () => expiryLengthRef.current,
            (length) => {
              expiryLengthRef.current = length;
            }
          );
          cvvTracker = createSimpleLengthTracker(
            () => cvvMaxLengthRef.current,
            () => cvvLengthRef.current,
            (length) => {
              cvvLengthRef.current = length;
            }
          );

          cardNumberField.on('focus', () => {
            resetCardPreview();
            setCardFlipped(false);
            setCardHighlight('number');
          });
          cardNumberField.on('blur', () => {
            setCardHighlight(null);
            tryRevealCardPreview();
          });
          cardNumberField.on('change', () => {
            resetCardPreview();
            cardLengthTracker?.onChange();
          });
          cardNumberField.on('binChange', async (data) => {
            if (data.bin == null) {
              cardLengthTracker?.onBinChange(null);
              return;
            }

            const bin = data.bin;
            const prevBin = currentBinRef.current;

            currentBinRef.current = bin;
            cardLengthTracker?.onBinChange(bin);

            const brand = detectCardNetwork(bin.replace(/\D/g, ''));
            if (brand) {
              const brandLength = getCardNumberLength(brand);
              cardMaxLengthRef.current = brandLength;
              setCardMaxLength(brandLength);
              const displayMax = getCardDisplayMaxLength(bin, brandLength);
              if (cardNumberLengthRef.current > displayMax) {
                syncCardNumberLength(displayMax);
              }
            }

            mpCardFormDebug('binChange', {
              bin,
              currentBin: currentBinRef.current,
              paymentMethodId: paymentMethodIdRef.current,
              cardNumberLength: cardNumberLengthRef.current,
            });

            if (!bin) {
              paymentMethodIdRef.current = '';
              clearIssuerAndInstallments();
              return;
            }

            if (bin === prevBin && paymentMethodIdRef.current) {
              return;
            }

            const generation = ++binResolveGenerationRef.current;
            await resolvePaymentMethodFromBin(
              mp,
              bin,
              cardNumberField,
              securityField,
              generation
            );
          });

          expirationField.on('focus', () => {
            resetCardPreview();
            setCardFlipped(false);
            setCardHighlight('expire');
          });
          expirationField.on('blur', () => {
            setCardHighlight(null);
            tryRevealCardPreview();
          });
          expirationField.on('change', () => {
            resetCardPreview();
            expiryTracker?.onChange();
          });

          securityField.on('focus', () => {
            resetCardPreview();
            setCardFlipped(true);
            setCardHighlight('cvv');
          });
          securityField.on('blur', () => {
            setCardFlipped(false);
            setCardHighlight(null);
            tryRevealCardPreview();
          });
          securityField.on('change', () => {
            resetCardPreview();
            cvvTracker?.onChange();
          });

          setReady(true);
          mpCardFormDebug('mount:ready', {
            cardNumberMountId,
            expirationMountId,
            securityMountId,
            cardBrand: detectCardNetwork(currentBinRef.current),
          });
        } catch (err) {
          if (!cancelled) {
            setReady(false);
            mpCardFormDebug('mount:error', {
              message: err instanceof Error ? err.message : 'unknown',
            });
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
        cardLengthTracker?.reset();
        expiryTracker?.reset();
        cvvTracker?.reset();
        cardNumberField?.unmount();
        expirationField?.unmount();
        securityField?.unmount();
        cardNumberFieldRef.current = null;
        expirationFieldRef.current = null;
        securityFieldRef.current = null;
        mpRef.current = null;
        currentBinRef.current = '';
        cardNumberLengthRef.current = 0;
        expiryLengthRef.current = 0;
        cvvLengthRef.current = 0;
        setCommittedDigits('');
        setCommittedExpiryLength(0);
        setCommittedCvv('');
        setCardRevealKey(0);
        setReady(false);
      };
    }, [
      publicKey,
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
        <div className="payment-card-shell">
          <InteractiveCreditCard
            numberDigits={committedDigits}
            numberMaxLength={cardDisplayMaxLength}
            holderName={holderName}
            expiryMonth={expiryMonth}
            expiryYear={expiryYear}
            cvv={committedCvv}
            cvvMaxLength={cvvMaxLength}
            highlight={cardHighlight}
            flipped={cardFlipped}
            secureFieldPreview="deferred"
            revealKey={cardRevealKey}
          />
        </div>

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
            <Label id={`${uid}-card-number-label`}>Número do cartão</Label>
            <div
              id={cardNumberMountId}
              ref={cardNumberMountRef}
              role="group"
              aria-labelledby={`${uid}-card-number-label`}
              className={cn(mpFieldClassName, disabled && 'pointer-events-none opacity-50')}
              onMouseDown={(event) => {
                if (disabled) return;
                event.preventDefault();
                focusMpSecureField(event.currentTarget, cardNumberFieldRef.current);
              }}
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
                setHolderName(event.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, ''));
              }}
              className={inputClassName}
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label id={`${uid}-expiry-label`}>Validade</Label>
              <div
                id={expirationMountId}
                ref={expirationMountRef}
                role="group"
                aria-labelledby={`${uid}-expiry-label`}
                className={cn(mpFieldClassName, disabled && 'pointer-events-none opacity-50')}
                onMouseDown={(event) => {
                  if (disabled) return;
                  event.preventDefault();
                  focusMpSecureField(event.currentTarget, expirationFieldRef.current);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label id={`${uid}-cvv-label`}>CVV</Label>
              <div
                id={securityMountId}
                ref={securityMountRef}
                role="group"
                aria-labelledby={`${uid}-cvv-label`}
                className={cn(mpFieldClassName, disabled && 'pointer-events-none opacity-50')}
                onMouseDown={(event) => {
                  if (disabled) return;
                  event.preventDefault();
                  focusMpSecureField(event.currentTarget, securityFieldRef.current);
                }}
              />
            </div>
          </div>

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
