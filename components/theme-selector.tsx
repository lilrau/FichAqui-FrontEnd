'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  applyThemeWithTransition,
  type ThemeValue,
} from '@/lib/apply-theme-transition';
import { cn } from '@/lib/utils';

const spring = { type: 'spring' as const, stiffness: 420, damping: 34 };

const themeOptions: {
  value: ThemeValue;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'dark', label: 'Escuro', icon: Moon },
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
          <div className="h-6 w-6 rounded bg-muted" />
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
              onClick={() => applyThemeWithTransition(setTheme, option.value)}
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
                className="relative z-10"
                animate={{ scale: selected ? 1.08 : 1 }}
                transition={spring}
              >
                <Icon
                  className={cn(
                    'h-6 w-6',
                    selected ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  strokeWidth={2}
                />
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
