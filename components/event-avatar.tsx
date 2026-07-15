'use client';

import { isImageUrl } from '@/lib/catalog/product-images';
import { EVENT_IMAGE_FALLBACK, getEventImage } from '@/lib/event-image';
import { cn } from '@/lib/utils';

interface EventAvatarProps {
  event: {
    banner?: string;
    icon?: string;
    name: string;
  };
  className?: string;
  emojiClassName?: string;
}

export function EventAvatar({ event, className, emojiClassName }: EventAvatarProps) {
  const image = getEventImage(event);

  if (image && isImageUrl(image)) {
    return (
      <img src={image} alt={event.name} className={cn('h-full w-full object-cover', className)} />
    );
  }

  return (
    <span className={cn('select-none', emojiClassName)} aria-hidden>
      {EVENT_IMAGE_FALLBACK}
    </span>
  );
}
