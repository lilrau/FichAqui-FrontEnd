'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Star, Trash2 } from 'lucide-react';
import {
  CardBrand,
  detectCardNetwork,
  getCardNumberLength,
} from '@/lib/card-brand';
import { SavedPaymentCard, mockSavedPaymentCards } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SavedCreditCard } from '@/components/saved-credit-card';
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
  if (digits.length === 0) return '';

  if (digits.length === 1) {
    return digits[0] > '1' ? `0${digits[0]}` : digits;
  }

  if (digits[0] === '0' && digits[1] === '0') return '0';

  let month = digits.slice(0, 2);
  const monthNum = parseInt(month, 10);
  if (monthNum > 12) month = '12';
  if (monthNum === 0) return '0';

  const year = digits.slice(2);
  if (year.length === 0) return month;
  return `${month}/${year}`;
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

export default function MetodosPagamentoPage() {
  const router = useRouter();
  const [cards, setCards] = useState<SavedPaymentCard[]>(mockSavedPaymentCards);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<SavedPaymentCard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [cardHighlight, setCardHighlight] = useState<CardHighlightField>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const paymentFormRef = useRef<HTMLFormElement>(null);

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

  const syncCardPreviewWithField = (fieldId: string) => {
    switch (fieldId) {
      case 'card-number':
        setCardFlipped(false);
        setCardHighlight('number');
        break;
      case 'holder-name':
        setCardFlipped(false);
        setCardHighlight('holder');
        break;
      case 'expiry':
        setCardFlipped(false);
        setCardHighlight('expire');
        break;
      case 'cvv':
        setCardFlipped(true);
        setCardHighlight('cvv');
        break;
      default:
        setCardFlipped(false);
        setCardHighlight(null);
    }
  };

  const handlePaymentFormFocusCapture = (
    e: React.FocusEvent<HTMLFormElement>
  ) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    syncCardPreviewWithField(target.id);
  };

  const handlePaymentFormBlurCapture = (
    e: React.FocusEvent<HTMLFormElement>
  ) => {
    const related = e.relatedTarget;
    if (
      related instanceof Node &&
      paymentFormRef.current?.contains(related)
    ) {
      return;
    }
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
    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) {
      setFormError('Informe um mês válido (01 a 12).');
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
                <div className="payment-card-shell">
                  <SavedCreditCard card={card} />
                </div>
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
      </main>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent
          className="rounded-2xl sm:max-w-lg"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            document.getElementById('card-number')?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Adicionar cartão</DialogTitle>
            <DialogDescription>
              Os dados são simulados neste protótipo.
            </DialogDescription>
          </DialogHeader>
          <div className="payment-card-shell" tabIndex={-1} aria-hidden>
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

          <form
            ref={paymentFormRef}
            className="space-y-4"
            onFocusCapture={handlePaymentFormFocusCapture}
            onBlurCapture={handlePaymentFormBlurCapture}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <Label htmlFor="card-number">Número do cartão</Label>
              <Input
                id="card-number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                value={form.number}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  value={form.expiry}
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
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  value={form.cvv}
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
            <div className="space-y-2">
              <Label htmlFor="holder-name">Nome do titular</Label>
              <Input
                id="holder-name"
                autoComplete="cc-name"
                placeholder="Como está no cartão"
                value={form.holderName}
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
                autoComplete="off"
                placeholder="000.000.000-00"
                value={form.holderCpf}
                onChange={(e) =>
                  setForm((f) => ({ ...f, holderCpf: formatCpf(e.target.value) }))
                }
                className="h-11 rounded-xl"
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </form>
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
