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
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-md md:p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        className="h-screen md:h-auto max-w-full md:max-w-2xl mx-auto p-8 bg-white  shadow-2xl text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          Welcome to <span className='text-sky-600'>SpotHole</span>!
        </h1>
        <p className="mt-4 md:text-lg text-gray-500 italic">
          "The roads you know, deserve a glow!"
        </p>
        <div className="mt-6 text-left space-y-4 text-gray-700">
            <p>
            SpotHole is a citizen-led movement to transform India's roads. We believe that every citizen has the power to make a difference.
            </p>
            <p>
                By simply snapping a photo of a pothole, you provide crucial data. You can also comment on and upvote existing reports to highlight the most urgent issues, creating a transparent and community-driven record of road conditions.
            </p>
            <p>
                Your contribution is vital. Every report, comment, and upvote helps build a safer, smoother, and better India for everyone.
            </p>

        </div>
        <Button size="lg" className="mt-8 px-8 py-6 text-lg w-full md:w-auto" onClick={onEnter}>
          Let's get started
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AppIntro;
