'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import UploadDisclaimer from '@/components/UploadDisclaimer';
import ExifReader from 'exifreader';
import { UploadCloud } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disclaimerAgreed = searchParams.get('disclaimer') === 'agreed';
  const [showDisclaimer, setShowDisclaimer] = useState(!disclaimerAgreed);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];

    if (!file) {
      return;
    }

    // 1. Validate file type
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG or JPG image.');
      return;
    }

    setUploading(true);

    try {
      // 2. Validate geotag
      const tags = await ExifReader.load(file);
      const lat = tags.GPSLatitude;
      const lon = tags.GPSLongitude;

      if (!lat || !lon) {
        setError(
          'Image is not geotagged. Please enable geotagging in your camera settings.'
        );
        setUploading(false);
        return;
      }

      // 3. Get pre-signed URL
      const presignedUrlResponse = await fetch('/api/s3-upload', {
        method: 'POST',
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Failed to get pre-signed URL.');
      }

      const { url, fields, publicUrl } = await presignedUrlResponse.json();

      // 4. Upload to S3
      const formData = new FormData();
      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3');
      }

      // 5. Save to database
      const dbResponse = await fetch('/api/potholes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: publicUrl,
          latitude: lat.description,
          longitude: lon.description,
          description: 'A new pothole report.',
          severity: 'Minor', // Default severity
        }),
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to save pothole data.');
      }

      router.push('/?upload=success');
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setUploading(false);
    }

    setShowDisclaimer(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'image/jpeg': [], 'image/jpg': [] },
  });

  const handleDisclaimerAgree = () => {
    setShowDisclaimer(false);
  };

  return (
    <>
      <UploadDisclaimer
        open={showDisclaimer}
        onOpenChange={setShowDisclaimer}
        onAgree={handleDisclaimerAgree}
      />

      {!showDisclaimer && (
        <div className="container mx-auto flex min-h-screen flex-col p-4">
          <div className="flex flex-grow items-center justify-center">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Upload your image</h1>
                <div className="mt-4 border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-700">
                  <p>
                    Images you upload needs to be <strong>GEOTAGGED</strong>.
                    This will help us appropriately place your entry on the map.
                    If you need help with this, kindly look at the FAQ below.
                  </p>
                </div>
              </div>

              <div {...getRootProps()} className="mb-8 flex justify-center">
                <input {...getInputProps()} />
                <div
                  className={`flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center ${
                    isDragActive ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {uploading ? (
                    <p>Uploading...</p>
                  ) : (
                    <>
                      <UploadCloud className="h-20 w-20 text-gray-400" />
                      <p className="text-gray-500">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        Accepted: jpeg, jpg
                      </p>
                    </>
                  )}
                </div>
              </div>
              {error && <p className="text-center text-red-500">{error}</p>}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[500px] flex-shrink-0 pb-8">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  How do I enable Geotagging on my iPhone?
                </AccordionTrigger>
                <AccordionContent>
                  To enable geotagging on an iPhone, go to Settings &gt; Privacy
                  &gt; Location Services. Make sure Location Services is on.
                  Then, scroll down to Camera, tap on it, and select "While
                  Using the App".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  How do I enable Geotagging on my Android phone?
                </AccordionTrigger>
                <AccordionContent>
                  To enable geotagging on an Android phone, open the Camera app
                  settings. Look for an option called "Location tags,"
                  "Geotags," or similar, and make sure it's enabled. The exact
                  steps may vary slightly depending on your phone's
                  manufacturer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Who runs this platform?</AccordionTrigger>
                <AccordionContent>
                  This is a community-driven platform built to improve road
                  safety for everyone. It is developed and maintained by Aadesh
                  Kulkarni. You can reach out to him on{' '}
                  <a
                    href="https://www.linkedin.com/in/aadeshkulkarni"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                  .
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </>
  );
};

const UploadPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <UploadPageClient />
  </Suspense>
);

export default UploadPage;
