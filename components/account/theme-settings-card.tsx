'use client';

import { Palette } from 'lucide-react';
import { ThemeSelector } from '@/components/theme-selector';
import { cn } from '@/lib/utils';

export function ThemeSettingsCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-card border border-border px-4 py-4 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Palette className="h-5 w-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Tema</p>
          <p className="text-xs text-muted-foreground">Aparência do aplicativo</p>
        </div>
      </div>
      <ThemeSelector />
    </div>
  );
}
