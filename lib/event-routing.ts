export const DEFAULT_EVENT_ID = '1';
export const ACTIVE_EVENT_KEY = 'fichaqui-frontend:active-event';

const ADMIN_RESERVED_SEGMENTS = new Set(['novo', 'config']);

export function parseEventIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/admin\/([^/]+)/);
  if (!match) return null;
  const segment = match[1];
  if (ADMIN_RESERVED_SEGMENTS.has(segment)) return null;
  return segment;
}

export function readStoredActiveEventId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_EVENT_KEY);
  } catch {
    return null;
  }
}

export function writeStoredActiveEventId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (id) localStorage.setItem(ACTIVE_EVENT_KEY, id);
    else localStorage.removeItem(ACTIVE_EVENT_KEY);
  } catch {
    // ignore
  }
}

export function formatEventDate(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });
}

const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  active: 'Ativo',
  finished: 'Finalizado',
};

export function getEventStatusLabel(status: string): string {
  return EVENT_STATUS_LABELS[status] ?? status;
}

export function formatEventTimeRange(startTime: string, endTime: string): string | null {
  const start = startTime.trim();
  const end = endTime.trim();

  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;

  return null;
}

export function formatEventScheduleMeta(event: {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}): string | null {
  return (
    formatEventTimeRange(event.startTime, event.endTime) ??
    (event.date.trim() ? formatEventDate(event.date) : null) ??
    (event.location.trim() || null)
  );
}
