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
import { seedCities, type City } from '@/lib/seed/cities';
import { loadJson, saveJson } from '@/lib/storage';

const SELECTED_CITY_KEY = 'event-app:selected-city';

interface CityContextType {
  hydrated: boolean;
  cities: City[];
  selectedCityId: string | null;
  selectedCity: City | null;
  setSelectedCityId: (cityId: string) => void;
  clearSelectedCity: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadJson<string | null>(SELECTED_CITY_KEY, null);
    if (stored && seedCities.some((c) => c.id === stored)) {
      setSelectedCityIdState(stored);
    }
    setHydrated(true);
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
    () => seedCities.find((c) => c.id === selectedCityId) ?? null,
    [selectedCityId]
  );

  const value = useMemo(
    () => ({
      hydrated,
      cities: seedCities,
      selectedCityId,
      selectedCity,
      setSelectedCityId,
      clearSelectedCity,
    }),
    [hydrated, selectedCityId, selectedCity, setSelectedCityId, clearSelectedCity]
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
