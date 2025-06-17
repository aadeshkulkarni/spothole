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
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        className="max-w-2xl mx-auto p-8 bg-white  shadow-2xl text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          Welcome to SpotHole!
        </h1>
        <p className="mt-4 text-lg text-gray-600 italic">
          "The roads you know, deserve a glow!"
        </p>
        <div className="mt-6 text-left space-y-4 text-gray-700">
            <p>
                This isn't just an app; it's a citizen-led movement to transform India's roads. We believe that every citizen has the power to make a difference.
            </p>
            <p>
                SpotHole was created by citizens, for citizens. By simply snapping a photo of a pothole, you provide crucial data. You can also comment on and upvote existing reports to highlight the most urgent issues, creating a transparent and community-driven record of road conditions.
            </p>
            <p>
                Your contribution is vital. Every report, comment, and upvote helps build a safer, smoother, and better India for everyone.
            </p>
            <p className='text-right m-0 font-bold'>Jai Hind!</p>
            <p className='text-right m-0 italic'>A4h</p>
        </div>
        <Button size="lg" className="mt-8 px-8 py-3 text-lg font-semibold" onClick={onEnter}>
          Let's get started
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AppIntro;
