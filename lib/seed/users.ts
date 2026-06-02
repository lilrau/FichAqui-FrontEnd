export type UserRole = 'client' | 'organizer';

export interface AppUser {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: UserRole[];
  organizerId?: string;
}

/** Contas de demonstração — substituir por API real depois */
export const seedUsers: AppUser[] = [
  {
    id: 'user-maria',
    email: 'maria@email.com',
    password: '123456',
    name: 'Maria Silva',
    roles: ['client'],
  },
  {
    id: 'user-raul',
    email: 'raul@paroquia.com',
    password: '123456',
    name: 'Raul Souza',
    roles: ['client', 'organizer'],
    organizerId: 'org-paroquia',
  },
];

export function findUserByCredentials(
  email: string,
  password: string
): AppUser | undefined {
  const normalized = email.trim().toLowerCase();
  return seedUsers.find(
    (u) => u.email.toLowerCase() === normalized && u.password === password
  );
}
