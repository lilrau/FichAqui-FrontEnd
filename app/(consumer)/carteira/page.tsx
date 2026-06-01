'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import {
  Ficha,
  getFichasFromOrder,
  isFichaValid,
  mockAvailableFichas,
} from '@/lib/mock-data';
import { FichaCard } from '@/components/ficha-card';
import { cn } from '@/lib/utils';

const mockTransactions = [
  {
    id: 'tx-1',
    label: 'Recarga via PIX',
    amount: 50,
    type: 'credit' as const,
    date: 'Hoje, 14:32',
  },
  {
    id: 'tx-2',
    label: 'Pedido #1234',
    amount: -22,
    type: 'debit' as const,
    date: 'Hoje, 12:15',
  },
  {
    id: 'tx-3',
    label: 'Recarga via PIX',
    amount: 30,
    type: 'credit' as const,
    date: 'Ontem, 18:40',
  },
  {
    id: 'tx-4',
    label: 'Pedido #1189',
    amount: -12,
    type: 'debit' as const,
    date: 'Ontem, 17:22',
  },
];

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
    <div className="space-y-2">
      {mockTransactions.map((tx, index) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                tx.type === 'credit' ? 'bg-green-500/10' : 'bg-secondary'
              }`}
            >
              {tx.type === 'credit' ? (
                <ArrowDownLeft className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{tx.label}</p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
          </div>
          <span
            className={`font-semibold text-sm ${
              tx.type === 'credit' ? 'text-green-600' : 'text-foreground'
            }`}
          >
            {tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
          </span>
        </motion.div>
      ))}
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

export default function CarteiraPage() {
  const balance = 46;
  const { orders } = useCart();
  const [activeTab, setActiveTab] = useState<TabId>('movimentacoes');
  const [[tabIndex, direction], setTabPosition] = useState([0, 0]);

  const availableFichas = useMemo(() => {
    const fromOrders = orders.flatMap(getFichasFromOrder).filter(isFichaValid);
    if (fromOrders.length > 0) return fromOrders;
    return mockAvailableFichas;
  }, [orders]);

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
            R$ {balance.toFixed(2).replace('.', ',')}
          </p>
          <Button
            variant="secondary"
            className="mt-5 w-full h-12 rounded-xl font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar créditos
          </Button>
        </motion.div>

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
