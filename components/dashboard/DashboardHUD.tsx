import React from 'react';
import { useLanguage } from '../../LanguageContext';

interface DashboardHUDProps {
  runBalance: number;
  govBalance: number;
}

const DashboardHUD: React.FC<DashboardHUDProps> = ({ runBalance, govBalance }) => {
  return (
    <div className="absolute top-2 left-2 z-40 flex gap-2 pointer-events-auto max-w-[calc(50%-40px)] overflow-x-auto no-scrollbar">
         <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 shrink-0">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">RUN</span>
             <span className="font-mono text-emerald-400 font-bold text-sm">{runBalance.toFixed(1)}</span>
         </div>
         <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 shrink-0">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">GOV</span>
             <span className="font-mono text-cyan-400 font-bold text-sm">{govBalance.toFixed(1)}</span>
         </div>
    </div>
  );
};

export default DashboardHUD;