export interface City {
  id: string;
  name: string;
  state: string;
}

export function cityLabel(city: City): string {
  return `${city.name} — ${city.state}`;
}
