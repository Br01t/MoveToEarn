import React, { useState } from 'react';
import { Filter, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface DashboardControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({ onZoomIn, onZoomOut }) => {
  const { t } = useLanguage();
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  return (
    <>
        <div className="relative flex flex-col items-end">
           <button 
             onClick={() => setIsLegendOpen(!isLegendOpen)} 
             className={`p-2 rounded-lg border shadow-lg transition-all duration-300 ${isLegendOpen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-gray-800/90 text-gray-400 border-gray-700 hover:text-white'}`}
           >
               <Filter size={20} />
           </button>
           {isLegendOpen && (
               <div className="absolute right-full mr-2 top-0 bg-gray-800/95 backdrop-blur p-2 rounded-lg border border-gray-700 text-[10px] text-white flex flex-col gap-1 w-28 animate-fade-in z-50 shadow-2xl">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-sm"></div> {t('dash.legend.my_zones')}</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-sm"></div> {t('dash.legend.enemy')}</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-400 rounded-sm"></div> {t('dash.legend.boosted')}</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-sm"></div> {t('dash.legend.shielded')}</span>
               </div>
           )}
        </div>
        <button onClick={onZoomIn} className="p-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 shadow-lg transition-colors"><ZoomIn size={20}/></button>
        <button onClick={onZoomOut} className="p-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 shadow-lg transition-colors"><ZoomOut size={20}/></button>
    </>
  );
};

export default DashboardControls;