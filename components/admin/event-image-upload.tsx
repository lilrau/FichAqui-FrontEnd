'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventAvatar } from '@/components/event-avatar';
import { removeEventImage, uploadAndApplyEventImage } from '@/lib/api/event-image';
import { getErrorMessage } from '@/lib/api/errors';
import { getEventImage } from '@/lib/event-image';
import type { Event } from '@/lib/types/event-domain';
import { cn } from '@/lib/utils';

interface EventImageUploadProps {
  event: Event;
  onUpdated: (event: Event) => void;
  className?: string;
}

export function EventImageUpload({ event, onUpdated, className }: EventImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageUrl = getEventImage(event);
  const busy = uploading || removing;

  const handleSelect = async (file: File | undefined) => {
    if (!file || busy) return;

    setUploading(true);
    setError(null);

    try {
      const updated = await uploadAndApplyEventImage(event.id, file);
      onUpdated(updated);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Não foi possível enviar a imagem.'));
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!imageUrl || busy) return;

    setRemoving(true);
    setError(null);

    try {
      const updated = await removeEventImage(event.id);
      onUpdated(updated);
    } catch (removeError) {
      setError(getErrorMessage(removeError, 'Não foi possível remover a imagem.'));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-secondary/30">
        <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          {imageUrl ? (
            <img src={imageUrl} alt={event.name} className="h-full w-full object-cover" />
          ) : (
            <EventAvatar event={event} emojiClassName="text-5xl" />
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => void handleSelect(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {imageUrl ? 'Trocar imagem' : 'Escolher imagem'}
          </Button>
          {imageUrl && (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-destructive"
              disabled={busy}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP ou GIF até 5 MB. Usada no banner e no ícone do evento.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
