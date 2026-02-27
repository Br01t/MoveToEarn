import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Share, PlusSquare, ExternalLink, Play, RefreshCw, Pause } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import LanguageDropdown from './LanguageDropdown';

interface ForcePWAModalProps {
  isIOS: boolean;
  onInstall: () => void;
  hasDeferredPrompt: boolean;
}

const ForcePWAModal: React.FC<ForcePWAModalProps> = ({ isIOS, onInstall, hasDeferredPrompt }) => {
  const { t } = useLanguage();
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoStarted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/98 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-gray-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 my-auto"
      >
        {/* Language Switcher */}
        <div className="absolute top-4 left-4 z-30">
          <LanguageDropdown align="left" />
        </div>

        {/* Refresh Button */}
        <button 
          onClick={handleRefresh}
          className="absolute top-4 right-4 z-30 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-full border border-white/10 text-slate-400 hover:text-white transition-colors"
          title="Refresh Page"
        >
          <RefreshCw size={18} />
        </button>

        {/* Header */}
        <div className="bg-emerald-500/10 p-8 flex flex-col items-center text-center border-b border-emerald-500/20">
          <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-emerald-500/50 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
            <Smartphone size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {t('pwa.force.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <p className="text-slate-400 text-center leading-relaxed font-medium">
            {t('pwa.force.body')}
          </p>

          {isIOS ? (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/5">
                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                  <Download size={16} />
                  {t('pwa.force.ios_title')}
                </h3>
                <p className="text-xs text-slate-400 mb-4 italic">
                  {t('pwa.force.ios_guide')}
                </p>
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                    <p className="flex items-center gap-2">
                      {t('pwa.force.ios_step1')} <Share size={16} className="text-emerald-500" />
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                    <p className="flex items-center gap-2">
                      {t('pwa.force.ios_step2')} <PlusSquare size={16} className="text-emerald-500" />
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                    <p>{t('pwa.force.ios_step3')}</p>
                  </div>
                </div>
              </div>

              {/* Video Tutorial Placeholder */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  {t('pwa.force.ios_video_title')}
                </p>
                <div 
                  className="aspect-video bg-gray-800 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-slate-500 overflow-hidden relative group cursor-pointer"
                  onClick={handlePlayVideo}
                >
                  {!videoStarted && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50"></div>
                      <div className="relative z-20 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
                          <Play size={24} className="text-emerald-500 fill-emerald-500/20 ml-1" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
                          {t('pwa.force.ios_video_title') || "Watch Installation Guide"}
                        </span>
                      </div>
                    </>
                  )}
                  <video 
                    ref={videoRef}
                    src="https://fjvmeffshcivnoctaikj.supabase.co/storage/v1/object/public/images/video_tutoria_pwa.mp4" 
                    className={`absolute inset-0 w-full h-full object-cover ${videoStarted ? 'z-30' : 'z-10'}`} 
                    controls={videoStarted}
                    playsInline
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <button
                  onClick={onInstall}
                  disabled={!hasDeferredPrompt}
                  className={`w-full py-5 px-6 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg uppercase tracking-wider text-lg ${
                    hasDeferredPrompt 
                      ? "bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/40" 
                      : "bg-gray-800 text-slate-500 cursor-not-allowed border border-white/5"
                  }`}
                >
                  <Download size={24} />
                  {t('pwa.force.android_btn')}
                </button>
                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                  {hasDeferredPrompt 
                    ? "Tap to start instant installation" 
                    : "Waiting for system protocol..."}
                </p>
              </div>

              <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 text-center">
                <p className="text-xs text-emerald-500/70 font-black uppercase tracking-wider">
                  {t('pwa.force.open_app_hint')}
                </p>
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-white/5 flex justify-center">
             <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                <ExternalLink size={10} />
                Secure Protocol Active
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForcePWAModal;