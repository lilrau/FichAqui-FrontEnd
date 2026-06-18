import { apiRequest } from '@/lib/api/client';
import { normalizePaymentInfo } from '@/lib/api/normalize-payment';
import type { PaymentInfo, PaymentsConfig } from '@/lib/types/payment';

/** Raw shape from GET /api/payments/config (PaymentClientConfig in OpenAPI). */
type PaymentClientConfigResponse = {
  enabled?: boolean;
  publicKey?: string | null;
  sandbox?: boolean;
  locale?: string;
  cardEnabled?: boolean;
  pixEnabled?: boolean;
  topUpEnabled?: boolean;
};

export async function fetchPaymentsConfig(): Promise<PaymentsConfig> {
  const data = await apiRequest<PaymentClientConfigResponse>('/api/payments/config');
  const mpReady = Boolean(data.enabled && data.publicKey);

  return {
    enabled: Boolean(data.enabled),
    publicKey: data.publicKey ?? null,
    // Backend currently exposes only `enabled` + `publicKey`; infer methods when flags are absent.
    cardEnabled: data.cardEnabled ?? mpReady,
    pixEnabled: data.pixEnabled ?? mpReady,
    topUpEnabled: data.topUpEnabled ?? mpReady,
  };
}

export async function fetchPaymentStatus(paymentId: string): Promise<PaymentInfo> {
  const data = await apiRequest<Record<string, unknown>>(`/api/payments/${paymentId}/status`, {
    auth: true,
  });
  const payment = normalizePaymentInfo(data);
  if (!payment) {
    throw new Error('Resposta de pagamento inválida.');
  }
  return payment;
}
