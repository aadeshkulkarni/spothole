'use client';

import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { indiaBoundary } from '@/lib/india-boundary';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';
import ExifReader from 'exifreader';
import { AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
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
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

type ReportFormProps = {
  onReportSubmitted: () => void;
  onClose: () => void;
};

export const ReportForm = ({ onReportSubmitted, onClose }: ReportFormProps) => {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSource, setLocationSource] = useState<string | null>(null);
  const [isMapVisible, setMapVisible] = useState(false);
  const [isLocationInIndia, setIsLocationInIndia] = useState(true);
  const [tempLocation, setTempLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const { data: session } = useSession();

  const resetForm = () => {
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setLocation(null);
    setError(null);
    setLocationSource(null);
    setMapVisible(false);
  };

  useEffect(() => {
    if (isMapVisible && location) {
      setTempLocation(location);
    } else {
      setTempLocation(null);
    }
  }, [isMapVisible, location]);

  // Effect to get current location
  useEffect(() => {
    // Only run if no location has been set yet from any source
    if (!location && !isMapVisible) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Check again to prevent race conditions
          if (!location) {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
            setLocationSource('Using your current device location.');
            setError(null);
          }
        },
        (err) => {
          // Only set error if no location is set at all
          if (!location) {
            setError(
              'Could not get location. Please enable location services or select a photo with location data.'
            );
          }
          console.log(err);
        }
      );
    }
  }, [location, isMapVisible]);

  const checkLocation = (lat: number, lon: number) => {
    const point = turfPoint([lon, lat]);
    // Deep copy to remove readonly properties for turf.js
    const boundary: GeoJSON.MultiPolygon = JSON.parse(
      JSON.stringify(indiaBoundary.features[0].geometry)
    );
    return booleanPointInPolygon(point, boundary);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Never override a manually set location.
      if (locationSource?.includes('manually')) {
        return;
      }

      setLocationSource('Checking photo for location data...');
      try {
        const tags = await ExifReader.load(file);
        const lat = tags.GPSLatitude?.description;
        const lon = tags.GPSLongitude?.description;

        if (typeof lat === 'number' && typeof lon === 'number') {
          setLocation({ lat, lon });
          setLocationSource('Location extracted from photo.');
        } else {
          setLocationSource('Photo has no location data. Using device location.');
        }
      } catch (err) {
        setLocationSource('Could not read photo data. Using device location.');
        console.warn('Could not read EXIF data from image.', err);
      }
    }
  };

  const handleManualLocationSelect = () => {
    if (tempLocation) {
      setLocation(tempLocation);
      setLocationSource('Location selected manually on map.');
      setMapVisible(false);
      setError(null);
    }
  };

  function LocationMarker() {
    const [position, setPosition] = useState<L.LatLng | null>(
      tempLocation ? L.latLng(tempLocation.lat, tempLocation.lon) : null
    );
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const isInIndia = checkLocation(lat, lng);
        setIsLocationInIndia(isInIndia);
        setTempLocation({ lat, lon: lng });
        setPosition(e.latlng);
      },
    });

    const eventHandlers = useMemo(
      () => ({
        dragend(e: L.DragEndEvent) {
          const marker = e.target;
          const newPos = marker.getLatLng();
          const isInIndia = checkLocation(newPos.lat, newPos.lng);
          setIsLocationInIndia(isInIndia);
          setTempLocation({ lat: newPos.lat, lon: newPos.lng });
        },
      }),
      []
    );

    return position === null ? null : (
      <Marker
        position={position}
        draggable={true}
        eventHandlers={eventHandlers}
      ></Marker>
    );
  }

  const isFormValid = () => {
    return imageFile && location && !isSubmitting;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError('Image and location are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

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
      onClose(); // Close the dialog on success
      onReportSubmitted();
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred.'
      );
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[520px]">
      <form
        onSubmit={(e) => {
          if (!isMapVisible) {
            handleSubmit(e);
          } else {
            e.preventDefault();
          }
        }}
        className="relative"
      >
        <AnimatePresence>
          {isSubmitting && <ReportLoadingScreen />}
        </AnimatePresence>
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            {isMapVisible
              ? 'Pin the Pothole Location'
              : 'Report a New Pothole'}
          </DialogTitle>
          <DialogDescription>
            {isMapVisible
              ? 'Click on the map to place a marker, or drag it to the exact spot.'
              : 'Fill in the details below. An image and location are required.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-0 md:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {isMapVisible ? (
            <div className="h-[400px] rounded-noneoverflow-hidden relative z-0">
              <MapContainer
                center={
                  tempLocation
                    ? [tempLocation.lat, tempLocation.lon]
                    : [20.5937, 78.9629]
                }
                zoom={tempLocation ? 16 : 5}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
              </MapContainer>
              {!isLocationInIndia && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Please select a location within India.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  {error}
                </p>
              )}
              {/* Form Fields Start */}
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pothole Image*
                </label>
                {imagePreview ? (
                  <div className="mt-2 text-center">
                    <div className="relative w-full h-48 rounded-none overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Pothole preview"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer text-sm text-blue-600 hover:text-blue-500 font-medium focus-within:outline-none mt-2 inline-block"
                    >
                      <span>Change file ({imageFile?.name})</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-2 flex justify-center rounded-none border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-300"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            className="sr-only "
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location*
                </label>
                <div className="mt-1 p-3 bg-gray-50 border">
                  <p className="text-sm text-gray-800">
                    {location
                      ? `${location.lat.toFixed(5)}, ${location.lon.toFixed(
                          5
                        )}`
                      : 'Getting location...'}
                  </p>
                  {locationSource && (
                    <p className="text-xs text-gray-500 mt-1">
                      {locationSource}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto mt-2 text-sm"
                    onClick={() => setMapVisible(true)}
                  >
                    {location ? 'Adjust' : 'Select'} Location on Map
                  </Button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="rounded-none shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="e.g., 'Large pothole near the bus stop'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              {/* Form Fields End */}
            </div>
          )}
        </div>

        <DialogFooter className="md:p-6 pt-4 bg-gray-50 border-t">
          {isMapVisible ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMapVisible(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleManualLocationSelect}
                disabled={!tempLocation || !isLocationInIndia}
              >
                Confirm Location
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid()}
                className="flex-grow"
              >
                Submit Report
              </Button>
            </>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
