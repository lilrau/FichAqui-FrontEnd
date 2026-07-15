export type UserRole = 'consumer' | 'organizer' | 'admin' | 'stall_manager';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  roles: UserRole[];
  organizerId?: string | null;
  stallId?: string | null;
  stallName?: string | null;
  eventId?: string | null;
}
