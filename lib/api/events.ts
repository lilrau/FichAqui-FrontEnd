import { apiRequest } from '@/lib/api/client';
import type { Event, Offering, Stall } from '@/lib/types/event-domain';

export interface ListEventsParams {
  cityId?: string;
  publicOnly?: boolean;
  organizerId?: string;
}

export async function fetchEvents(params: ListEventsParams = {}): Promise<Event[]> {
  const search = new URLSearchParams();
  if (params.cityId) search.set('cityId', params.cityId);
  if (params.publicOnly) search.set('public_only', 'true');
  if (params.organizerId) search.set('organizer_id', params.organizerId);
  const query = search.toString();
  return apiRequest<Event[]>(`/api/events${query ? `?${query}` : ''}`, { auth: true });
}

export async function fetchEvent(eventId: string): Promise<Event> {
  return apiRequest<Event>(`/api/events/${eventId}`);
}

export type CreateEventPayload = {
  name: string;
  cityId: string;
  location: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  banner?: string;
  status?: Event['status'];
  capacity?: number;
  primaryColor?: string;
  icon?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export interface CreateEventResponse {
  event: Event;
  stalls: Stall[];
  offerings: Offering[];
}

export async function createEventApi(payload: CreateEventPayload): Promise<CreateEventResponse> {
  return apiRequest<CreateEventResponse>('/api/events', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export async function updateEventApi(eventId: string, patch: Partial<Event>): Promise<Event> {
  return apiRequest<Event>(`/api/events/${eventId}`, {
    method: 'PATCH',
    auth: true,
    body: patch,
  });
}
