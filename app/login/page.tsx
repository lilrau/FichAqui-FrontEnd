'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

function LoginContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
      <p className="mt-2 text-muted-foreground">
        Uma conta para participar dos eventos ou gerenciar sua quermesse.
      </p>

      <div className="mt-8">
        <LoginForm
          redirectOrganizerTo={next.startsWith('/admin') ? next : '/admin'}
          redirectClientTo={next.startsWith('/admin') ? '/' : next}
        />
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col p-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-muted-foreground mb-8 w-fit"
      >
        <ChevronRight className="h-5 w-5 rotate-180" />
        Voltar
      </Link>

      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
