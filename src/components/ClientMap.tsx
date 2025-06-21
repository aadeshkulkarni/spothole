'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import type { Pothole } from './Map';

interface ClientMapProps {
  initialPotholes: Pothole[];
  onMapReady: (methods: { refresh: () => void }) => void;
}

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <p className="mt-10 text-center">Loading map...</p>,
  ssr: false,
});

const ClientMap = ({ initialPotholes, onMapReady }: ClientMapProps) => {
  const [potholes, setPotholes] = useState<Pothole[]>(initialPotholes);

  const refreshMapData = useCallback(async () => {
    try {
      console.log('Refreshing map data...');
      const response = await fetch('/api/potholes');
      if (!response.ok) {
        throw new Error('Failed to fetch potholes');
      }
      const result = await response.json();
      setPotholes(result.data);
      console.log(
        'Map data refreshed. Found:',
        result.data.length,
        'potholes.'
      );
    } catch (error) {
      console.error('Failed to refresh map data:', error);
    }
  }, []);

  useEffect(() => {
    onMapReady({ refresh: refreshMapData });
  }, [onMapReady, refreshMapData]);

  return <Map potholes={potholes} />;
};

export default ClientMap;
