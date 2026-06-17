'use client';

import { useState } from 'react';
import { isImageUrl, PRODUCT_IMAGE_FALLBACK } from '@/lib/catalog/product-images';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  emojiClassName?: string;
}

export function ProductImage({ src, alt, className, emojiClassName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const display = src?.trim() ? src : PRODUCT_IMAGE_FALLBACK;

  if (!isImageUrl(display) || failed) {
    return (
      <span className={cn('inline-flex shrink-0 items-center justify-center', emojiClassName, className)}>
        {failed || !isImageUrl(display) ? (display || PRODUCT_IMAGE_FALLBACK) : display}
      </span>
    );
  }

  return (
    <img
      src={display}
      alt={alt}
      className={cn('object-cover shrink-0', className)}
      onError={() => setFailed(true)}
    />
  );
}
