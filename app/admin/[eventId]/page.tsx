'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  Clock,
  Package,
  Plus,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEventStore } from '@/lib/event-store';
import { getAdminMenu } from '@/lib/admin-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Pedidos Hoje', value: '147', icon: Package, trend: '+12%', color: 'bg-blue-500/10 text-blue-500' },
  { label: 'Vendas Hoje', value: 'R$ 2.450', icon: TrendingUp, trend: '+8%', color: 'bg-green-500/10 text-green-500' },
  { label: 'Visitantes', value: '312', icon: Users, trend: '+24%', color: 'bg-purple-500/10 text-purple-500' },
  { label: 'Tempo Médio', value: '4 min', icon: Clock, trend: '-15%', color: 'bg-amber-500/10 text-amber-500' },
];

export default function AdminEventDashboardPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { getEventById, getStallsByEventId } = useEventStore();
  const event = getEventById(eventId);
  const stalls = getStallsByEventId(eventId);
  const menuAdmin = getAdminMenu(eventId);

  if (!event) return null;

  return (
    <main className="px-4 py-6 space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-card p-4 shadow-sm border border-border"
            >
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', stat.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <span className="text-xs font-medium text-green-500">{stat.trend}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

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
              Ver como Cliente
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
          <h2 className="font-bold text-foreground">Barracas Ativas</h2>
          <Link href={`/admin/${eventId}/barracas`} className="text-sm text-primary font-medium">
            Ver todas
          </Link>
        </div>
        <div className="space-y-2">
          {stalls.slice(0, 4).map((stall) => (
            <div
              key={stall.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: stall.color }}
              >
                {stall.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{stall.name}</p>
                <p className="text-xs text-muted-foreground">{stall.responsible}</p>
              </div>
              <div
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  stall.status === 'open'
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-red-500/10 text-red-600'
                )}
              >
                {stall.status === 'open' ? 'Aberta' : 'Fechada'}
              </div>
            </div>
          ))}
          {stalls.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma barraca cadastrada.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
