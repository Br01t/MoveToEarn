
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Zone, InventoryItem, ViewState, Badge, RunAnalysisData } from '../types';
import { UploadCloud, History, X, Calendar } from 'lucide-react';
import Pagination from './Pagination';
import { useLanguage } from '../LanguageContext';
import { getHexPixelPosition } from '../utils/geo';
import HexMap from './dashboard/HexMap';
import ZoneDetails from './dashboard/ZoneDetails';
import DashboardHUD from './dashboard/DashboardHUD';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardControls from './dashboard/DashboardControls';

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
  onOpenSync: () => void;
  onGetZoneLeaderboard: (zoneId: string) => Promise<any[]>;
}

const HEX_SIZE = 100;
const RUNS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({ 
    user, zones, users, badges, 
    onSyncRun, onClaim, onBoost, onDefend, onNavigate, onOpenSync,
    onGetZoneLeaderboard
}) => {
  const { t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [zoneLeaderboard, setZoneLeaderboard] = useState<any[]>([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'ENEMY'>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Map View State
  const [view, setView] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const prevZonesLengthRef = useRef(zones.length);

  // Derived Values - earningRate logic removed

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

  // FETCH REAL DATA WHEN ZONE IS SELECTED
  useEffect(() => {
      if (selectedZone) {
          // Pass ID instead of Name for accurate lookup
          onGetZoneLeaderboard(selectedZone.id).then(data => {
              setZoneLeaderboard(data);
          });
      } else {
          setZoneLeaderboard([]);
      }
  }, [selectedZone]);

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

  return (
    <div className="relative w-full h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-gray-900 shadow-inner">
      
      <DashboardHUD 
          runBalance={user.runBalance} 
          govBalance={user.govBalance} 
      />

      <DashboardSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          countries={countries}
          lastRun={lastRun}
          zones={zones}
          onViewHistory={() => { setHistoryPage(1); setShowHistoryModal(true); }}
      />

      <DashboardControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

      {/* Sync Run Button - Adjusted bottom position for mobile from 36 to 44 (approx 176px) to clear 2-row navbar */}
      <div className="absolute bottom-44 md:bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"></div>
            
            <button 
              onClick={onOpenSync}
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

      {/* HISTORY MODAL (Inline for now, could be extracted further) */}
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
                         currentHistoryRuns.map(run => {
                             const locationDisplay = (run.involvedZones && run.involvedZones.length > 0)
                                ? run.involvedZones.map(id => zones.find(z => z.id === id)?.name).filter(Boolean).join(', ')
                                : run.location;

                             return (
                                 <div key={run.id} className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex justify-between items-center">
                                     <div>
                                         <div className="font-bold text-white text-sm">{locationDisplay}</div>
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
                             );
                         })
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