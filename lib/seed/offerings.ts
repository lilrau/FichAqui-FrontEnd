import type { Offering } from '@/lib/types/event-domain';

type OfferingSeed = Omit<Offering, 'id'>;

function offeringId(eventId: string, stallId: string, productId: string): string {
  return `offering-${eventId}-${stallId}-${productId}`;
}

const offeringsEvent1: OfferingSeed[] = [
  {
    eventId: '1',
    stallId: 'stall-1',
    productId: 'pastel',
    available: true,
    variants: [
      { templateId: 'carne', price: 8.0, available: true, badge: 'Mais vendido' },
      { templateId: 'queijo', price: 7.0, available: true },
    ],
  },
  {
    eventId: '1',
    stallId: 'stall-2',
    productId: 'pastel',
    available: true,
    variants: [
      { templateId: 'carne', price: 9.0, available: true },
      { templateId: 'queijo', price: 8.0, available: true },
    ],
  },
  {
    eventId: '1',
    stallId: 'stall-2',
    productId: 'milho-verde',
    available: true,
    variants: [{ templateId: 'unidade', price: 6.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-2',
    productId: 'cachorro-quente',
    available: true,
    variants: [{ templateId: 'unidade', price: 10.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-1',
    productId: 'cachorro-quente',
    available: true,
    variants: [{ templateId: 'unidade', price: 11.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-2',
    productId: 'espetinho-carne',
    available: true,
    variants: [{ templateId: 'unidade', price: 12.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-2',
    productId: 'caldo-verde',
    available: true,
    variants: [{ templateId: 'copo', price: 8.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-3',
    productId: 'maca-amor',
    available: true,
    variants: [{ templateId: 'unidade', price: 8.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-3',
    productId: 'canjica',
    available: true,
    variants: [{ templateId: 'copo', price: 7.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-3',
    productId: 'pacoca',
    available: true,
    variants: [{ templateId: 'unidade', price: 3.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-3',
    productId: 'pe-de-moleque',
    available: true,
    variants: [{ templateId: 'unidade', price: 4.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-3',
    productId: 'cocada',
    available: true,
    variants: [{ templateId: 'unidade', price: 5.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-4',
    productId: 'quentao',
    available: true,
    variants: [{ templateId: 'copo', price: 6.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-4',
    productId: 'vinho-quente',
    available: true,
    variants: [{ templateId: 'copo', price: 8.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-4',
    productId: 'refrigerante',
    available: true,
    variants: [
      { templateId: 'coca', price: 5.0, available: true },
      { templateId: 'guarana', price: 5.0, available: true },
      { templateId: 'fanta', price: 5.0, available: true },
    ],
  },
  {
    eventId: '1',
    stallId: 'stall-4',
    productId: 'agua-mineral',
    available: true,
    variants: [{ templateId: 'garrafa', price: 3.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-4',
    productId: 'suco-natural',
    available: true,
    variants: [
      { templateId: 'laranja', price: 6.0, available: true },
      { templateId: 'limao', price: 6.0, available: true },
    ],
  },
  {
    eventId: '1',
    stallId: 'stall-5',
    productId: 'pescaria',
    available: true,
    variants: [{ templateId: 'jogada', price: 5.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-5',
    productId: 'argolas',
    available: true,
    variants: [{ templateId: 'jogada', price: 5.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-5',
    productId: 'tiro-ao-alvo',
    available: true,
    variants: [{ templateId: 'jogada', price: 5.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-6',
    productId: 'bingo',
    available: true,
    variants: [{ templateId: 'cartela', price: 5.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-7',
    productId: 'correio-elegante',
    available: true,
    variants: [{ templateId: 'mensagem', price: 3.0, available: true }],
  },
  {
    eventId: '1',
    stallId: 'stall-7',
    productId: 'quadrilha',
    available: true,
    variants: [{ templateId: 'participacao', price: 0, available: true }],
  },
];

const offeringsEvent2: OfferingSeed[] = [
  {
    eventId: '2',
    stallId: 'stall-n1',
    productId: 'peru-assado',
    available: true,
    variants: [{ templateId: 'fatia', price: 15.0, available: true }],
  },
  {
    eventId: '2',
    stallId: 'stall-n2',
    productId: 'panetone',
    available: true,
    variants: [{ templateId: 'fatia', price: 8.0, available: true }],
  },
  {
    eventId: '2',
    stallId: 'stall-n2',
    productId: 'rabanada',
    available: true,
    variants: [{ templateId: 'unidade', price: 5.0, available: true }],
  },
  {
    eventId: '2',
    stallId: 'stall-n3',
    productId: 'chocolate-quente',
    available: true,
    variants: [{ templateId: 'copo', price: 7.0, available: true }],
  },
  {
    eventId: '2',
    stallId: 'stall-n3',
    productId: 'vinho-natal',
    available: true,
    variants: [{ templateId: 'copo', price: 9.0, available: true }],
  },
];

const offeringsEvent3: OfferingSeed[] = [
  {
    eventId: '3',
    stallId: 'stall-l1',
    productId: 'sopa',
    available: true,
    variants: [{ templateId: 'copo', price: 7.0, available: true }],
  },
];

function withIds(seeds: OfferingSeed[]): Offering[] {
  return seeds.map((seed) => ({
    ...seed,
    id: offeringId(seed.eventId, seed.stallId, seed.productId),
  }));
}

export const seedOfferings: Offering[] = [
  ...withIds(offeringsEvent1),
  ...withIds(offeringsEvent2),
  ...withIds(offeringsEvent3),
];

export function createDefaultOfferingForEvent(
  eventId: string,
  stallId: string
): Offering {
  return {
    id: offeringId(eventId, stallId, 'item-boas-vindas'),
    eventId,
    stallId,
    productId: 'item-boas-vindas',
    available: true,
    variants: [{ templateId: 'unidade', price: 5, available: true }],
  };
}

export function createOfferingFromCatalogProduct(
  eventId: string,
  stallId: string,
  productId: string
): Offering {
  return {
    id: offeringId(eventId, stallId, productId),
    eventId,
    stallId,
    productId,
    available: true,
    variants: [],
  };
}
