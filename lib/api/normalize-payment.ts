import type {
  PaymentInfo,
  PaymentMethodKind,
  PaymentStatus,
  PixPaymentDetails,
} from '@/lib/types/payment';

type RawPixFields = {
  pix?: Partial<PixPaymentDetails> & {
    copy_paste?: string;
    qr_code?: string;
    expires_at?: string;
  };
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  pixExpiresAt?: string | null;
};

type RawPaymentFields = RawPixFields & {
  payment?: RawPaymentFields;
  id?: string;
  paymentId?: string;
  status?: string;
  paymentStatus?: string;
  method?: string;
  paymentMethod?: string;
};

function normalizePaymentStatus(raw?: string | null): PaymentStatus {
  if (raw === 'approved' || raw === 'paid') return 'approved';
  if (raw === 'rejected' || raw === 'failed' || raw === 'payment_failed') return 'rejected';
  return 'pending';
}

function normalizePixDetails(raw: RawPixFields): PixPaymentDetails | undefined {
  const nested = raw.pix;
  const copyPaste =
    nested?.copyPaste ?? nested?.copy_paste ?? raw.pixCopyPaste ?? undefined;
  const qrCode = nested?.qrCode ?? nested?.qr_code ?? raw.pixQrCode ?? undefined;
  const expiresAt =
    nested?.expiresAt ?? nested?.expires_at ?? raw.pixExpiresAt ?? undefined;

  if (!copyPaste && !qrCode) return undefined;

  return {
    copyPaste: copyPaste ?? '',
    qrCode: qrCode ?? undefined,
    expiresAt: expiresAt ?? undefined,
  };
}

export function normalizePaymentInfo(raw: RawPaymentFields | null | undefined): PaymentInfo | null {
  if (!raw) return null;

  const nested = raw.payment;
  const id = nested?.paymentId ?? nested?.id ?? raw.paymentId ?? raw.id;
  const method = (nested?.method ??
    nested?.paymentMethod ??
    raw.paymentMethod ??
    raw.method) as PaymentMethodKind | undefined;

  if (!id || !method) return null;

  const status = normalizePaymentStatus(
    nested?.paymentStatus ?? nested?.status ?? raw.paymentStatus ?? raw.status
  );

  const pix = normalizePixDetails({
    pix: nested?.pix ?? raw.pix,
    pixQrCode: nested?.pixQrCode ?? raw.pixQrCode,
    pixCopyPaste: nested?.pixCopyPaste ?? raw.pixCopyPaste,
    pixExpiresAt: nested?.pixExpiresAt ?? raw.pixExpiresAt,
  });

  return {
    id,
    status,
    method,
    ...(pix ? { pix } : {}),
  };
}

export function hasPendingPix(payment: PaymentInfo | null | undefined): boolean {
  return (
    payment?.method === 'pix' &&
    payment.status === 'pending' &&
    Boolean(payment.pix?.copyPaste || payment.pix?.qrCode)
  );
}

export function hasPendingCardPayment(payment: PaymentInfo | null | undefined): boolean {
  return payment?.method === 'credit_card' && payment.status === 'pending';
}

export function hasPendingPayment(payment: PaymentInfo | null | undefined): boolean {
  return payment?.status === 'pending';
}
