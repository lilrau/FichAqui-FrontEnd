'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import '@/app/(consumer)/metodos-pagamento/payment-card.css';
import { CardBrandLogo } from '@/components/card-brand-logo';
import {
  detectCardNetwork,
  getCardNumberGroups,
  getCardNumberLength,
} from '@/lib/card-brand';
import { getCardDisplayChar } from '@/lib/mercadopago/secure-field-preview';

export type CardHighlightField = 'number' | 'holder' | 'expire' | 'cvv' | null;
export type SecureFieldPreviewMode = 'live' | 'deferred';

const REVEAL_DIGIT_MS = 70;

type DigitSlot = {
  bottom: string;
  filed: boolean;
};

function buildEmptySlots(length: number): DigitSlot[] {
  return Array.from({ length }, () => ({ bottom: '', filed: false }));
}

function buildSlotsFromDigits(
  digits: string,
  maxLen: number,
  mapChar: (index: number, digit: string) => string = (_, d) => d
): DigitSlot[] {
  const slots = buildEmptySlots(maxLen);
  for (let i = 0; i < digits.length; i++) {
    slots[i] = {
      bottom: mapChar(i, digits[i]),
      filed: true,
    };
  }
  return slots;
}

function useAnimatedDigitSlots(
  rawDigits: string,
  maxLen: number,
  mapChar: (index: number, digit: string) => string = (_, d) => d,
  sanitize: (value: string) => string = (value) => value.replace(/\D/g, '')
): DigitSlot[] {
  const normalized = sanitize(rawDigits).slice(0, maxLen);
  const [slots, setSlots] = useState<DigitSlot[]>(() => buildEmptySlots(maxLen));
  const prevLenRef = useRef(0);
  const prevNormalizedRef = useRef('');
  const prevMaxLenRef = useRef(maxLen);
  const mapCharRef = useRef(mapChar);
  mapCharRef.current = mapChar;

  useEffect(() => {
    const len = normalized.length;
    const map = mapCharRef.current;
    const prev = prevLenRef.current;
    const delta = len - prev;

    if (maxLen !== prevMaxLenRef.current) {
      setSlots(
        len > 0
          ? buildSlotsFromDigits(normalized, maxLen, map)
          : buildEmptySlots(maxLen)
      );
      prevLenRef.current = len;
      prevNormalizedRef.current = normalized;
      prevMaxLenRef.current = maxLen;
      return;
    }

    if (len === 0) {
      setSlots(buildEmptySlots(maxLen));
      prevLenRef.current = 0;
      prevNormalizedRef.current = '';
      return;
    }

    if (normalized === prevNormalizedRef.current) {
      return;
    }

    if (delta === 0) {
      setSlots((current) => {
        const next = current.map((slot, index) => {
          if (index >= normalized.length) {
            return { bottom: '', filed: false };
          }
          const bottom = map(index, normalized[index]);
          if (slot.bottom === bottom && slot.filed) {
            return slot;
          }
          return { bottom, filed: true };
        });
        return next;
      });
    } else if (delta === -1) {
      setSlots((current) => {
        const next = current.map((slot) => ({ ...slot }));
        next[len] = { bottom: '', filed: false };
        return next;
      });
    } else if (Math.abs(delta) > 1) {
      setSlots(buildSlotsFromDigits(normalized, maxLen, map));
    } else {
      setSlots((current) => {
        const next = current.map((slot) => ({ ...slot }));
        next[len - 1] = {
          bottom: map(len - 1, normalized[len - 1]),
          filed: true,
        };
        return next;
      });
    }

    prevLenRef.current = len;
    prevNormalizedRef.current = normalized;
  }, [normalized, maxLen]);

  return slots.length === maxLen
    ? slots
    : buildSlotsFromDigits(normalized, maxLen, mapChar);
}

