
import React, { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";

interface PWAInstallPromptProps {
  isAuthenticated: boolean;
  deferredPrompt: any;
  isIOS: boolean;
  isStandalone: boolean;
  onInstall: () => void;
  forceShow?: boolean;
  onCloseForce?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
    isAuthenticated, deferredPrompt, isIOS, isStandalone, onInstall, forceShow, onCloseForce 
}) => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (forceShow) {
        setShowPrompt(true);
        return;
    }

    // Hide if already in standalone mode
    if (isStandalone) {
        setShowPrompt(false);
        return;
    }

    // Only show to authenticated users who aren't currently installed
    if (isAuthenticated && !isStandalone) {
        const timer = setTimeout(() => {
            if (deferredPrompt || isIOS) {
                setShowPrompt(true);
            }
        }, 3000);
        return () => clearTimeout(timer);
    } else {
        setShowPrompt(false);
    }
  }, [isAuthenticated, isStandalone, deferredPrompt, isIOS, forceShow]);

  const handleClose = () => {
      setShowPrompt(false);
      // Save dismissal to localStorage via parent/hook if needed, 
      // but here we just hide the current instance
      if (onCloseForce) onCloseForce();
      
      // Persist dismissal
      localStorage.setItem('zr_pwa_dismissed_at', Date.now().toString());
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
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10 fill-white">
              <polygon points="50,5 93.3,25 93.3,75 50,95 6.7,75 6.7,25" fillOpacity="0.2" />
              <path d="M55 22 L62 22 L42 52 L58 52 L38 82 L38 82 L42 58 L28 58 Z" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight mb-1">ZoneRun App</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Installa l'app per un'esperienza a pieno schermo e accesso rapido dalla home.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {isIOS ? (
            <div className="bg-black/30 rounded-xl p-3 border border-gray-700/50 text-sm text-gray-300">
              <p className="flex items-center gap-2 mb-2">
                1. Tocca il tasto <Share size={16} className="text-blue-400" /> <strong>Condividi</strong>
              </p>
              <p className="flex items-center gap-2">
                2. Seleziona <PlusSquare size={16} className="text-white" /> <strong>Aggiungi alla Home</strong>
              </p>
            </div>
          ) : (
            <button
              onClick={onInstall}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Download size={18} /> Installa Ora
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;