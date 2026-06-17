'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchCities } from '@/lib/api/cities';
import { getErrorMessage } from '@/lib/api/errors';
import { loadJson, saveJson } from '@/lib/storage';
import type { City } from '@/lib/types/city';

const SELECTED_CITY_KEY = 'event-app:selected-city';

interface CityContextType {
  hydrated: boolean;
  loadError: string | null;
  cities: City[];
  selectedCityId: string | null;
  selectedCity: City | null;
  setSelectedCityId: (cityId: string) => void;
  clearSelectedCity: () => void;
  refreshCities: () => Promise<void>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshCities = useCallback(async () => {
    const list = await fetchCities();
    setCities(list);
    setLoadError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchCities();
        if (cancelled) return;

        setCities(list);
        const stored = loadJson<string | null>(SELECTED_CITY_KEY, null);
        const validStored = stored && list.some((city) => city.id === stored);
        setSelectedCityIdState(validStored ? stored : (list[0]?.id ?? null));
        setLoadError(null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, 'Não foi possível carregar as cidades.'));
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedCityId = useCallback((cityId: string) => {
    setSelectedCityIdState(cityId);
    saveJson(SELECTED_CITY_KEY, cityId);
  }, []);

  const clearSelectedCity = useCallback(() => {
    setSelectedCityIdState(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SELECTED_CITY_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? null,
    [cities, selectedCityId]
  );

  const value = useMemo(
    () => ({
      hydrated,
      loadError,
      cities,
      selectedCityId,
      selectedCity,
      setSelectedCityId,
      clearSelectedCity,
      refreshCities,
    }),
    [
      hydrated,
      loadError,
      cities,
      selectedCityId,
      selectedCity,
      setSelectedCityId,
      clearSelectedCity,
      refreshCities,
    ]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error('useCity must be used within CityProvider');
  }
  return ctx;
}