function useAnimatedCharSlots(text: string): DigitSlot[] {
  const len = text.length;
  return useAnimatedDigitSlots(text, len, (_, char) => char, (value) => value);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function useDeferredFieldReveal(
  targets: { number: number; expiry: number; cvv: number },
  revealKey: number,
  enabled: boolean
): { number: number; expiry: number; cvv: number } {
  const [visible, setVisible] = useState({ number: 0, expiry: 0, cvv: 0 });

  useEffect(() => {
    if (!enabled || revealKey === 0) {
      setVisible({ number: 0, expiry: 0, cvv: 0 });
      return;
    }

    let cancelled = false;
    setVisible({ number: 0, expiry: 0, cvv: 0 });

    const run = async () => {
      for (let index = 1; index <= targets.number; index++) {
        if (cancelled) return;
        await delay(REVEAL_DIGIT_MS);
        setVisible((current) => ({ ...current, number: index }));
      }
      for (let index = 1; index <= targets.expiry; index++) {
        if (cancelled) return;
        await delay(REVEAL_DIGIT_MS);
        setVisible((current) => ({ ...current, expiry: index }));
      }
      for (let index = 1; index <= targets.cvv; index++) {
        if (cancelled) return;
        await delay(REVEAL_DIGIT_MS);
        setVisible((current) => ({ ...current, cvv: index }));
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    revealKey,
    targets.cvv,
    targets.expiry,
    targets.number,
  ]);

  return visible;
}

function expiryFromVisibleLength(length: number): { month: string; year: string } {
  if (length <= 0) {
    return { month: '', year: '' };
  }
  if (length <= 2) {
    return { month: '0'.repeat(length), year: '' };
  }
  return { month: '00', year: '0'.repeat(length - 2) };
}

function AnimatedDigit({
  slot,
  placeholder,
}: {
  slot: DigitSlot;
  placeholder: string;
}) {
  return (
    <span
      className={`payment-card__digit${slot.filed ? ' payment-card__digit--filed' : ''}`}
    >
      <span className="payment-card__digit-track">
        <span className="payment-card__digit-char">{placeholder}</span>
        <span className="payment-card__digit-char">
          {slot.filed ? slot.bottom : '\u00a0'}
        </span>
      </span>
    </span>
  );
}

export interface InteractiveCreditCardProps {
  numberDigits: string;
  numberMaxLength?: number;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cvvMaxLength?: number;
  highlight: CardHighlightField;
  flipped?: boolean;
  /** MP secure fields: defer card preview until revealKey triggers progressive animation. */
  secureFieldPreview?: SecureFieldPreviewMode;
  revealKey?: number;
}

export function InteractiveCreditCard({
  numberDigits,
  numberMaxLength,
  holderName,
  expiryMonth,
  expiryYear,
  cvv,
  cvvMaxLength = 4,
  highlight,
  flipped = false,
  secureFieldPreview = 'live',
  revealKey = 0,
}: InteractiveCreditCardProps) {
  const deferred = secureFieldPreview === 'deferred';
  const targetNumberLength = numberDigits.slice(0, numberMaxLength ?? 16).length;
  const targetExpiryLength = Math.min(
    4,
    expiryMonth.replace(/\D/g, '').length + expiryYear.replace(/\D/g, '').length
  );
  const targetCvvLength = Math.min(
    cvvMaxLength,
    cvv.replace(/\D/g, '').length
  );

  const revealed = useDeferredFieldReveal(
    {
      number: targetNumberLength,
      expiry: targetExpiryLength,
      cvv: targetCvvLength,
    },
    revealKey,
    deferred
  );

  const visibleNumberLength = deferred ? revealed.number : targetNumberLength;
  const visibleExpiryLength = deferred ? revealed.expiry : targetExpiryLength;
  const visibleCvvLength = deferred ? revealed.cvv : targetCvvLength;

  const digitsOnly = useMemo(
    () => numberDigits.replace(/[^\d·x]/g, '').replace(/[·x]/g, ''),
    [numberDigits]
  );
  const brand = useMemo(() => detectCardNetwork(digitsOnly), [digitsOnly]);

  const maxLen = numberMaxLength ?? getCardNumberLength(brand);
  const groups = getCardNumberGroups(brand);
  const normalizedDigits = numberDigits.slice(0, visibleNumberLength);
  const filledLength = normalizedDigits.length;

  const mapCardChar = useMemo(
    () => (index: number, digit: string) =>
      getCardDisplayChar(index, digit, maxLen, filledLength),
    [filledLength, maxLen]
  );

  const cardSlots = useAnimatedDigitSlots(
    normalizedDigits,
    maxLen,
    mapCardChar,
    (value) => value.slice(0, maxLen)
  );

  const { month: visibleExpiryMonth, year: visibleExpiryYear } =
    expiryFromVisibleLength(visibleExpiryLength);
  const monthDigits = visibleExpiryMonth.replace(/\D/g, '').slice(0, 2);
  const yearDigits = visibleExpiryYear.replace(/\D/g, '').slice(-2);
  const monthSlots = useAnimatedDigitSlots(monthDigits, 2);
  const yearSlots = useAnimatedDigitSlots(yearDigits, 2);

  const holderChars = holderName.trim().toLocaleUpperCase('pt-BR');
  const holderSlots = useAnimatedCharSlots(holderChars);
  const cvvSlots = useAnimatedDigitSlots(
    cvv.replace(/\D/g, '').slice(0, visibleCvvLength),
    cvvMaxLength,
    () => '•'
  );

  return (
    <section
      className={`payment-card${flipped ? ' payment-card--flip' : ''}`}
      aria-hidden
    >
      <section className="payment-card__front">
        <div className="payment-card__header">
          <div />
          <div className="payment-card__brand-slot">
            <CardBrandLogo brand={brand} />
          </div>
        </div>

        <div className="payment-card__field payment-card__field--number">
          {highlight === 'number' && <div className="payment-card__highlight" />}
          <div className="payment-card__number">
            {groups.map((groupSize, groupIndex) => {
              const start = groups
                .slice(0, groupIndex)
                .reduce((sum, size) => sum + size, 0);
              const groupSlots = cardSlots.slice(start, start + groupSize);

              return (
                <span
                  key={groupIndex}
                  className="payment-card__number-group"
                >
                  {groupSlots.map((slot, digitIndex) => (
                    <AnimatedDigit
                      key={digitIndex}
                      slot={slot}
                      placeholder="#"
                    />
                  ))}
                </span>
              );
            })}
          </div>
        </div>

        <div className="payment-card__footer">
          <div className="payment-card__field payment-card__field--holder">
            {highlight === 'holder' && <div className="payment-card__highlight" />}
            <div className="payment-card__holder">
              <div className="payment-card__section-title">Titular</div>
              <div className="payment-card__holder-name">
                {holderChars ? (
                  holderSlots.map((slot, index) => (
                    <AnimatedDigit key={index} slot={slot} placeholder=" " />
                  ))
                ) : (
                  <span className="payment-card__holder-placeholder">Nome no cartão</span>
                )}
              </div>
            </div>
          </div>

          <div className="payment-card__field payment-card__field--expire">
            {highlight === 'expire' && <div className="payment-card__highlight" />}
            <div className="payment-card__expires">
              <div className="payment-card__section-title">Validade</div>
              <div className="payment-card__expires-value">
                <AnimatedDigit slot={monthSlots[0]} placeholder="M" />
                <AnimatedDigit slot={monthSlots[1]} placeholder="M" />
                <span className="payment-card__expires-sep">/</span>
                <AnimatedDigit slot={yearSlots[0]} placeholder="A" />
                <AnimatedDigit slot={yearSlots[1]} placeholder="A" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="payment-card__back">
        <div className="payment-card__hide-line" />
        <div className="payment-card__cvv-wrap">
          {highlight === 'cvv' && <div className="payment-card__highlight" />}
          <div className="payment-card__cvv">
            <span>CVV</span>
            <div className="payment-card__cvv-field">
              {cvvSlots.map((slot, index) => (
                <AnimatedDigit key={index} slot={slot} placeholder="#" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
