import type { City } from '@/lib/types/city';

function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchCityToPlatform(
  cityName: string | null,
  stateCode: string | null,
  cities: City[]
): City | null {
  if (!cityName) return null;

  const target = normalizeCityName(cityName);
  const matches = cities.filter((city) => normalizeCityName(city.name) === target);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  if (stateCode) {
    const byState = matches.find(
      (city) => city.state.toUpperCase() === stateCode.toUpperCase()
    );
    if (byState) return byState;
  }

  return matches[0] ?? null;
}
