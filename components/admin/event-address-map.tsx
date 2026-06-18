'use client';

import { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps/load-google-maps';

const DEFAULT_CENTER = { lat: -14.235, lng: -51.9253 };
const DEFAULT_ZOOM = 4;
const ADDRESS_ZOOM = 16;

export function EventAddressMap({
  latitude,
  longitude,
}: {
  latitude?: number | null;
  longitude?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMaps();
        if (cancelled || !containerRef.current) return;

        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(containerRef.current, {
            center: hasCoordinates ? { lat: latitude!, lng: longitude! } : DEFAULT_CENTER,
            zoom: hasCoordinates ? ADDRESS_ZOOM : DEFAULT_ZOOM,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'cooperative',
          });
          markerRef.current = new google.maps.Marker({ map: mapRef.current });
        }

        if (hasCoordinates) {
          const center = { lat: latitude!, lng: longitude! };
          markerRef.current?.setPosition(center);
          markerRef.current?.setMap(mapRef.current);
          mapRef.current.setCenter(center);
          mapRef.current.setZoom(ADDRESS_ZOOM);
          mapRef.current.panTo(center);
          return;
        }

        markerRef.current?.setMap(null);
        mapRef.current.setCenter(DEFAULT_CENTER);
        mapRef.current.setZoom(DEFAULT_ZOOM);
      } catch {
        // Parent field already surfaces map load errors.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasCoordinates, latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="h-48 w-full overflow-hidden rounded-xl border border-border bg-muted"
      aria-label="Mapa do endereço do evento"
    />
  );
}
