
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Zone, InventoryItem, ViewState, Badge, RunAnalysisData } from '../types';
import { ZoomIn, ZoomOut, UploadCloud, Search, Filter, Activity, History, X, Globe, Calendar } from 'lucide-react';
import Pagination from './Pagination';
import { useLanguage } from '../LanguageContext';
import { getHexPixelPosition } from '../utils/geo';
import HexMap from './dashboard/HexMap';
import ZoneDetails from './dashboard/ZoneDetails';
import SyncModal from './dashboard/SyncModal';

interface DashboardProps {
  user: User;
  zones: Zone[];
  users: Record<string, any>; 
  badges: Badge[];
  onSyncRun: (data: RunAnalysisData[]) => void;
  onClaim: (zoneId: string) => void;
  onBoost: (zoneId: string) => void;
  onDefend: (zoneId: string) => void;
  onNavigate: (view: ViewState) => void;
}

const HEX_SIZE = 100;
const RUNS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({ user, zones, users, badges, onSyncRun, onClaim, onBoost, onDefend, onNavigate }) => {
  const { t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'ENEMY'>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLastRunOpen, setIsLastRunOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Map View State
  const [view, setView] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const prevZonesLengthRef = useRef(zones.length);

  // Derived Values
  const earningRate = zones
    .filter(z => z.ownerId === user.id)
    .reduce((acc, z) => acc + (0.5 * z.interestRate), 0) * 6;

  const boostItem: InventoryItem | undefined = user.inventory.find(i => i.type === 'BOOST');
  const defenseItem: InventoryItem | undefined = user.inventory.find(i => i.type === 'DEFENSE');

  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    zones.forEach(z => {
      const match = z.name.match(/\-\s([A-Z]{2})$/);
      if (match && match[1]) countrySet.add(match[1]);
      else countrySet.add('Other');
    });
    return Array.from(countrySet).sort();
  }, [zones]);

  const lastRun = user.runHistory[0];

  const totalHistoryPages = Math.ceil(user.runHistory.length / RUNS_PER_PAGE);
  const currentHistoryRuns = user.runHistory.slice(
      (historyPage - 1) * RUNS_PER_PAGE,
      historyPage * RUNS_PER_PAGE
  );

  // --- Zone Logic Helpers ---
  const getOwnerDetails = (ownerId: string | null) => {
      if (!ownerId) return { name: 'Unclaimed', avatar: null, badge: null };
      let userData = ownerId === user.id ? user : users[ownerId];
      if (!userData) return { name: 'Unknown', avatar: null, badge: null };
      const badge = userData.favoriteBadgeId ? badges.find(b => b.id === userData.favoriteBadgeId) : null;
      return { name: userData.name, avatar: userData.avatar, badge: badge };
  };

  const getZoneLeaderboard = (zoneName: string) => {
      const myRuns = user.runHistory.filter(r => r.location === zoneName);
      const myTotalKm = myRuns.reduce((acc, r) => acc + r.km, 0);
      const leaderboard = Object.values(users).map((u: any) => {
          if (u.id === user.id) return { id: u.id, name: u.name, avatar: u.avatar, km: myTotalKm };
          const seed = (u.id.charCodeAt(u.id.length - 1) + zoneName.length) % 100;
          const fakeKm = (u.totalKm * (seed / 100)) / 5;
          return { id: u.id, name: u.name, avatar: u.avatar, km: fakeKm };
      });
      return leaderboard.sort((a, b) => b.km - a.km).slice(0, 10);
  };

  // --- Effects ---
  useEffect(() => {
    if (zones.length > prevZonesLengthRef.current) {
        const newZone = zones[zones.length - 1];
        const pos = getHexPixelPosition(newZone.x, newZone.y, HEX_SIZE);
        const newX = window.innerWidth / 2 - pos.x * view.scale;
        const newY = window.innerHeight / 2 - pos.y * view.scale;
        setView(v => ({ ...v, x: newX, y: newY }));
        setSelectedZone(newZone);
    }
    prevZonesLengthRef.current = zones.length;
  }, [zones, view.scale]);

  // --- Map Interactions ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(Math.max(0.3, view.scale + direction * scaleFactor), 2.5);
    setView(v => ({ ...v, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
          setIsDragging(true);
          setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMousePos.x;
      const dy = e.touches[0].clientY - lastMousePos.y;
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const zoomIn = () => setView(v => ({ ...v, scale: Math.min(v.scale + 0.2, 2.5) }));
  const zoomOut = () => setView(v => ({ ...v, scale: Math.max(v.scale - 0.2, 0.3) }));

  // --- Prep Render Data ---
  const ownerDetails = selectedZone ? getOwnerDetails(selectedZone.ownerId) : null;
  const zoneLeaderboard = selectedZone ? getZoneLeaderboard(selectedZone.name) : [];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-gray-900 shadow-inner">
      
      {/* HUD - Stats */}
      <div className="absolute top-2 left-2 right-2 z-20 flex overflow-x-auto no-scrollbar gap-2 pointer-events-none pr-12">
         <div className="bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 shadow-xl flex items-center gap-2 pointer-events-auto shrink-0">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">RUN</span>
             <span className="font-mono text-emerald-400 font-bold text-sm">{user.runBalance.toFixed(1)}</span>
         </div>
         <div className="bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 shadow-xl flex items-center gap-2 pointer-events-auto shrink-0">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">GOV</span>
             <span className="font-mono text-cyan-400 font-bold text-sm">{user.govBalance.toFixed(1)}</span>
         </div>
         {earningRate > 0 && (
            <div className="bg-emerald-900/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-xl flex items-center gap-2 pointer-events-auto shrink-0">
                <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">{t('dash.yield')}</span>
                <span className="font-mono text-white font-bold text-sm">~{earningRate.toFixed(1)}/m</span>
            </div>
         )}
      </div>

      {/* LEFT TOOLBAR: SEARCH & LAST RUN */}
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
                            onClick={() => { setIsLastRunOpen(false); setHistoryPage(1); setShowHistoryModal(true); }}
                            className="w-full py-1.5 bg-gray-700/50 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs text-gray-400 rounded transition-colors flex items-center justify-center gap-1"
                        >
                            <History size={12} /> View History
                        </button>
                     </div>
                 )}
             </div>
          )}
      </div>

      {/* Map Controls & Legend */}
      <div className="absolute top-14 right-2 z-20 flex flex-col items-end gap-2">
          <div className="relative flex flex-col items-end">
             <button onClick={() => setIsLegendOpen(!isLegendOpen)} className="p-2 bg-gray-800/90 text-gray-400 rounded-lg border border-gray-700 shadow-lg mb-2">
                 <Filter size={20} />
             </button>
             {isLegendOpen && (
                 <div className="bg-gray-800/90 backdrop-blur p-2 rounded-lg border border-gray-700 text-[10px] text-white flex flex-col gap-1 w-28 animate-fade-in">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-sm"></div> {t('dash.legend.my_zones')}</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-sm"></div> {t('dash.legend.enemy')}</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-400 rounded-sm"></div> {t('dash.legend.boosted')}</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-sm"></div> {t('dash.legend.shielded')}</span>
                 </div>
             )}
          </div>
          <button onClick={zoomIn} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 shadow-lg"><ZoomIn size={20}/></button>
          <button onClick={zoomOut} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 shadow-lg"><ZoomOut size={20}/></button>
      </div>

      {/* Sync Run Button */}
      <div className="absolute bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"></div>
            
            <button 
              onClick={() => setShowSyncModal(true)}
              className="relative group flex items-center gap-3 px-8 py-4 bg-gray-900/90 backdrop-blur-xl border-2 border-emerald-400 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:border-emerald-300 hover:scale-105 transition-all duration-300"
            >
                <div className="bg-emerald-500 text-black p-2 rounded-full">
                   <UploadCloud size={24} className="animate-pulse" /> 
                </div>
                <div className="flex flex-col items-start">
                   <span className="text-emerald-400 font-black text-xs uppercase tracking-widest leading-none mb-0.5">{t('dash.sync_btn_sub')}</span>
                   <span className="text-white font-bold text-lg leading-none">{t('dash.sync_btn_main')}</span>
                </div>
            </button>
      </div>

      {/* HEX MAP COMPONENT */}
      <HexMap
          ref={svgRef}
          zones={zones}
          user={user}
          view={view}
          selectedZoneId={selectedZone?.id || null}
          onZoneClick={setSelectedZone}
          filterMode={filterMode}
          filterCountry={filterCountry}
          searchTerm={searchTerm}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          onWheel={handleWheel}
      />

      {/* ZONE DETAILS PANEL */}
      {selectedZone && ownerDetails && (
          <ZoneDetails 
              zone={selectedZone}
              user={user}
              onClose={() => setSelectedZone(null)}
              ownerDetails={ownerDetails}
              zoneLeaderboard={zoneLeaderboard}
              onClaim={onClaim}
              onBoost={onBoost}
              onDefend={onDefend}
              hasBoostItem={!!boostItem}
              hasDefenseItem={!!defenseItem}
          />
      )}

      {/* SYNC MODAL */}
      {showSyncModal && (
          <SyncModal 
              onClose={() => setShowSyncModal(false)}
              onNavigate={onNavigate}
              onSyncRun={onSyncRun}
              user={user}
          />
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                         <History className="text-gray-400" /> Run History
                     </h3>
                     <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="p-4 overflow-y-auto space-y-3 flex-1">
                     {user.runHistory.length === 0 ? (
                         <div className="text-center py-8 text-gray-500">No runs recorded yet.</div>
                     ) : (
                         currentHistoryRuns.map(run => (
                             <div key={run.id} className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex justify-between items-center">
                                 <div>
                                     <div className="font-bold text-white text-sm">{run.location}</div>
                                     <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                         <Calendar size={10} />
                                         {new Date(run.timestamp).toLocaleDateString()}
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="font-mono text-emerald-400 font-bold">{run.km.toFixed(2)} km</div>
                                     <div className="text-[10px] text-gray-400 mt-1">
                                         +{run.runEarned} RUN
                                         {run.govEarned ? <span className="text-cyan-400 ml-1">+{run.govEarned} GOV</span> : ''}
                                     </div>
                                 </div>
                             </div>
                         ))
                     )}
                  </div>
                  <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
                    <Pagination currentPage={historyPage} totalPages={totalHistoryPages} onPageChange={setHistoryPage} />
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Dashboard;