'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Bell,
  Moon,
  Smartphone,
  Wifi,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfigPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const settingsGroups = [
    {
      title: 'Preferências',
      items: [
        {
          icon: Bell,
          label: 'Notificações de pedidos',
          description: 'Receba alertas de novos pedidos',
          toggle: true,
          value: notifications,
          onChange: () => setNotifications(!notifications),
        },
        {
          icon: Moon,
          label: 'Modo escuro',
          description: 'Melhor visibilidade à noite',
          toggle: true,
          value: darkMode,
          onChange: () => setDarkMode(!darkMode),
        },
        {
          icon: Wifi,
          label: 'Modo offline',
          description: 'Funcionar com internet instável',
          toggle: true,
          value: offlineMode,
          onChange: () => setOfflineMode(!offlineMode),
        },
      ],
    },
    {
      title: 'Segurança',
      items: [
        {
          icon: Shield,
          label: 'Alterar senha',
          description: 'Atualizar senha de acesso',
          link: true,
        },
        {
          icon: Users,
          label: 'Gerenciar acessos',
          description: 'Controlar quem pode acessar',
          link: true,
        },
      ],
    },
    {
      title: 'Suporte',
      items: [
        {
          icon: HelpCircle,
          label: 'Central de Ajuda',
          description: 'Dúvidas frequentes e tutoriais',
          link: true,
        },
        {
          icon: Smartphone,
          label: 'Sobre o aplicativo',
          description: 'Versão 1.0.0',
          link: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Configurações</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
              {group.title}
            </h2>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-4 p-4",
                      index !== group.items.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {item.toggle && (
                      <button
                        onClick={item.onChange}
                        className={cn(
                          "relative h-7 w-12 rounded-full transition-colors",
                          item.value ? "bg-primary" : "bg-secondary"
                        )}
                      >
                        <motion.div
                          animate={{ x: item.value ? 22 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                        />
                      </button>
                    )}
                    {item.link && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive font-semibold"
        >
          <LogOut className="h-5 w-5" />
          Sair da conta
        </motion.button>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground">
          FichAqui v1.0.0
        </p>
      </main>
    </div>
  );
}
