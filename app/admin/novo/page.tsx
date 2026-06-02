'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save } from 'lucide-react';
import { useEventStore } from '@/lib/event-store';
import type { Event } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const defaultEvent: Omit<Event, 'id'> = {
  name: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '18:00',
  endTime: '23:00',
  location: '',
  banner: '/festa-banner.jpg',
  status: 'draft',
  capacity: 200,
  primaryColor: '#d97706',
  code: '',
};

export default function NovoEventoPage() {
  const router = useRouter();
  const { createEvent } = useEventStore();
  const [event, setEvent] = useState(defaultEvent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!event.name.trim()) return;
    setIsSaving(true);
    const code =
      event.code?.trim() ||
      event.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 12) || `EVT${Date.now()}`;
    const created = createEvent({ ...event, code, status: 'draft' });
    setTimeout(() => {
      setIsSaving(false);
      router.push(`/admin/${created.id}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="font-bold text-foreground">Novo Evento</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Nome do Evento</label>
          <Input
            value={event.name}
            onChange={(e) => setEvent({ ...event, name: e.target.value })}
            className="mt-2 h-14 rounded-xl"
            placeholder="Ex: Festa de São João"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Código de acesso</label>
          <Input
            value={event.code ?? ''}
            onChange={(e) => setEvent({ ...event, code: e.target.value.toUpperCase() })}
            className="mt-2 h-14 rounded-xl uppercase"
            placeholder="FESTA2026"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Descrição</label>
          <textarea
            value={event.description}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            className="mt-2 w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Descreva o evento..."
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Localização</label>
          <Input
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            className="mt-2 h-14 rounded-xl"
            placeholder="Ex: Paróquia São João Batista"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground">Data</label>
            <Input
              type="date"
              value={event.date}
              onChange={(e) => setEvent({ ...event, date: e.target.value })}
              className="mt-2 h-14 rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Capacidade</label>
            <Input
              type="number"
              value={event.capacity}
              onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value, 10) || 0 })}
              className="mt-2 h-14 rounded-xl"
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-background border-t border-border px-4 py-4 pb-8">
        <Button
          onClick={handleSave}
          disabled={isSaving || !event.name.trim()}
          className="w-full h-14 text-lg font-bold rounded-2xl"
        >
          {isSaving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Criar Evento
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
