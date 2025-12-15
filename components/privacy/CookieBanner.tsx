
import React, { useState } from 'react';
import { Cookie, Shield, ChevronDown, ChevronUp, Check, Sliders } from 'lucide-react';
import { usePrivacy, ConsentState } from '../../contexts/PrivacyContext';
import { useLanguage } from '../../LanguageContext';
import { ViewState } from '../../types';

interface CookieBannerProps {
    onNavigate: (view: ViewState) => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const { isBannerOpen, saveConsent } = usePrivacy();
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  
  const [preferences, setPreferences] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  if (!isBannerOpen) return null;

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof ConsentState) => {
    if (key === 'necessary') return; // Cannot toggle necessary
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[250] p-4 md:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col md:flex-row gap-6 p-6">
        
        {/* Left: Icon & Text */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400">
              <Cookie size={24} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{t('privacy.banner.title')}</h3>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t('privacy.banner.desc')}
          </p>
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <Sliders size={14} /> {showDetails ? t('privacy.banner.hide_pref') : t('privacy.banner.show_pref')}
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Granular Controls */}
          {showDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fade-in">
              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700 opacity-70 cursor-not-allowed">
                <span className="text-sm font-bold text-gray-300 flex items-center gap-2"><Shield size={14} className="text-emerald-500"/> {t('privacy.pref.necessary')}</span>
                <Check size={16} className="text-emerald-500" />
              </div>
              
              <div 
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${preferences.analytics ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-gray-800/50 border-gray-700'}`}
                onClick={() => togglePreference('analytics')}
              >
                <span className={`text-sm font-bold flex items-center gap-2 ${preferences.analytics ? 'text-white' : 'text-gray-400'}`}>
                    {t('privacy.pref.analytics')}
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.analytics ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.analytics ? 'left-6' : 'left-1'}`}></div>
                </div>
              </div>

              <div 
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${preferences.marketing ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-gray-800/50 border-gray-700'}`}
                onClick={() => togglePreference('marketing')}
              >
                <span className={`text-sm font-bold flex items-center gap-2 ${preferences.marketing ? 'text-white' : 'text-gray-400'}`}>
                    {t('privacy.pref.marketing')}
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.marketing ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.marketing ? 'left-6' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-3 justify-center min-w-[200px]">
          <button 
            onClick={handleAcceptAll}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
          >
            {t('privacy.btn.accept_all')}
          </button>
          
          {showDetails ? (
             <button 
                onClick={handleSavePreferences}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-600 transition-colors"
             >
                {t('privacy.btn.save_pref')}
             </button>
          ) : (
             <button 
                onClick={handleRejectAll}
                className="w-full py-3 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white font-bold rounded-xl border border-gray-700 transition-colors"
             >
                {t('privacy.btn.reject_all')}
             </button>
          )}
          
          <p className="text-[10px] text-gray-500 text-center mt-1">
            Read our <button onClick={() => onNavigate('PRIVACY')} className="underline text-emerald-500 hover:text-emerald-400">Privacy Policy</button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;