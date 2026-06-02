'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronRight,
  LogOut,
  MapPin,
  Plus,
} from 'lucide-react';
import { useEventStore } from '@/lib/event-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  active: 'Ativo',
  finished: 'Finalizado',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-600',
  published: 'bg-blue-500/10 text-blue-600',
  active: 'bg-green-500/10 text-green-600',
  finished: 'bg-gray-400/10 text-gray-500',
};

export default function AdminHubPage() {
  const router = useRouter();
  const { events } = useEventStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-xl">
                🎪
              </div>
              <div>
                <p className="text-sm opacity-80">Painel Administrativo</p>
                <h1 className="font-bold">Meus eventos</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">Eventos</h2>
          <Link href="/admin/novo">
            <Button className="h-11 rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/${event.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm active:scale-[0.98] transition-transform"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${event.primaryColor}22` }}
                >
                  {event.id === '2' ? '🎄' : '🎪'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{event.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {event.location}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        statusColors[event.status]
                      )}
                    >
                      {statusLabels[event.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {event.startTime} – {event.endTime}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-medium text-primary">Gerir</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
