'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { SavedCreditCard } from '@/components/saved-credit-card';
import { MpCardForm } from '@/components/payments/mp-card-form';
import { Button } from '@/components/ui/button';
import { addWalletCard, deleteWalletCard } from '@/lib/api/wallet';
import { getErrorMessage } from '@/lib/api/errors';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import type { CardTokenResult } from '@/lib/types/payment';
import { useWallet } from '@/lib/wallet-context';

export default function MetodosPagamentoPage() {
  const router = useRouter();
  const { savedCards, loadError, hydrated, refreshWallet } = useWallet();
  const { config } = usePaymentsConfig();
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const mpReady = config.enabled && config.cardEnabled && Boolean(config.publicKey);
  const canAddSavedCard = mpReady;

  const handleAddCard = async (result: CardTokenResult) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await addWalletCard({
        cardToken: result.token,
        paymentMethodId: result.paymentMethodId,
      });
      await refreshWallet();
      setShowAddForm(false);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível salvar o cartão.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setDeletingId(cardId);
    setFormError(null);
    try {
      await deleteWalletCard(cardId);
      await refreshWallet();
      setConfirmDeleteId(null);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível remover o cartão.'));
    } finally {
      setDeletingId(null);
    }
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
          Cartões vinculados à sua conta para checkout e recarga da carteira.
        </p>

        {loadError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {formError && !showAddForm && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {formError}
          </p>
        )}

        {!showAddForm && (
          canAddSavedCard ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar cartão
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl"
                disabled
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar cartão
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Cartões ficarão disponíveis quando o Mercado Pago estiver configurado.
              </p>
            </div>
          )
        )}

        {canAddSavedCard && showAddForm && config.publicKey && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Novo cartão</h2>
              <button
                type="button"
                className="text-sm text-muted-foreground"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
            </div>
            <MpCardForm
              publicKey={config.publicKey}
              amount="1.00"
              showInstallments={false}
              showSubmit
              submitLabel={submitting ? 'Salvando…' : 'Salvar cartão'}
              disabled={submitting}
              onError={setFormError}
              onToken={handleAddCard}
            />
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
        )}

        {!hydrated ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : savedCards.length === 0 ? (
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
              {mpReady
                ? 'Adicione seu primeiro cartão para agilizar pagamentos e recargas no evento.'
                : 'Cartões ficarão disponíveis quando o Mercado Pago estiver configurado.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {savedCards.map((card, index) => {
              const isConfirmingDelete = confirmDeleteId === card.id;
              const isDeleting = deletingId === card.id;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="payment-card-shell">
                    <SavedCreditCard card={card} />
                  </div>
                  <div className="flex items-center justify-end gap-2 px-1">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-1.5 text-sm">
                        <span className="text-xs font-medium text-destructive">
                          Remover este cartão?
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2.5 text-xs rounded-lg font-semibold"
                          disabled={isDeleting}
                          onClick={() => void handleDeleteCard(card.id)}
                        >
                          {isDeleting ? 'Removendo...' : 'Sim, remover'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs rounded-lg text-muted-foreground hover:bg-background/80"
                          disabled={isDeleting}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => setConfirmDeleteId(card.id)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Remover cartão
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
