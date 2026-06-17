import { apiRequest } from '@/lib/api/client';
import type { PaymentInfo, PaymentsConfig } from '@/lib/types/payment';

export async function fetchPaymentsConfig(): Promise<PaymentsConfig> {
  const data = await apiRequest<PaymentsConfig>('/api/payments/config');
  return {
    enabled: Boolean(data.enabled),
    publicKey: data.publicKey ?? null,
    cardEnabled: Boolean(data.cardEnabled),
    pixEnabled: Boolean(data.pixEnabled),
    topUpEnabled: Boolean(data.topUpEnabled),
  };
}

export async function fetchPaymentStatus(paymentId: string): Promise<PaymentInfo> {
  return apiRequest<PaymentInfo>(`/api/payments/${paymentId}/status`, { auth: true });
}
