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
  mercadoPagoCardId?: string;
}

export interface WalletData {
  balance: number;
  savedCards: SavedPaymentCard[];
}

export type WalletTransactionDirection = 'credit' | 'debit';

export type WalletTransactionType = 'recarga' | 'compra';

export type WalletTransactionOriginType = 'recarga' | 'pedido' | 'manual';

export interface WalletTransaction {
  id: string;
  description: string;
  direction: WalletTransactionDirection;
  amount: number;
  createdAt: string;
  type: WalletTransactionType;
  originType: WalletTransactionOriginType;
  originId: string;
}
