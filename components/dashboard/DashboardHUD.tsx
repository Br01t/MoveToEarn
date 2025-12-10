
import React from 'react';
import { useLanguage } from '../../LanguageContext';

interface DashboardHUDProps {
  runBalance: number;
  govBalance: number;
  earningRate: number;
}

const DashboardHUD: React.FC<DashboardHUDProps> = ({ runBalance, govBalance, earningRate }) => {
  const { t } = useLanguage();
  return (
    <div className="absolute top-2 left-2 right-2 z-20 flex overflow-x-auto no-scrollbar gap-2 pointer-events-none pr-12">
         <div className="bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 shadow-xl flex items-center gap-2 pointer-events-auto shrink-0">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">RUN</span>
             <span className="font-mono text-emerald-400 font-bold text-sm">{runBalance.toFixed(1)}</span>
         </div>
         <div className="bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 shadow-xl flex items-center gap-2 pointer-events-auto shrink-0">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">GOV</span>
             <span className="font-mono text-cyan-400 font-bold text-sm">{govBalance.toFixed(1)}</span>
         </div>
         {earningRate > 0 && (
            <div className="bg-emerald-900/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-xl flex items-center gap-2 pointer-events-auto shrink-0">
                <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">{t('dash.yield')}</span>
                <span className="font-mono text-white font-bold text-sm">~{earningRate.toFixed(1)}/m</span>
            </div>
         )}
    </div>
  );
};

export default DashboardHUD;