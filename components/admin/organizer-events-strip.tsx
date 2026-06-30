'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { useEventStore } from '@/lib/event-store';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { isImageUrl } from '@/lib/catalog/product-images';
import type { Event } from '@/lib/types/event-domain';

const statusLabels: Record<Event['status'], string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  active: 'Ativo',
  finished: 'Finalizado',
};

export function OrganizerEventsStrip({
  currentEventId,
  title = 'Seus outros eventos',
}: {
  currentEventId: string;
  title?: string;
}) {
  const { user, hasRole } = useAuth();
  const { getEventsByOrganizerId } = useEventStore();

  if (!hasRole('organizer') || !user?.organizerId) return null;

  const all = getEventsByOrganizerId(user.organizerId);
  const others = all.filter((e) => e.id !== currentEventId);

  if (others.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-foreground">{title}</h2>
        <Link href="/admin" className="text-sm text-primary font-medium">
          Ver todos ({all.length})
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {others.map((event) => (
          <Link
            key={event.id}
            href={`/admin/${event.id}`}
            className="min-w-[220px] max-w-[240px] shrink-0 rounded-2xl border border-border bg-card p-3 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start gap-3">
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg"
                style={{ backgroundColor: `${event.primaryColor}22` }}
              >
                {event.icon && isImageUrl(event.icon) ? (
                  <img src={event.icon} alt={event.name} className="h-full w-full object-cover" />
                ) : (
                  event.icon ?? '🎪'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{event.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {event.location}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-medium capitalize',
                      event.status === 'active'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {statusLabels[event.status]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
