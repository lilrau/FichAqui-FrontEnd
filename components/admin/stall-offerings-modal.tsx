'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { useEventStore } from '@/lib/event-store';
import { createOfferingFromCatalogProduct } from '@/lib/catalog/create-offering';
import type { CatalogProduct, Offering, OfferingVariant, Stall } from '@/lib/types/event-domain';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/product-image';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface StallOfferingsModalProps {
  stall: Stall;
  onClose: () => void;
}

export function StallOfferingsModal({ stall, onClose }: StallOfferingsModalProps) {
  const {
    catalogProducts,
    getOfferingsByStallId,
    addOffering,
    updateOffering,
    deleteOffering,
  } = useEventStore();
  const stallOfferings = getOfferingsByStallId(stall.id);
  const [showCatalog, setShowCatalog] = useState(false);

  const availableCatalogProducts = useMemo(() => {
    const offeredIds = new Set(stallOfferings.map((offering) => offering.productId));
    return catalogProducts.filter((product) => !offeredIds.has(product.id));
  }, [catalogProducts, stallOfferings]);

  const handleAddProduct = (product: CatalogProduct) => {
    const offering = createOfferingFromCatalogProduct(stall.eventId, stall.id, product.id);
    offering.variants = product.variantTemplates.map((template) => ({
      templateId: template.id,
      price: 0,
      available: true,
    }));
    addOffering(offering);
    setShowCatalog(false);
  };

  const handleVariantChange = (
    offering: Offering,
    templateId: string,
    patch: Partial<OfferingVariant>
  ) => {
    updateOffering(offering.id, {
      variants: offering.variants.map((variant) =>
        variant.templateId === templateId ? { ...variant, ...patch } : variant
      ),
    });
  };

  const getProduct = (productId: string) =>
    catalogProducts.find((product) => product.id === productId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card shadow-2xl"
      >
        <div className="sticky top-0 bg-card z-10 border-b border-border">
          <div className="flex justify-center pt-3">
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-bold text-lg text-card-foreground">Cardápio da barraca</h2>
              <p className="text-sm text-muted-foreground">{stall.name}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {stallOfferings.length === 0 ? (
            <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
              Nenhum produto adicionado. Selecione itens do catálogo global.
            </p>
          ) : (
            stallOfferings.map((offering) => {
              const product = getProduct(offering.productId);
              if (!product) return null;

              return (
                <div
                  key={offering.id}
                  className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-secondary shrink-0">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          emojiClassName="text-2xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-destructive shrink-0"
                      onClick={() => deleteOffering(offering.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {product.variantTemplates.map((template) => {
                      const variant = offering.variants.find(
                        (entry) => entry.templateId === template.id
                      ) ?? {
                        templateId: template.id,
                        price: 0,
                        available: false,
                      };

                      return (
                        <div
                          key={template.id}
                          className="flex items-center gap-3 rounded-xl bg-card px-3 py-2"
                        >
                          <Switch
                            checked={variant.available}
                            onCheckedChange={(available) =>
                              handleVariantChange(offering, template.id, { available })
                            }
                          />
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {template.label}
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={variant.price}
                            disabled={!variant.available}
                            onChange={(event) =>
                              handleVariantChange(offering, template.id, {
                                price: Number(event.target.value),
                              })
                            }
                            className="h-10 w-24 rounded-lg text-right"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => setShowCatalog((current) => !current)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar produto do catálogo
          </Button>

          <AnimatePresence>
            {showCatalog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {availableCatalogProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todos os produtos do catálogo já foram adicionados.
                  </p>
                ) : (
                  availableCatalogProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left',
                        'transition-colors hover:bg-secondary/50'
                      )}
                    >
                      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-secondary shrink-0">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          emojiClassName="text-2xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 pb-8">
          <Button onClick={onClose} className="w-full h-14 text-lg font-bold rounded-2xl">
            Concluir
          </Button>
        </div>
      </motion.div>
    </>
  );
}
