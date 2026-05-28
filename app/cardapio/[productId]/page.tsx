'use client';

import { use, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Flame } from 'lucide-react';
import { menuProducts } from '@/lib/mock-data';
import { getProductById } from '@/lib/menu-utils';
import { ProductPriceDisplay } from '@/components/product-price-display';
import { MenuVariantRow } from '@/components/menu-item-card';

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const product = getProductById(menuProducts, productId);

  useEffect(() => {
    if (!product || !product.available) {
      router.replace('/cardapio');
    }
  }, [product, router]);

  if (!product || !product.available) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">{product.name}</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-card border border-border shadow-md"
        >
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
        </motion.div>

        <section className="space-y-3">
          <h3 className="font-bold text-lg text-foreground">Escolha a opção</h3>

          {product.variants
            .filter((variant) => variant.available)
            .map((variant, index) => (
              <motion.div
                key={variant.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MenuVariantRow product={product} variant={variant} />
              </motion.div>
            ))}
        </section>
      </main>
    </div>
  );
}
