export const EVENT_IMAGE_FALLBACK = '🎪';

export function getEventImage(event: {
  banner?: string | null;
  icon?: string | null;
}): string {
  return event.banner?.trim() || event.icon?.trim() || '';
}

export function withSyncedEventImage<T extends { banner?: string; icon?: string }>(event: T): T {
  const image = getEventImage(event);

  return {
    ...event,
    banner: image,
    icon: image,
  };
}
