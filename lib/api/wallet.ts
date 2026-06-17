import { apiRequest } from '@/lib/api/client';
import type { CardBrand } from '@/lib/card-brand';
import type { SavedPaymentCard, WalletData } from '@/lib/types/wallet';

interface WalletResponse {
  balance: number;
  savedCards: {
    id: string;
    brand: string;
    lastFour: string;
    holderName: string;
    isDefault: boolean;
  }[];
}

const KNOWN_BRANDS = new Set<CardBrand>([
  'visa',
  'mastercard',
  'amex',
  'discover',
  'diners',
  'jcb',
  'hipercard',
  'banese',
  'cabal',
  'sorocred',
  'valecard',
  'elo',
]);

function normalizeBrand(brand: string): CardBrand {
  if (KNOWN_BRANDS.has(brand as CardBrand)) {
    return brand as CardBrand;
  }
  return 'elo';
}

function normalizeSavedCard(dto: WalletResponse['savedCards'][number]): SavedPaymentCard {
  return {
    id: dto.id,
    brand: normalizeBrand(dto.brand),
    lastFour: dto.lastFour,
    holderName: dto.holderName,
    isDefault: dto.isDefault,
  };
}

export async function fetchWallet(): Promise<WalletData> {
  const data = await apiRequest<WalletResponse>('/api/user/wallet', { auth: true });
  return {
    balance: data.balance,
    savedCards: data.savedCards.map(normalizeSavedCard),
  };
}
