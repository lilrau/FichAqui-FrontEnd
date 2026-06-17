'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPaymentStatus } from '@/lib/api/payments';
import { getErrorMessage } from '@/lib/api/errors';
import type { PaymentInfo, PaymentStatus } from '@/lib/types/payment';

const POLL_MS = 4000;

export function usePaymentStatusPoll(paymentId: string | null) {
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef(false);

  const pollOnce = useCallback(async () => {
    if (!paymentId || terminalRef.current) return null;

    try {
      const status = await fetchPaymentStatus(paymentId);
      setPayment(status);
      setError(null);
      if (status.status === 'approved' || status.status === 'rejected') {
        terminalRef.current = true;
      }
      return status;
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível verificar o pagamento.'));
      return null;
    }
  }, [paymentId]);

  useEffect(() => {
    terminalRef.current = false;
    setPayment(null);
    setError(null);
    if (!paymentId) return;

    let cancelled = false;

    void pollOnce();

    const interval = window.setInterval(() => {
      if (cancelled || document.hidden || terminalRef.current) return;
      void pollOnce();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [paymentId, pollOnce]);

  return {
    payment,
    error,
    isApproved: payment?.status === 'approved',
    isRejected: payment?.status === 'rejected',
    isPending: payment?.status === 'pending' || (!payment && Boolean(paymentId)),
  };
}

export function isTerminalPaymentStatus(status: PaymentStatus): boolean {
  return status === 'approved' || status === 'rejected';
}
