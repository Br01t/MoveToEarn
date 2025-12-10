
import React, { useState } from 'react';
import { Search, X, Globe, Activity, History } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { RunEntry } from '../../types';

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
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  searchTerm, setSearchTerm,
  filterMode, setFilterMode,
  filterCountry, setFilterCountry,
  countries,
  lastRun,
  onViewHistory
}) => {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLastRunOpen, setIsLastRunOpen] = useState(false);

  return (
    <div className="absolute top-14 left-2 z-20 flex flex-col gap-2 items-start pointer-events-none">
        <div className={`flex flex-col items-start transition-all duration-300 pointer-events-auto ${isFilterOpen ? 'w-64 z-50' : 'w-10 z-40'}`}>
          <button 
              onClick={() => { setIsFilterOpen(!isFilterOpen); if (isLastRunOpen) setIsLastRunOpen(false); }} 
              className="w-10 h-10 bg-gray-800/90 backdrop-blur-md rounded-full border border-gray-700 shadow-lg flex items-center justify-center text-white hover:text-emerald-400 relative shrink-0"
          >
              {isFilterOpen ? <X size={20}/> : <Search size={20}/>}
          </button>

          {isFilterOpen && (
              <div className="mt-2 w-full bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl p-3 flex flex-col gap-3 animate-fade-in origin-top-left">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                          type="text" 
                          placeholder={t('dash.search_placeholder')}
                          className="w-full bg-gray-900/80 text-white rounded-lg pl-8 pr-3 py-2 text-xs border border-gray-600 focus:border-emerald-500 focus:outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <select 
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className="w-full bg-gray-900/80 text-white rounded-lg pl-8 pr-3 py-2 text-xs border border-gray-600 focus:border-emerald-500 focus:outline-none appearance-none"
                      >
                      <option value="ALL">All Nations</option>
                      {countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                      ))}
                      </select>
                  </div>
                  <div className="flex gap-1">
                      <button onClick={() => setFilterMode('ALL')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${filterMode === 'ALL' ? 'bg-gray-600 text-white' : 'bg-gray-900 text-gray-400'}`}>{t('dash.filter.all')}</button>
                      <button onClick={() => setFilterMode('MINE')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${filterMode === 'MINE' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'}`}>{t('dash.filter.mine')}</button>
                      <button onClick={() => setFilterMode('ENEMY')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${filterMode === 'ENEMY' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400'}`}>{t('dash.filter.enemy')}</button>
                  </div>
              </div>
          )}
        </div>

        {lastRun && (
           <div className="relative pointer-events-auto z-30">
               <button 
                  onClick={() => { setIsLastRunOpen(!isLastRunOpen); if (isFilterOpen) setIsFilterOpen(false); }}
                  className={`w-10 h-10 bg-gray-800/90 backdrop-blur-md rounded-full border border-gray-700 shadow-lg flex items-center justify-center transition-colors ${isLastRunOpen ? 'text-white border-emerald-500' : 'text-emerald-400 hover:text-white'}`}
               >
                   <Activity size={20} />
               </button>

               {isLastRunOpen && (
                   <div className="mt-2 w-56 bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl p-3 shadow-lg animate-fade-in origin-top-left">
                      <div className="flex items-center gap-2 mb-2">
                          <Activity size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Latest Activity</span>
                      </div>
                      <div className="space-y-1 mb-3">
                          <div className="text-sm font-bold text-white truncate">{lastRun.location}</div>
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{new Date(lastRun.timestamp).toLocaleDateString()}</span>
                              <span className="text-emerald-400 font-mono font-bold">{lastRun.km.toFixed(1)} km</span>
                          </div>
                      </div>
                      <button 
                          onClick={() => { setIsLastRunOpen(false); onViewHistory(); }}
                          className="w-full py-1.5 bg-gray-700/50 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs text-gray-400 rounded transition-colors flex items-center justify-center gap-1"
                      >
                          <History size={12} /> View History
                      </button>
                   </div>
               )}
           </div>
        )}
    </div>
  );
};

export default DashboardSidebar;