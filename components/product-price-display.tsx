import type { CardapioProduct } from '@/lib/mock-data';
import { getCardapioPriceParts } from '@/lib/menu-utils';
import { cn } from '@/lib/utils';

interface ProductPriceDisplayProps {
  entry: CardapioProduct;
  className?: string;
}

export function ProductPriceDisplay({ entry, className }: ProductPriceDisplayProps) {
  const parts = getCardapioPriceParts(entry);

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

interface VariantPriceDisplayProps {
  price: number;
  className?: string;
}

export function VariantPriceDisplay({ price, className }: VariantPriceDisplayProps) {
  return (
    <span className={cn('text-sm font-bold text-primary', className)}>
      {price === 0 ? 'Grátis' : `R$ ${price.toFixed(2)}`}
    </span>
  );
}
