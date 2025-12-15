
import React, { useEffect, useState } from 'react';
import { CheckCircle, Activity, MapPin, Zap, Timer, TrendingUp, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface RunSummaryModalProps {
  data: {
    totalKm: number;
    duration: number;
    runEarned: number;
    involvedZoneNames: string[];
    isReinforced: boolean;
  };
  onClose: () => void;
}

const RunSummaryModal: React.FC<RunSummaryModalProps> = ({ data, onClose }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation delay
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
      setIsVisible(false);
      setTimeout(onClose, 300);
  };

  const pace = data.duration > 0 ? (data.duration / data.totalKm).toFixed(2) : "0.00";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
        <div className={`relative w-full max-w-sm glass-panel-heavy rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.25)] overflow-hidden transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

            {/* Header */}
            <div className="p-6 text-center relative z-10">
                <div className="w-16 h-16 mx-auto bg-emerald-900/40 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-lg shadow-emerald-500/20 mb-4 animate-bounce-slow">
                    <Activity size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{t('run_summary.title')}</h2>
                <p className="text-xs text-gray-400">{t('run_summary.subtitle')}</p>
            </div>

            {/* Location & Context List */}
            <div className="px-6 pb-2 text-center relative z-10 flex flex-col items-center gap-2">
                <div className="text-[10px] uppercase font-bold text-gray-500">{t('run_summary.zones_involved')}</div>
                <div className="flex flex-col gap-2 w-full max-h-[100px] overflow-y-auto pr-1 scrollbar-hide">
                    {data.involvedZoneNames.map((name, i) => (
                        <div key={i} className="bg-black/40 p-2 rounded-lg border border-white/5 flex items-center justify-center gap-2 w-full">
                            <MapPin size={14} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-bold text-white truncate">{name}</span>
                        </div>
                    ))}
                </div>
                
                {data.isReinforced && (
                    <div className="bg-amber-900/20 p-2 rounded-lg border border-amber-500/30 flex items-center justify-center gap-2 animate-pulse w-full mt-2">
                        <Zap size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">{t('run_summary.reinforced')}</span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="p-6 relative z-10">
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-700/50">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('run_summary.dist')}</div>
                        <div className="text-lg font-mono font-bold text-white">{data.totalKm.toFixed(2)}</div>
                        <div className="text-[9px] text-gray-600">KM</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-700/50">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('run_summary.time')}</div>
                        <div className="text-lg font-mono font-bold text-white">{Math.floor(data.duration)}</div>
                        <div className="text-[9px] text-gray-600">MIN</div>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg text-center border border-gray-700/50">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('run_summary.pace')}</div>
                        <div className="text-lg font-mono font-bold text-white">{pace}</div>
                        <div className="text-[9px] text-gray-600">MIN/KM</div>
                    </div>
                </div>

                {/* Reward Section */}
                <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 text-center mb-6">
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t('run_summary.rewards')}</div>
                    <div className="text-4xl font-black text-emerald-400 drop-shadow-lg flex items-center justify-center gap-2">
                        +{data.runEarned.toFixed(2)} <span className="text-lg mt-2">RUN</span>
                    </div>
                    {data.isReinforced && (
                         <p className="text-[10px] text-emerald-400/70 mt-2">{t('run_summary.reinforced_desc')}</p>
                    )}
                </div>

                <button 
                    onClick={handleClose}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                    <CheckCircle size={20} /> {t('run_summary.collect_btn')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default RunSummaryModal;