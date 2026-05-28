'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, User, Receipt, Search, X } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { menuProducts, categories, currentEvent } from '@/lib/mock-data';
import { productMatchesSearch } from '@/lib/menu-utils';
import { MenuItemCard } from '@/components/menu-item-card';
import { CategoryPills } from '@/components/category-pills';
import { CartSheet, FloatingCartButton } from '@/components/cart-sheet';
import { Input } from '@/components/ui/input';

function CardapioContent() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredProducts = menuProducts.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory;
    const matchesSearch = !searchQuery || productMatchesSearch(product, searchQuery);
    return matchesCategory && matchesSearch && product.available;
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/pedido');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-xl">
                🎪
              </div>
              <div>
                <h1 className="font-bold text-foreground">{currentEvent.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{currentEvent.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
              >
                {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
              <button
                onClick={() => router.push('/meus-pedidos')}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground relative"
              >
                <Receipt className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
              >
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Live Badge */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-sm">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-2 w-2 rounded-full bg-green-500"
              />
              <span className="font-medium">Aberto agora</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{currentEvent.startTime} - {currentEvent.endTime}</span>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <Input
                    type="text"
                    placeholder="Buscar itens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Floating Cart Button */}
      <AnimatePresence>
        {itemCount > 0 && (
          <FloatingCartButton onClick={() => setIsCartOpen(true)} />
        )}
      </AnimatePresence>

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
