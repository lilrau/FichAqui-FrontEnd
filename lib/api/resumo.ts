import { apiRequest } from '@/lib/api/client';
import type { EventResumo } from '@/lib/types/event-report';

export async function fetchEventResumo(eventId: string): Promise<EventResumo> {
  return apiRequest<EventResumo>(`/api/events/${eventId}/resumo`, {
    auth: true,
  });
}
