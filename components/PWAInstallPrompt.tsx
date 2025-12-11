import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, ExternalLink } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect device type
    const mobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Detect standalone (installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    // If already installed → no install prompt
    if (standalone) return;

    // Detect iOS
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(isIos);

    // ---- iOS logic ----
    if (isIos && mobile) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // ---- Android/Chrome logic ----
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  // 🔥 If app already installed → suggest opening it
  if (isStandalone && isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[200] p-4">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-sm">Hai già installato ZoneRun</h3>
            <p className="text-gray-400 text-xs">Apri l’app per la migliore esperienza</p>
          </div>

          <a
            href="zonerun://open" 
            className="bg-emerald-500 px-3 py-2 rounded-xl font-bold text-black flex items-center gap-1 hover:bg-emerald-400"
          >
            <ExternalLink size={16} /> Apri App
          </a>
        </div>
      </div>
    );
  }

  // No prompt to show
  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-slide-up">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] p-5 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>

        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 bg-black/20 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10 fill-white">
              <polygon points="50,5 93.3,25 93.3,75 50,95 6.7,75 6.7,25" fillOpacity="0.2"/>
              <path d="M55 22 L62 22 L42 52 L58 52 L38 82 L38 82 L42 58 L28 58 Z" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight mb-1">Install ZoneRun</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Aggiungi alla schermata Home per esperienza full screen e accesso rapido.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {isIOS ? (
            <div className="bg-black/30 rounded-xl p-3 border border-gray-700/50 text-sm text-gray-300">
              <p className="flex items-center gap-2 mb-2">
                1. Tocca <Share size={16} className="text-blue-400" /> <strong>Condividi</strong>
              </p>
              <p className="flex items-center gap-2">
                2. Scegli <PlusSquare size={16} className="text-white" /> <strong>Aggiungi a Home</strong>
              </p>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Download size={18} /> Installa App
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;