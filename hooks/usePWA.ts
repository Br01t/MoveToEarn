
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Robust Standalone Check
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(/CriOS/i.test(userAgent));
    setIsIOS(isIosDevice);

    // 3. Listen for Install Prompt (Android/PC)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Check if user previously dismissed it in this session or recently
      const dismissedAt = localStorage.getItem('zr_pwa_dismissed_at');
      const now = Date.now();
      
      // If dismissed less than 7 days ago, don't show the custom prompt automatically
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

  return { deferredPrompt, isIOS, isStandalone, installPWA, dismissPrompt };
};