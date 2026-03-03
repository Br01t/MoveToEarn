import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../LanguageContext';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { NAVBAR_LOGO_URL } from '../constants';
import LanguageDropdown from './ui/LanguageDropdown';

interface PublicNavbarProps {
  onLogin: () => void;
  onNavigate: (view: ViewState) => void;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ onLogin, onNavigate }) => {
  const { t } = useLanguage();
  const { isMuted, toggleMute, playSound } = useGlobalUI();

  const handleActionClick = (action: () => void) => {
    playSound('CLICK');
    action();
  };

  const handleNavAction = (view: ViewState) => {
    playSound('CLICK');
    onNavigate(view);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 lg:px-6 py-3 lg:py-4 backdrop-blur-md bg-black/40 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 lg:gap-3 cursor-pointer group" 
          onClick={() => handleNavAction('LANDING')}
        >
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-lg"></div>
             <div className="glass-panel p-1 rounded-xl border-white/10 group-hover:border-emerald-500/50 transition-colors relative z-10">
                <img src={NAVBAR_LOGO_URL} alt="ZoneRun Logo" className="w-8 h-8 lg:w-10 lg:h-10 object-contain" referrerPolicy="no-referrer" />
             </div>
          </div>
          <div className="text-lg lg:text-xl font-black text-white uppercase tracking-widest">
            ZONE<span className="text-emerald-400">RUN</span>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-2 lg:gap-4">
            <LanguageDropdown align="right" />
            <button
                onClick={toggleMute}
                className={`p-1.5 lg:p-2 rounded-xl glass-panel transition-all border ${isMuted ? 'text-red-400 border-red-500/30 bg-red-900/10' : 'text-gray-400 border-white/10 hover:text-white hover:border-white/30'}`}
            >
                {isMuted ? <VolumeX size={16} className="lg:hidden" /> : <Volume2 size={16} className="lg:hidden" />}
                {isMuted ? <VolumeX size={18} className="hidden lg:block" /> : <Volume2 size={18} className="hidden lg:block" />}
            </button>
            <button 
              onClick={() => handleActionClick(onLogin)}
              className="hidden sm:block px-4 lg:px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all text-xs lg:text-sm uppercase tracking-wider"
            >
              {t('auth.login')}
            </button>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;