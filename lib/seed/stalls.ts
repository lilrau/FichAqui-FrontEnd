import type { Stall } from '@/lib/types/event-domain';

export const seedStalls: Stall[] = [
  { id: 'stall-1', eventId: '1', name: 'Barraca do Pastel', category: 'comidas', responsible: 'Maria Silva', color: '#ef4444', status: 'open', stock: 150 },
  { id: 'stall-2', eventId: '1', name: 'Barraca do Milho', category: 'comidas', responsible: 'João Santos', color: '#f59e0b', status: 'open', stock: 200 },
  { id: 'stall-3', eventId: '1', name: 'Doces da Vovó', category: 'doces', responsible: 'Ana Costa', color: '#ec4899', status: 'open', stock: 100 },
  { id: 'stall-4', eventId: '1', name: 'Cantinho das Bebidas', category: 'bebidas', responsible: 'Pedro Lima', color: '#3b82f6', status: 'open', stock: 300 },
  { id: 'stall-5', eventId: '1', name: 'Pescaria', category: 'jogos', responsible: 'Carlos Oliveira', color: '#22c55e', status: 'open', stock: 50 },
  { id: 'stall-6', eventId: '1', name: 'Bingo', category: 'brincadeiras', responsible: 'Lucia Ferreira', color: '#8b5cf6', status: 'open', stock: 100 },
  { id: 'stall-7', eventId: '1', name: 'Correio Elegante', category: 'brincadeiras', responsible: 'Fernanda Rocha', color: '#f43f5e', status: 'open', stock: 200 },
  { id: 'stall-n1', eventId: '2', name: 'Barraca do Peru', category: 'comidas', responsible: 'Roberto Alves', color: '#dc2626', status: 'open', stock: 80 },
  { id: 'stall-n2', eventId: '2', name: 'Doces Natalinos', category: 'doces', responsible: 'Helena Dias', color: '#16a34a', status: 'open', stock: 120 },
  { id: 'stall-n3', eventId: '2', name: 'Bebidas Quentes', category: 'bebidas', responsible: 'Marcos Prado', color: '#ca8a04', status: 'open', stock: 200 },
  { id: 'stall-l1', eventId: '3', name: 'Barraca Central', category: 'comidas', responsible: 'Ana Lima', color: '#7c3aed', status: 'open', stock: 120 },
];

export function createDefaultStallsForEvent(eventId: string): Stall[] {
  const stallId = `stall-${eventId}-default`;
  return [
    {
      id: stallId,
      eventId,
      name: 'Barraca Principal',
      category: 'comidas',
      responsible: 'Organizador',
      color: '#d97706',
      status: 'open',
      stock: 100,
    },
  ];
}
