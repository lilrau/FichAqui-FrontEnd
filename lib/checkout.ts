import { hasPendingCardPayment, hasPendingPix } from "@/lib/api/normalize-payment";
import {
  createOrderApi,
  normalizeApiOrder,
  toApiPaymentMethod,
  type CheckoutPaymentMethod,
} from "@/lib/api/orders";
import { parseVariantIdFromMenuItem } from "@/lib/catalog/menu-catalog";
import { resolveProductImage } from "@/lib/catalog/product-images";
import type { Ficha, MenuItem, Order } from "@/lib/types/event-domain";
import type { CardPaymentType, PaymentInfo } from '@/lib/types/payment';

export type { CheckoutPaymentMethod };

type CartLine = { item: MenuItem; quantity: number };

export interface CheckoutOptions {
  cardId?: string | null;
  cardToken?: string | null;
  paymentMethodId?: string | null;
  paymentMethodType?: CardPaymentType | null;
  cardholderName?: string | null;
  cardholderCpf?: string | null;
  installments?: number;
  saveCard?: boolean;
}

export interface CheckoutResult {
  order: Order;
  payment: PaymentInfo | null;
  fichas: Ficha[];
}

export async function checkoutOrder(
  eventId: string,
  cartItems: CartLine[],
  paymentMethod: CheckoutPaymentMethod,
  options?: CheckoutOptions,
): Promise<CheckoutResult> {
  const response = await createOrderApi(eventId, {
    items: cartItems.map((line) => ({
      offeringId: line.item.offeringId,
      variantId: parseVariantIdFromMenuItem(line.item),
      quantity: line.quantity,
    })),
    paymentMethod: toApiPaymentMethod(paymentMethod),
    cardId: paymentMethod === "card" ? (options?.cardId ?? null) : null,
    cardToken: paymentMethod === "card" ? (options?.cardToken ?? null) : null,
    paymentMethodId:
      paymentMethod === "card" ? (options?.paymentMethodId ?? null) : null,
    paymentMethodType:
      paymentMethod === "card" ? (options?.paymentMethodType ?? null) : null,
    cardholderName:
      paymentMethod === "card" ? (options?.cardholderName ?? null) : null,
    cardholderCpf:
      paymentMethod === "card" ? (options?.cardholderCpf ?? null) : null,
    installments: paymentMethod === "card" ? (options?.installments ?? 1) : undefined,
    saveCard: paymentMethod === "card" ? Boolean(options?.saveCard) : false,
  });

  const order = normalizeApiOrder(response.order, cartItems, eventId);
  const fichas = (order.fichas ?? response.fichas).map((dto) => ({
    id: dto.id,
    orderId: dto.orderId,
    itemName: dto.itemName,
    itemImage: resolveProductImage(dto.itemImage),
    stallId: dto.stallId,
    stallName: dto.stallName,
    qrCode: dto.qrCode,
    status: dto.status,
  }));

  return {
    order: { ...order, fichas },
    payment: response.payment,
    fichas,
  };
}

export function isCheckoutPaymentFailed(result: CheckoutResult): boolean {
  if (result.payment?.status === "rejected") return true;
  return result.order.status === "payment_failed";
}

export function needsPixConfirmation(result: CheckoutResult): boolean {
  return hasPendingPix(result.payment);
}

export function needsCardPaymentConfirmation(result: CheckoutResult): boolean {
  return hasPendingCardPayment(result.payment);
}

export function needsAsyncPaymentConfirmation(result: CheckoutResult): boolean {
  return (
    (needsPixConfirmation(result) || needsCardPaymentConfirmation(result)) &&
    !hasImmediateFichas(result)
  );
}

export function hasImmediateFichas(result: CheckoutResult): boolean {
  return result.fichas.length > 0;
}
