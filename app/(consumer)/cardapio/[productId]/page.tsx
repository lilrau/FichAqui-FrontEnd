'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Flame, LogIn, ShoppingBag } from 'lucide-react';
import { getProductById } from '@/lib/menu-utils';
import { useCart } from '@/lib/cart-context';
import { useEventStore } from '@/lib/event-store';
import { buildConsumerEventHref } from '@/lib/consumer-scope';
import { useEventId } from '@/lib/event-context';
import { ConsumerLoading } from '@/components/consumer-loading';
import { ProductPriceDisplay } from '@/components/product-price-display';
import { MenuVariantRow } from '@/components/menu-item-card';
import { CartSheet, FloatingOrderButton } from '@/components/cart-sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const eventId = useEventId();
  const { getMenuProductsByEventId } = useEventStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const menuProducts = getMenuProductsByEventId(eventId);
  const product = getProductById(menuProducts, productId);

  useEffect(() => {
    if (!product || !product.available) {
      router.replace(buildConsumerEventHref('/cardapio', eventId));
    }
  }, [product, router, eventId]);

  if (!product || !product.available) {
    return <ConsumerLoading />;
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        itemCount > 0 ? 'pb-56' : 'pb-24'
      )}
    >
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="max-w-[40%] truncate font-bold text-foreground">{product.name}</h1>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            >
              <ShoppingBag className="h-4 w-4" />
              Carrinho
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
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-xl h-10">
                <LogIn className="h-4 w-4 mr-1" />
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="overflow-hidden rounded-2xl bg-card border border-border shadow-md">
          <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-secondary to-muted">
            {product.badge && (
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  {product.badge === 'Mais vendido' && <Flame className="h-3 w-3" />}
                  {product.badge}
                </span>
              </div>
            )}
            <span className="text-7xl">{product.image}</span>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
              <p className="mt-1 text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex justify-end">
              <ProductPriceDisplay product={product} />
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="font-bold text-lg text-foreground">Escolha a opção</h3>

          {product.variants
            .filter((variant) => variant.available)
            .map((variant) => (
              <MenuVariantRow key={variant.id} product={product} variant={variant} />
            ))}
        </section>
      </main>

      <FloatingOrderButton
        visible={itemCount > 0}
        onClick={() => router.push('/pedido')}
      />

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          router.push('/pedido');
        }}
      />
    </div>
  );
}
