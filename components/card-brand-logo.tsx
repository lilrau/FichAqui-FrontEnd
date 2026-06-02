'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  CARD_BRAND_LABELS,
  CardNetwork,
  getCardBrandIconPath,
} from '@/lib/card-brand';
import { cn } from '@/lib/utils';

const LOGO_SLOT_CLASS =
  'relative flex h-10 w-[60px] shrink-0 items-center justify-center';

const logoMotion = {
  initial: { opacity: 0, scale: 0.82, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -4 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function MastercardLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-96 -98.908 832 593.448"
      className="h-full w-auto max-h-full max-w-full"
      aria-hidden
    >
      <path fill="#ff5f00" d="M224.833 42.298h190.416v311.005H224.833z" />
      <path
        fill="#eb001b"
        d="M244.446 197.828a197.448 197.448 0 0175.54-155.475 197.777 197.777 0 100 311.004 197.448 197.448 0 01-75.54-155.53z"
      />
      <path
        fill="#f79e1b"
        d="M640 197.828a197.777 197.777 0 01-320.015 155.474 197.777 197.777 0 000-311.004A197.777 197.777 0 01640 197.773z"
      />
    </svg>
  );
}

function BrandFallback({ brand }: { brand: CardNetwork }) {
  return (
    <span className="max-w-full truncate text-[10px] font-bold uppercase leading-tight text-white/90">
      {CARD_BRAND_LABELS[brand]}
    </span>
  );
}

function BrandLogoContent({
  brand,
  imageError,
  onImageError,
}: {
  brand: CardNetwork;
  imageError: boolean;
  onImageError: () => void;
}) {
  if (brand === 'mastercard') return <MastercardLogo />;
  if (imageError) return <BrandFallback brand={brand} />;

  return (
    <Image
      src={getCardBrandIconPath(brand)}
      alt={CARD_BRAND_LABELS[brand]}
      width={60}
      height={40}
      className="max-h-full max-w-full object-contain"
      onError={onImageError}
    />
  );
}

interface CardBrandLogoProps {
  brand: CardNetwork | null;
  className?: string;
}

export function CardBrandLogo({ brand, className }: CardBrandLogoProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [brand]);

  const motionKey = brand
    ? `${brand}${imageError ? '-fallback' : ''}`
    : 'empty';

  return (
    <div className={cn(LOGO_SLOT_CLASS, className)} aria-hidden={!brand}>
      <AnimatePresence mode="wait">
        {brand ? (
          <motion.div
            key={motionKey}
            className="absolute inset-0 flex items-center justify-center px-0.5"
            {...logoMotion}
          >
            <BrandLogoContent
              brand={brand}
              imageError={imageError}
              onImageError={() => setImageError(true)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
