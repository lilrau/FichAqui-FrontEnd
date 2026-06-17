'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SavedCreditCard } from '@/components/saved-credit-card';
import { useWallet } from '@/lib/wallet-context';

export default function MetodosPagamentoPage() {
  const router = useRouter();
  const { savedCards, loadError, hydrated } = useWallet();

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
          Cartões vinculados à sua conta. A gestão de cartões (adicionar ou remover) será
          disponibilizada em uma atualização futura.
        </p>

        {loadError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
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
              Quando houver cartões na sua carteira, eles aparecerão aqui.
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
