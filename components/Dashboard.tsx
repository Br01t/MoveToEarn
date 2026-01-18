import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Zone, InventoryItem, ViewState, Badge, RunAnalysisData } from '../types';
import { UploadCloud, History, X, Calendar, Waypoints, Circle } from 'lucide-react';
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
  const [showGlobalTrajectories, setShowGlobalTrajectories] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'ENEMY'>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Map View State - Zoom out limit expanded to 0.05
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
          onGetZoneLeaderboard(selectedZone.id).then(data => {
              setZoneLeaderboard(data);
          });
      } else {
          setZoneLeaderboard([]);
      }
  }, [selectedZone]);

  const calculateDistributionCenter = (currentZones: Zone[], currentScale: number) => {
      if (currentZones.length === 0) return null;
      
      let sumX = 0;
      let sumY = 0;
      
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
        if (center) {
            setView(v => ({ ...v, x: center.x, y: center.y }));
        }
    }
    else if (zones.length > prevZonesLengthRef.current) {
        const newZone = zones[zones.length - 1];
        const pos = getHexPixelPosition(newZone.x, newZone.y, HEX_SIZE);
        const newX = Math.round(window.innerWidth / 2 - pos.x * view.scale);
        const newY = Math.round(window.innerHeight / 2 - pos.y * view.scale);
        setView(v => ({ ...v, x: newX, y: newY }));
    }
    prevZonesLengthRef.current = zones.length;
  }, [zones]);

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

  const handleMouseUp = () => {
      isDragging.current = false;
  };

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
      if (!target.closest('svg') && target !== container) {
          isDragging.current = false;
          return;
      }

      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPinchDistance.current = null;
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        const { distance, midpoint } = getTouchMetrics(e.touches);
        initialPinchDistance.current = distance;
        initialPinchScale.current = view.scale;
        
        initialMidpointWorld.current = {
          x: (midpoint.x - view.x) / view.scale,
          y: (midpoint.y - view.y) / view.scale
        };
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
      
      if (!isUITouch) {
          if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      initialPinchDistance.current = null;
    };

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
      if (center) {
          setView(v => ({ ...v, x: center.x, y: center.y }));
      }
  };

  const ownerDetails = selectedZone ? getOwnerDetails(selectedZone.ownerId) : null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-transparent shadow-inner"
    >
      
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
          onRecenter={handleRecenter}
      />

      <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 pointer-events-none">
          <button 
            onClick={() => setShowGlobalTrajectories(!showGlobalTrajectories)}
            className={`relative w-10 h-10 rounded-lg border shadow-lg transition-all duration-300 flex items-center justify-center pointer-events-auto ${
                showGlobalTrajectories 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                : 'bg-gray-800/90 text-gray-500 border-gray-700 hover:text-white'
            }`}
            title="Toggle Traiettorie"
          >
              <Waypoints size={20} className={showGlobalTrajectories ? 'animate-pulse' : ''} />
              <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-black/50 ${showGlobalTrajectories ? 'bg-emerald-400 animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-gray-600'}`}></div>
          </button>
          
          <div className="flex flex-col gap-2 pointer-events-auto">
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
                <div className="bg-emerald-500 text-black p-1.5 md:p-2 rounded-full shrink-0">
                   <UploadCloud size={20} className="md:w-6 md:h-6 animate-pulse" /> 
                </div>
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
              onClaim={(id) => { 
                  onClaim(id); 
                  setSelectedZone(null); 
              }}
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