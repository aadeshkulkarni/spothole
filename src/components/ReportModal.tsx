'use client';

import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

type ReportModalProps = {
  onClose: () => void;
  onReportSubmitted: () => void;
};

export const ReportModal = ({ onClose, onReportSubmitted }: ReportModalProps) => {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError('Could not get location. Please enable location services.');
        console.log(err);
      }
    );
  }, []);

  const resetForm = () => {
    setDescription('');
    setImageFile(null);
    setLocation(null);
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !location) {
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
        body: JSON.stringify({ fileType: imageFile.type }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Failed to get presigned URL.');
      }

      const { url, key } = await presignedUrlResponse.json();

      const s3UploadResponse = await fetch(url, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile.type,
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
          longitude: location.lon,
          latitude: location.lat,
          imageUrl: imageUrl,
          description: description,
        }),
      });

      if (!reportResponse.ok) {
        throw new Error('Failed to submit report.');
      }

      alert('Report submitted successfully!');
      handleClose();
      onReportSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report a New Pothole</DialogTitle>
          <DialogDescription>
            Fill in the details below. An image and location are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</p>}

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Pothole Image*
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="image" name="image" type="file" className="sr-only" accept="image/*" required onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {imageFile ? <p className="text-xs text-gray-500">{imageFile.name}</p> : <p className="text-xs text-gray-500">PNG, JPG, etc.</p>}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 'Large pothole near the bus stop'"
            ></textarea>
          </div>

          {location && (
             <div className="text-xs text-gray-500 pt-2">
               <span className="font-semibold">Location Captured</span>
             </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!location || !imageFile || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
  );
};
