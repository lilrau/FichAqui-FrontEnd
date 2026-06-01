'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Star, Trash2 } from 'lucide-react';
import {
  CARD_BRAND_LABELS,
  CardBrand,
  detectCardNetwork,
  getCardNumberLength,
} from '@/lib/card-brand';
import { SavedPaymentCard, mockSavedPaymentCards } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  CardHighlightField,
  InteractiveCreditCard,
} from '@/components/interactive-credit-card';

const brandGradients: Partial<Record<CardBrand, string>> = {
  visa: 'from-blue-600 to-blue-900',
  mastercard: 'from-red-600 to-orange-700',
  amex: 'from-sky-600 to-blue-900',
  discover: 'from-orange-500 to-amber-700',
  diners: 'from-slate-600 to-slate-900',
  jcb: 'from-emerald-600 to-teal-900',
  elo: 'from-amber-500 to-emerald-800',
  hipercard: 'from-red-700 to-rose-900',
  banese: 'from-green-600 to-emerald-900',
  cabal: 'from-indigo-600 to-violet-900',
  sorocred: 'from-cyan-600 to-blue-800',
  valecard: 'from-lime-600 to-green-900',
};

function getBrandGradient(brand: CardBrand): string {
  return brandGradients[brand] ?? 'from-zinc-600 to-zinc-900';
}

const emptyForm = {
  number: '',
  holderName: '',
  holderCpf: '',
  expiry: '',
  cvv: '',
};

