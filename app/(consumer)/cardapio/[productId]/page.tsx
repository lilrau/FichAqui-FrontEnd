'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Flame, LogIn, ShoppingCart, Store } from 'lucide-react';
import Link from 'next/link';
import { getCardapioByProductId, getStallById } from '@/lib/menu-utils';
import { useCart } from '@/lib/cart-context';
import { useEventStore } from '@/lib/event-store';
import { buildConsumerEventHref } from '@/lib/consumer-scope';
import { useEventId } from '@/lib/event-context';
import { ConsumerLoading } from '@/components/consumer-loading';
import { ProductPriceDisplay } from '@/components/product-price-display';
import { ProductImage } from '@/components/product-image';
import { OfferingVariantRow } from '@/components/menu-item-card';
import { CartSheet, FloatingCartActions } from '@/components/cart-sheet';
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
  const { getCardapioByEventId, getStallsByEventId } = useEventStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cardapio = getCardapioByEventId(eventId);
  const stalls = getStallsByEventId(eventId);
  const entry = getCardapioByProductId(cardapio, productId);
  const openOfferings = useMemo(
    () =>
      entry?.offerings.filter((offering) => {
        const stall = getStallById(stalls, offering.stallId);
        return stall?.status === 'open' && offering.available;
      }) ?? [],
    [entry, stalls]
  );
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);

  const selectedOffering =
    openOfferings.find((offering) => offering.id === selectedOfferingId) ??
    (openOfferings.length === 1 ? openOfferings[0] : null);
  const selectedStall = selectedOffering
    ? getStallById(stalls, selectedOffering.stallId)
    : undefined;

  useEffect(() => {
    if (!entry || openOfferings.length === 0) {
      router.replace(buildConsumerEventHref('/cardapio', eventId));
    }
  }, [entry, openOfferings.length, router, eventId]);

  useEffect(() => {
    if (openOfferings.length === 1) {
      setSelectedOfferingId(openOfferings[0].id);
    }
  }, [openOfferings]);

  if (!entry || openOfferings.length === 0) {
    return <ConsumerLoading />;
  }

  const { product } = entry;
  const selectedEntry = selectedOffering
    ? { product, offerings: [selectedOffering] }
    : entry;
  const visibleVariants =
    selectedOffering?.variants.filter((variant) => variant.available) ?? [];

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        itemCount > 0 ? 'pb-80' : 'pb-24'
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
              <ShoppingCart className="h-4 w-4" />
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
            <ProductImage
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              emojiClassName="text-7xl"
            />
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
              <p className="mt-1 text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex justify-end">
              <ProductPriceDisplay entry={selectedOffering ? selectedEntry : entry} />
            </div>
          </div>
        </div>

        {openOfferings.length > 1 && (
          <section className="space-y-3">
            <h3 className="font-bold text-lg text-foreground">Escolha a barraca</h3>
            {openOfferings.map((offering) => {
              const stall = getStallById(stalls, offering.stallId);
              if (!stall) return null;
              const isSelected = selectedOffering?.id === offering.id;

              return (
                <button
                  key={offering.id}
                  type="button"
                  onClick={() => setSelectedOfferingId(offering.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  )}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: stall.color }}
                  >
                    <Store className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{stall.name}</p>
                    <p className="text-sm text-muted-foreground">{stall.responsible}</p>
                  </div>
                </button>
              );
            })}
          </section>
        )}

        {selectedOffering && selectedStall && (
          <section className="space-y-3">
            <div>
              <h3 className="font-bold text-lg text-foreground">Escolha a opção</h3>
              <p className="text-sm text-muted-foreground">{selectedStall.name}</p>
            </div>

            {visibleVariants.map((variant) => (
              <OfferingVariantRow
                key={`${selectedOffering.id}-${variant.templateId}`}
                product={product}
                offering={selectedOffering}
                stall={selectedStall}
                variant={variant}
              />
            ))}
          </section>
        )}

        {openOfferings.length > 1 && !selectedOffering && (
          <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
            Selecione uma barraca para ver as opções disponíveis.
          </p>
        )}
      </main>

      <FloatingCartActions
        visible={itemCount > 0}
        onCheckout={() => router.push('/pedido')}
        onContinueBrowsing={() =>
          router.push(buildConsumerEventHref('/cardapio', eventId))
        }
        continueLabel="Continuar no cardápio"
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
