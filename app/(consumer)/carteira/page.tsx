'use client';

import { Suspense, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsumerLoading } from '@/components/consumer-loading';
import type { Ficha } from '@/lib/types/event-domain';
import { WalletTopUpDialog } from '@/components/payments/wallet-top-up-dialog';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import { formatWalletBalance, useWallet } from '@/lib/wallet-context';
import { FichaCard } from '@/components/ficha-card';
import { useConsumerEventId } from '@/lib/consumer-scope';
import { useUserOrders } from '@/lib/user-orders-context';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'movimentacoes' as const, label: 'Movimentações' },
  { id: 'fichas' as const, label: 'Fichas disponíveis' },
];

type TabId = (typeof tabs)[number]['id'];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

function TransactionsList() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="font-semibold text-foreground">Nenhuma movimentação</p>
      <p className="mt-1 text-sm text-muted-foreground">
        O histórico da carteira aparecerá aqui quando a API estiver disponível.
      </p>
    </div>
  );
}

function FichasList({ fichas }: { fichas: Ficha[] }) {
  if (fichas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
          🎫
        </div>
        <p className="mt-4 font-semibold text-foreground">Nenhuma ficha disponível</p>
        <p className="mt-1 text-sm text-muted-foreground">
          QR codes válidos dos seus pedidos aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fichas.map((ficha, index) => (
        <motion.div
          key={ficha.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <FichaCard ficha={ficha} />
        </motion.div>
      ))}
    </div>
  );
}

function CarteiraContent() {
  const searchParams = useSearchParams();
  const initialTab: TabId =
    searchParams.get('tab') === 'fichas' ? 'fichas' : 'movimentacoes';
  const initialTabIndex = tabs.findIndex((t) => t.id === initialTab);

  const { balance, loadError, refreshWallet } = useWallet();
  const { config: paymentsConfig } = usePaymentsConfig();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const consumerEventId = useConsumerEventId();
  const { getAvailableFichasForEvent } = useUserOrders();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [[tabIndex, direction], setTabPosition] = useState([initialTabIndex, 0]);

  const availableFichas = useMemo(
    () => getAvailableFichasForEvent(consumerEventId),
    [getAvailableFichasForEvent, consumerEventId]
  );

  const selectTab = (tabId: TabId) => {
    const newIndex = tabs.findIndex((t) => t.id === tabId);
    if (newIndex === tabIndex) return;
    setTabPosition([newIndex, newIndex > tabIndex ? 1 : -1]);
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <h1 className="font-bold text-foreground text-lg">Carteira</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Saldo disponível</span>
          </div>
          <p className="mt-2 text-4xl font-bold">
            R$ {formatWalletBalance(balance)}
          </p>
          {loadError && (
            <p className="mt-2 text-sm text-primary-foreground/80">{loadError}</p>
          )}
          {(paymentsConfig.topUpEnabled || paymentsConfig.enabled) && (
            <Button
              variant="secondary"
              className="mt-5 w-full h-12 rounded-xl font-semibold"
              onClick={() => setTopUpOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar créditos
            </Button>
          )}
        </motion.div>

        <WalletTopUpDialog
          open={topUpOpen}
          onClose={() => setTopUpOpen(false)}
          onSuccess={() => void refreshWallet()}
        />

        <div className="space-y-4">
          <div className="relative grid h-12 grid-cols-2 rounded-xl bg-secondary p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="carteira-tab-pill"
                    className="absolute inset-0 rounded-lg bg-background shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {activeTab === 'movimentacoes' ? (
                  <TransactionsList />
                ) : (
                  <FichasList fichas={availableFichas} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CarteiraPage() {
  return (
    <Suspense fallback={<ConsumerLoading />}>
      <CarteiraContent />
    </Suspense>
  );
}
