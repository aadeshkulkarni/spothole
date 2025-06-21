'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const wittyQuotes = [
  'Click a crack, bring the road back!',
  'A snap, a tap, we bridge the gap!',
  "From hole to whole, we're on a roll!",
  'One photo near, makes your street clear!',
  'See a bump? Give it a jump!',
  'Gaddha spotted, action plotted!',
  'Snap the dent, make a government event!',
  'Capture that pit, let the netizens hit!',
  'Spill the crack, get our roads back!',
  'Where roads dip, we file the tip!',
  "Snap the mess, we'll do the rest!",
  'Your report today, smoothes the way!',
  "A street that's rough? One click's enough!",
  'Catch the glitch, fix the ditch!',
  'The crack you see, starts change for free!',
  "Spotted a dip? We'll tighten the grip!",
  'From snaps to maps, we close the gaps!',
  "Upload the bump, we'll fix the slump!",
  'It starts with you, and potholes too!',
  'The roads you know, deserve a glow!',
];

const ReportLoadingScreen = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(wittyQuotes[Math.floor(Math.random() * wittyQuotes.length)]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center bg-white p-8 text-center backdrop-blur-sm"
    >
      <div className="mb-8 h-16 w-16 animate-spin rounded-full border-4 border-dashed border-sky-500"></div>
      <AnimatePresence mode="wait">
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-gray-700"
        >
          "{quote}"
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportLoadingScreen;
