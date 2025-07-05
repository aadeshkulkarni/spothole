'use client';

import { motion } from 'framer-motion';
import { Camera, MapPin, UploadCloud, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';

interface AppIntroProps {
  onClose: () => void;
}

const AppIntro = ({ onClose }: AppIntroProps) => {
  const t = useTranslations('AppIntro');

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
        className="relative w-full max-w-2xl rounded-lg bg-white p-4 text-center shadow-xl sm:p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-4xl">
          {t('welcomeTitle')}
        </h1>
        <p className="mb-6 text-base text-gray-600">{t('welcomeSubtitle')}</p>

        <div className="mb-6 grid grid-cols-1 gap-4 text-left sm:mb-8 sm:gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <MapPin size={24} />
            </div>
            <h3 className="mb-1 text-base font-semibold sm:text-lg">
              {t('step1Title')}
            </h3>
            <p className="text-sm text-gray-500 sm:text-base">
              {t('step1Subtitle')}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Camera size={24} />
            </div>
            <h3 className="mb-1 text-base font-semibold sm:text-lg">
              {t('step2Title')}
            </h3>
            <p className="text-sm text-gray-500 sm:text-base">
              {t('step2Subtitle')}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <UploadCloud size={24} />
            </div>
            <h3 className="mb-1 text-base font-semibold sm:text-lg">
              {t('step3Title')}
            </h3>
            <p className="text-sm text-gray-500 sm:text-base">
              {t('step3Subtitle')}
            </p>
          </div>
        </div>

        <p className="mb-6 text-lg font-semibold text-gray-700 sm:text-xl">
          {t('motto')}
        </p>

        <Button onClick={onClose} size="lg" className="rounded-full">
          {t('buttonText')}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AppIntro;
