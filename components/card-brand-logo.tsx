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
  'relative flex h-10 w-[60px] shrink-0 items-center justify-end overflow-hidden';

const logoMotion = {
  initial: { opacity: 0, scale: 0.82, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -4 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function VisaLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 16"
      className="h-8 max-h-full w-auto max-w-full"
      aria-hidden
    >
      <path
        fill="#fff"
        d="M19.2 15.2h-3.1L16.5 4.5h3.1l-.4 10.7zm11.8-10.4c-.6-.2-1.6-.5-2.8-.5-3.1 0-5.2 1.6-5.2 4 0 1.7 1.6 2.7 2.8 3.3 1.2.6 1.7 1 1.7 1.5 0 .8-1 1.2-2 1.2-1.3 0-2-.3-3.1-.9l-.4-.2-.5 2.8c.8.4 2.3.7 3.8.7 3.3 0 5.4-1.6 5.5-4 .1-1.4-.9-2.4-2.8-3.3-1.2-.6-1.9-1-1.9-1.6 0-.5.6-1.1 1.9-1.1 1.1 0 1.9.2 2.5.5l.3.1.5-2.7zm8.2 6.6c.5-1.3 2.5-6.2 2.5-6.2h-2.9c0 0-1.4 3-2.1 4.5l-2.5-4.5h-3.3l4 6.8-2.3 3.9h2.9l6.1-10.5zM8.3 4.5L5.3 11.6l-.3-1.6c-.6-1.9-2.4-4-4.4-5l2.7 10.7h3.2l4.8-10.7H8.3zM2.6 4.5H0L0 4.7c3.8.9 6.3 3.2 7.3 5.9L5.5 4.5H2.6z"
      />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-96 -98.908 832 593.448"
      className="h-full max-h-10 w-auto max-w-full"
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
  if (brand === 'visa') return <VisaLogo />;
  if (brand === 'mastercard') return <MastercardLogo />;
  if (imageError) return <BrandFallback brand={brand} />;

  return (
    <Image
      src={getCardBrandIconPath(brand)}
      alt={CARD_BRAND_LABELS[brand]}
      width={60}
      height={40}
      className="max-h-10 max-w-[60px] object-contain object-right"
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
            className="absolute inset-0 flex items-center justify-end"
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
