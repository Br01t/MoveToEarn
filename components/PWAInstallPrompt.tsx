
import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If iOS and not installed, show prompt after a delay
    if (isIosDevice) {
        const timer = setTimeout(() => setShowPrompt(true), 3000); // Show after 3s on iOS
        return () => clearTimeout(timer);
    }

    // Detect Android/Desktop PWA support
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt automatically or wait for user interaction? 
      // Let's show it automatically for visibility as requested
      setTimeout(() => setShowPrompt(true), 3000);
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

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-slide-up">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] p-5 relative overflow-hidden">
        
        {/* Background Glow */}
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
                    Add to your Home Screen for the full full-screen experience and faster access.
                </p>
            </div>
        </div>

        <div className="mt-5">
            {isIOS ? (
                <div className="bg-black/30 rounded-xl p-3 border border-gray-700/50 text-sm text-gray-300">
                    <p className="flex items-center gap-2 mb-2">
                        1. Tap the <Share size={16} className="text-blue-400" /> <strong>Share</strong> button
                    </p>
                    <p className="flex items-center gap-2">
                        2. Select <PlusSquare size={16} className="text-white" /> <strong>Add to Home Screen</strong>
                    </p>
                </div>
            ) : (
                <button 
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                >
                    <Download size={18} /> Install App
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;