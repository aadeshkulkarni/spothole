'use client';

import { Pothole } from '@/types/pothole';
import { AnimatePresence } from 'framer-motion';
import { LatLngExpression } from 'leaflet';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AppIntro from './AppIntro';
import ClientMap from './ClientMap';
import Header from './Header';
import PotholeDetails from './PotholeDetails';
import UploadDisclaimer from './UploadDisclaimer';
import { Button } from './ui/button';

interface HomePageClientProps {
  initialPotholes: Pothole[];
}

// This interface defines the shape of the object that ClientMap will expose.
interface MapHandles {
  refresh: () => void;
}

const HomePageClient = ({ initialPotholes }: HomePageClientProps) => {
  const mapRef = useRef<MapHandles | null>(null);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [initialCenter, setInitialCenter] = useState<LatLngExpression>([
    19.2076, 72.9645,
  ]); // Default to Thane
  const [showIntro, setShowIntro] = useState(false);
  const [showUploadDisclaimer, setShowUploadDisclaimer] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('HomePage');

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
      localStorage.setItem('hasSeenIntro', 'true');
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('upload') === 'success') {
      toast.success('Pothole reported successfully!');
    }
  }, [searchParams]);

  /*
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://reallyfreegeoip.org/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setInitialCenter([data.latitude, data.longitude]);
        }
      } catch (error) {
        console.error('Failed to fetch IP-based location:', error);
        // Keep the default location
      }
    };

    fetchLocation();
  }, []);
  */

  const handleReportSubmitted = useCallback(() => {
    console.log('Report submitted, refreshing map...');
    mapRef.current?.refresh();
  }, []);

  // This function is passed to ClientMap, which will call it with its public methods.
  const handleMapReady = useCallback((methods: MapHandles) => {
    mapRef.current = methods;
  }, []);

  const handleMarkerClick = (pothole: Pothole) => {
    setSelectedPothole(pothole);
  };

  const handleClosePopup = () => {
    setSelectedPothole(null);
  };

  const handleLogoClick = () => {
    setShowIntro(true);
  };

  const handleReportClick = () => {
    setShowUploadDisclaimer(true);
  };

  const handleDisclaimerAgree = () => {
    setShowUploadDisclaimer(false);
    router.push('/upload?disclaimer=agreed');
  };

  return (
    <main className="relative h-[100dvh] w-screen">
      <AnimatePresence>
        {showIntro && <AppIntro onClose={() => setShowIntro(false)} />}
      </AnimatePresence>
      <Header onLogoClick={handleLogoClick} />
      <ClientMap
        initialPotholes={initialPotholes}
        onMapReady={handleMapReady}
        onMarkerClick={handleMarkerClick}
        initialCenter={initialCenter}
      />
      {selectedPothole && (
        <PotholeDetails pothole={selectedPothole} onClose={handleClosePopup} />
      )}
      <UploadDisclaimer
        open={showUploadDisclaimer}
        onOpenChange={setShowUploadDisclaimer}
        onAgree={handleDisclaimerAgree}
      />
      <div className="fixed bottom-12 left-1/2 z-[1000] -translate-x-1/2">
        <Button
          size="lg"
          className="relative z-10 w-full cursor-pointer rounded-full border-4 border-gray-900 py-6 shadow-lg transition-transform duration-150 ease-in-out active:scale-95 md:py-4"
          onClick={handleReportClick}
        >
          <PlusIcon className="h-4 w-4 stroke-white stroke-2" />
          {t('reportButton')}
        </Button>
      </div>
    </main>
  );
};

export default HomePageClient;
