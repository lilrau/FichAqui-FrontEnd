'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type ThemeValue = 'light' | 'system' | 'dark';

const spring = { type: 'spring' as const, stiffness: 420, damping: 34 };

const themeOptions: {
  value: ThemeValue;
  label: string;
  icon: LucideIcon;
  preview: string;
  iconClass: string;
}[] = [
  {
    value: 'light',
    label: 'Claro',
    icon: Sun,
    preview: 'from-amber-100 via-orange-50 to-amber-50',
    iconClass: 'text-amber-600',
  },
  {
    value: 'system',
    label: 'Sistema',
    icon: Monitor,
    preview: 'from-muted via-secondary to-muted',
    iconClass: 'text-foreground/70',
  },
  {
    value: 'dark',
    label: 'Escuro',
    icon: Moon,
    preview: 'from-slate-700 via-slate-800 to-slate-900',
    iconClass: 'text-slate-200',
  },
];

function ThemeSelectorSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-1.5',
        className
      )}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2.5 rounded-xl py-3.5 animate-pulse"
        >
          <div className="h-11 w-11 rounded-xl bg-muted" />
          <div className="h-3 w-10 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ThemeSelectorSkeleton className={className} />;
  }

  const active = (theme ?? 'system') as ThemeValue;

  return (
    <div
      role="radiogroup"
      aria-label="Tema do aplicativo"
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/30 p-1.5',
        className
      )}
    >
      <div className="grid grid-cols-3 gap-1">
        {themeOptions.map((option) => {
          const selected = active === option.value;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              whileTap={{ scale: 0.94 }}
              onClick={() => setTheme(option.value)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl py-3 outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              )}
            >
              {selected && (
                <motion.div
                  layoutId="theme-selector-indicator"
                  className="absolute inset-0 rounded-xl border border-primary/25 bg-background shadow-sm"
                  transition={spring}
                />
              )}

              <motion.span
                className={cn(
                  'relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner ring-1 ring-black/5 dark:ring-white/10',
                  option.preview
                )}
                animate={{
                  scale: selected ? 1.06 : 1,
                  y: selected ? -1 : 0,
                }}
                transition={spring}
              >
                <Icon className={cn('h-5 w-5', option.iconClass)} strokeWidth={2.25} />
              </motion.span>

              <motion.span
                className={cn(
                  'relative z-10 text-xs tracking-tight',
                  selected ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                )}
                animate={{ opacity: selected ? 1 : 0.75 }}
                transition={{ duration: 0.15 }}
              >
                {option.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
