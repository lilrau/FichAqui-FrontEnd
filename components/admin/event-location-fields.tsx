'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { matchCityToPlatform } from '@/lib/google-maps/match-city';
import { loadGoogleMaps } from '@/lib/google-maps/load-google-maps';
import { parsePlaceResult } from '@/lib/google-maps/parse-place';
import type { City } from '@/lib/types/city';
import { Input } from '@/components/ui/input';
import { EventAddressMap } from '@/components/admin/event-address-map';

export interface EventAddressValue {
  location: string;
  latitude: number | null;
  longitude: number | null;
  cityId: string;
}

export function hasEventCoordinates(value: Pick<EventAddressValue, 'latitude' | 'longitude'>): boolean {
  return typeof value.latitude === 'number' && typeof value.longitude === 'number';
}

export type EventAddressInput = {
  location: string;
  cityId: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function hasResolvedEventAddress(value: EventAddressInput): boolean {
  return Boolean(
    value.location.trim() &&
      typeof value.latitude === 'number' &&
      typeof value.longitude === 'number' &&
      value.cityId
  );
}

export function EventAddressField({
  value,
  cities,
  onChange,
  disabled = false,
  inputKey,
}: {
  value: EventAddressValue;
  cities: City[];
  onChange: (value: EventAddressValue) => void;
  disabled?: boolean;
  inputKey?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const citiesRef = useRef(cities);
  const isTypingRef = useRef(false);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const hasCoordinates = hasEventCoordinates(value);

  onChangeRef.current = onChange;
  citiesRef.current = cities;

  useEffect(() => {
    if (isTypingRef.current || !inputRef.current) return;
    inputRef.current.value = value.location;
  }, [value.location, inputKey]);

  useEffect(() => {
    let cancelled = false;
    let autocomplete: google.maps.places.Autocomplete | null = null;

    (async () => {
      try {
        await loadGoogleMaps();
        if (cancelled || !inputRef.current) return;

        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'br' },
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete?.getPlace();
          if (!place) return;

          const parsed = parsePlaceResult(place);
          if (!parsed) {
            setResolveError('Não foi possível obter as coordenadas deste endereço.');
            return;
          }

          const city = matchCityToPlatform(
            parsed.cityName,
            parsed.stateCode,
            citiesRef.current
          );
          if (!city) {
            setResolveError(
              parsed.cityName
                ? `A cidade "${parsed.cityName}" ainda não está disponível na plataforma.`
                : 'Não foi possível identificar a cidade deste endereço.'
            );
            isTypingRef.current = false;
            if (inputRef.current) {
              inputRef.current.value = parsed.formattedAddress;
            }
            onChangeRef.current({
              location: parsed.formattedAddress,
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              cityId: '',
            });
            return;
          }

          setResolveError(null);
          isTypingRef.current = false;
          if (inputRef.current) {
            inputRef.current.value = parsed.formattedAddress;
          }
          onChangeRef.current({
            location: parsed.formattedAddress,
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            cityId: city.id,
          });
        });

        setMapsError(null);
      } catch (error) {
        if (!cancelled) {
          setMapsError(error instanceof Error ? error.message : 'Erro ao carregar o Google Maps.');
        }
      } finally {
        if (!cancelled) setIsLoadingMaps(false);
      }
    })();

    return () => {
      cancelled = true;
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [inputKey]);

  const syncDraftToParent = () => {
    const nextLocation = inputRef.current?.value.trim() ?? '';
    isTypingRef.current = false;

    if (!nextLocation) {
      onChangeRef.current({
        location: '',
        latitude: null,
        longitude: null,
        cityId: '',
      });
      return;
    }

    if (
      nextLocation === value.location &&
      hasResolvedEventAddress(value)
    ) {
      return;
    }

    onChangeRef.current({
      location: nextLocation,
      latitude: null,
      longitude: null,
      cityId: '',
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        Endereço do evento
      </label>

      <p className="text-xs text-muted-foreground">
        Digite o endereço e selecione uma sugestão do Google Maps. A cidade e as coordenadas são
        preenchidas automaticamente.
      </p>

      <div className="relative">
        <Input
          key={inputKey}
          ref={inputRef}
          defaultValue={value.location}
          onFocus={() => {
            isTypingRef.current = true;
          }}
          onInput={() => {
            isTypingRef.current = true;
            setResolveError(null);
          }}
          onBlur={syncDraftToParent}
          disabled={disabled || isLoadingMaps || Boolean(mapsError)}
          className="h-14 rounded-xl pr-10"
          placeholder="Ex: Rua XV de Novembro, 1000, Curitiba"
          autoComplete="off"
        />
        {isLoadingMaps ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {mapsError ? <p className="text-sm text-destructive">{mapsError}</p> : null}
      {resolveError ? <p className="text-sm text-destructive">{resolveError}</p> : null}

      <EventAddressMap latitude={value.latitude} longitude={value.longitude} />

      {!hasCoordinates && !resolveError ? (
        <p className="text-xs text-muted-foreground">
          Selecione um endereço na lista de sugestões para confirmar a localização.
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use EventAddressField */
export const EventLocationFields = EventAddressField;
