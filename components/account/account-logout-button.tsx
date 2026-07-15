'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function AccountLogoutButton({
  redirectTo = '/',
  label = 'Sair da conta',
  className,
}: {
  redirectTo?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => {
        void logout();
        router.push(redirectTo);
      }}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-2xl p-4 font-semibold',
        'bg-destructive/10 text-destructive',
        className
      )}
    >
      <LogOut className="h-5 w-5" />
      {label}
    </button>
  );
}
