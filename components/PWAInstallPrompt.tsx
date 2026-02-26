import React, { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { OFFICIAL_LOGO_URL } from "../constants";

interface PWAInstallPromptProps {
  isAuthenticated: boolean;
  deferredPrompt: any;
  isIOS: boolean;
  isMobile: boolean;
  isStandalone: boolean;
  onInstall: () => void;
  forceShow?: boolean;
  onCloseForce?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
    isAuthenticated, deferredPrompt, isIOS, isMobile, isStandalone, onInstall, forceShow, onCloseForce 
}) => {
  const { t } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    if (forceShow) {
        setShowPrompt(true);
        return;
    }

    // Hide if already in standalone mode or on mobile (where we force it)
    if (isStandalone || isMobile) {
        setShowPrompt(false);
        return;
    }

    // Check if user has permanently dismissed it
    const isPermanentlyDismissed = localStorage.getItem('zr_pwa_dismissed_forever') === 'true';
    if (isPermanentlyDismissed) {
        setShowPrompt(false);
        return;
    }

    // Check for temporary dismissal cooldown (24 hours)
    const dismissedAt = localStorage.getItem('zr_pwa_dismissed_at');
    if (dismissedAt) {
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - parseInt(dismissedAt) < cooldown) {
            setShowPrompt(false);
            return;
        }
    }

    // Show on PC regardless of auth, or on mobile if authenticated (though mobile is usually forced)
    const shouldShowOnPC = !isMobile && !isStandalone;
    const shouldShowOnMobile = isMobile && isAuthenticated && !isStandalone;

    if (shouldShowOnPC || shouldShowOnMobile) {
        const timer = setTimeout(() => {
            // On PC we might show it even without deferredPrompt as a "hint" 
            // but the button will only work if deferredPrompt exists.
            // However, to keep it clean, let's show it if it's installable or if we want to hint.
            if (deferredPrompt || isIOS || !isMobile) {
                setShowPrompt(true);
            }
        }, 3000);
        return () => clearTimeout(timer);
    } else {
        setShowPrompt(false);
    }
  }, [isAuthenticated, isStandalone, deferredPrompt, isIOS, isMobile, forceShow]);

  const handleClose = () => {
      setShowPrompt(false);
      if (onCloseForce) onCloseForce();
      
      if (dontAskAgain) {
          localStorage.setItem('zr_pwa_dismissed_forever', 'true');
      } else {
          localStorage.setItem('zr_pwa_dismissed_at', Date.now().toString());
      }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-slide-up">
      <div className="max-w-md mx-auto bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] p-5 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>

        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-white p-1 bg-black/20 rounded-full transition-colors">
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gray-800 rounded-xl shadow-lg flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
            <img src={OFFICIAL_LOGO_URL} alt="ZoneRun Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight mb-1">
              {t('pwa.prompt.title')}
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              {t('pwa.prompt.body')}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {isIOS ? (
            <div className="bg-black/30 rounded-xl p-3 border border-gray-700/50 text-sm text-gray-300">
              <p className="flex items-center gap-2 mb-2">
                1. {t('pwa.force.ios_step1')}
              </p>
              <p className="flex items-center gap-2">
                2. {t('pwa.force.ios_step2')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onInstall}
                disabled={!deferredPrompt && !isMobile}
                className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                  deferredPrompt || isMobile
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-900/20"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <Download size={18} /> {t('pwa.prompt.install_btn')}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox" 
              id="dontAskAgain" 
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="dontAskAgain" className="text-xs text-gray-400 cursor-pointer">
              {t('pwa.prompt.dont_ask')}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;