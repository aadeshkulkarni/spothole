'use client';

import { Pothole } from '@/types/pothole';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet/dist/leaflet.css';
import { Info, Minus, PlusIcon, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap
} from 'react-leaflet';

const redIcon = new L.Icon({
  iconUrl:
    'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getSeverityStyle = (
  severity: 'Minor' | 'Major' | 'Severe' | 'Critical'
) => {
  switch (severity) {
    case 'Minor':
      return { color: '#ef4444' };
    case 'Major':
      return { color: '#dc2626' };
    case 'Severe':
      return { color: '#b91c1c' };
    case 'Critical':
      return { color: '#991b1b' };
    default:
      return { color: 'gray' };
  }
};

const Legend = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const severities: ('Minor' | 'Major' | 'Severe' | 'Critical')[] = [
    'Minor',
    'Major',
    'Severe',
    'Critical',
  ];

  return (
    <div className="legend flex flex-col items-center justify-center rounded bg-white/80 px-0.5 py-2 shadow-lg">
      <div className="flex items-center justify-between">
        {isExpanded && <h4 className="font-bold">Pothole Severity</h4>}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto flex h-10 w-10 items-center justify-center"
        >
          <Info size={24} />
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {severities.map((severity) => (
          <div key={severity} className="flex items-center">
            <i
              className="h-6 w-6 shrink-0"
              style={{
                backgroundColor: getSeverityStyle(severity).color,
                marginRight: isExpanded ? '0.75rem' : '0',
                opacity: 0.8,
              }}
            />
            {isExpanded && <span>{severity}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomControls = ({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();
  const resetView = () => map.setView(center, zoom);
  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();

  return (
    <div className="absolute right-4 bottom-4 z-[1000] flex flex-col items-end">
      <Legend />
      <div className="mt-2 flex flex-col gap-4 border-0">
        <a
          onClick={zoomIn}
          title="Zoom in"
          role="button"
          className="leaflet-control-zoom-in flex h-11 w-11 items-center justify-center rounded-md bg-white/80 shadow"
        >
          <PlusIcon size={20} className="text-black" />
        </a>
        <a
          onClick={zoomOut}
          title="Zoom out"
          role="button"
          className="leaflet-control-zoom-out flex h-11 w-11 items-center justify-center rounded-md bg-white/80 shadow"
        >
          <Minus size={20} className="text-black" />
        </a>
        <a
          onClick={resetView}
          title="Reset view"
          role="button"
          className="flex h-11 w-11 items-center justify-center rounded-md bg-white/80 shadow"
        >
          <RefreshCw size={20} className="text-black" />
        </a>
      </div>
    </div>
  );
};

const Markers = ({
  potholes,
  onMarkerClick,
}: {
  potholes: Pothole[];
  onMarkerClick: (pothole: Pothole) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    // This will help us debug if potholes are being passed correctly
    console.log('Potholes received by Markers component:', potholes);

    const markerClusterGroup = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let size = 40;
        let className = 'marker-cluster-';
        if (count < 10) className += 'small';
        else if (count < 100) {
          className += 'medium';
          size = 50;
        } else {
          className += 'large';
          size = 60;
        }
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: new L.Point(size, size),
        });
      },
    });

    potholes
      .filter(
        (pothole) =>
          pothole &&
          typeof pothole.latitude === 'number' &&
          typeof pothole.longitude === 'number',
      )
      .forEach((pothole) => {
        const marker = L.marker([pothole.latitude, pothole.longitude], {
          icon: redIcon,
        }).on('click', () => {
          onMarkerClick(pothole);
          const targetLatLng = L.latLng(pothole.latitude, pothole.longitude);
          map.flyTo(targetLatLng, map.getZoom());
        });
        markerClusterGroup.addLayer(marker);
      });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [potholes, map, onMarkerClick]);

  return null;
};

export interface MapHandles {
  panTo: (position: LatLngExpression) => void;
  refresh: () => void;
}

interface MapProps {
  potholes: Pothole[];
  onMapReady: (methods: MapHandles) => void;
  onMarkerClick: (pothole: Pothole) => void;
  initialCenter: LatLngExpression;
  locale: string;
}

export const Map = ({
  potholes,
  onMapReady,
  onMarkerClick,
  initialCenter,
  locale,
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const initialZoom = 14;
  const indiaBounds = L.latLngBounds(
    L.latLng(6, 68), // Southwest
    L.latLng(37, 98), // Northeast
  );

  useEffect(() => {
    if (mapRef.current) {
      onMapReady({
        panTo: (position) => {
          mapRef.current?.panTo(position, { animate: true, duration: 1 });
        },
        refresh: () => {
          // Placeholder for manual refresh
        },
      });
    }
  }, [onMapReady, mapRef]);

  const tileUrl =
    'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png?lang=' + locale;
  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';

  return (
    <MapContainer
      ref={mapRef}
      center={initialCenter}
      zoom={initialZoom}
      zoomControl={false}
      style={{ height: '100vh', width: '100%' }}
      minZoom={5}
      maxBounds={indiaBounds}
      maxBoundsViscosity={1.0}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      <Markers potholes={potholes} onMarkerClick={onMarkerClick} />
      <CustomControls center={initialCenter} zoom={initialZoom} />
    </MapContainer>
  );
};
