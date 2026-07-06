import { apiRequest } from '@/lib/api/client';
import { normalizePaymentInfo } from '@/lib/api/normalize-payment';
import type { CardBrand } from '@/lib/card-brand';
import type { CardPaymentType, TopUpResponse } from '@/lib/types/payment';
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

export async function addWalletCard(payload: {
  cardToken: string;
  paymentMethodId: string;
}): Promise<SavedPaymentCard> {
  const data = await apiRequest<WalletResponse['savedCards'][number]>(
    '/api/user/wallet/cards',
    {
      method: 'POST',
      auth: true,
      body: payload,
    }
  );
  return normalizeSavedCard(data);
}

export async function topUpWallet(payload: {
  amount: number;
  paymentMethod: 'credit_card' | 'pix';
  cardId?: string | null;
  cardToken?: string | null;
  paymentMethodId?: string | null;
  paymentMethodType?: CardPaymentType | null;
  installments?: number;
  saveCard?: boolean;
}): Promise<TopUpResponse> {
  const data = await apiRequest<TopUpResponse & Record<string, unknown>>('/api/user/wallet/top-up', {
    method: 'POST',
    auth: true,
    body: payload,
  });

  const payment = normalizePaymentInfo(data.payment ?? data);
  if (!payment) {
    throw new Error('Resposta de pagamento inválida.');
  }

  return {
    balance: data.balance,
    payment,
  };
}
