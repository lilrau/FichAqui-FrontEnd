'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import '@/app/(consumer)/metodos-pagamento/payment-card.css';
import { CardBrandLogo } from '@/components/card-brand-logo';
import {
  detectCardNetwork,
  getCardNumberGroups,
  getCardNumberLength,
} from '@/lib/card-brand';

export type CardHighlightField = 'number' | 'holder' | 'expire' | 'cvv' | null;

type DigitSlot = {
  bottom: string;
  filed: boolean;
};

function buildEmptySlots(length: number): DigitSlot[] {
  return Array.from({ length }, () => ({ bottom: '', filed: false }));
}

function getMaskedChar(index: number, digit: string, maxLen: number): string {
  const position = index + 1;
  if (maxLen === 16 && position > 4 && position < 13) return '*';
  return digit;
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
  mapChar: (index: number, digit: string) => string = (_, d) => d
): DigitSlot[] {
  const normalized = rawDigits.replace(/\D/g, '').slice(0, maxLen);
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

    if (delta === 0 || Math.abs(delta) > 1) {
      setSlots(buildSlotsFromDigits(normalized, maxLen, map));
    } else if (delta === -1) {
      setSlots((current) => {
        const next = current.map((slot) => ({ ...slot }));
        next[len] = { bottom: '', filed: false };
        return next;
      });
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
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  highlight: CardHighlightField;
  flipped?: boolean;
}

export function InteractiveCreditCard({
  numberDigits,
  holderName,
  expiryMonth,
  expiryYear,
  cvv,
  highlight,
  flipped = false,
}: InteractiveCreditCardProps) {
  const brand = useMemo(
    () => detectCardNetwork(numberDigits),
    [numberDigits]
  );

  const maxLen = getCardNumberLength(brand);
  const groups = getCardNumberGroups(brand);
  const normalizedDigits = numberDigits.replace(/\D/g, '').slice(0, maxLen);

  const mapCardChar = useMemo(
    () => (index: number, digit: string) =>
      getMaskedChar(index, digit, maxLen),
    [maxLen]
  );

  const cardSlots = useAnimatedDigitSlots(
    normalizedDigits,
    maxLen,
    mapCardChar
  );

  const monthDigits = expiryMonth.replace(/\D/g, '').slice(0, 2);
  const yearDigits = expiryYear.replace(/\D/g, '').slice(-2);
  const monthSlots = useAnimatedDigitSlots(monthDigits, 2);
  const yearSlots = useAnimatedDigitSlots(yearDigits, 2);

  const displayHolder = holderName.trim() || 'Nome no cartão';
  const cvvMask = cvv ? '*'.repeat(cvv.length) : '';

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
              <div className="payment-card__holder-name">{displayHolder}</div>
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
            <div className="payment-card__cvv-field">{cvvMask}</div>
          </div>
        </div>
      </section>
    </section>
  );
}
