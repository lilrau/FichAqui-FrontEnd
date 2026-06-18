declare namespace google.maps {
  class LatLng {
    lat(): number;
    lng(): number;
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  namespace places {
    interface AutocompleteOptions {
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
      types?: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      name?: string;
      address_components?: GeocoderAddressComponent[];
      geometry?: { location?: LatLng };
    }

    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(event: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }
  }

  class Geocoder {
    geocode(
      request: { address: string; componentRestrictions?: { country: string } },
      callback: (results: GeocoderResult[] | null, status: string) => void
    ): void;
  }

  interface GeocoderResult {
    formatted_address: string;
    address_components: GeocoderAddressComponent[];
    geometry: { location: LatLng };
  }

  interface MapOptions {
    center?: { lat: number; lng: number };
    zoom?: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    gestureHandling?: string;
  }

  class Map {
    constructor(element: HTMLElement, opts?: MapOptions);
    setCenter(center: { lat: number; lng: number }): void;
    setZoom(zoom: number): void;
    panTo(center: { lat: number; lng: number }): void;
  }

  interface MarkerOptions {
    position?: { lat: number; lng: number };
    map?: Map | null;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: { lat: number; lng: number }): void;
  }

  namespace event {
    function clearInstanceListeners(instance: object): void;
  }
}

declare const google: {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: google.maps.places.AutocompleteOptions
      ) => google.maps.places.Autocomplete;
    };
    Geocoder: new () => google.maps.Geocoder;
    Map: new (element: HTMLElement, opts?: google.maps.MapOptions) => google.maps.Map;
    Marker: new (opts?: google.maps.MarkerOptions) => google.maps.Marker;
    event: typeof google.maps.event;
  };
};

interface Window {
  google?: typeof google;
}
