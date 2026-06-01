'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, UtensilsCrossed, Clock, User } from 'lucide-react';
import { useNavigation } from '@/components/navigation-provider';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/carteira', label: 'Carteira', icon: Wallet },
  { href: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed, matchPrefix: true },
  { href: '/historico', label: 'Histórico', icon: Clock },
  { href: '/perfil', label: 'Perfil', icon: User },
] as const;

function isActive(pathname: string, href: string, matchPrefix?: boolean) {
  if (matchPrefix) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function BottomNav() {
  const pathname = usePathname();
  const { startNav, isPending } = useNavigation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-4">
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map(({ href, label, icon: Icon, matchPrefix }) => {
          const active = isActive(pathname, href, matchPrefix);

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
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('relative z-10 h-5 w-5', active && 'stroke-[2.5]')} />
              <span className={cn('relative z-10 text-xs', active ? 'font-semibold' : 'font-medium')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
