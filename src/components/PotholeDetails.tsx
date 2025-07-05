'use client';

import { Pothole } from '@/types/pothole';
import { X } from 'lucide-react';

interface PotholeDetailsProps {
  pothole: Pothole;
  onClose: () => void;
}

const PotholeDetails = ({ pothole, onClose }: PotholeDetailsProps) => {
  const date = new Date(pothole.createdAt);
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

  return (
    <div className="fixed top-1/2 left-1/2 z-[1100] w-[90vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/90 p-4 text-gray-800 shadow-2xl backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <h3 className="mb-4 text-xl font-bold">Location Details</h3>

      <a href={pothole.imageUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={pothole.imageUrl}
          alt="Pothole"
          className="mb-2 h-48 w-full rounded-md object-cover"
        />
        <p className="mb-4 text-center text-sm text-gray-600">
          Click to view full image
        </p>
      </a>

      <div className="flex flex-col gap-4">
        <a
          href={`https://www.google.com/maps?q=${pothole.latitude},${pothole.longitude}&z=19`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          Lat: {pothole.latitude.toFixed(5)}, Lng:{' '}
          {pothole.longitude.toFixed(5)}
        </a>
        <p>
          <strong>Added:</strong> {formattedDate}
        </p>
      </div>
    </div>
  );
};

export default PotholeDetails;
