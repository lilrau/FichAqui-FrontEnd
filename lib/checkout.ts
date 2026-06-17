import {
  createOrderApi,
  normalizeApiOrder,
  toApiPaymentMethod,
  type CheckoutPaymentMethod,
} from '@/lib/api/orders';
import { parseVariantIdFromMenuItem } from '@/lib/catalog/menu-catalog';
import type { MenuItem, Order } from '@/lib/types/event-domain';

type CartLine = { item: MenuItem; quantity: number };

export async function checkoutOrder(
  eventId: string,
  cartItems: CartLine[],
  paymentMethod: CheckoutPaymentMethod,
  options?: { cardId?: string | null }
): Promise<Order> {
  const response = await createOrderApi(eventId, {
    items: cartItems.map((line) => ({
      offeringId: line.item.offeringId,
      variantId: parseVariantIdFromMenuItem(line.item),
      quantity: line.quantity,
    })),
    paymentMethod: toApiPaymentMethod(paymentMethod),
    cardId: paymentMethod === 'card' ? (options?.cardId ?? null) : null,
  });

  return normalizeApiOrder(response, cartItems, eventId);
}
