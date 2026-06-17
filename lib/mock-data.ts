/** @deprecated Import from `@/lib/types/event-domain` or `@/lib/seed` instead. */
export type {
  CatalogProduct,
  CatalogVariantTemplate,
  Offering,
  OfferingVariant,
  CardapioProduct,
  MenuVariant,
  MenuProduct,
  MenuItem,
  Category,
  Stall,
  OrderStatus,
  Order,
  Ficha,
  Event,
} from '@/lib/types/event-domain';

export {
  getFichasFromOrder,
  isFichaValid,
  generateOrderNumber,
  generateQRCode,
} from '@/lib/types/event-domain';

export {
  buildMenuItemsFromOfferings,
  buildCardapioForEvent,
} from '@/lib/catalog/menu-catalog';
export { seedCategories as categories } from '@/lib/seed/categories';
export { seedEvents as events } from '@/lib/seed/events';
export { seedStalls as stalls } from '@/lib/seed/stalls';
export { seedCatalogProducts as catalogProducts } from '@/lib/seed/global-catalog';
export { seedOfferings as offerings } from '@/lib/seed/offerings';

export type { CardBrand, CardNetwork } from './card-brand';
export type { SavedPaymentCard } from '@/lib/types/wallet';
import type { Ficha } from '@/lib/types/event-domain';
import type { SavedPaymentCard } from '@/lib/types/wallet';

export const mockAvailableFichas: Ficha[] = [
  {
    id: 'ficha-1',
    orderId: 'order-1',
    itemName: 'Pastel — Carne',
    itemImage: '🥟',
    stallId: 'stall-1',
    stallName: 'Barraca do Pastel',
    qrCode: 'QR-12345-offering-1-stall-1-pastel:carne-0',
    status: 'available',
  },
  {
    id: 'ficha-2',
    orderId: 'order-1',
    itemName: 'Milho Verde',
    itemImage: '🌽',
    stallId: 'stall-2',
    stallName: 'Barraca do Milho',
    qrCode: 'QR-12345-offering-1-stall-2-milho-verde:unidade-0',
    status: 'available',
  },
  {
    id: 'ficha-3',
    orderId: 'order-4',
    itemName: 'Cachorro Quente',
    itemImage: '🌭',
    stallId: 'stall-2',
    stallName: 'Barraca do Milho',
    qrCode: 'QR-99001-offering-1-stall-2-cachorro-quente:unidade-0',
    status: 'available',
  },
];

export const mockWalletBalance = 46;

export const mockSavedPaymentCards: SavedPaymentCard[] = [
  {
    id: 'card-1',
    brand: 'visa',
    lastFour: '4242',
    holderName: 'Maria Silva',
    holderCpf: '123.456.789-09',
    expiryMonth: '08',
    expiryYear: '28',
    isDefault: true,
  },
  {
    id: 'card-2',
    brand: 'mastercard',
    lastFour: '5555',
    holderName: 'Maria Silva',
    holderCpf: '123.456.789-09',
    expiryMonth: '12',
    expiryYear: '27',
    isDefault: false,
  },
];
