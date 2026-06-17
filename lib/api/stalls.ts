import { apiRequest } from '@/lib/api/client';
import type { Stall } from '@/lib/types/event-domain';

export type CreateStallPayload = Omit<Stall, 'id' | 'eventId'>;
export type UpdateStallPayload = Partial<CreateStallPayload>;

export async function fetchStalls(eventId: string): Promise<Stall[]> {
  return apiRequest<Stall[]>(`/api/events/${eventId}/stalls`);
}

export async function createStallApi(
  eventId: string,
  payload: CreateStallPayload
): Promise<Stall> {
  return apiRequest<Stall>(`/api/events/${eventId}/stalls`, {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export async function updateStallApi(
  eventId: string,
  stallId: string,
  patch: UpdateStallPayload
): Promise<Stall> {
  return apiRequest<Stall>(`/api/events/${eventId}/stalls/${stallId}`, {
    method: 'PATCH',
    auth: true,
    body: patch,
  });
}
