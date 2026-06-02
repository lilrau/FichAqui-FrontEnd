'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Search, ShoppingBag, Wallet } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import {
  categories,
  mockWalletBalance,
  getFichasFromOrder,
  isFichaValid,
  mockAvailableFichas,
} from '@/lib/mock-data';
import { useEventStore } from '@/lib/event-store';
import { buildConsumerEventHref } from '@/lib/consumer-scope';
import { useActiveEvent, useEventId } from '@/lib/event-context';
import { productMatchesSearch } from '@/lib/menu-utils';
import { MenuItemCard } from '@/components/menu-item-card';
import { CategoryPills } from '@/components/category-pills';
import { CartSheet, FloatingOrderButton } from '@/components/cart-sheet';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function CardapioContent() {
  const router = useRouter();
  const { itemCount, orders } = useCart();
  const { activeEvent } = useActiveEvent();
  const eventId = useEventId();
  const { getMenuProductsByEventId } = useEventStore();
  const menuProducts = getMenuProductsByEventId(eventId);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableFichasCount = useMemo(() => {
    const fromOrders = orders.flatMap(getFichasFromOrder).filter(isFichaValid);
    const fichas = fromOrders.length > 0 ? fromOrders : mockAvailableFichas;
    return fichas.length;
  }, [orders]);

  const filteredProducts = menuProducts.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const matchesSearch = !searchQuery || productMatchesSearch(product, searchQuery);
    return matchesCategory && matchesSearch && product.available;
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/pedido');
  };

  const formattedBalance = mockWalletBalance.toFixed(2).replace('.', ',');

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        itemCount > 0 ? 'pb-56' : 'pb-24'
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          {/* Top Row */}
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
            </div>
          </div>

          {/* Search Bar */}
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

        {/* Categories */}
        <div className="px-4 pb-3">
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </header>

      {/* Menu Grid */}
      <main className="px-4 py-4">
        {filteredProducts.length === 0 ? (
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
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MenuItemCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <FloatingOrderButton
        visible={itemCount > 0}
        onClick={() => router.push('/pedido')}
      />

      {/* Cart Sheet */}
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
