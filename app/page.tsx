'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronRight,
  Clock,
  LayoutDashboard,
  LogIn,
  MapPin,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/components/navigation-provider';
import { useAuth } from '@/lib/auth-context';
import { buildConsumerEventHref } from '@/lib/consumer-scope';
import { useCity } from '@/lib/city-context';
import { useActiveEvent } from '@/lib/event-context';
import { useEventStore } from '@/lib/event-store';
import { cityLabel } from '@/lib/types/city';
import { formatEventDate } from '@/lib/event-routing';
import { isImageUrl } from '@/lib/catalog/product-images';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/types/event-domain';

const statusLabels: Record<Event['status'], string> = {
  draft: 'Rascunho',
  published: 'Em breve',
  active: 'Acontecendo agora',
  finished: 'Encerrado',
};

export default function HomePage() {
  const { startNav, isPending } = useNavigation();
  const { user, isAuthenticated, hasRole, logout, hydrated: authHydrated } = useAuth();
  const {
    cities,
    selectedCityId,
    selectedCity,
    setSelectedCityId,
    clearSelectedCity,
    hydrated: cityHydrated,
  } = useCity();
  const { getEventsByCityId } = useEventStore();
  const { setActiveEventId } = useActiveEvent();
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

  const cityEvents = selectedCityId
    ? getEventsByCityId(selectedCityId, { publicOnly: true })
    : [];

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
  };

  const handleOpenEvent = (eventId: string) => {
    setLoadingEventId(eventId);
    setActiveEventId(eventId);
    startNav(buildConsumerEventHref('/cardapio', eventId));
  };

  useEffect(() => {
    if (!isPending) {
      setLoadingEventId(null);
    }
  }, [isPending]);

  const showCityPicker = cityHydrated && !selectedCityId;

  return (
    <main
      className={cn(
        'min-h-screen bg-background',
        authHydrated && isAuthenticated && 'pb-24'
      )}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎪</span>
            <div>
              <p className="text-xs text-muted-foreground">FichAqui</p>
              <h1 className="font-bold text-foreground leading-tight">
                {selectedCity ? cityLabel(selectedCity) : 'Chega de filas nos seus pedidos'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && hasRole('organizer') && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="rounded-xl h-10">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Painel
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl h-10"
                onClick={() => void logout()}
              >
                Sair
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-xl h-10">
                  <LogIn className="h-4 w-4 mr-1" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 px-4 py-6 max-w-lg mx-auto space-y-6">
        {isAuthenticated && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Olá, <span className="font-medium text-foreground">{user?.name}</span>
          </p>
        )}

        {showCityPicker ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-foreground">
              Em qual cidade você está?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mostramos as festas e quermesses disponíveis na sua cidade.
            </p>
            <div className="mt-5 space-y-2">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city.id)}
                  className="w-full flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-left shadow-sm active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">
                      {cityLabel(city)}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.section>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {cityEvents.length}{' '}
                {cityEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
              </p>
              <button
                type="button"
                onClick={clearSelectedCity}
                className="text-sm font-medium text-primary"
              >
                Trocar cidade
              </button>
            </div>

            {cityEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-semibold text-foreground">Nenhum evento por aqui</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Não há festas publicadas em {selectedCity?.name} no momento.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl"
                  onClick={clearSelectedCity}
                >
                  Escolher outra cidade
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cityEvents.map((event, index) => (
                  <motion.article
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
                  >
                    <div
                      className="h-2"
                      style={{ backgroundColor: event.primaryColor }}
                    />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl"
                          style={{ backgroundColor: `${event.primaryColor}18` }}
                        >
                          {event.icon && isImageUrl(event.icon) ? (
                            <img src={event.icon} alt={event.name} className="h-full w-full object-cover" />
                          ) : (
                            event.icon ?? '🎪'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground">{event.name}</h3>
                            <span
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                event.status === 'active'
                                  ? 'bg-green-500/10 text-green-600'
                                  : 'bg-secondary text-muted-foreground'
                              )}
                            >
                              {statusLabels[event.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatEventDate(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.startTime} – {event.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="mt-4 w-full h-12 rounded-xl font-bold"
                        disabled={loadingEventId === event.id}
                        onClick={() => handleOpenEvent(event.id)}
                      >
                        {loadingEventId === event.id ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          'Ver cardápio e atrações'
                        )}
                      </Button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
