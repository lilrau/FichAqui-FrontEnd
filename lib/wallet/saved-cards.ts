import type { SavedPaymentCard } from '@/lib/types/wallet';

/** Cartão persistido no Mercado Pago (pode gerar CVV token). */
export function getTokenizedSavedCards(cards: SavedPaymentCard[]): SavedPaymentCard[] {
  return cards.filter((card) => Boolean(card.mercadoPagoCardId));
}

export function pickDefaultSavedCard(
  cards: SavedPaymentCard[]
): SavedPaymentCard | undefined {
  const tokenized = getTokenizedSavedCards(cards);
  if (tokenized.length > 0) {
    return tokenized.find((card) => card.isDefault) ?? tokenized[0];
  }

  return cards.find((card) => card.isDefault) ?? cards[0];
}

export function isTokenizedSavedCard(card: SavedPaymentCard): boolean {
  return Boolean(card.mercadoPagoCardId);
}
