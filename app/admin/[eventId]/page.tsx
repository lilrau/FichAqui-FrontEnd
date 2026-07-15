'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  Package,
  RefreshCw,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { fetchEventResumo } from '@/lib/api/resumo';
import { getErrorMessage } from '@/lib/api/errors';
import { formatBrl, pickupPercent } from '@/lib/format/money';
import { useEventStore } from '@/lib/event-store';
import { getAdminMenu } from '@/lib/admin-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EventResumo } from '@/lib/types/event-report';

const POLL_INTERVAL_MS = 30_000;

export default function AdminEventDashboardPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { getEventById } = useEventStore();
  const event = getEventById(eventId);
  const menuAdmin = getAdminMenu(eventId);

  const [resumo, setResumo] = useState<EventResumo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchEventResumo(eventId);
      setResumo(data);
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Não foi possível carregar o resumo do evento.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        void load(true);
      }
    };

    const interval = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  if (!event) return null;

  const stats = resumo
    ? [
        {
          label: 'Pedidos Hoje',
          value: String(resumo.orderCount),
          icon: Package,
          color: 'bg-blue-500/10 text-blue-500',
        },
        {
          label: 'Vendas Hoje',
          value: formatBrl(resumo.totalRevenue),
          icon: TrendingUp,
          color: 'bg-green-500/10 text-green-500',
        },
        {
          label: 'Consumidores',
          value: String(resumo.consumerCount),
          icon: Users,
          color: 'bg-purple-500/10 text-purple-500',
        },
      ]
    : [];

  const hasStalls = (resumo?.salesByStall.length ?? 0) > 0;

  return (
    <main className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-foreground">Resumo de hoje</h1>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={() => void load(true)}
          disabled={refreshing}
          aria-label="Atualizar resumo"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        </Button>
      </div>

      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {loading && !resumo ? (
        <div className="py-8 text-center text-muted-foreground">Carregando resumo…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-w-0 rounded-2xl bg-card p-4 shadow-sm border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        stat.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 text-2xl font-bold tabular-nums text-foreground">
                        {stat.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {resumo && resumo.pendingOrderCount > 0 && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              {resumo.pendingOrderCount}{' '}
              {resumo.pendingOrderCount === 1 ? 'pedido aguardando' : 'pedidos aguardando'} PIX
            </p>
          )}
        </>
      )}

      <div>
        <h2 className="font-bold text-foreground mb-3">Ações Rápidas</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Link href={`/admin/${eventId}/evento`}>
            <Button variant="outline" className="h-12 rounded-xl whitespace-nowrap">
              Editar evento
            </Button>
          </Link>
          <Link href={`/admin/${eventId}/barracas`}>
            <Button variant="outline" className="h-12 rounded-xl whitespace-nowrap">
              <Store className="mr-2 h-4 w-4" />
              Nova Barraca
            </Button>
          </Link>
          <Link href={`/cardapio?event=${eventId}`}>
            <Button variant="outline" className="h-12 rounded-xl whitespace-nowrap">
              Ver como Consumidor
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-foreground mb-3">Gerenciamento</h2>
        <div className="space-y-2">
          {menuAdmin.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground">Barracas hoje</h2>
          <Link href={`/admin/${eventId}/barracas`} className="text-sm text-primary font-medium">
            Ver todas
          </Link>
        </div>
        <div className="space-y-2">
          {(resumo?.salesByStall ?? []).map((stall) => {
            const pickup =
              stall.fichasIssued != null && stall.fichasDelivered != null
                ? pickupPercent(stall.fichasDelivered, stall.fichasIssued)
                : null;

            return (
              <div
                key={stall.stallId}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: stall.color }}
                >
                  {stall.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{stall.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stall.orderCount}{' '}
                        {stall.orderCount === 1 ? 'pedido' : 'pedidos'} · {formatBrl(stall.revenue)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium shrink-0',
                        stall.status === 'open'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      )}
                    >
                      {stall.status === 'open' ? 'Aberta' : 'Fechada'}
                    </div>
                  </div>
                  {stall.fichasIssued != null && stall.fichasIssued > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Retiradas</span>
                        <span>
                          {stall.fichasDelivered}/{stall.fichasIssued} fichas
                          {pickup != null ? ` (${pickup}%)` : ''}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pickup ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {resumo && !hasStalls && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma barraca cadastrada.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
