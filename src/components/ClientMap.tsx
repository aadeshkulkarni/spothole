'use client';

import { Pothole } from '@/types/pothole';
import { LatLngExpression } from 'leaflet';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { MapHandles } from './Map';

interface ClientMapProps {
  initialPotholes: Pothole[];
  onMapReady: (methods: MapHandles) => void;
  onMarkerClick: (pothole: Pothole) => void;
  initialCenter: LatLngExpression;
}

const Map = dynamic(
  () => import('@/components/Map').then((mod) => mod.Map),
  {
    loading: () => <p className="mt-10 text-center">Loading map...</p>,
    ssr: false,
  },
);

const ClientMap = ({
  initialPotholes,
  onMapReady,
  onMarkerClick,
  initialCenter,
}: ClientMapProps) => {
  const [potholes, setPotholes] = useState<Pothole[]>(initialPotholes);
  const locale = useLocale();

  useEffect(() => {
    setPotholes(initialPotholes);
  }, [initialPotholes]);

  const refreshPotholes = useCallback(async () => {
    try {
      const response = await fetch('/api/potholes');
      if (!response.ok) {
        throw new Error('Failed to fetch potholes');
      }
      const data = await response.json();
      setPotholes(data);
    } catch (error) {
      console.error('Error refreshing potholes:', error);
    }
  }, []);

  const handleMapReadyWithRefresh = useCallback(
    (methods: MapHandles) => {
      onMapReady({ ...methods, refresh: refreshPotholes });
    },
    [onMapReady, refreshPotholes],
  );

  return (
    <Map
      potholes={potholes}
      onMapReady={handleMapReadyWithRefresh}
      onMarkerClick={onMarkerClick}
      initialCenter={initialCenter}
      locale={locale}
    />
  );
};

export default ClientMap;
