'use client';

import { useMemo, useState } from 'react';
import {
  CardBrand,
  detectCardNetwork,
  getCardNumberLength,
} from '@/lib/card-brand';
import {
  CardHighlightField,
  InteractiveCreditCard,
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

export type NewPaymentCardData = {
  brand: CardBrand;
  lastFour: string;
  holderName: string;
  holderCpf: string;
  expiryMonth: string;
  expiryYear: string;
};

const inputClassName = 'h-11 rounded-xl';

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCardNumber(value: string, brand: CardBrand | null) {
  const digits = value.replace(/\D/g, '').slice(0, getCardNumberLength(brand));
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

interface AddPaymentCardFormProps {
  onSubmit: (data: NewPaymentCardData) => void;
}

export function AddPaymentCardForm({ onSubmit }: AddPaymentCardFormProps) {
  const [holderCpf, setHolderCpf] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [cardHighlight, setCardHighlight] = useState<CardHighlightField>(null);
  const [cardFlipped, setCardFlipped] = useState(false);

  const numberDigits = cardNumber.replace(/\D/g, '');
  const brand = detectCardNetwork(numberDigits);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
    []
  );

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => String(current + i));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedBrand = brand ?? 'elo';
    if (numberDigits.length < getCardNumberLength(resolvedBrand)) {
      setFormError('Informe um número de cartão válido.');
      return;
    }
    if (!holderName.trim()) {
      setFormError('Informe o nome do titular.');
      return;
    }
    if (holderCpf.replace(/\D/g, '').length !== 11) {
      setFormError('Informe um CPF válido.');
      return;
    }
    if (!expiryMonth || !expiryYear) {
      setFormError('Informe a validade do cartão.');
      return;
    }
    if (cvv.replace(/\D/g, '').length < 3) {
      setFormError('Informe o CVV.');
      return;
    }

    setFormError(null);
    onSubmit({
      brand: resolvedBrand,
      lastFour: numberDigits.slice(-4),
      holderName: holderName.trim(),
      holderCpf: formatCpf(holderCpf),
      expiryMonth,
      expiryYear: expiryYear.slice(-2),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InteractiveCreditCard
        numberDigits={numberDigits}
        holderName={holderName}
        expiryMonth={expiryMonth}
        expiryYear={expiryYear}
        cvv={cvv}
        highlight={cardHighlight}
        flipped={cardFlipped}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="holder-cpf">CPF do titular</Label>
          <Input
            id="holder-cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={holderCpf}
            onChange={(e) => {
              setHolderCpf(formatCpf(e.target.value));
              if (formError) setFormError(null);
            }}
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-number">Número do cartão</Label>
          <Input
            id="card-number"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onFocus={() => {
              setCardFlipped(false);
              setCardHighlight('number');
            }}
            onBlur={() => setCardHighlight(null)}
            onChange={(e) => {
              const nextBrand = detectCardNetwork(
                e.target.value.replace(/\D/g, '')
              );
              setCardNumber(formatCardNumber(e.target.value, nextBrand));
              if (formError) setFormError(null);
            }}
            className={`${inputClassName} font-mono`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="holder-name">Nome do titular</Label>
          <Input
            id="holder-name"
            placeholder="Como está no cartão"
            value={holderName}
            onFocus={() => {
              setCardFlipped(false);
              setCardHighlight('holder');
            }}
            onBlur={() => setCardHighlight(null)}
            onChange={(e) => {
              setHolderName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''));
              if (formError) setFormError(null);
            }}
            className={inputClassName}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="expiry-month">Mês</Label>
            <Select
              value={expiryMonth}
              onOpenChange={(open) => {
                if (open) {
                  setCardFlipped(false);
                  setCardHighlight('expire');
                } else {
                  setCardHighlight(null);
                }
              }}
              onValueChange={(v) => {
                setExpiryMonth(v);
                if (formError) setFormError(null);
              }}
            >
              <SelectTrigger id="expiry-month" className={`${inputClassName} w-full`}>
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry-year">Ano</Label>
            <Select
              value={expiryYear}
              onOpenChange={(open) => {
                if (open) {
                  setCardFlipped(false);
                  setCardHighlight('expire');
                } else {
                  setCardHighlight(null);
                }
              }}
              onValueChange={(v) => {
                setExpiryYear(v);
                if (formError) setFormError(null);
              }}
            >
              <SelectTrigger id="expiry-year" className={`${inputClassName} w-full`}>
                <SelectValue placeholder="AAAA" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              inputMode="numeric"
              placeholder="123"
              maxLength={4}
              value={cvv}
              onFocus={() => {
                setCardFlipped(true);
                setCardHighlight('cvv');
              }}
              onBlur={() => {
                setCardFlipped(false);
                setCardHighlight(null);
              }}
              onChange={(e) => {
                setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                if (formError) setFormError(null);
              }}
              className={inputClassName}
            />
          </div>
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}
      </div>

      <Button type="submit" className="h-12 w-full rounded-xl font-semibold">
        Salvar cartão
      </Button>
    </form>
  );
}
