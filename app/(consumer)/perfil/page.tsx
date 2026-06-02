'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  Shield,
  ChevronRight,
  KeyRound,
  CreditCard,
  Palette,
} from 'lucide-react';
import { ThemeSelector } from '@/components/theme-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { loadJson, saveJson } from '@/lib/storage';
import { cn } from '@/lib/utils';

const PROFILE_KEY = 'event-app:profile';

const profileDefaults = {
  name: 'Maria Silva',
  email: 'maria.silva@email.com',
  phone: '(41) 99999-1234',
  cpf: '123.456.789-09',
  birthDate: '15/03/1992',
};

type EditableProfile = Pick<typeof profileDefaults, 'name' | 'email' | 'phone'>;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const readOnlyInputClass =
  'bg-muted/50 text-muted-foreground cursor-default focus-visible:ring-0 focus-visible:border-input';

export default function PerfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<EditableProfile>({
    name: profileDefaults.name,
    email: profileDefaults.email,
    phone: profileDefaults.phone,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadJson<Partial<EditableProfile> | null>(PROFILE_KEY, null);
    setForm({
      name: stored?.name ?? user?.name ?? profileDefaults.name,
      email: stored?.email ?? user?.email ?? profileDefaults.email,
      phone: stored?.phone ?? profileDefaults.phone,
    });
  }, [user?.name, user?.email]);

  const handleSave = async () => {
    setSaving(true);
    saveJson(PROFILE_KEY, form);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-4">
          <h1 className="font-bold text-foreground text-lg">Perfil</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-10 w-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-card border border-border px-4 py-4 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone">Telefone</Label>
            <Input
              id="profile-phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))
              }
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-cpf">CPF</Label>
            <Input
              id="profile-cpf"
              value={profileDefaults.cpf}
              readOnly
              tabIndex={-1}
              aria-readonly
              className={readOnlyInputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-birth-date">Data de nascimento</Label>
            <Input
              id="profile-birth-date"
              value={profileDefaults.birthDate}
              readOnly
              tabIndex={-1}
              aria-readonly
              className={readOnlyInputClass}
            />
          </div>

          <Button
            type="button"
            className="w-full h-11 rounded-xl"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl bg-card border border-border px-4 py-4 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">Aparência do aplicativo</p>
            </div>
          </div>
          <ThemeSelector />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden"
        >
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Trocar minha senha</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/metodos-pagamento')}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Métodos de pagamento</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Área administrativa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          type="button"
          onClick={() => router.push('/')}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-4 text-sm font-semibold text-destructive'
          )}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </motion.button>
      </main>
    </div>
  );
}
