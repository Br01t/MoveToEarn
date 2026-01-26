
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Zone, InventoryItem, ViewState, Badge, RunAnalysisData } from '../types';
import { UploadCloud, History, X, Calendar, Waypoints, Circle, Footprints, Info, RefreshCw, AlertTriangle } from 'lucide-react';
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
  isSyncing?: boolean;
  syncError?: string | null;
  onSyncRun: (data: RunAnalysisData[]) => void;
  onClaim: (zoneId: string) => void;
  onBoost: (zoneId: string) => void;
  onDefend: (zoneId: string) => void;
  onNavigate: (view: ViewState) => void;
  onOpenSync: () => void;
  onGetZoneLeaderboard: (zoneId: string) => Promise<any[]>;
  onRefreshData?: () => void;
}

const HEX_SIZE = 100;
const RUNS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({ 
    user, zones, users, badges, isSyncing, syncError,
    onSyncRun, onClaim, onBoost, onDefend, onNavigate, onOpenSync,
    onGetZoneLeaderboard, onRefreshData
}) => {
  const { t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [zoneLeaderboard, setZoneLeaderboard] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [showGlobalTrajectories, setShowGlobalTrajectories] = useState(false);
  const [showOnlyVisited, setShowOnlyVisited] = useState(false);
  
  const [activeTooltip, setActiveTooltip] = useState<'EXPLORATION' | 'TRAJECTORIES' | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'ENEMY'>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Map View State
  const [view, setView] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0.8 });
  
  // Dragging & Pinch State
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchScale = useRef<number>(0.8);
  const initialMidpointWorld = useRef({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const prevZonesLengthRef = useRef(0);

  const visitedZoneIds = useMemo(() => {
    const ids = new Set<string>();
    user.runHistory.forEach(run => {
        if (run.involvedZones) {
            run.involvedZones.forEach(id => ids.add(id));
        }
    });
    return ids;
  }, [user.runHistory]);

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

  const getOwnerDetails = (ownerId: string | null) => {
      if (!ownerId) return { name: 'Unclaimed', avatar: null, badge: null };
      let userData = ownerId === user.id ? user : users[ownerId];
      if (!userData) return { name: 'Unknown', avatar: null, badge: null };
      const badge = userData.favoriteBadgeId ? badges.find(b => b.id === userData.favoriteBadgeId) : null;
      return { name: userData.name, avatar: userData.avatar, badge: badge };
  };

  useEffect(() => {
      if (selectedZone) {
          setIsLeaderboardLoading(true);
          onGetZoneLeaderboard(selectedZone.id).then(data => {
              setZoneLeaderboard(data);
              setIsLeaderboardLoading(false);
          }).catch(() => {
              setZoneLeaderboard([]);
              setIsLeaderboardLoading(false);
          });
      } else {
          setZoneLeaderboard([]);
          setIsLeaderboardLoading(false);
      }
  }, [selectedZone, onGetZoneLeaderboard]);

  const calculateDistributionCenter = (currentZones: Zone[], currentScale: number) => {
      if (currentZones.length === 0) return null;
      let sumX = 0, sumY = 0;
      currentZones.forEach(z => {
          const pixelPos = getHexPixelPosition(z.x, z.y, HEX_SIZE);
          sumX += pixelPos.x;
          sumY += pixelPos.y;
      });
      const avgX = sumX / currentZones.length;
      const avgY = sumY / currentZones.length;
      return { 
          x: Math.round((window.innerWidth / 2) - (avgX * currentScale)), 
          y: Math.round((window.innerHeight / 2) - (avgY * currentScale)) 
      };
  };

  useEffect(() => {
    if (prevZonesLengthRef.current === 0 && zones.length > 0) {
        const center = calculateDistributionCenter(zones, view.scale);
        if (center) setView(v => ({ ...v, x: center.x, y: center.y }));
    }
    else if (zones.length > prevZonesLengthRef.current) {
        const newZone = zones[zones.length - 1];
        const pos = getHexPixelPosition(newZone.x, newZone.y, HEX_SIZE);
        const newX = Math.round(window.innerWidth / 2 - pos.x * view.scale);
        const newY = Math.round(window.innerHeight / 2 - pos.y * view.scale);
        setView(v => ({ ...v, x: newX, y: newY }));
    }
    prevZonesLengthRef.current = zones.length;
  }, [zones, view.scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('svg') && target !== containerRef.current) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const getTouchMetrics = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midpoint = {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
    return { distance, midpoint };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('svg') && target !== container) { isDragging.current = false; return; }
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPinchDistance.current = null;
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        const { distance, midpoint } = getTouchMetrics(e.touches);
        initialPinchDistance.current = distance;
        initialPinchScale.current = view.scale;
        initialMidpointWorld.current = { x: (midpoint.x - view.x) / view.scale, y: (midpoint.y - view.y) / view.scale };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isUITouch = !target.closest('svg') && target !== container;
      if (e.touches.length === 1 && isDragging.current && !isUITouch) {
        const dx = e.touches[0].clientX - lastMousePos.current.x;
        const dy = e.touches[0].clientY - lastMousePos.current.y;
        setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initialPinchDistance.current !== null) {
        const { distance, midpoint } = getTouchMetrics(e.touches);
        const ratio = distance / initialPinchDistance.current;
        const newScale = Math.min(2.5, Math.max(0.05, initialPinchScale.current * ratio));
        const newX = midpoint.x - (initialMidpointWorld.current.x * newScale);
        const newY = midpoint.y - (initialMidpointWorld.current.y * newScale);
        setView({ x: newX, y: newY, scale: newScale });
      }
      if (!isUITouch && e.cancelable) e.preventDefault();
    };
    const handleTouchEnd = () => { isDragging.current = false; initialPinchDistance.current = null; };
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [view]);

  const zoomIn = () => setView(v => ({ ...v, scale: Math.min(v.scale + 0.2, 2.5) }));
  const zoomOut = () => setView(v => ({ ...v, scale: Math.max(v.scale - 0.2, 0.05) }));

  const handleRecenter = () => {
      if (zones.length === 0) return;
      const center = calculateDistributionCenter(zones, view.scale);
      if (center) setView(v => ({ ...v, x: center.x, y: center.y }));
  };

  const showTooltipTemporarily = (type: 'EXPLORATION' | 'TRAJECTORIES') => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      setActiveTooltip(type);
      tooltipTimeoutRef.current = setTimeout(() => setActiveTooltip(null), 2500);
  };

  const handleToggleExploration = () => {
    const nextValue = !showOnlyVisited;
    setShowOnlyVisited(nextValue);
    if (nextValue) setShowGlobalTrajectories(false);
    showTooltipTemporarily('EXPLORATION');
  };

  const handleToggleTrajectories = () => {
    const nextValue = !showGlobalTrajectories;
    setShowGlobalTrajectories(nextValue);
    if (nextValue) setShowOnlyVisited(false);
    showTooltipTemporarily('TRAJECTORIES');
  };

  const ownerDetails = selectedZone ? getOwnerDetails(selectedZone.ownerId) : null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-transparent shadow-inner"
    >
      <DashboardHUD runBalance={user.runBalance} govBalance={user.govBalance} />

      <div className="absolute top-14 right-2 z-30 flex flex-col items-end gap-2 pointer-events-none">
          {isSyncing && (
              <div className="bg-gray-900/90 backdrop-blur-md border border-emerald-500/50 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse pointer-events-auto">
                  <RefreshCw size={14} className="text-emerald-400 animate-spin" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sincronizzazione Griglia...</span>
              </div>
          )}
          {syncError && !isSyncing && (
              <button 
                onClick={onRefreshData}
                className="bg-red-900/90 backdrop-blur-md border border-red-500/50 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg hover:bg-red-800 transition-colors pointer-events-auto group"
              >
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest">{syncError}</span>
                  <RefreshCw size={12} className="text-red-400 group-hover:rotate-180 transition-transform" />
              </button>
          )}
      </div>

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
          onRecenter={handleRecenter}
      />

      {activeTooltip && (
          <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xs animate-slide-down pointer-events-none">
              <div className={`glass-panel-heavy p-4 rounded-2xl border shadow-2xl flex items-start gap-3 ${activeTooltip === 'EXPLORATION' ? 'border-emerald-500/50 text-emerald-400' : 'border-cyan-500/50 text-cyan-400'}`}>
                  <Info size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-tight">{t(`dash.tooltip.${activeTooltip.toLowerCase()}`)}</p>
              </div>
          </div>
      )}

      <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
              <div className="relative group/tooltip">
                  <button 
                    onClick={handleToggleExploration}
                    onMouseEnter={() => setActiveTooltip('EXPLORATION')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className={`relative w-10 h-10 rounded-lg border shadow-lg transition-all duration-300 flex items-center justify-center ${showOnlyVisited ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-800/90 text-gray-500 border-gray-700 hover:text-white'}`}
                  >
                      <Footprints size={20} className={showOnlyVisited ? 'animate-pulse' : ''} />
                      <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-black/50 ${showOnlyVisited ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-gray-600'}`}></div>
                  </button>
                  <div className={`hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl transition-opacity pointer-events-none whitespace-nowrap text-[11px] font-bold text-emerald-400 z-50 ${activeTooltip === 'EXPLORATION' ? 'opacity-100' : 'opacity-0'}`}>
                    {t('dash.tooltip.exploration')}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 border-r border-t border-white/10 rotate-45"></div>
                  </div>
              </div>
              <div className="relative group/tooltip">
                  <button 
                    onClick={handleToggleTrajectories}
                    onMouseEnter={() => setActiveTooltip('TRAJECTORIES')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className={`relative w-10 h-10 rounded-lg border shadow-lg transition-all duration-300 flex items-center justify-center ${showGlobalTrajectories ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-gray-800/90 text-gray-500 border-gray-700 hover:text-white'}`}
                  >
                      <Waypoints size={20} className={showGlobalTrajectories ? 'animate-pulse' : ''} />
                      <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-black/50 ${showGlobalTrajectories ? 'bg-emerald-400 animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-gray-600'}`}></div>
                  </button>
                  <div className={`hidden md:block absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl transition-opacity pointer-events-none whitespace-nowrap text-[11px] font-bold text-cyan-400 z-50 ${activeTooltip === 'TRAJECTORIES' ? 'opacity-100' : 'opacity-0'}`}>
                    {t('dash.tooltip.trajectories')}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 border-r border-t border-white/10 rotate-45"></div>
                  </div>
              </div>
              <DashboardControls onZoomIn={zoomIn} onZoomOut={zoomOut} />
          </div>
      </div>

      <div className="absolute bottom-44 right-4 md:bottom-10 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"></div>
            <button 
              onClick={onOpenSync}
              className="relative group flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-8 md:py-4 bg-gray-900/90 backdrop-blur-xl border-2 border-emerald-400 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:border-emerald-300 hover:scale-105 transition-all duration-300"
            >
                <div className="bg-emerald-500 text-black p-1.5 md:p-2 rounded-full shrink-0"><UploadCloud size={20} className="md:w-6 md:h-6 animate-pulse" /></div>
                <div className="flex flex-col items-start min-w-0">
                   <span className="hidden md:block text-emerald-400 font-black text-xs uppercase tracking-widest leading-none mb-0.5">{t('dash.sync_btn_sub')}</span>
                   <span className="text-white font-bold text-sm md:text-lg leading-none truncate whitespace-nowrap">{t('dash.sync_btn_main')}</span>
                </div>
            </button>
      </div>

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
          showGlobalTrajectories={showGlobalTrajectories}
          showOnlyVisited={showOnlyVisited}
          visitedZoneIds={visitedZoneIds}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={() => {}}
          onTouchMove={() => {}}
          onTouchEnd={() => {}}
      />

      {selectedZone && ownerDetails && (
          <ZoneDetails 
              zone={selectedZone}
              user={user}
              onClose={() => setSelectedZone(null)}
              ownerDetails={ownerDetails}
              zoneLeaderboard={zoneLeaderboard}
              isLoadingLeaderboard={isLeaderboardLoading}
              onClaim={(id) => { onClaim(id); setSelectedZone(null); }}
              onBoost={onBoost}
              onDefend={onDefend}
              hasBoostItem={!!boostItem}
              hasDefenseItem={!!defenseItem}
          />
      )}

      {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2"><History className="text-gray-400" /> Run History</h3>
                     <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="p-4 overflow-y-auto space-y-3 flex-1">
                     {user.runHistory.length === 0 ? <div className="text-center py-8 text-gray-500">No runs recorded yet.</div> : currentHistoryRuns.map(run => (
                         <div key={run.id} className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex justify-between items-center">
                             <div>
                                 <div className="font-bold text-white text-sm">{(run.involvedZones || []).map(id => zones.find(z => z.id === id)?.name).filter(Boolean).join(', ') || run.location}</div>
                                 <div className="text-xs text-gray-500 flex items-center gap-2 mt-1"><Calendar size={10} />{new Date(run.timestamp).toLocaleDateString()}</div>
                             </div>
                             <div className="text-right">
                                 <div className="font-mono text-emerald-400 font-bold">{run.km.toFixed(2)} km</div>
                                 <div className="text-[10px] text-gray-400 mt-1">+{run.runEarned} RUN{run.govEarned ? <span className="text-cyan-400 ml-1">+{run.govEarned} GOV</span> : ''}</div>
                             </div>
                         </div>
                     ))}
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