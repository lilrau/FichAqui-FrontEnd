'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Store,
  Package,
  BarChart3,
  Settings,
  Plus,
  ChevronRight,
  Users,
  TrendingUp,
  Clock,
  LogOut,
} from 'lucide-react';
import { currentEvent, stalls, menuItems } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Pedidos Hoje', value: '147', icon: Package, trend: '+12%', color: 'bg-blue-500/10 text-blue-500' },
  { label: 'Vendas Hoje', value: 'R$ 2.450', icon: TrendingUp, trend: '+8%', color: 'bg-green-500/10 text-green-500' },
  { label: 'Visitantes', value: '312', icon: Users, trend: '+24%', color: 'bg-purple-500/10 text-purple-500' },
  { label: 'Tempo Médio', value: '4 min', icon: Clock, trend: '-15%', color: 'bg-amber-500/10 text-amber-500' },
];

const menuAdmin = [
  { label: 'Gerenciar Evento', icon: Calendar, href: '/admin/evento', description: 'Editar informações do evento' },
  { label: 'Pontos de Venda', icon: Store, href: '/admin/barracas', description: 'Gerenciar barracas e estoque' },
  { label: 'Pedidos', icon: Package, href: '/admin/pedidos', description: 'Acompanhar pedidos em tempo real' },
  { label: 'Relatórios', icon: BarChart3, href: '/admin/relatorios', description: 'Vendas e estatísticas' },
  { label: 'Configurações', icon: Settings, href: '/admin/config', description: 'Configurações do sistema' },
];

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-xl">
                🎪
              </div>
              <div>
                <p className="text-sm opacity-80">Painel Administrativo</p>
                <h1 className="font-bold">{currentEvent.name}</h1>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Event Status */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-2.5 w-2.5 rounded-full bg-green-400"
            />
            <span>Evento ativo</span>
            <span className="opacity-60">•</span>
            <span className="opacity-80">{currentEvent.startTime} - {currentEvent.endTime}</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
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

        {/* Quick Actions */}
        <div>
          <h2 className="font-bold text-foreground mb-3">Ações Rápidas</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/admin/evento">
              <Button className="h-12 rounded-xl whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </Link>
            <Link href="/admin/barracas">
              <Button variant="outline" className="h-12 rounded-xl whitespace-nowrap">
                <Store className="mr-2 h-4 w-4" />
                Nova Barraca
              </Button>
            </Link>
            <Link href="/cardapio">
              <Button variant="outline" className="h-12 rounded-xl whitespace-nowrap">
                Ver como Cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Menu Items */}
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

        {/* Active Stalls Summary */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">Barracas Ativas</h2>
            <Link href="/admin/barracas" className="text-sm text-primary font-medium">
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
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  stall.status === 'open' 
                    ? "bg-green-500/10 text-green-600" 
                    : "bg-red-500/10 text-red-600"
                )}>
                  {stall.status === 'open' ? 'Aberta' : 'Fechada'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
