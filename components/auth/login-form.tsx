'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolvePostLoginPath } from '@/lib/auth/post-login-path';
import { useAuth } from '@/lib/auth-context';

export function LoginForm({
  redirectOrganizerTo = '/admin',
  redirectClientTo = '/',
  onSuccess,
  showDemoHint = true,
}: {
  redirectOrganizerTo?: string;
  redirectClientTo?: string;
  onSuccess?: () => void;
  showDemoHint?: boolean;
}) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onSuccess?.();
    router.push(resolvePostLoginPath(result.user));
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">E-mail</label>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="mt-2 h-14 rounded-xl text-base"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Senha</label>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-2 h-14 rounded-xl text-base"
          required
        />
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 text-lg font-bold rounded-2xl"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
          />
        ) : (
          'Entrar'
        )}
      </Button>

      {showDemoHint && (
        <div className="rounded-xl bg-secondary/80 p-3 text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Contas de demonstração</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('test_user_5207637493757128652@testuser.com')}
              className="rounded-lg bg-background px-2 py-1 border border-border"
            >
              Consumidor
            </button>
            <button
              type="button"
              onClick={() => fillDemo('raul@paroquia.com')}
              className="rounded-lg bg-background px-2 py-1 border border-border"
            >
              Organizador
            </button>
            <button
              type="button"
              onClick={() => fillDemo('atendente@email.com')}
              className="rounded-lg bg-background px-2 py-1 border border-border"
            >
              Atendente
            </button>
          </div>
          <p>Senha: 123456</p>
          <p>Consumidor usa @testuser.com (obrigatório para Mercado Pago sandbox).</p>
        </div>
      )}
    </form>
  );
}
