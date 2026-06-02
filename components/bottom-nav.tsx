'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Wallet, UtensilsCrossed, Clock, User, type LucideIcon } from 'lucide-react';
import { useNavigation } from '@/components/navigation-provider';
import { buildConsumerEventHref, useConsumerScope } from '@/lib/consumer-scope';
import { useActiveEvent } from '@/lib/event-context';
import { cn } from '@/lib/utils';

type NavTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchPrefix?: boolean;
};

const inicioTab: NavTab = { href: '/', label: 'Início', icon: Home };

const homeTabs: NavTab[] = [
  inicioTab,
  { href: '/carteira', label: 'Carteira', icon: Wallet },
  { href: '/perfil', label: 'Perfil', icon: User },
];

function useNavTabs(variant: 'event' | 'home'): NavTab[] {
  const { activeEventId } = useActiveEvent();

  if (variant === 'home' || !activeEventId) {
    return homeTabs;
  }

  return [
    inicioTab,
    { href: buildConsumerEventHref('/carteira', activeEventId), label: 'Carteira', icon: Wallet },
    {
      href: buildConsumerEventHref('/cardapio', activeEventId),
      label: 'Cardápio',
      icon: UtensilsCrossed,
      matchPrefix: true,
    },
    { href: buildConsumerEventHref('/historico', activeEventId), label: 'Histórico', icon: Clock },
    { href: buildConsumerEventHref('/perfil', activeEventId), label: 'Perfil', icon: User },
  ];
}

function useIsNavActive() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = useConsumerScope();
  const currentEvent = searchParams.get('event');

  return (href: string, matchPrefix?: boolean) => {
    const url = new URL(href, 'http://local');
    const hrefPath = url.pathname;
    const hrefEvent = url.searchParams.get('event');

    const pathMatch = matchPrefix
      ? pathname === hrefPath || pathname.startsWith(`${hrefPath}/`)
      : pathname === hrefPath;

    if (!pathMatch) return false;

    if (hrefPath === '/') return pathname === '/';

    if (!hrefEvent) {
      return scope === 'global' && !currentEvent;
    }

    return hrefEvent === currentEvent;
  };
}

function BottomNavBar({ variant = 'event' }: { variant?: 'event' | 'home' }) {
  const { startNav, isPending } = useNavigation();
  const tabs = useNavTabs(variant);
  const isNavActive = useIsNavActive();
  const layoutId = variant === 'home' ? 'bottom-nav-active-home' : 'bottom-nav-active';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-4"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map(({ href, label, icon: Icon, matchPrefix }) => {
          const active = isNavActive(href, matchPrefix);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={(e) => {
                if (active) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                startNav(href);
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 py-2 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
                isPending && !active && 'opacity-70'
              )}
            >
              {active && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('relative z-10 h-5 w-5', active && 'stroke-[2.5]')} />
              <span
                className={cn(
                  'relative z-10 text-[11px] leading-tight',
                  active ? 'font-semibold' : 'font-medium'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Portal no body: animações com transform no layout pai quebram position:fixed. */
export function BottomNav({ variant = 'event' }: { variant?: 'event' | 'home' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<BottomNavBar variant={variant} />, document.body);
}