function formatCardNumber(value: string, brand: CardBrand | null) {
  const digits = value.replace(/\D/g, '').slice(0, getCardNumberLength(brand));
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
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

function SavedCardVisual({ card }: { card: SavedPaymentCard }) {
  const label = CARD_BRAND_LABELS[card.brand];
  const gradient = getBrandGradient(card.brand);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg',
        gradient
      )}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative space-y-6">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-white/90">{label}</span>
          {card.isDefault && (
            <Badge className="border-white/30 bg-white/20 text-white hover:bg-white/20">
              Padrão
            </Badge>
          )}
        </div>
        <p className="font-mono text-lg tracking-widest">
          •••• •••• •••• {card.lastFour}
        </p>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/70">Titular</p>
            <p className="truncate text-sm font-medium">{card.holderName}</p>
            <p className="mt-2 text-xs text-white/70">CPF do titular</p>
            <p className="text-sm font-medium">{card.holderCpf}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-white/70">Validade</p>
            <p className="text-sm font-medium">
              {card.expiryMonth}/{card.expiryYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetodosPagamentoPage() {
  const router = useRouter();
  const [cards, setCards] = useState<SavedPaymentCard[]>(mockSavedPaymentCards);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<SavedPaymentCard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [cardHighlight, setCardHighlight] = useState<CardHighlightField>(null);
  const [cardFlipped, setCardFlipped] = useState(false);

  const [expiryMonth = '', expiryYear = ''] = form.expiry.split('/');
  const numberDigits = form.number.replace(/\D/g, '');

  const setDefault = (id: string) => {
    setCards((prev) =>
      prev.map((card) => ({ ...card, isDefault: card.id === id }))
    );
  };

  const removeCard = (id: string) => {
    setCards((prev) => {
      const next = prev.filter((card) => card.id !== id);
      if (next.length > 0 && !next.some((c) => c.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setCardToRemove(null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormError(null);
    setCardHighlight(null);
    setCardFlipped(false);
  };

  const handleAddCard = () => {
    const digits = form.number.replace(/\D/g, '');
    const brand = detectCardNetwork(digits) ?? 'elo';
    const [month = '', year = ''] = form.expiry.split('/');

    if (digits.length < getCardNumberLength(brand)) {
      setFormError('Informe um número de cartão válido.');
      return;
    }
    if (!form.holderName.trim()) {
      setFormError('Informe o nome do titular.');
      return;
    }
    if (form.holderCpf.replace(/\D/g, '').length !== 11) {
      setFormError('Informe um CPF válido.');
      return;
    }
    if (month.length !== 2 || year.length !== 2) {
      setFormError('Informe a validade no formato MM/AA.');
      return;
    }
    if (form.cvv.replace(/\D/g, '').length < 3) {
      setFormError('Informe o CVV.');
      return;
    }

    const newCard: SavedPaymentCard = {
      id: `card-${Date.now()}`,
      brand,
      lastFour: digits.slice(-4),
      holderName: form.holderName.trim(),
      holderCpf: formatCpf(form.holderCpf),
      expiryMonth: month,
      expiryYear: year,
      isDefault: cards.length === 0,
    };

    setCards((prev) => [...prev, newCard]);
    setIsAddOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Métodos de pagamento</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Gerencie os cartões salvos para recargas e pagamentos no evento.
        </p>

        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
              💳
            </div>
            <p className="mt-4 font-semibold text-foreground">Nenhum cartão salvo</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Adicione um cartão para agilizar suas próximas recargas.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-3"
              >
                <SavedCardVisual card={card} />
                <div className="flex gap-2">
                  {!card.isDefault && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setDefault(card.id)}
                    >
                      <Star className="h-4 w-4" />
                      Definir como padrão
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      'rounded-xl text-destructive hover:text-destructive',
                      card.isDefault ? 'flex-1' : 'shrink-0'
                    )}
                    onClick={() => setCardToRemove(card)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {card.isDefault ? 'Remover cartão' : null}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Button
          type="button"
          className="h-12 w-full rounded-xl font-semibold"
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Adicionar cartão
        </Button>
      </main>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar cartão</DialogTitle>
            <DialogDescription>
              Os dados são simulados neste protótipo.
            </DialogDescription>
          </DialogHeader>
          <div className="payment-card-shell">
          <InteractiveCreditCard
            numberDigits={numberDigits}
            holderName={form.holderName}
            expiryMonth={expiryMonth}
            expiryYear={expiryYear}
            cvv={form.cvv}
            highlight={cardHighlight}
            flipped={cardFlipped}
          />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Número do cartão</Label>
              <Input
                id="card-number"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={form.number}
                onFocus={() => {
                  setCardFlipped(false);
                  setCardHighlight('number');
                }}
                onBlur={() => setCardHighlight(null)}
                onChange={(e) => {
                  const brand = detectCardNetwork(
                    e.target.value.replace(/\D/g, '')
                  );
                  setForm((f) => ({
                    ...f,
                    number: formatCardNumber(e.target.value, brand),
                  }));
                }}
                className="h-11 rounded-xl font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holder-name">Nome do titular</Label>
              <Input
                id="holder-name"
                placeholder="Como está no cartão"
                value={form.holderName}
                onFocus={() => {
                  setCardFlipped(false);
                  setCardHighlight('holder');
                }}
                onBlur={() => setCardHighlight(null)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, holderName: e.target.value }))
                }
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holder-cpf">CPF do titular</Label>
              <Input
                id="holder-cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={form.holderCpf}
                onChange={(e) =>
                  setForm((f) => ({ ...f, holderCpf: formatCpf(e.target.value) }))
                }
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  value={form.expiry}
                  onFocus={() => {
                    setCardFlipped(false);
                    setCardHighlight('expire');
                  }}
                  onBlur={() => setCardHighlight(null)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))
                  }
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  value={form.cvv}
                  onFocus={() => {
                    setCardFlipped(true);
                    setCardHighlight('cvv');
                  }}
                  onBlur={() => {
                    setCardFlipped(false);
                    setCardHighlight(null);
                  }}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                    }))
                  }
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsAddOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" className="rounded-xl" onClick={handleAddCard}>
              Salvar cartão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!cardToRemove}
        onOpenChange={(open) => !open && setCardToRemove(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              O cartão final {cardToRemove?.lastFour} será removido da sua conta.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
              onClick={() => cardToRemove && removeCard(cardToRemove.id)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
