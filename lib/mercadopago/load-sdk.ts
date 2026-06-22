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

export interface MpIdentificationType {
  id: string;
  name: string;
}

export interface MpFieldChangeData {
  fieldLength?: number;
}

export interface MpBinChangeData {
  bin?: string;
}

export interface MpSecureField {
  mount: (elementId: string) => MpSecureField;
  unmount: () => void;
  on: (
    event: 'binChange' | 'change' | 'focus' | 'blur' | 'validityChange' | 'ready',
    callback: (data: MpFieldChangeData & MpBinChangeData) => void
  ) => void;
  update: (options: Record<string, unknown>) => void;
}

export interface MpFieldsApi {
  create: (fieldType: 'cardNumber' | 'expirationDate' | 'securityCode', options?: { placeholder?: string }) => MpSecureField;
  createCardToken: (options: {
    cardholderName: string;
    identificationType: string;
    identificationNumber: string;
  }) => Promise<{ id: string }>;
}

export interface MercadoPagoInstance {
  fields: MpFieldsApi;
  getIdentificationTypes: () => Promise<MpIdentificationType[]>;
  getPaymentMethods: (options: { bin: string }) => Promise<{
    results: Array<{ id: string; settings?: Array<{ card_number?: unknown; security_code?: unknown }> }>;
  }>;
}

export function createMercadoPago(publicKey: string): MercadoPagoInstance {
  if (!window.MercadoPago) {
    throw new Error('Mercado Pago SDK não carregado');
  }
  return new window.MercadoPago(publicKey, { locale: 'pt-BR' });
}

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale?: string }
    ) => MercadoPagoInstance;
  }
}
