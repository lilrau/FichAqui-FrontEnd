const SDK_URL = 'https://sdk.mercadopago.com/js/v2';

let sdkPromise: Promise<void> | null = null;

export function loadMercadoPagoSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Mercado Pago SDK requires browser'));
  }

  if (window.MercadoPago) {
    return Promise.resolve();
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-mp-sdk="v2"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Falha ao carregar Mercado Pago')));
        return;
      }

      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.dataset.mpSdk = 'v2';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Mercado Pago'));
      document.body.appendChild(script);
    });
  }

  return sdkPromise;
}

export function createMercadoPago(publicKey: string): MercadoPagoInstance {
  if (!window.MercadoPago) {
    throw new Error('Mercado Pago SDK não carregado');
  }
  return new window.MercadoPago(publicKey, { locale: 'pt-BR' });
}

export interface MercadoPagoCardForm {
  createCardToken: () => Promise<{
    token?: string;
    paymentMethodId?: string;
    payment_method_id?: string;
  }>;
}

export interface MercadoPagoInstance {
  cardForm: (options: Record<string, unknown>) => MercadoPagoCardForm;
}

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale?: string }
    ) => MercadoPagoInstance;
  }
}
