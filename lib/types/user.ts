export type UserRole = 'consumer' | 'organizer' | 'admin' | 'stall_manager';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  organizerId?: string | null;
}
