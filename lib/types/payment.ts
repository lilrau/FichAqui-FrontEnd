export type PaymentMethodKind = 'credit_card' | 'pix' | 'wallet';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export type OrderPaymentStatus = 'pending_payment' | 'paid' | 'payment_failed' | 'available' | 'delivered';

export interface PixPaymentDetails {
  qrCode?: string;
  copyPaste: string;
  expiresAt?: string;
}

export interface PaymentInfo {
  id: string;
  status: PaymentStatus;
  method: PaymentMethodKind;
  pix?: PixPaymentDetails;
}

export interface PaymentsConfig {
  enabled: boolean;
  publicKey: string | null;
  cardEnabled: boolean;
  pixEnabled: boolean;
  topUpEnabled: boolean;
}

export interface CardTokenResult {
  token: string;
  paymentMethodId: string;
}

export interface TopUpPayload {
  amount: number;
  paymentMethod: 'credit_card' | 'pix';
  cardId?: string | null;
  cardToken?: string | null;
  paymentMethodId?: string | null;
  saveCard?: boolean;
}

export interface TopUpResponse {
  balance: number;
  payment: PaymentInfo;
}

export interface AddWalletCardPayload {
  cardToken: string;
  paymentMethodId: string;
}
