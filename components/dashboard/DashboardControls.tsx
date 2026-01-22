
import React, { useState } from 'react';
import { Filter, ZoomIn, ZoomOut, Swords, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface DashboardControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({ onZoomIn, onZoomOut }) => {
  const { t } = useLanguage();
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const toggleLegend = () => {
    setIsLegendOpen(!isLegendOpen);
  };

  return (
    <>
        <div className="relative flex flex-col items-end">
           <button 
             onClick={toggleLegend} 
             className={`w-10 h-10 flex items-center justify-center rounded-lg border shadow-lg transition-all duration-300 ${isLegendOpen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-gray-800/90 text-gray-400 border-gray-700 hover:text-white'}`}
             title="Filtri Mappa"
           >
               <Filter size={20} />
           </button>
           {isLegendOpen && (
               <div className="absolute right-full mr-2 top-0 bg-gray-900/95 backdrop-blur-xl p-4 rounded-xl border border-gray-700 text-[10px] text-white flex flex-col gap-3 w-40 animate-fade-in z-50 shadow-2xl">
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm shadow-[0_0_5px_#10b981]"></div> {t('dash.legend.my_zones')}</span>
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-sm shadow-[0_0_5px_#ef4444]"></div> {t('dash.legend.enemy')}</span>
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-400 rounded-sm shadow-[0_0_5px_#fbbf24]"></div> {t('dash.legend.boosted')}</span>
                    <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_5px_#22d3ee]"></div> {t('dash.legend.shielded')}</span>
                    
                    <div className="h-px bg-white/10 my-1"></div>
                    
                    <span className="flex items-center gap-2 text-yellow-400 font-bold">
                        <Swords size={12} className="shrink-0" /> {t('dash.legend.ready_conquest')}
                    </span>
                    <span className="flex items-center gap-2 text-red-400 font-bold">
                        <AlertTriangle size={12} className="shrink-0" /> {t('dash.legend.at_risk')}
                    </span>
               </div>
           )}
        </div>
        <button onClick={onZoomIn} className="w-10 h-10 flex items-center justify-center bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 shadow-lg transition-colors"><ZoomIn size={20}/></button>
        <button onClick={onZoomOut} className="w-10 h-10 flex items-center justify-center bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 shadow-lg transition-colors"><ZoomOut size={20}/></button>
    </>
  );
};

export default DashboardControls;