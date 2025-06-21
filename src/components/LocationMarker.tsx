'use client';

import { indiaBoundary } from '@/lib/india-boundary';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';
import L from 'leaflet';
import { useMemo, useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';

interface LocationMarkerProps {
  initialPosition: { lat: number; lon: number };
  onLocationChange: (lat: number, lon: number) => void;
  onLocationValidityChange: (isValid: boolean) => void;
}

export const LocationMarker = ({
  initialPosition,
  onLocationChange,
  onLocationValidityChange,
}: LocationMarkerProps) => {
  const [position, setPosition] = useState(
    L.latLng(initialPosition.lat, initialPosition.lon)
  );

  const checkLocation = (lat: number, lon: number) => {
    const point = turfPoint([lon, lat]);
    const boundary: GeoJSON.MultiPolygon = JSON.parse(
      JSON.stringify(indiaBoundary.features[0].geometry)
    );
    return booleanPointInPolygon(point, boundary);
  };

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const isInIndia = checkLocation(lat, lng);
      onLocationValidityChange(isInIndia);
      onLocationChange(lat, lng);
      setPosition(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target;
        const newPos = marker.getLatLng();
        const isInIndia = checkLocation(newPos.lat, newPos.lng);
        onLocationValidityChange(isInIndia);
        onLocationChange(newPos.lat, newPos.lng);
      },
    }),
    [onLocationChange, onLocationValidityChange]
  );

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
};
