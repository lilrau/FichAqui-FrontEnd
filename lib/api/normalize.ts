import { resolveProductImage } from '@/lib/catalog/product-images';
import type { SessionUser, UserRole } from '@/lib/types/user';
import type { CatalogProduct, Category } from '@/lib/types/event-domain';

const KNOWN_ROLES = new Set<UserRole>(['consumer', 'organizer', 'admin', 'stall_manager']);

function normalizeRole(value: string): UserRole | null {
  if (value === 'client') return 'consumer';
  if (KNOWN_ROLES.has(value as UserRole)) return value as UserRole;
  return null;
}

export function normalizeUser(dto: {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  role?: string;
  roles?: string[];
  organizerId?: string | null;
  stallId?: string | null;
  eventId?: string | null;
}): SessionUser {
  const roles = new Set<UserRole>();
  for (const entry of dto.roles ?? []) {
    const role = normalizeRole(entry);
    if (role) roles.add(role);
  }
  if (dto.role) {
    const role = normalizeRole(dto.role);
    if (role) roles.add(role);
  }
  if (roles.size === 0) {
    roles.add('consumer');
  }

  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    phone: dto.phone ?? null,
    cpf: dto.cpf ?? null,
    birthDate: dto.birthDate ?? null,
    roles: [...roles],
    organizerId: dto.organizerId ?? null,
    stallId: dto.stallId ?? null,
    eventId: dto.eventId ?? null,
  };
}

export function normalizeCatalogProduct(dto: CatalogProduct): CatalogProduct {
  return {
    ...dto,
    image: resolveProductImage(dto.image),
  };
}

export function normalizeCategory(dto: Category): Category {
  return dto;
}
