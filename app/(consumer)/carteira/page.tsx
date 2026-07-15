'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsumerLoading } from '@/components/consumer-loading';
import type { Ficha } from '@/lib/types/event-domain';
import { WalletTopUpDialog } from '@/components/payments/wallet-top-up-dialog';
import { usePaymentsConfig } from '@/lib/hooks/use-payments-config';
import { formatWalletBalance, useWallet } from '@/lib/wallet-context';
import { FichaCard } from '@/components/ficha-card';
import { useConsumerEventId } from '@/lib/consumer-scope';
import { useUserOrders } from '@/lib/user-orders-context';
import { fetchWalletTransactions } from '@/lib/api/wallet';
import { getErrorMessage } from '@/lib/api/errors';
import type { WalletTransaction } from '@/lib/types/wallet';
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

function formatRelativeTime(isoDate: string): string {
  const minutes = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000 / 60);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

function TransactionsList({ refreshKey }: { refreshKey: number }) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchWalletTransactions()
      .then((data) => {
        if (!cancelled) {
          setTransactions(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Não foi possível carregar as movimentações.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="font-semibold text-foreground">Nenhuma movimentação</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Recargas e compras com saldo aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const isCredit = transaction.direction === 'credit';
        const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;

        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl bg-card p-4 shadow-md border border-border"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    isCredit ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isCredit ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate font-semibold text-foreground">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(transaction.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-bold',
                  isCredit ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {isCredit ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
              </span>
            </div>
          </motion.div>
        );
      })}
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
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState(0);
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
          onSuccess={() => {
            void refreshWallet();
            setTransactionsRefreshKey((key) => key + 1);
          }}
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
                  <TransactionsList refreshKey={transactionsRefreshKey} />
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
