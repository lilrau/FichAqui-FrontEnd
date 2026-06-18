export interface ParsedPlace {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  cityName: string | null;
  stateCode: string | null;
}

function readCityName(components: google.maps.GeocoderAddressComponent[]): string | null {
  return (
    components.find((component) => component.types.includes('locality'))?.long_name ??
    components.find((component) => component.types.includes('administrative_area_level_2'))
      ?.long_name ??
    null
  );
}

function readStateCode(components: google.maps.GeocoderAddressComponent[]): string | null {
  return (
    components.find((component) => component.types.includes('administrative_area_level_1'))
      ?.short_name ?? null
  );
}

export function parsePlaceResult(place: google.maps.places.PlaceResult): ParsedPlace | null {
  const location = place.geometry?.location;
  if (!location) return null;

  const components = place.address_components ?? [];

  return {
    formattedAddress: place.formatted_address ?? place.name ?? '',
    latitude: location.lat(),
    longitude: location.lng(),
    cityName: readCityName(components),
    stateCode: readStateCode(components),
  };
}

export function parseGeocoderResult(result: google.maps.GeocoderResult): ParsedPlace {
  const components = result.address_components ?? [];

  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat(),
    longitude: result.geometry.location.lng(),
    cityName: readCityName(components),
    stateCode: readStateCode(components),
  };
}
