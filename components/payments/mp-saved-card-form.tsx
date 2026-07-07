'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  createMercadoPago,
  loadMercadoPagoSdk,
  type MpFieldStyle,
  type MpSecureField,
} from '@/lib/mercadopago/load-sdk';
import type { SavedPaymentCard } from '@/lib/types/wallet';
import { cn } from '@/lib/utils';

export interface MpSavedCardFormHandle {
  createToken: () => Promise<string>;
  isReady: () => boolean;
}

interface MpSavedCardFormProps {
  publicKey: string;
  card: SavedPaymentCard;
  className?: string;
  disabled?: boolean;
  onReadyChange?: (ready: boolean) => void;
  onError?: (message: string) => void;
}

const inputClassName = 'h-11 rounded-xl';
const TOKEN_TIMEOUT_MS = 30_000;

function resolveCssColor(customProperty: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
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

export const MpSavedCardForm = forwardRef<MpSavedCardFormHandle, MpSavedCardFormProps>(
  function MpSavedCardForm(
    {
      publicKey,
      card,
      className,
      disabled = false,
      onReadyChange,
      onError,
    },
    ref
  ) {
    const uid = useId().replace(/:/g, '');
    const securityMountId = `mp-saved-card-cvv-${uid}`;
    const securityMountRef = useRef<HTMLDivElement>(null);

    const mpRef = useRef<ReturnType<typeof createMercadoPago> | null>(null);
    const securityFieldRef = useRef<MpSecureField | null>(null);
    const [ready, setReady] = useState(false);

    const cardIdForMp = card.mercadoPagoCardId || card.id;

    const createToken = async (): Promise<string> => {
      if (!mpRef.current || !securityFieldRef.current) {
        throw new Error('Campo de CVV ainda não carregou.');
      }

      const token = await Promise.race([
        mpRef.current.fields.createCardToken({
          cardId: cardIdForMp,
        }),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error('Tempo esgotado ao validar o CVV. Tente novamente.')),
            TOKEN_TIMEOUT_MS
          );
        }),
      ]);

      if (!token || !token.id) {
        throw new Error('Não foi possível validar o código de segurança do cartão.');
      }

      return token.id;
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
      let securityField: MpSecureField | null = null;

      const mountField = async () => {
        try {
          await loadMercadoPagoSdk();
          if (cancelled) return;

          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          if (cancelled) return;

          if (!document.getElementById(securityMountId)) {
            onError?.('Não foi possível montar o campo de segurança.');
            return;
          }

          const mp = createMercadoPago(publicKey);
          if (cancelled) return;
          mpRef.current = mp;

          const { style: fieldStyle, customFonts } = resolveMpFieldStyle();
          const fieldOptions = { style: fieldStyle, customFonts };

          securityField = mp.fields.create('securityCode', {
            cardId: cardIdForMp,
            placeholder: '123',
            ...fieldOptions,
          });
          securityField.mount(securityMountId);
          securityFieldRef.current = securityField;

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

      void mountField();

      return () => {
        cancelled = true;
        securityField?.unmount();
        securityFieldRef.current = null;
        mpRef.current = null;
        setReady(false);
      };
    }, [publicKey, cardIdForMp, securityMountId, onError]);

    return (
      <div className={cn('w-full', className)}>
        <div
          id={securityMountId}
          ref={securityMountRef}
          role="group"
          aria-label="Código de segurança (CVV)"
          className={cn(
            'h-11 rounded-xl flex w-full min-w-0 items-center border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
            'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
            'overflow-hidden p-0 cursor-text',
            disabled && 'pointer-events-none opacity-50'
          )}
          onMouseDown={(event) => {
            if (disabled) return;
            event.preventDefault();
            if (securityFieldRef.current?.focus) {
              securityFieldRef.current.focus();
            } else {
              event.currentTarget.querySelector('iframe')?.focus();
            }
          }}
        />
      </div>
    );
  }
);
