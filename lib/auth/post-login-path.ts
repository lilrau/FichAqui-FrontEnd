import type { SessionUser } from '@/lib/types/user';

/** Atendente > Organizador > Consumidor */
export function resolvePostLoginPath(user: SessionUser): string {
  if (user.roles.includes('stall_manager')) return '/retirada';
  if (user.roles.includes('organizer')) return '/admin';
  return '/';
}
