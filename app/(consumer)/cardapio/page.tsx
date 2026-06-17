'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogIn, MapPin, Search, ShoppingBag, Wallet } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { isFichaValid } from '@/lib/mock-data';
import { useEventStore } from '@/lib/event-store';
import { buildConsumerEventHref } from '@/lib/consumer-scope';
import { useActiveEvent, useEventId } from '@/lib/event-context';
import { cardapioMatchesSearch } from '@/lib/menu-utils';
import { MenuItemCard } from '@/components/menu-item-card';
import { CategoryPills } from '@/components/category-pills';
import { CartSheet, FloatingOrderButton } from '@/components/cart-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { formatWalletBalance, useWallet } from '@/lib/wallet-context';
import { useUserOrders } from '@/lib/user-orders-context';
import { useConsumerEventId } from '@/lib/consumer-scope';
import { cn } from '@/lib/utils';

function CardapioContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const { itemCount } = useCart();
  const consumerEventId = useConsumerEventId();
  const { getAvailableFichasForEvent } = useUserOrders();
  const { activeEvent } = useActiveEvent();
  const eventId = useEventId();
  const { getCardapioByEventId, categories } = useEventStore();
  const cardapio = getCardapioByEventId(eventId);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableFichasCount = useMemo(() => {
    return getAvailableFichasForEvent(consumerEventId).filter(isFichaValid).length;
  }, [getAvailableFichasForEvent, consumerEventId]);

  const filteredCardapio = cardapio.filter((entry) => {
    const matchesCategory = !activeCategory || entry.product.category === activeCategory;
    const matchesSearch = !searchQuery || cardapioMatchesSearch(entry, searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/pedido');
  };

  const formattedBalance = formatWalletBalance(balance);

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        itemCount > 0 ? 'pb-56' : 'pb-24'
      )}
    >
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-primary flex items-center justify-center text-xl">
                {activeEvent?.icon ?? '🎪'}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-foreground truncate">{activeEvent?.name ?? 'Cardápio'}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{activeEvent?.location}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/15"
                    aria-label="Abrir carrinho"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span
                        className={cn(
                          'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center',
                          'rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground'
                        )}
                      >
                        {itemCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(buildConsumerEventHref('/carteira', eventId, { tab: 'fichas' }))
                    }
                    className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 transition-colors hover:bg-secondary/80"
                  >
                    <Wallet className="h-5 w-5 text-primary" />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        R$ {formattedBalance}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {availableFichasCount}{' '}
                        {availableFichasCount === 1 ? 'ficha' : 'fichas'}
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-xl h-10">
                    <LogIn className="h-4 w-4 mr-1" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="px-4 pb-3">
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </header>

      <main className="px-4 py-4">
        {filteredCardapio.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
              🔍
            </div>
            <p className="mt-4 font-semibold text-foreground">Nenhum item encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente buscar por outro termo
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCategory ?? 'all'}
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {filteredCardapio.map((entry) => (
                <motion.div
                  key={entry.product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <MenuItemCard entry={entry} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <FloatingOrderButton
        visible={itemCount > 0}
        onClick={() => router.push('/pedido')}
      />

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default function CardapioPage() {
  return <CardapioContent />;
}
