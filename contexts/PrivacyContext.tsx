
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ConsentState {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface PrivacyContextType {
  consent: ConsentState | null; // null means not answered yet
  saveConsent: (preferences: ConsentState) => void;
  resetConsent: () => void;
  isBannerOpen: boolean;
  openBanner: () => void;
  closeBanner: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = 'zonerun_consent_v1';

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse consent", e);
        setIsBannerOpen(true);
      }
    } else {
      // No consent found, open banner
      setIsBannerOpen(true);
    }
  }, []);

  const saveConsent = (preferences: ConsentState) => {
    const finalPreferences = { ...preferences, necessary: true }; // Force necessary
    setConsent(finalPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPreferences));
    setIsBannerOpen(false);

    // Here you would typically trigger GTM or GA initialization based on flags
    if (finalPreferences.analytics) {
      console.log("✅ Analytics Allowed - Initializing trackers...");
      // initializeAnalytics();
    } else {
      console.log("🚫 Analytics Denied");
    }
  };

  const resetConsent = () => {
    setConsent(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsBannerOpen(true);
  };

  const openBanner = () => setIsBannerOpen(true);
  const closeBanner = () => setIsBannerOpen(false);

  return (
    <PrivacyContext.Provider value={{ consent, saveConsent, resetConsent, isBannerOpen, openBanner, closeBanner }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};