import { getGoogleMapsApiKey } from '@/lib/google-maps/config';

let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps só pode ser carregado no navegador.'));
  }

  if (window.google?.maps?.places?.Autocomplete) {
    return Promise.resolve();
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      new Error('Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para buscar endereços.')
    );
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=pt-BR`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Não foi possível carregar o Google Maps.'));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
