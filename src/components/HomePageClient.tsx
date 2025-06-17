'use client';

import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppIntro from './AppIntro';
import ClientMap from './ClientMap';
import Header from './Header';
import type { Pothole } from './Map';
import SplashScreen from './SplashScreen';

interface HomePageClientProps {
  initialPotholes: Pothole[];
}

// This interface defines the shape of the object that ClientMap will expose.
interface MapHandles {
  refresh: () => void;
}

const HomePageClient = ({ initialPotholes }: HomePageClientProps) => {
  const mapRef = useRef<MapHandles | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      if (!hasSeenIntro) {
        setShowIntro(true);
      }
    }, 5000); // Show splash for 5 seconds

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (searchParams.get('openReportDialog') === 'true') {
      setIsModalOpen(true);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [searchParams]);

  const handleIntroDismiss = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  const handleReportSubmitted = useCallback(() => {
    console.log('Report submitted, refreshing map...');
    mapRef.current?.refresh();
  }, []);

  // This function is passed to ClientMap, which will call it with its public methods.
  const handleMapReady = useCallback((methods: MapHandles) => {
    mapRef.current = methods;
  }, []);

  return (
    <main className="relative h-screen w-screen">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
        {showIntro && <AppIntro onEnter={handleIntroDismiss} />}
      </AnimatePresence>

      <Header
        onReportSubmitted={handleReportSubmitted}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <ClientMap
        initialPotholes={initialPotholes}
        onMapReady={handleMapReady}
      />
    </main>
  );
};

export default HomePageClient;
