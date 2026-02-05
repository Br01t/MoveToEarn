import React, { useEffect, useState } from 'react';
import { Mission, Badge } from '../types';
import { Trophy, CheckCircle, X, Award, Target, Sparkles, Layers } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface AchievementModalProps {
  data: { type: 'MISSION' | 'BADGE'; item: Mission | Badge };
  onClose: () => void;
  onClaimAll: () => void;
  remainingCount: number;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ data, onClose, onClaimAll, remainingCount }) => {
  const { t, tRich } = useLanguage();
  const { type, item } = data;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClaimAll = () => {
    setIsVisible(false);
    setTimeout(onClaimAll, 300);
  };

  const isMission = type === 'MISSION';
  const rewardRun = (item as any).rewardRun || 0;
  const rewardGov = (item as any).rewardGov || 0;
  
  const themeColor = isMission ? 'emerald' : 'yellow';
  const glowColor = isMission ? 'shadow-[0_0_60px_rgba(16,185,129,0.3)]' : 'shadow-[0_0_60px_rgba(234,179,8,0.3)]';
  const bgGradient = isMission 
    ? 'from-emerald-900/40 to-transparent' 
    : 'from-yellow-900/40 to-transparent';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className={`relative w-full max-w-sm glass-panel-heavy rounded-2xl p-1 ${glowColor} transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        <div className={`absolute inset-0 z-0 bg-gradient-to-b ${bgGradient} rounded-2xl opacity-50`}></div>

        <div className="absolute -top-6 -left-6 text-white/20 animate-bounce delay-100"><Sparkles size={40} /></div>
        <div className="absolute -bottom-6 -right-6 text-white/20 animate-bounce delay-300"><Sparkles size={40} /></div>

        <div className="relative z-10 p-6 flex flex-col items-center text-center overflow-hidden">
            
            <div className={`mb-6 p-4 rounded-full border-2 border-${themeColor}-500/50 bg-black/40 relative group`}>
                <div className={`absolute inset-0 rounded-full opacity-20 bg-${themeColor}-500 animate-pulse`}></div>
                {isMission ? (
                    <Target size={48} className="text-emerald-400" />
                ) : (
                    <Award size={48} className="text-yellow-400" />
                )}
            </div>

            <h2 className={`text-xs font-black tracking-[0.2em] uppercase mb-2 ${isMission ? 'text-emerald-500' : 'text-yellow-500'}`}>
                {isMission ? t('ach.mission_complete') : t('ach.badge_unlocked')}
            </h2>

            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                {isMission ? (item as Mission).title : (item as Badge).name}
            </h3>

            <p className="text-gray-400 text-sm mb-6 px-4">
                {isMission ? (item as Mission).description : (item as Badge).description}
            </p>

            {(rewardRun > 0 || rewardGov > 0) && (
                <div className="mb-6 bg-black/40 border border-white/10 px-6 py-3 rounded-lg flex flex-col items-center gap-1 w-full">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{t('ach.reward_claimed')}</span>
                    {rewardRun > 0 && (
                        <span className="text-2xl font-mono font-bold text-emerald-400 flex items-center gap-2">
                             +{rewardRun} RUN
                        </span>
                    )}
                    {rewardGov > 0 && (
                        <span className="text-xl font-mono font-bold text-cyan-400 flex items-center gap-2">
                             +{rewardGov} GOV
                        </span>
                    )}
                </div>
            )}

            {!(rewardRun > 0 || rewardGov > 0) && !isMission && (
                 <div className="mb-6 bg-black/40 border border-white/10 px-6 py-3 rounded-lg flex flex-col items-center w-full">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{t('ach.status')}</span>
                    <span className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                        {tRich('ach.prestige')}
                    </span>
                </div>
            )}

            <button 
                onClick={handleClose}
                className={`w-full py-3.5 rounded-xl font-bold text-black shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${isMission ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-yellow-500 hover:bg-yellow-400'}`}
            >
                <CheckCircle size={18} />
                {isMission ? t('ach.claim_btn') : t('ach.awesome_btn')}
            </button>

            {remainingCount > 0 && (
                <button 
                    onClick={handleClaimAll}
                    className="mt-4 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group px-4 py-2 hover:bg-white/5 rounded-lg"
                >
                    <Layers size={14} className="group-hover:text-emerald-400 transition-colors" />
                    <span>{t('ach.claim_all')} ({remainingCount} {t('ach.pending')})</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;