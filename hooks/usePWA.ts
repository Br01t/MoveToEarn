import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(/CriOS/i.test(userAgent));
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsMobile(isMobileDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      const dismissedAt = localStorage.getItem('zr_pwa_dismissed_at');
      const now = Date.now();
      
      if (dismissedAt && (now - parseInt(dismissedAt)) < 7 * 24 * 60 * 60 * 1000) {
        return;
      }

      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        localStorage.removeItem('zr_pwa_dismissed_at');
      } else {
        // If rejected, save timestamp to not ask again for a while
        localStorage.setItem('zr_pwa_dismissed_at', Date.now().toString());
      }
    }
  };

  const dismissPrompt = () => {
    setDeferredPrompt(null);
    localStorage.setItem('zr_pwa_dismissed_at', Date.now().toString());
  };

  return { deferredPrompt, isIOS, isMobile, isStandalone, installPWA, dismissPrompt };
};