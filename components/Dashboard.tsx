
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
  
  // Dragging State (Refs for performance and to avoid stale closures in memoized child)
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize to 0 to force density centering on mount even if data exists
  const prevZonesLengthRef = useRef(0);

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
          console.log(`[Dashboard Debug] 🟢 Zone Selected: "${selectedZone.name}" (ID: ${selectedZone.id})`);
          
          // Pass ID instead of Name for accurate lookup
          onGetZoneLeaderboard(selectedZone.id).then(data => {
              console.log(`[Dashboard Debug] 📥 Leaderboard Data Received for ${selectedZone.name}:`, data);
              setZoneLeaderboard(data);
          });
      } else {
          setZoneLeaderboard([]);
      }
  }, [selectedZone]);

  // --- Effects ---
  
  // DENSITY CENTERING ALGORITHM
  // Finds the cluster with the most zones and calculates its center
  const calculateDensityCenter = (currentZones: Zone[]) => {
      if (currentZones.length === 0) return null;

      // 1. Group zones into "buckets" (sectors of approx 5x5 hexes)
      const CLUSTER_SIZE = 5;
      const clusters: Record<string, Zone[]> = {};

      currentZones.forEach(z => {
          const key = `${Math.floor(z.x / CLUSTER_SIZE)},${Math.floor(z.y / CLUSTER_SIZE)}`;
          if (!clusters[key]) clusters[key] = [];
          clusters[key].push(z);
      });

      // 2. Find the cluster with the highest population
      let densestCluster: Zone[] = [];
      Object.values(clusters).forEach(c => {
          if (c.length > densestCluster.length) densestCluster = c;
      });

      // If broad dispersion, fallback to all zones
      const targetGroup = densestCluster.length > 0 ? densestCluster : currentZones;

      // 3. Calculate Average Axial Coordinate (Q, R) of that cluster
      let sumQ = 0, sumR = 0;
      targetGroup.forEach(z => {
          sumQ += z.x;
          sumR += z.y;
      });

      const avgQ = sumQ / targetGroup.length;
      const avgR = sumR / targetGroup.length;

      // 4. Convert to Pixel Coordinates
      const pos = getHexPixelPosition(avgQ, avgR, HEX_SIZE);
      
      return {
          x: window.innerWidth / 2 - pos.x * 0.8, // Using initial scale 0.8
          y: window.innerHeight / 2 - pos.y * 0.8
      };
  };

  useEffect(() => {
    // CASE A: First Load (Zones appear from 0 to N) -> Center on Density
    if (prevZonesLengthRef.current === 0 && zones.length > 0) {
        const center = calculateDensityCenter(zones);
        if (center) {
            setView(v => ({ ...v, x: center.x, y: center.y }));
        }
    }
    // CASE B: New Zone Minted (N -> N+1) -> Focus on the specific new zone
    else if (zones.length > prevZonesLengthRef.current) {
        const newZone = zones[zones.length - 1];
        const pos = getHexPixelPosition(newZone.x, newZone.y, HEX_SIZE);
        const newX = window.innerWidth / 2 - pos.x * view.scale;
        const newY = window.innerHeight / 2 - pos.y * view.scale;
        
        setView(v => ({ ...v, x: newX, y: newY }));
    }
    prevZonesLengthRef.current = zones.length;
  }, [zones]); // Removed view.scale dependency to avoid loops during init

  // --- Map Interactions ---
  // Note: Wheel zoom handler removed to restrict zooming to buttons only.

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
          isDragging.current = true;
          lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMousePos.current.x;
      const dy = e.touches[0].clientY - lastMousePos.current.y;
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
      isDragging.current = false;
  };

  const zoomIn = () => setView(v => ({ ...v, scale: Math.min(v.scale + 0.2, 2.5) }));
  const zoomOut = () => setView(v => ({ ...v, scale: Math.max(v.scale - 0.2, 0.3) }));

  // Center map on the "Empire Center" (Geometric center of all zones)
  const handleRecenter = () => {
      if (zones.length === 0) return;
      
      const center = calculateDensityCenter(zones);
      if (center) {
          setView(v => ({ ...v, x: center.x, y: center.y }));
      }
  };

  // --- Prep Render Data ---
  const ownerDetails = selectedZone ? getOwnerDetails(selectedZone.ownerId) : null;

  return (
    // Changed bg-gray-900 to bg-transparent to show global background
    <div className="relative w-full h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-transparent shadow-inner">
      
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

      <DashboardControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

      {/* Sync Run Button - Adjusted bottom position for mobile from 36 to 44 (approx 176px) to clear 2-row navbar */}
      <div className="absolute bottom-44 md:bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"></div>
            
            <button 
              onClick={onOpenSync}
              disabled
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
          onTouchEnd={handleTouchEnd}
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