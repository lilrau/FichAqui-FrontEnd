import { apiRequest } from '@/lib/api/client';
import { getApiBaseUrl } from '@/lib/api/config';
import { getAuthToken } from '@/lib/api/token';
import type { Event } from '@/lib/types/event-domain';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export interface EventImageUploadTarget {
  key: string;
  method: 'PUT' | 'POST';
  uploadUrl: string;
  headers: Record<string, string>;
}

export function validateEventImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Use JPEG, PNG, WebP ou GIF.';
  }
  if (file.size > MAX_BYTES) {
    return 'A imagem deve ter no máximo 5 MB.';
  }
  return null;
}

export async function requestEventImageUploadUrl(
  eventId: string,
  contentType: string
): Promise<EventImageUploadTarget> {
  return apiRequest<EventImageUploadTarget>(`/api/events/${eventId}/image/upload-url`, {
    method: 'POST',
    auth: true,
    body: { contentType },
  });
}

async function readXsrfToken(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function uploadEventImageFile(target: EventImageUploadTarget, file: File): Promise<void> {
  if (target.method === 'PUT') {
    let response: Response;
    try {
      response = await fetch(target.uploadUrl, {
        method: 'PUT',
        headers: target.headers,
        body: file,
      });
    } catch {
      throw new Error(
        'Não foi possível enviar a imagem para o armazenamento. Configure CORS no bucket R2 para permitir PUT a partir do domínio do frontend.'
      );
    }
    if (!response.ok) {
      throw new Error('Não foi possível enviar a imagem.');
    }
    return;
  }

  const form = new FormData();
  form.append('key', target.key);
  form.append('file', file);

  const headers = new Headers({ Accept: 'application/json' });
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const xsrf = await readXsrfToken();
  if (xsrf) {
    headers.set('X-XSRF-TOKEN', xsrf);
  }

  const uploadUrl = target.uploadUrl.startsWith('http')
    ? target.uploadUrl
    : `${getApiBaseUrl()}${target.uploadUrl.replace(/^\/api/, '/api')}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: form,
  });

  if (!response.ok) {
    throw new Error('Não foi possível enviar a imagem.');
  }
}

export async function applyEventImageKey(eventId: string, key: string | null): Promise<Event> {
  return apiRequest<Event>(`/api/events/${eventId}/image/apply`, {
    method: 'POST',
    auth: true,
    body: { key: key ?? '' },
  });
}

export async function uploadAndApplyEventImage(eventId: string, file: File): Promise<Event> {
  const validationError = validateEventImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const target = await requestEventImageUploadUrl(eventId, file.type);
  await uploadEventImageFile(target, file);
  return applyEventImageKey(eventId, target.key);
}

export async function removeEventImage(eventId: string): Promise<Event> {
  return applyEventImageKey(eventId, null);
}
