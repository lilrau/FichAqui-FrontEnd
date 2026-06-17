'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchPaymentsConfig } from '@/lib/api/payments';
import { getErrorMessage } from '@/lib/api/errors';
import type { PaymentsConfig } from '@/lib/types/payment';

const DEFAULT_CONFIG: PaymentsConfig = {
  enabled: false,
  publicKey: null,
  cardEnabled: false,
  pixEnabled: false,
  topUpEnabled: false,
};

export function usePaymentsConfig() {
  const [config, setConfig] = useState<PaymentsConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchPaymentsConfig();
      setConfig(next);
      setError(null);
    } catch (err) {
      setConfig(DEFAULT_CONFIG);
      setError(getErrorMessage(err, 'Não foi possível carregar pagamentos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { config, loading, error, refresh };
}
