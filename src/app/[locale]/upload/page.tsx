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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('UploadPage');

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];

    if (!file) {
      return;
    }

    // 1. Validate file type
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      setError(t('errorInvalidType'));
      return;
    }

    setUploading(true);

    try {
      // 2. Validate geotag
      const tags = await ExifReader.load(file);
      const lat = tags.GPSLatitude;
      const lon = tags.GPSLongitude;

      if (!lat || !lon) {
        setError(t('errorNoGeotag'));
        setUploading(false);
        return;
      }

      // 3. Get pre-signed URL
      const presignedUrlResponse = await fetch('/api/s3-upload', {
        method: 'POST',
      });

      if (!presignedUrlResponse.ok) {
        throw new Error(t('errorPresignedUrl'));
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
        throw new Error(t('errorS3Upload'));
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
        throw new Error(t('errorDbSave'));
      }

      router.push('/?upload=success');
    } catch (e: any) {
      setError(e.message || t('errorUnknown'));
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
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <div className="mt-4 border-l-4 border-sky-200 bg-blue-50 p-4 text-sky-800">
                  <p>
                    <strong>{t('geotagInfo')}</strong>
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
                    <p>{t('uploading')}</p>
                  ) : (
                    <>
                      <UploadCloud className="h-20 w-20 text-gray-400" />
                      <p className="text-gray-500">{t('dropzone')}</p>
                      <p className="text-xs text-gray-400">
                        {t('acceptedFiles')}
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
                <AccordionTrigger>{t('faqTitle1')}</AccordionTrigger>
                <AccordionContent>{t('faqContent1')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>{t('faqTitle2')}</AccordionTrigger>
                <AccordionContent>{t('faqContent2')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>{t('faqTitle3')}</AccordionTrigger>
                <AccordionContent>
                  {t('faqContent3')}
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
