import { loadGoogleMaps } from '@/lib/google-maps/load-google-maps';
import { parseGeocoderResult, type ParsedPlace } from '@/lib/google-maps/parse-place';

export async function geocodeAddress(address: string): Promise<ParsedPlace | null> {
  const query = address.trim();
  if (!query) return null;

  await loadGoogleMaps();

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query, componentRestrictions: { country: 'br' } }, (results, status) => {
      if (status !== 'OK' || !results?.[0]) {
        resolve(null);
        return;
      }

      try {
        resolve(parseGeocoderResult(results[0]));
      } catch (error) {
        reject(error);
      }
    });
  });
}
