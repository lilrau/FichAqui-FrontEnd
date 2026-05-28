import type { MenuProduct } from '@/lib/mock-data';
import { getProductPriceParts } from '@/lib/menu-utils';
import { cn } from '@/lib/utils';

interface ProductPriceDisplayProps {
  product: MenuProduct;
  className?: string;
}

export function ProductPriceDisplay({ product, className }: ProductPriceDisplayProps) {
  const parts = getProductPriceParts(product);

  if (parts.kind === 'unavailable') {
    return (
      <span className={cn('text-sm text-muted-foreground', className)}>
        Indisponível
      </span>
    );
  }

  if (parts.kind === 'free') {
    return (
      <span className={cn('text-xl font-bold text-primary', className)}>Grátis</span>
    );
  }

  if (parts.kind === 'single') {
    return (
      <span className={cn('text-xl font-bold text-primary', className)}>
        {parts.price}
      </span>
    );
  }

  return (
    <div className={cn('flex flex-col gap-0.5 text-primary', className)}>
      <span className="text-xs font-medium leading-none text-muted-foreground">
        A partir de
      </span>
      <span className="text-xl font-bold leading-tight">{parts.price}</span>
    </div>
  );
}
