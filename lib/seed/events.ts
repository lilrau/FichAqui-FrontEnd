import type { Event } from '@/lib/types/event-domain';

export const seedEvents: Event[] = [
  {
    id: '1',
    name: 'Festa de São João',
    description:
      'A maior festa junina da comunidade! Venha celebrar com comidas típicas, jogos e muita diversão.',
    date: '2026-06-24',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Paróquia São João Batista',
    banner: '/festa-banner.jpg',
    status: 'active',
    capacity: 500,
    primaryColor: '#d97706',
    code: 'FESTA2026',
    icon: '🎪',
  },
  {
    id: '2',
    name: 'Festa de Natal',
    description:
      'Celebração natalina com comidas típicas, doces e bebidas quentes para toda a família.',
    date: '2026-12-25',
    startTime: '17:00',
    endTime: '22:00',
    location: 'Salão Paroquial',
    banner: '/natal-banner.jpg',
    status: 'published',
    capacity: 300,
    primaryColor: '#dc2626',
    code: 'NATAL2026',
    icon: '🎄',
  },
];
