'use client';

import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { reverseGeocode } from '@/lib/geocode';
import ExifReader from 'exifreader';
import { AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useReducer } from 'react';
import { LocationMarker } from './LocationMarker';
import ReportLoadingScreen from './ReportLoadingScreen';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

type ReportFormProps = {
  onReportSubmitted: () => void;
  onClose: () => void;
};

type State = {
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  location: { lat: number; lon: number } | null;
  tempLocation: { lat: number; lon: number } | null;
  error: string | null;
  status: 'idle' | 'locating' | 'submitting' | 'success' | 'error';
  locationSource: string | null;
  isMapVisible: boolean;
  isLocationInIndia: boolean;
  address: string | null;
  isGeocoding: boolean;
};

type Action =
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_IMAGE'; payload: { file: File; preview: string } }
  | {
      type: 'SET_LOCATION';
      payload: { lat: number; lon: number; source: string };
    }
  | { type: 'SET_TEMP_LOCATION'; payload: { lat: number; lon: number } }
  | { type: 'SET_LOCATION_VALIDITY'; payload: boolean }
  | { type: 'SET_STATUS'; payload: State['status'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_MAP'; payload: boolean }
  | { type: 'CONFIRM_MANUAL_LOCATION' }
  | { type: 'RESET' }
  | { type: 'SET_ADDRESS'; payload: string | null }
  | { type: 'SET_GEOCODING'; payload: boolean };

const initialState: State = {
  description: '',
  imageFile: null,
  imagePreview: null,
  location: null,
  tempLocation: null,
  error: null,
  status: 'idle',
  locationSource: null,
  isMapVisible: false,
  isLocationInIndia: true,
  address: null,
  isGeocoding: false,
};

function reportFormReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_IMAGE':
      return {
        ...state,
        imageFile: action.payload.file,
        imagePreview: action.payload.preview,
        error: null,
      };
    case 'SET_LOCATION':
      return {
        ...state,
        location: action.payload,
        locationSource: action.payload.source,
        error: null,
        address: null,
      };
    case 'SET_TEMP_LOCATION':
      return { ...state, tempLocation: action.payload };
    case 'SET_LOCATION_VALIDITY':
      return { ...state, isLocationInIndia: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'TOGGLE_MAP':
      return {
        ...state,
        isMapVisible: action.payload,
        tempLocation: action.payload ? state.location : null,
      };
    case 'CONFIRM_MANUAL_LOCATION':
      if (state.tempLocation) {
        return {
          ...state,
          location: state.tempLocation,
          locationSource: 'Location selected manually on map.',
          isMapVisible: false,
          error: null,
        };
      }
      return state;
    case 'RESET':
      return initialState;
    case 'SET_ADDRESS':
      return { ...state, address: action.payload, isGeocoding: false };
    case 'SET_GEOCODING':
      return { ...state, isGeocoding: action.payload };
    default:
      return state;
  }
}

export const ReportForm = ({ onReportSubmitted, onClose }: ReportFormProps) => {
  const [state, dispatch] = useReducer(reportFormReducer, initialState);
  const {
    description,
    imageFile,
    imagePreview,
    location,
    tempLocation,
    error,
    status,
    locationSource,
    isMapVisible,
    isLocationInIndia,
    address,
    isGeocoding,
  } = state;

  // Effect to get current location
  useEffect(() => {
    if (!location) {
      dispatch({ type: 'SET_STATUS', payload: 'locating' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Check again to prevent race conditions
          if (!state.location) {
            dispatch({
              type: 'SET_LOCATION',
              payload: {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                source: 'Using your current device location.',
              },
            });
            dispatch({ type: 'SET_STATUS', payload: 'idle' });
          }
        },
        (err) => {
          if (!state.location) {
            dispatch({
              type: 'SET_ERROR',
              payload:
                'Could not get location. Please enable location services or select a photo with location data.',
            });
          }
          console.log(err);
        }
      );
    }
  }, [location, state.location]);

  useEffect(() => {
    if (location) {
      const fetchAddress = async () => {
        dispatch({ type: 'SET_GEOCODING', payload: true });
        const formattedAddress = await reverseGeocode(
          location.lat,
          location.lon
        );
        dispatch({ type: 'SET_ADDRESS', payload: formattedAddress });
      };
      try {
        fetchAddress();
      } catch (ex) {
        console.log('Failed to fetch address', ex);
      }
    }
  }, [location]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      dispatch({
        type: 'SET_IMAGE',
        payload: { file, preview: URL.createObjectURL(file) },
      });

      // Never override a manually set location.
      if (locationSource?.includes('manually')) {
        return;
      }

      dispatch({
        type: 'SET_LOCATION',
        payload: {
          ...state.location!,
          source: 'Checking photo for location data...',
        },
      });
      try {
        const tags = await ExifReader.load(file);
        const lat = tags.GPSLatitude?.description;
        const lon = tags.GPSLongitude?.description;

        if (typeof lat === 'number' && typeof lon === 'number') {
          dispatch({
            type: 'SET_LOCATION',
            payload: { lat, lon, source: 'Location extracted from photo.' },
          });
        } else {
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              ...state.location!,
              source: 'Photo has no location data. Using device location.',
            },
          });
        }
      } catch (err) {
        dispatch({
          type: 'SET_LOCATION',
          payload: {
            ...state.location!,
            source: 'Could not read photo data. Using device location.',
          },
        });
        console.warn('Could not read EXIF data from image.', err);
      }
    }
  };

  const isFormValid = () => {
    return imageFile && location && status !== 'submitting';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Image and location are required.',
      });
      return;
    }
    dispatch({ type: 'SET_STATUS', payload: 'submitting' });

    try {
      const presignedUrlResponse = await fetch('/api/s3-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileType: imageFile!.type }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Failed to get presigned URL.');
      }

      const { url, key } = await presignedUrlResponse.json();

      const s3UploadResponse = await fetch(url, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile!.type,
        },
      });

      if (!s3UploadResponse.ok) {
        throw new Error('Failed to upload image to S3.');
      }

      const imageUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${key}`;

      const reportResponse = await fetch('/api/potholes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longitude: location!.lon,
          latitude: location!.lat,
          imageUrl: imageUrl,
          description: description,
        }),
      });

      if (!reportResponse.ok) {
        throw new Error('Failed to submit report.');
      }

      dispatch({ type: 'SET_STATUS', payload: 'success' });
      onReportSubmitted();
      dispatch({ type: 'RESET' });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.log(err);
    }
  };

  const handleCancel = () => {
    dispatch({ type: 'RESET' });
    onClose();
  };

  return (
    <DialogContent className="max-h-[100dvh] grid-rows-[auto,1fr,auto] overflow-y-auto sm:max-w-[480px]">
      <AnimatePresence>
        {status === 'submitting' && <ReportLoadingScreen />}
      </AnimatePresence>
      <DialogHeader className="text-left">
        <DialogTitle>Report a New Pothole</DialogTitle>
        <DialogDescription>
          Your report helps improve our city's roads. Please provide an image
          and location.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 overflow-y-auto">
        <div className="space-y-2">
          <label htmlFor="image-upload" className="text-sm font-medium">
            Pothole Image
          </label>
          <div
            className={`h-48 w-full text-xs ${imagePreview ? 'border-0' : 'border border-dashed'} relative flex items-center justify-center text-gray-500`}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Pothole preview"
                layout="fill"
                objectFit="cover"
                className="w-full"
              />
            ) : (
              'Click or drag to upload'
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pothole Location</label>
          <div className="border border-gray-200 p-4">
            {locationSource && (
              <p className="text-xs text-gray-500">{locationSource}</p>
            )}

            {isGeocoding && (
              <p className="mt-2 text-xs text-gray-500">Fetching address...</p>
            )}
            {address && (
              <div className="mt-2 text-xs wrap-break-word text-gray-800">
                {address}
              </div>
            )}
            {location && (
              <p className="py-1 text-xs">
                Lat: {location?.lat?.toFixed(5)}, Lon:{' '}
                {location?.lon?.toFixed(5)}
              </p>
            )}

            <Button
              variant="default"
              className="mt-2 text-xs"
              onClick={() =>
                dispatch({ type: 'TOGGLE_MAP', payload: !isMapVisible })
              }
            >
              {isMapVisible ? 'Close Map' : 'Adjust Location Manually'}
            </Button>
          </div>
        </div>

        {isMapVisible && location && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg">
            <MapContainer
              center={[location.lat, location.lon]}
              zoom={16}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                initialPosition={location}
                onLocationChange={(lat, lon) =>
                  dispatch({ type: 'SET_TEMP_LOCATION', payload: { lat, lon } })
                }
                onLocationValidityChange={(isValid) =>
                  dispatch({ type: 'SET_LOCATION_VALIDITY', payload: isValid })
                }
              />
            </MapContainer>
            <div className="absolute bottom-2 left-1/2 z-[1000] flex -translate-x-1/2 flex-col items-center gap-2">
              {!isLocationInIndia && (
                <p className="rounded-md bg-red-100 p-2 text-xs text-red-700">
                  Please select a location within India.
                </p>
              )}
              <Button
                size="sm"
                onClick={() => dispatch({ type: 'CONFIRM_MANUAL_LOCATION' })}
                disabled={!isLocationInIndia}
              >
                Confirm Manual Location
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) =>
              dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
            }
            className="h-24 w-full border p-2 text-xs"
            placeholder="Enter a description of the pothole. e.g., 'Deep pothole near the bus stop'"
          />
        </div>
      </div>
      {error && <p className="mr-auto text-sm text-red-500">{error}</p>}

      <DialogFooter>
        <Button type="button" onClick={handleCancel} variant={'outline'}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={!isFormValid()}>
          {status === 'submitting' ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
