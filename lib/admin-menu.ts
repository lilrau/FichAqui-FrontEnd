import {
  BarChart3,
  Calendar,
  Package,
  Settings,
  Store,
  type LucideIcon,
} from 'lucide-react';

export interface AdminMenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

export function getAdminMenu(eventId: string): AdminMenuItem[] {
  const base = `/admin/${eventId}`;
  return [
    {
      label: 'Gerenciar Evento',
      icon: Calendar,
      href: `${base}/evento`,
      description: 'Editar informações do evento',
    },
    {
      label: 'Pontos de Venda',
      icon: Store,
      href: `${base}/barracas`,
      description: 'Gerenciar barracas e estoque',
    },
    {
      label: 'Pedidos',
      icon: Package,
      href: `${base}/pedidos`,
      description: 'Acompanhar pedidos em tempo real',
    },
    {
      label: 'Relatórios',
      icon: BarChart3,
      href: `${base}/relatorios`,
      description: 'Vendas e estatísticas',
    },
    {
      label: 'Minha conta',
      icon: Settings,
      href: `${base}/config`,
      description: 'Dados pessoais e preferências',
    },
  ];
}
