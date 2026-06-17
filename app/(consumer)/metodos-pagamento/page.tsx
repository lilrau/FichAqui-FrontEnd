'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus } from 'lucide-react';
import { SavedCreditCard } from '@/components/saved-credit-card';
import { MpCardForm } from '@/components/payments/mp-card-form';
import { Button } from '@/components/ui/button';
import { addWalletCard } from '@/lib/api/wallet';
import { getErrorMessage } from '@/lib/api/errors';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import { useWallet } from '@/lib/wallet-context';

export default function MetodosPagamentoPage() {
  const router = useRouter();
  const { savedCards, loadError, hydrated, refreshWallet } = useWallet();
  const { config } = usePaymentsConfig();
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mpReady = config.enabled && config.cardEnabled && Boolean(config.publicKey);

  const handleAddCard = async (token: { token: string; paymentMethodId: string }) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await addWalletCard(token);
      await refreshWallet();
      setShowAddForm(false);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível salvar o cartão.'));
    } finally {
      setSubmitting(false);
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

        {mpReady && !showAddForm && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar cartão
          </Button>
        )}

        {showAddForm && config.publicKey && (
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
                ? 'Adicione um cartão para usar no checkout.'
                : 'Cartões ficarão disponíveis quando o Mercado Pago estiver configurado.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {savedCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="payment-card-shell">
                  <SavedCreditCard card={card} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
