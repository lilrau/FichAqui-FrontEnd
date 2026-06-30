'use client';

import { motion } from 'framer-motion';
import { useNavigation } from '@/components/navigation-provider';
import { Minus, Plus, Flame, ChevronRight } from 'lucide-react';
import type { CardapioProduct, CatalogProduct, MenuItem, Offering, Stall } from '@/lib/types/event-domain';
import { useCart } from '@/lib/cart-context';
import { useEventStore } from '@/lib/event-store';
import { useEventId } from '@/lib/event-context';
import {
  canQuickAddFromCardapio,
  getProductCartQuantity,
  hasMultipleVariants,
  offeringVariantToMenuItem,
} from '@/lib/menu-utils';
import { ProductPriceDisplay, VariantPriceDisplay } from '@/components/product-price-display';
import { ProductImage } from '@/components/product-image';
import { cn } from '@/lib/utils';
import type { OfferingVariant } from '@/lib/types/event-domain';

interface MenuItemCardItemProps {
  item: MenuItem;
  product?: never;
  entry?: never;
  variant?: 'default' | 'compact';
}

interface MenuItemCardProductProps {
  entry: CardapioProduct;
  item?: never;
  product?: never;
  variant?: 'default';
}

type MenuItemCardProps = MenuItemCardItemProps | MenuItemCardProductProps;

export function MenuItemCard(props: MenuItemCardProps) {
  if ('item' in props && props.item) {
    return <MenuItemCardCompact item={props.item} variant={props.variant ?? 'compact'} />;
  }

  return <CardapioProductCard entry={props.entry} />;
}

function CardapioProductCard({ entry }: { entry: CardapioProduct }) {
  const eventId = useEventId();
  const { startNav } = useNavigation();
  const { getStallsByEventId } = useEventStore();
  const { items, addItem, updateQuantity } = useCart();
  const stalls = getStallsByEventId(eventId);
  const quickAddItem = canQuickAddFromCardapio(entry, stalls);
  const needsProductPage =
    entry.offerings.length > 1 ||
    hasMultipleVariants(entry.product) ||
    !quickAddItem;
  const quantity = getProductCartQuantity(entry, items);

  const handleOpenProduct = () => {
    startNav(`/cardapio/${entry.product.id}`);
  };

  const handleAdd = () => {
    if (quickAddItem) {
      addItem(quickAddItem);
    }
  };

  const handleDecrease = () => {
    if (quickAddItem && quantity > 0) {
      updateQuantity(quickAddItem.id, quantity - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={needsProductPage ? handleOpenProduct : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card shadow-md border border-border',
        'transition-all duration-200 hover:shadow-lg',
        quantity > 0 && 'ring-2 ring-primary ring-offset-2',
        needsProductPage && 'cursor-pointer'
      )}
    >
      {entry.product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {entry.product.badge === 'Mais vendido' && <Flame className="h-3 w-3" />}
            {entry.product.badge}
          </span>
        </div>
      )}

      <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-secondary to-muted">
        <ProductImage
          src={entry.product.image}
          alt={entry.product.name}
          className="h-full w-full object-cover"
          emojiClassName="text-6xl"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-card-foreground text-lg leading-tight">
          {entry.product.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {entry.product.description}
        </p>

        <ProductPriceDisplay entry={entry} className="mt-3" />

        <div className="mt-3 flex items-center justify-end">
          {needsProductPage ? (
            <div className="flex items-center gap-2">
              {quantity > 0 && (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary/10 px-2 text-sm font-bold text-primary">
                  {quantity}
                </span>
              )}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          ) : quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(event) => {
                event.stopPropagation();
                handleAdd();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md active:shadow-sm"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          ) : (
            <QuantityControl
              quantity={quantity}
              onIncrease={handleAdd}
              onDecrease={handleDecrease}
              size="md"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MenuItemCardCompact({
  item,
  variant,
}: {
  item: MenuItem;
  variant: 'default' | 'compact';
}) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((cartEntry) => cartEntry.item.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1);
    }
  };

  if (variant === 'default') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-2xl bg-card shadow-md border border-border',
          'transition-all duration-200 hover:shadow-lg',
          quantity > 0 && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        {item.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              {item.badge === 'Mais vendido' && <Flame className="h-3 w-3" />}
              {item.badge}
            </span>
          </div>
        )}

        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-secondary to-muted">
          <ProductImage
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            emojiClassName="text-6xl"
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold text-card-foreground text-lg leading-tight">
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{item.stallName}</p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          <span className="mt-3 block text-xl font-bold text-primary">
            {item.price === 0 ? 'Grátis' : `R$ ${item.price.toFixed(2)}`}
          </span>

          <div className="mt-3 flex items-center justify-end">
            {quantity === 0 ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAdd}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md active:shadow-sm"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            ) : (
              <QuantityControl
                quantity={quantity}
                onIncrease={handleAdd}
                onDecrease={handleDecrease}
                size="md"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm border border-border"
    >
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        <ProductImage
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
          emojiClassName="text-2xl"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-card-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate">{item.stallName}</p>
        <p className="text-sm font-bold text-primary">
          {item.price === 0 ? 'Grátis' : `R$ ${item.price.toFixed(2)}`}
        </p>
      </div>
      <QuantityControl
        quantity={quantity}
        onIncrease={handleAdd}
        onDecrease={handleDecrease}
        size="sm"
      />
    </motion.div>
  );
}

export function OfferingVariantRow({
  product,
  offering,
  stall,
  variant,
}: {
  product: CatalogProduct;
  offering: Offering;
  stall: Stall;
  variant: OfferingVariant;
}) {
  const { items, addItem, updateQuantity } = useCart();
  const menuItem = offeringVariantToMenuItem(product, offering, stall, variant);
  const cartItem = menuItem
    ? items.find((cartEntry) => cartEntry.item.id === menuItem.id)
    : undefined;
  const quantity = cartItem?.quantity || 0;

  if (!menuItem) return null;

  const handleAdd = () => {
    addItem(menuItem);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      updateQuantity(menuItem.id, quantity - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm border border-border"
    >
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          emojiClassName="text-2xl"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-card-foreground truncate">
          {product.variantTemplates.length > 1
            ? product.variantTemplates.find((template) => template.id === variant.templateId)
                ?.label
            : product.name}
        </p>
        <VariantPriceDisplay price={variant.price} />
      </div>
      <QuantityControl
        quantity={quantity}
        onIncrease={handleAdd}
        onDecrease={handleDecrease}
        size="sm"
      />
    </motion.div>
  );
}

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'sm' | 'md';
}

function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  size = 'md',
}: QuantityControlProps) {
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textSize = size === 'sm' ? 'text-sm w-6' : 'text-base w-8';

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(event) => {
          event.stopPropagation();
          onDecrease();
        }}
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground'
        )}
      >
        <Minus className="h-4 w-4" />
      </motion.button>
      <span className={cn(textSize, 'text-center font-bold text-foreground')}>
        {quantity}
      </span>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(event) => {
          event.stopPropagation();
          onIncrease();
        }}
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-lg bg-primary text-primary-foreground'
        )}
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

/** @deprecated Use OfferingVariantRow */
export const MenuVariantRow = OfferingVariantRow;
