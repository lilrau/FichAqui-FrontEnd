import type { CardBrand } from '@/lib/card-brand';

export interface SavedPaymentCard {
  id: string;
  brand: CardBrand;
  lastFour: string;
  holderName: string;
  holderCpf?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

export interface WalletData {
  balance: number;
  savedCards: SavedPaymentCard[];
}
