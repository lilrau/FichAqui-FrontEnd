import { geocodeAddress } from '@/lib/google-maps/geocode-address';
import { matchCityToPlatform } from '@/lib/google-maps/match-city';
import type { EventAddressInput } from '@/components/admin/event-location-fields';
import type { City } from '@/lib/types/city';

export type ResolveEventAddressResult =
  | { ok: true; value: Required<Pick<EventAddressInput, 'location' | 'cityId'>> & {
      latitude: number;
      longitude: number;
    } }
  | { ok: false; message: string };

function hasCoordinates(value: EventAddressInput): boolean {
  return typeof value.latitude === 'number' && typeof value.longitude === 'number';
}

export async function resolveEventAddress(
  value: EventAddressInput,
  cities: City[]
): Promise<ResolveEventAddressResult> {
  if (!value.location.trim()) {
    return { ok: false, message: 'Informe o endereço do evento.' };
  }

  if (value.cityId && hasCoordinates(value)) {
    return {
      ok: true,
      value: {
        location: value.location,
        cityId: value.cityId,
        latitude: value.latitude as number,
        longitude: value.longitude as number,
      },
    };
  }

  const parsed = await geocodeAddress(value.location);
  if (!parsed) {
    return {
      ok: false,
      message: 'Não foi possível localizar este endereço. Selecione uma sugestão do Google Maps.',
    };
  }

  const city = matchCityToPlatform(parsed.cityName, parsed.stateCode, cities);
  if (!city) {
    return {
      ok: false,
      message: parsed.cityName
        ? `A cidade "${parsed.cityName}" ainda não está disponível na plataforma.`
        : 'Não foi possível identificar a cidade deste endereço.',
    };
  }

  return {
    ok: true,
    value: {
      location: parsed.formattedAddress,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      cityId: city.id,
    },
  };
}
