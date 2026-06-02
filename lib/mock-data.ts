/** @deprecated Import from `@/lib/types/event-domain` or `@/lib/seed` instead. */
export type {
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

export { buildMenuItemsFromProducts } from '@/lib/catalog/menu-catalog';
export { seedCategories as categories } from '@/lib/seed/categories';
export { seedEvents as events } from '@/lib/seed/events';
export { seedStalls as stalls } from '@/lib/seed/stalls';
export { seedMenuProducts as menuProducts } from '@/lib/seed/menu-products';

export type { CardBrand, CardNetwork } from './card-brand';

export interface SavedPaymentCard {
  id: string;
  brand: CardBrand;
  lastFour: string;
  holderName: string;
  holderCpf: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

import type { CardBrand } from './card-brand';
import type { Ficha } from '@/lib/types/event-domain';

export const mockAvailableFichas: Ficha[] = [
  {
    id: 'ficha-1',
    orderId: 'order-1',
    itemName: 'Pastel — Carne',
    itemImage: '🥟',
    stallId: 'stall-1',
    qrCode: 'QR-12345-pastel-carne',
    status: 'available',
  },
  {
    id: 'ficha-2',
    orderId: 'order-1',
    itemName: 'Milho Verde',
    itemImage: '🌽',
    stallId: 'stall-2',
    qrCode: 'QR-12345-milho-verde-unidade',
    status: 'available',
  },
  {
    id: 'ficha-3',
    orderId: 'order-4',
    itemName: 'Cachorro Quente',
    itemImage: '🌭',
    stallId: 'stall-2',
    qrCode: 'QR-99001-cachorro-quente-unidade',
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
