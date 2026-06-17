'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Image,
  Users,
  Eye,
  Save,
  Globe,
} from 'lucide-react';
import { useEventStore } from '@/lib/event-store';
import { seedCities, cityLabel } from '@/lib/seed/cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AdminSubpageHeader } from '@/components/admin/admin-subpage-header';

export function EventoForm({ eventId }: { eventId: string }) {
  const { getEventById, updateEvent } = useEventStore();
  const stored = getEventById(eventId);
  const [event, setEvent] = useState(stored);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (stored) setEvent(stored);
  }, [stored]);

  const handleSave = async () => {
    if (!event) return;
    setIsSaving(true);
    try {
      await updateEvent(eventId, event);
    } finally {
      setIsSaving(false);
    }
  };

  if (!stored || !event) {
    return null;
  }

  const statusOptions = [
    { value: 'draft', label: 'Rascunho', color: 'bg-gray-500' },
    { value: 'published', label: 'Publicado', color: 'bg-blue-500' },
    { value: 'active', label: 'Ativo', color: 'bg-green-500' },
    { value: 'finished', label: 'Finalizado', color: 'bg-gray-400' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <AdminSubpageHeader
        eventId={eventId}
        title="Gerenciar Evento"
        right={
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-sm text-primary font-medium"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        }
      />

      <main className="px-4 py-6 space-y-6">
        {/* Preview Card */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl overflow-hidden bg-card shadow-lg border border-border"
          >
            <div className="h-32 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-5xl">{event.icon ?? '🎪'}</span>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-foreground">{event.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {event.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {event.date}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Ícone (emoji)</label>
            <Input
              value={event.icon ?? ''}
              onChange={(e) => setEvent({ ...event, icon: e.target.value })}
              className="mt-2 h-14 rounded-xl text-2xl"
              placeholder="🎪"
              maxLength={4}
            />
          </div>

          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Nome do Evento
            </label>
            <Input
              value={event.name}
              onChange={(e) => setEvent({ ...event, name: e.target.value })}
              className="mt-2 h-14 rounded-xl text-base"
              placeholder="Ex: Festa de São João"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              className="mt-2 w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Descreva o evento..."
            />
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Data
              </label>
              <Input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                className="mt-2 h-14 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Capacidade
              </label>
              <Input
                type="number"
                value={event.capacity}
                onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value) })}
                className="mt-2 h-14 rounded-xl"
              />
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Início
              </label>
              <Input
                type="time"
                value={event.startTime}
                onChange={(e) => setEvent({ ...event, startTime: e.target.value })}
                className="mt-2 h-14 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Término
              </label>
              <Input
                type="time"
                value={event.endTime}
                onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
                className="mt-2 h-14 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Cidade</label>
            <select
              value={event.cityId}
              onChange={(e) => setEvent({ ...event, cityId: e.target.value })}
              className="mt-2 w-full h-14 rounded-xl border border-input bg-background px-3 text-base"
            >
              {seedCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {cityLabel(city)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Local (endereço)
            </label>
            <Input
              value={event.location}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
              className="mt-2 h-14 rounded-xl"
              placeholder="Ex: Paróquia São João Batista"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Status do Evento
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setEvent({ ...event, status: status.value as typeof event.status })}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    event.status === status.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-full", status.color)} />
                  <span className="font-medium text-foreground">{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Banner Upload (mock) */}
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              Banner do Evento
            </label>
            <div className="mt-2 border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/30">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-3 font-medium text-foreground">Arraste uma imagem ou clique aqui</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG, JPG até 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-background border-t border-border px-4 py-4 pb-8">
        <Button
          onClick={handleSave}
          disabled={isSaving}
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
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
