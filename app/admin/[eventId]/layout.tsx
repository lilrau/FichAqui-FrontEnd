'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrganizerEventsStrip } from '@/components/admin/organizer-events-strip';
import { ChevronDown, LogOut } from 'lucide-react';
import {
  formatEventScheduleMeta,
  getEventStatusLabel,
} from '@/lib/event-routing';
import { useEventStore } from '@/lib/event-store';
import { useAppReady } from '@/lib/event-context';
import { isImageUrl } from '@/lib/catalog/product-images';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { events, getEventById, hydrated } = useEventStore();
  const ready = useAppReady();
  const event = getEventById(eventId);

  useEffect(() => {
    if (!hydrated) return;
    if (!event && events.length > 0) {
      router.replace('/admin');
    }
  }, [event, events.length, router, hydrated]);

  if (!ready || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando evento…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-foreground">Evento não encontrado</p>
        <p className="text-sm text-muted-foreground">
          O evento &quot;{eventId}&quot; não existe ou foi removido.
        </p>
        <Link
          href="/admin"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ver todos os eventos
        </Link>
      </div>
    );
  }

  const otherEvents = events.filter((e) => e.id !== eventId);
  const scheduleMeta = formatEventScheduleMeta(event);

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-30 text-primary-foreground"
        style={{ backgroundColor: event.primaryColor }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-primary-foreground/20 flex items-center justify-center text-xl">
                {event.icon && isImageUrl(event.icon) ? (
                  <img src={event.icon} alt={event.name} className="h-full w-full object-cover" />
                ) : (
                  event.icon ?? '🎪'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm opacity-80 truncate">Painel Administrativo</p>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-bold text-left max-w-[200px]">
                    <span className="truncate">{event.name}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {otherEvents.map((e) => (
                      <DropdownMenuItem key={e.id} asChild>
                        <Link href={`/admin/${e.id}`}>{e.name}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Todos os eventos</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm opacity-90">
            <span
              className={
                event.status === 'active'
                  ? 'h-2 w-2 rounded-full bg-green-300'
                  : 'h-2 w-2 rounded-full bg-gray-300'
              }
            />
            <span>{getEventStatusLabel(event.status)}</span>
            {scheduleMeta && (
              <>
                <span>•</span>
                <span>{scheduleMeta}</span>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="px-4 pt-4">
        <OrganizerEventsStrip currentEventId={eventId} title="Outros eventos seus" />
      </div>
      {children}
    </div>
  );
}
