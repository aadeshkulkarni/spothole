'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface AppIntroProps {
  onEnter: () => void;
}

const AppIntro = ({ onEnter }: AppIntroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 top-0 left-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-md md:p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        className="mx-auto h-screen max-h-screen max-w-full bg-white p-4 text-center shadow-2xl md:h-auto md:max-w-2xl md:p-8"
      >
        <h1 className="p-4 text-4xl leading-10 font-light tracking-tight text-gray-800 md:p-0 md:text-4xl">
          <span className="font-bold text-sky-600">Spothole</span>!
        </h1>
        <p className="mt-4 font-light text-gray-600 italic md:text-lg">
          "The roads you know, deserve a glow!"
        </p>
        <div className="mt-6 space-y-4 text-left font-light text-gray-700">
          <p className="wrap-break-word">
            Spothole is a citizen-led movement to transform India's roads. We
            believe that every citizen has the power to make a difference.
          </p>
          <p>
            By simply snapping a photo of a pothole, you provide crucial data.
            You can also comment on and upvote existing reports to highlight the
            most urgent issues, creating a transparent and community-driven
            record of road conditions.
          </p>
          <p>
            Your contribution is vital. Every report, comment, and upvote helps
            build a safer, smoother, and better India for everyone.
          </p>
        </div>
        <Button
          size="lg"
          className="mt-8 w-full px-8 py-6 text-lg font-bold tracking-widest text-gray-100 uppercase md:w-auto"
          onClick={onEnter}
        >
          Enter
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AppIntro;
