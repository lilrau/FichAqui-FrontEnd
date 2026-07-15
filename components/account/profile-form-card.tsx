'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { updateProfileApi } from '@/lib/api/profile';
import { getErrorMessage } from '@/lib/api/errors';
import { formatPhone } from '@/lib/format/phone';
import { formatIsoDateBr } from '@/lib/format/date';
import { cn } from '@/lib/utils';

type EditableProfile = {
  name: string;
  phone: string;
};

const readOnlyInputClass =
  'bg-muted/50 text-muted-foreground cursor-default focus-visible:ring-0 focus-visible:border-input';

export function ProfileFormCard({
  idPrefix = 'profile',
  className,
}: {
  idPrefix?: string;
  className?: string;
}) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState<EditableProfile>({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      phone: user.phone ?? '',
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfileApi({ name: form.name, phone: form.phone });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Não foi possível salvar o perfil.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn('rounded-2xl bg-card border border-border px-4 py-4 space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>E-mail</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={user?.email ?? ''}
          readOnly
          tabIndex={-1}
          aria-readonly
          className={readOnlyInputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>Telefone</Label>
        <Input
          id={`${idPrefix}-phone`}
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
        <Label htmlFor={`${idPrefix}-cpf`}>CPF</Label>
        <Input
          id={`${idPrefix}-cpf`}
          value={user?.cpf ?? '—'}
          readOnly
          tabIndex={-1}
          aria-readonly
          className={readOnlyInputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-birth-date`}>Data de nascimento</Label>
        <Input
          id={`${idPrefix}-birth-date`}
          value={formatIsoDateBr(user?.birthDate)}
          readOnly
          tabIndex={-1}
          aria-readonly
          className={readOnlyInputClass}
        />
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <Button
        type="button"
        className="w-full h-11 rounded-xl"
        onClick={() => void handleSave()}
        disabled={saving}
      >
        {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar'}
      </Button>
    </div>
  );
}
