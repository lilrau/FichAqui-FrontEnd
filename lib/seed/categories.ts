import type { Category } from '@/lib/types/event-domain';

export const seedCategories: Category[] = [
  { id: 'comidas', name: 'Comidas', icon: 'UtensilsCrossed', color: '#ef4444' },
  { id: 'doces', name: 'Doces', icon: 'Candy', color: '#ec4899' },
  { id: 'bebidas', name: 'Bebidas', icon: 'GlassWater', color: '#3b82f6' },
  { id: 'jogos', name: 'Jogos', icon: 'Gamepad2', color: '#22c55e' },
  { id: 'brincadeiras', name: 'Brincadeiras', icon: 'PartyPopper', color: '#f59e0b' },
];
