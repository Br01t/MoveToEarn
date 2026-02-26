import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Share, PlusSquare, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ForcePWAModalProps {
  isIOS: boolean;
  onInstall: () => void;
  hasDeferredPrompt: boolean;
}

const ForcePWAModal: React.FC<ForcePWAModalProps> = ({ isIOS, onInstall, hasDeferredPrompt }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/95 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 my-auto"
      >
        <div className="bg-emerald-500/10 p-8 flex flex-col items-center text-center border-b border-emerald-500/20">
          <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-emerald-500/50 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
            <Smartphone size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {t('pwa.force.title')}
          </h2>
        </div>

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
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold">1</div>
                    <p className="flex items-center gap-2">
                      {t('pwa.force.ios_step1')} <Share size={16} className="text-emerald-500" />
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold">2</div>
                    <p className="flex items-center gap-2">
                      {t('pwa.force.ios_step2')} <PlusSquare size={16} className="text-emerald-500" />
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold">3</div>
                    <p>{t('pwa.force.ios_step3')}</p>
                  </div>
                </div>
              </div>

              <div className="aspect-video bg-gray-800 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-slate-500 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Smartphone size={20} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Tutorial Video Placeholder</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {hasDeferredPrompt ? (
                <button
                  onClick={onInstall}
                  className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
                >
                  <Download size={20} />
                  {t('pwa.force.android_btn')}
                </button>
              ) : (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/5 text-center">
                  <p className="text-slate-300 font-bold mb-4 uppercase tracking-wider text-sm">
                    {t('pwa.force.open_app')}
                  </p>
                  <p className="text-xs text-slate-500">
                    If you already installed ZoneRun, please open it from your app drawer.
                  </p>
                </div>
              )}
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