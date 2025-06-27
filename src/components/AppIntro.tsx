'use client';

import { motion } from 'framer-motion';
import { Camera, MapPin, UploadCloud, X } from 'lucide-react';
import { Button } from './ui/button';

interface AppIntroProps {
  onClose: () => void;
}

const AppIntro = ({ onClose }: AppIntroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl rounded-lg bg-white p-4 text-center shadow-xl sm:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h1 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl">
          Welcome to Spothole!
        </h1>
        <p className="mb-8 text-base text-gray-600 sm:text-lg">
          A community-driven platform to report potholes and improve road safety
          for everyone.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-6 text-left sm:gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600 sm:h-16 sm:w-16">
              <MapPin size={28} />
            </div>
            <h3 className="mb-2 text-base font-semibold sm:text-lg">
              1. Spot a Pothole
            </h3>
            <p className="text-sm text-gray-500 sm:text-base">
              Find a pothole that needs fixing.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600 sm:h-16 sm:w-16">
              <Camera size={28} />
            </div>
            <h3 className="mb-2 text-base font-semibold sm:text-lg">
              2. Snap a Photo
            </h3>
            <p className="text-sm text-gray-500 sm:text-base">
              Take a clear, geotagged picture.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600 sm:h-16 sm:w-16">
              <UploadCloud size={28} />
            </div>
            <h3 className="mb-2 text-base font-semibold sm:text-lg">
              3. Upload to Map
            </h3>
            <p className="text-sm text-gray-500 sm:text-base">
              Help us put it on the map for all to see.
            </p>
          </div>
        </div>

        <p className="mb-6 text-lg font-semibold text-gray-700 sm:text-xl">
          Together, we can make our roads safer.
        </p>

        <Button onClick={onClose} size="lg" className="rounded-full">
          Let's Go!
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AppIntro;
