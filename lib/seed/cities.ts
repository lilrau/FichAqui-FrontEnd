export interface City {
  id: string;
  name: string;
  state: string;
}

export const seedCities: City[] = [
  { id: 'curitiba-pr', name: 'Curitiba', state: 'PR' },
  { id: 'londrina-pr', name: 'Londrina', state: 'PR' },
  { id: 'sao-paulo-sp', name: 'São Paulo', state: 'SP' },
];

export function cityLabel(city: City): string {
  return `${city.name} — ${city.state}`;
}
