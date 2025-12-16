
import React, { useEffect } from 'react';
import { X, CheckCircle, Trophy, Star, Crown } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { renderLevelIcon } from '../leaderboard/LeaderboardIcons';

interface LevelUpModalProps {
  level: number;
  title?: string;
  icon?: string;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, title, icon, onClose }) => {
  const { t } = useLanguage();

  // Auto-focus logic or entrance animation handling could go here
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-sm glass-panel-heavy rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.3)] animate-slide-up border-2 border-yellow-500/30">
        
        {/* Background Rays Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent opacity-50 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>

        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center p-8 pt-10">
            
            {/* Level Icon Badge */}
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-2xl relative z-10">
                    {icon ? (
                        renderLevelIcon(icon, "w-12 h-12 text-yellow-400 drop-shadow-lg")
                    ) : (
                        <Trophy size={48} className="text-yellow-400 drop-shadow-lg" />
                    )}
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white text-xs font-black px-3 py-1 rounded-md border border-yellow-400 shadow-lg uppercase tracking-wider whitespace-nowrap">
                    Level Up
                </div>
            </div>

            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-1 drop-shadow-xl">
                LEVEL <span className="text-yellow-400 text-5xl">{level}</span>
            </h2>
            
            <p className="text-gray-300 font-medium text-lg mb-6 max-w-[80%] leading-tight">
                {title || t('ach.prestige')}
            </p>

            <div className="w-full bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-yellow-200 text-sm font-bold uppercase tracking-wide">
                    <Crown size={16} /> New Rank Achieved
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-lg rounded-xl shadow-lg shadow-yellow-900/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide"
            >
                <CheckCircle size={20} /> {t('ach.claim_btn')}
            </button>

        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;