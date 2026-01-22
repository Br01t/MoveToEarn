
import React, { useState } from 'react';
import { Search, X, Globe, Activity, History, Crosshair } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { RunEntry, Zone } from '../../types';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface DashboardSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterMode: 'ALL' | 'MINE' | 'ENEMY';
  setFilterMode: (mode: 'ALL' | 'MINE' | 'ENEMY') => void;
  filterCountry: string;
  setFilterCountry: (country: string) => void;
  countries: string[];
  lastRun?: RunEntry;
  onViewHistory: () => void;
  zones: Zone[];
  onRecenter: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  searchTerm, setSearchTerm,
  filterMode, setFilterMode,
  filterCountry, setFilterCountry,
  countries,
  lastRun,
  onViewHistory,
  zones,
  onRecenter
}) => {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLastRunOpen, setIsLastRunOpen] = useState(false);

  // Resolve location names for last run if available
  const lastRunLocation = React.useMemo(() => {
      if (!lastRun) return '';
      
      let names: string[] = [];
      if (lastRun.involvedZones && lastRun.involvedZones.length > 0) {
          names = lastRun.involvedZones
              .map(id => zones.find(z => z.id === id)?.name)
              .filter((n): n is string => !!n);
      }
      
      return names.length > 0 ? names.join(', ') : (lastRun.location || 'Unknown Location');
  }, [lastRun, zones]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (isLastRunOpen) setIsLastRunOpen(false);
  };

  const toggleLastRun = () => {
    setIsLastRunOpen(!isLastRunOpen);
    if (isFilterOpen) setIsFilterOpen(false);
  };

  return (
    <div className="absolute top-14 left-2 z-20 flex flex-col gap-2 items-start pointer-events-none">
        <div className={`flex flex-col items-start transition-all duration-300 pointer-events-auto ${isFilterOpen ? 'w-64 z-50' : 'w-10 z-40'}`}>
          <button 
              onClick={toggleFilter} 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-emerald-400 relative shrink-0 glass-panel ${isFilterOpen ? 'border-emerald-500/50' : ''}`}
          >
              {isFilterOpen ? <X size={20}/> : <Search size={20}/>}
          </button>

          {isFilterOpen && (
              <div className="mt-2 w-full glass-panel rounded-xl p-3 flex flex-col gap-3 animate-fade-in origin-top-left">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                          type="text" 
                          placeholder={t('dash.search_placeholder')}
                          className="w-full bg-black/40 text-white rounded-lg pl-8 pr-3 py-2 text-xs border border-gray-600 focus:border-emerald-500 focus:outline-none placeholder-gray-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <select 
                        value={filterCountry}
                        onChange={(e) => { setFilterCountry(e.target.value); }}
                        className="w-full bg-black/40 text-white rounded-lg pl-8 pr-3 py-2 text-xs border border-gray-600 focus:border-emerald-500 focus:outline-none appearance-none"
                      >
                      <option value="ALL">All Nations</option>
                      {countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                      ))}
                      </select>
                  </div>
                  <div className="flex gap-1">
                      <button onClick={() => setFilterMode('ALL')} className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${filterMode === 'ALL' ? 'bg-gray-600 text-white border-gray-500' : 'bg-black/30 text-gray-400 border-transparent hover:border-gray-600'}`}>{t('dash.filter.all')}</button>
                      <button onClick={() => setFilterMode('MINE')} className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${filterMode === 'MINE' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50' : 'bg-black/30 text-gray-400 border-transparent hover:border-emerald-500/30'}`}>{t('dash.filter.mine')}</button>
                      <button onClick={() => setFilterMode('ENEMY')} className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${filterMode === 'ENEMY' ? 'bg-red-900/50 text-red-400 border-red-500/50' : 'bg-black/30 text-gray-400 border-transparent hover:border-red-500/30'}`}>{t('dash.filter.enemy')}</button>
                  </div>
              </div>
          )}
        </div>

        {lastRun && (
           <div className="relative pointer-events-auto z-30">
               <button 
                  onClick={toggleLastRun}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors glass-panel ${isLastRunOpen ? 'text-white border-emerald-500/50' : 'text-emerald-400 hover:text-white'}`}
               >
                   <Activity size={20} />
               </button>

               {isLastRunOpen && (
                   <div className="mt-2 w-56 glass-panel rounded-xl p-3 animate-fade-in origin-top-left">
                      <div className="flex items-center gap-2 mb-2">
                          <Activity size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Latest Activity</span>
                      </div>
                      <div className="space-y-1 mb-3">
                          <div className="text-sm font-bold text-white truncate" title={lastRunLocation}>{lastRunLocation}</div>
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{new Date(lastRun.timestamp).toLocaleDateString()}</span>
                              <span className="text-emerald-400 font-mono font-bold">{lastRun.km.toFixed(1)} km</span>
                          </div>
                      </div>
                      <button 
                          onClick={() => { setIsLastRunOpen(false); onViewHistory(); }}
                          className="w-full py-1.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs text-gray-400 rounded border border-white/5 hover:border-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                      >
                          <History size={12} /> View History
                      </button>
                   </div>
               )}
           </div>
        )}

        <button 
            onClick={onRecenter}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white pointer-events-auto transition-colors z-30 glass-panel"
            title="Center Map"
        >
            <Crosshair size={20} />
        </button>
    </div>
  );
};

export default DashboardSidebar;