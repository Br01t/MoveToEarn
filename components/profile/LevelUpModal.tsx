
import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Trophy, Star, Crown, Zap } from 'lucide-react';
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
  const [progress, setProgress] = useState(100);
  const DURATION = 5000; // 5 secondi

  useEffect(() => {
    // Timer per la barra di progresso visiva
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
      <style>
        {`
          @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(1000%); opacity: 0; }
          }
          .scanline-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, transparent, #fbbf24, transparent);
            box-shadow: 0 0 15px #fbbf24;
            animation: scanline 3s linear infinite;
            z-index: 5;
          }
          @keyframes glitch-text {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
          .animate-glitch {
            animation: glitch-text 0.2s infinite;
            animation-play-state: paused;
          }
          .animate-glitch:hover {
            animation-play-state: running;
          }
        `}
      </style>
      
      <div className="relative w-full max-w-sm glass-panel-heavy rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(251,191,36,0.2)] animate-slide-up border-2 border-yellow-500/40">
        
        {/* Scanning Line Effect */}
        <div className="scanline-effect"></div>

        {/* Background Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:30px:30px] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent opacity-40"></div>

        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-white z-50 transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center p-8 pt-12">
            
            {/* Level Icon HUD Badge */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                
                {/* Orbital Rings */}
                <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-full scale-125 animate-spin-slow"></div>
                <div className="absolute inset-0 border border-yellow-500/10 rounded-full scale-150 animate-reverse-spin-slow"></div>

                <div className="w-28 h-28 bg-black rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] relative z-10">
                    {icon ? (
                        renderLevelIcon(icon, "w-14 h-14 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]")
                    ) : (
                        <Trophy size={56} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                    )}
                </div>
                
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-[11px] font-black px-4 py-1.5 rounded-lg border-2 border-black shadow-xl uppercase tracking-[0.2em] whitespace-nowrap z-20">
                    Rank Up
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xs font-black text-yellow-500 uppercase tracking-[0.4em] mb-2 opacity-80">System Promotion</h2>
                <h3 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl flex items-center justify-center gap-3">
                    LVL <span className="text-yellow-400 text-6xl tabular-nums">{level}</span>
                </h3>
            </div>
            
            <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 mb-8 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <p className="text-gray-300 font-bold text-xl leading-tight uppercase tracking-tight">
                    {title || "Superior Agent"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-yellow-500/70 text-[10px] font-bold uppercase tracking-widest">
                    <Zap size={10} fill="currentColor" /> Authority Increased <Zap size={10} fill="currentColor" />
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl shadow-[0_10px_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider group"
            >
                <CheckCircle size={22} className="group-hover:scale-110 transition-transform" /> {t('ach.claim_btn')}
            </button>

            <p className="mt-4 text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Auto-closing in few seconds...</p>
        </div>

        {/* Timer Progress Bar (HUD Style) */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-gray-900 w-full">
            <div 
                className="h-full bg-yellow-500 shadow-[0_0_10px_#fbbf24] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;