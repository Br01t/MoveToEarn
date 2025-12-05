
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Zone, InventoryItem, ViewState, Badge, Rarity } from '../types';
import { Play, ZoomIn, ZoomOut, Move, X, UploadCloud, MapPin, CheckCircle, Zap, Search, ShoppingBag, Clock, Shield, Globe, Image as ImageIcon, Trash2, FileText, Crown, Loader, AlertTriangle, Lock, Filter, ChevronDown, ChevronUp, HelpCircle, Activity, History, Calendar, Medal, Award, Flag, Mountain, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users } from 'lucide-react';
import { PREMIUM_COST } from '../constants';
import Pagination from './Pagination';

interface DashboardProps {
  user: User;
  zones: Zone[];
  users: Record<string, any>; // Receiving full user list for leaderboard calculation
  badges: Badge[]; // Received for displaying owner badge
  onSyncRun: (data: { km: number, name: string }) => void;
  onClaim: (zoneId: string) => void;
  onBoost: (zoneId: string) => void;
  onDefend: (zoneId: string) => void;
  onNavigate: (view: ViewState) => void;
}

// Hexagon Configuration
const HEX_SIZE = 100; // Increased size for better visibility
const RUNS_PER_PAGE = 5;

const Dashboard: React.FC<DashboardProps> = ({ user, zones, users, badges, onSyncRun, onClaim, onBoost, onDefend, onNavigate }) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'ENEMY'>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile collapse state
  const [isLegendOpen, setIsLegendOpen] = useState(false); // Legend collapse state
  const [isLastRunOpen, setIsLastRunOpen] = useState(false); // Last Run collapse state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncTab, setSyncTab] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [uploadStep, setUploadStep] = useState<'SELECT' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [antiFraudLog, setAntiFraudLog] = useState<string[]>([]);
  
  // Form Data
  const [runForm, setRunForm] = useState({ location: '', km: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map View State
  const [view, setView] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Track previous zones length to detect additions
  const prevZonesLengthRef = useRef(zones.length);

  // Calculate earning rate for display
  const earningRate = zones
    .filter(z => z.ownerId === user.id)
    .reduce((acc, z) => acc + (0.5 * z.interestRate), 0) * 6; // Per minute estimate (since loop is 10s)

  // Find inventory items
  const boostItem: InventoryItem | undefined = user.inventory.find(i => i.type === 'BOOST');
  const defenseItem: InventoryItem | undefined = user.inventory.find(i => i.type === 'DEFENSE');

  // Extract available countries from zones
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    zones.forEach(z => {
      // Regex updated to match " - CC" format
      const match = z.name.match(/\-\s([A-Z]{2})$/);
      if (match && match[1]) {
        countrySet.add(match[1]);
      } else {
        countrySet.add('Other');
      }
    });
    return Array.from(countrySet).sort();
  }, [zones]);

  const lastRun = user.runHistory[0];

  // Pagination for History Modal
  const totalHistoryPages = Math.ceil(user.runHistory.length / RUNS_PER_PAGE);
  const currentHistoryRuns = user.runHistory.slice(
      (historyPage - 1) * RUNS_PER_PAGE,
      historyPage * RUNS_PER_PAGE
  );

  // --- Map Math Helpers ---
  const getHexPosition = (q: number, r: number) => {
    const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
    const y = HEX_SIZE * 3/2 * r;
    return { x, y };
  };

  // Helper to check boost status
  const isBoostActive = (zone: Zone) => {
    return zone.boostExpiresAt && zone.boostExpiresAt > Date.now();
  };

  // Helper to check shield status
  const isShieldActive = (zone: Zone) => {
    return zone.shieldExpiresAt && zone.shieldExpiresAt > Date.now();
  };

  // --- Zone Logic Helpers ---

  // Helper: Get Rarity Color for Badge
  const getRarityColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
          case 'EPIC': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
          case 'RARE': return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
          default: return 'text-gray-300 border-gray-600 bg-gray-800';
      }
  };

  // Helper: Render Badge Icon
  const renderBadgeIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Flag': return <Flag className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Award': return <Award className={className} />;
          case 'Zap': return <Zap className={className} />;
          case 'Mountain': return <Mountain className={className} />;
          case 'Globe': return <Globe className={className} />;
          case 'Home': return <Home className={className} />;
          case 'Landmark': return <Landmark className={className} />;
          case 'Swords': return <Swords className={className} />;
          case 'Footprints': return <Footprints className={className} />;
          case 'Rocket': return <Rocket className={className} />;
          case 'Tent': return <Tent className={className} />;
          case 'Timer': return <Timer className={className} />;
          case 'Building2': return <Building2 className={className} />;
          case 'Moon': return <Moon className={className} />;
          case 'Sun': return <Sun className={className} />;
          case 'ShieldCheck': return <ShieldCheck className={className} />;
          case 'Gem': return <Gem className={className} />;
          case 'Users': return <Users className={className} />;
          default: return <Award className={className} />;
      }
  };

  const getOwnerDetails = (ownerId: string | null) => {
      if (!ownerId) return { name: 'Unclaimed', avatar: null, badge: null };
      
      let userData;
      if (ownerId === user.id) {
          userData = user;
      } else {
          userData = users[ownerId];
      }

      if (!userData) return { name: 'Unknown', avatar: null, badge: null };

      const badge = userData.favoriteBadgeId ? badges.find(b => b.id === userData.favoriteBadgeId) : null;
      
      return { 
          name: userData.name, 
          avatar: userData.avatar,
          badge: badge
      };
  };

  const getZoneLeaderboard = (zoneName: string) => {
      // 1. Get current user's actual stats for this zone
      const myRuns = user.runHistory.filter(r => r.location === zoneName);
      const myTotalKm = myRuns.reduce((acc, r) => acc + r.km, 0);

      // 2. Generate simulated stats for other users (mock data)
      // In a real app, this would query the backend.
      const leaderboard = Object.values(users).map((u: any) => {
          if (u.id === user.id) {
              return { id: u.id, name: u.name, avatar: u.avatar, km: myTotalKm };
          } else {
              // Deterministic random KM based on user ID and zone name to keep it consistent but varied
              const seed = (u.id.charCodeAt(u.id.length - 1) + zoneName.length) % 100;
              const fakeKm = (u.totalKm * (seed / 100)) / 5; // A fraction of their total km
              return { id: u.id, name: u.name, avatar: u.avatar, km: fakeKm };
          }
      });

      // 3. Sort descending
      return leaderboard.sort((a, b) => b.km - a.km).slice(0, 10);
  };

  // --- Effects ---

  // Auto-center camera when a new zone is added
  useEffect(() => {
    if (zones.length > prevZonesLengthRef.current) {
        // A new zone was added!
        const newZone = zones[zones.length - 1];
        
        // Find its pixel position
        const pos = getHexPosition(newZone.x, newZone.y);
        
        // Center the view on this new zone
        const newX = window.innerWidth / 2 - pos.x * view.scale;
        const newY = window.innerHeight / 2 - pos.y * view.scale;

        setView(v => ({ ...v, x: newX, y: newY }));
        setSelectedZone(newZone); // Auto select it
    }
    prevZonesLengthRef.current = zones.length;
  }, [zones, view.scale]);

  // --- Handlers ---

  const openSyncModal = (zone?: Zone) => {
     if (zone) {
       setRunForm({ 
         location: zone.name, 
         km: ''
       });
     } else {
       setRunForm({ location: '', km: '' });
     }
     setSyncTab(user.isPremium ? 'PREMIUM' : 'FREE');
     setUploadStep('SELECT');
     setSelectedFile(null);
     setAntiFraudLog([]);
     setShowSyncModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartUpload = () => {
    if (!selectedFile || !runForm.km || !runForm.location) {
        alert("Please fill in all fields and attach a file.");
        return;
    }
    setUploadStep('UPLOADING');
    
    // Simulate File Upload
    setTimeout(() => {
        setUploadStep('PROCESSING');
        // Simulate Logs
        runLogSequence();
    }, 1500);
  };

  const runLogSequence = () => {
      const logs = [
          "Parsing .GPX file structure...",
          "Validating GPS timestamps...",
          "Checking velocity anomalies...",
          "Verifying elevation gain...",
          "Cross-referencing Zone Database...",
          "Calculation: OK"
      ];
      
      let i = 0;
      const interval = setInterval(() => {
          setAntiFraudLog(prev => [...prev, logs[i]]);
          i++;
          if (i >= logs.length) {
              clearInterval(interval);
              setTimeout(() => {
                  setUploadStep('SUCCESS');
              }, 800);
          }
      }, 800);
  };

  const handleFinalSubmit = () => {
     const km = parseFloat(runForm.km);
     onSyncRun({ km, name: runForm.location });
     setShowSyncModal(false);
  };

  // --- Map Interaction Handlers ---

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

  // Mobile Touch Handling for Map Dragging
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

  const handleTouchEnd = () => setIsDragging(false);


  const zoomIn = () => setView(v => ({ ...v, scale: Math.min(v.scale + 0.2, 2.5) }));
  const zoomOut = () => setView(v => ({ ...v, scale: Math.max(v.scale - 0.2, 0.3) }));

  // --- Hexagon Render Helpers ---

  const getHexPoints = () => {
    const angles = [30, 90, 150, 210, 270, 330];
    return angles.map(angle => {
      const rad = (Math.PI / 180) * angle;
      return `${HEX_SIZE * Math.cos(rad)},${HEX_SIZE * Math.sin(rad)}`;
    }).join(' ');
  };

  const getFillId = (zone: Zone) => {
      if (isBoostActive(zone)) return "url(#grad-boosted-zone)";
      if (isShieldActive(zone)) return "url(#grad-shielded-zone)"; 
      if (zone.ownerId === user.id) return "url(#grad-my-zone)";
      return "url(#grad-enemy-zone)";
  };

  const getStrokeColor = (zone: Zone) => {
    if (isBoostActive(zone)) return '#f59e0b'; // Amber/Gold
    if (isShieldActive(zone)) return '#06b6d4'; // Cyan/Blue
    if (zone.ownerId === user.id) return '#34d399'; // Emerald
    return '#f87171'; // Red
  };

  // --- Prep Render Data for selected zone ---
  const ownerDetails = selectedZone ? getOwnerDetails(selectedZone.ownerId) : null;
  const zoneLeaderboard = selectedZone ? getZoneLeaderboard(selectedZone.name) : [];
  const topRunner = zoneLeaderboard.length > 0 ? zoneLeaderboard[0] : null;
  const isTopRunner = topRunner ? topRunner.id === user.id : false;
  const kmToTop = topRunner && !isTopRunner ? (topRunner.km - (zoneLeaderboard.find(u => u.id === user.id)?.km || 0)) : 0;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-gray-900 shadow-inner">
      
      {/* HUD - Stats (Compact on Mobile) */}
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
                <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Yield</span>
                <span className="font-mono text-white font-bold text-sm">~{earningRate.toFixed(1)}/m</span>
            </div>
         )}
      </div>

      {/* LEFT TOOLBAR: SEARCH & LAST RUN */}
      <div className="absolute top-14 left-2 z-20 flex flex-col gap-2 items-start pointer-events-none">
          
          {/* 1. SEARCH TOGGLE */}
          <div className={`flex flex-col items-start transition-all duration-300 pointer-events-auto ${isFilterOpen ? 'w-64 z-50' : 'w-10 z-40'}`}>
            <button 
                onClick={() => {
                    setIsFilterOpen(!isFilterOpen);
                    if (isLastRunOpen) setIsLastRunOpen(false); // Close other menu
                }} 
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
                            placeholder="Search zone..." 
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
                        <button onClick={() => setFilterMode('ALL')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${filterMode === 'ALL' ? 'bg-gray-600 text-white' : 'bg-gray-900 text-gray-400'}`}>ALL</button>
                        <button onClick={() => setFilterMode('MINE')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${filterMode === 'MINE' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400'}`}>MINE</button>
                        <button onClick={() => setFilterMode('ENEMY')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${filterMode === 'ENEMY' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400'}`}>ENEMY</button>
                    </div>
                </div>
            )}
          </div>

          {/* 2. LAST RUN TOGGLE */}
          {lastRun && (
             <div className="relative pointer-events-auto z-30">
                 <button 
                    onClick={() => {
                        setIsLastRunOpen(!isLastRunOpen);
                        if (isFilterOpen) setIsFilterOpen(false); // Close other menu
                    }}
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
                            onClick={() => {
                                setIsLastRunOpen(false);
                                setHistoryPage(1);
                                setShowHistoryModal(true);
                            }}
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
          {/* Legend Toggle */}
          <div className="relative flex flex-col items-end">
             <button onClick={() => setIsLegendOpen(!isLegendOpen)} className="p-2 bg-gray-800/90 text-gray-400 rounded-lg border border-gray-700 shadow-lg mb-2">
                 <Filter size={20} />
             </button>
             {isLegendOpen && (
                 <div className="bg-gray-800/90 backdrop-blur p-2 rounded-lg border border-gray-700 text-[10px] text-white flex flex-col gap-1 w-28 animate-fade-in">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-sm"></div> My Zones</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-sm"></div> Enemy</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-400 rounded-sm"></div> Boosted</span>
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-sm"></div> Shielded</span>
                 </div>
             )}
          </div>

          {/* Zoom Buttons */}
          <button onClick={zoomIn} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 shadow-lg"><ZoomIn size={20}/></button>
          <button onClick={zoomOut} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 shadow-lg"><ZoomOut size={20}/></button>
      </div>

      {/* Sync Run Button (Main Floating Action) */}
      <div className="absolute bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center">
            {/* Radar Ping Animation */}
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"></div>
            
            <button 
              onClick={() => openSyncModal()}
              className="relative group flex items-center gap-3 px-8 py-4 bg-gray-900/90 backdrop-blur-xl border-2 border-emerald-400 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:border-emerald-300 hover:scale-105 transition-all duration-300"
            >
                <div className="bg-emerald-500 text-black p-2 rounded-full">
                   <UploadCloud size={24} className="animate-pulse" /> 
                </div>
                <div className="flex flex-col items-start">
                   <span className="text-emerald-400 font-black text-xs uppercase tracking-widest leading-none mb-0.5">Sync</span>
                   <span className="text-white font-bold text-lg leading-none">Activity</span>
                </div>
            </button>
      </div>

      {/* SVG Map Canvas */}
      <div 
          className="absolute inset-0 cursor-move bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
      >
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%"
          className="touch-none select-none"
        >
          <defs>
            <linearGradient id="grad-my-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#064e3b', stopOpacity: 0.9 }} />
              <stop offset="60%" style={{ stopColor: '#10b981', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#6ee7b7', stopOpacity: 0.9 }} />
            </linearGradient>
            
            <linearGradient id="grad-enemy-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#450a0a', stopOpacity: 0.9 }} />
              <stop offset="60%" style={{ stopColor: '#dc2626', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: '#fca5a5', stopOpacity: 0.9 }} />
            </linearGradient>

            <linearGradient id="grad-boosted-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#78350f', stopOpacity: 0.9 }} />
              <stop offset="60%" style={{ stopColor: '#d97706', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0.95 }} />
            </linearGradient>

            <linearGradient id="grad-shielded-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#164e63', stopOpacity: 0.9 }} />
              <stop offset="60%" style={{ stopColor: '#0891b2', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#67e8f9', stopOpacity: 0.95 }} />
            </linearGradient>
          </defs>

          <g transform={`translate(${view.x},${view.y}) scale(${view.scale})`}>
              {zones.map((zone) => {
                const pos = getHexPosition(zone.x, zone.y);
                const isSelected = selectedZone?.id === zone.id;
                const boosted = isBoostActive(zone);
                const shielded = isShieldActive(zone);
                const strokeColor = getStrokeColor(zone);
                const fillUrl = getFillId(zone);

                // --- Filtering Logic ---
                let isMatch = true;
                if (filterMode === 'MINE' && zone.ownerId !== user.id) isMatch = false;
                if (filterMode === 'ENEMY' && zone.ownerId === user.id) isMatch = false;
                
                if (filterCountry !== 'ALL') {
                    if (filterCountry === 'Other') {
                        if (zone.name.match(/\-\s[A-Z]{2}$/)) isMatch = false;
                    } else {
                        if (!zone.name.endsWith(` - ${filterCountry}`)) isMatch = false;
                    }
                }

                if (searchTerm && !zone.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    isMatch = false;
                }

                return (
                  <g 
                    key={zone.id} 
                    transform={`translate(${pos.x},${pos.y})`}
                    onClick={(e) => { e.stopPropagation(); setSelectedZone(zone); }}
                    className={`transition-all duration-300 group ${isMatch ? 'cursor-pointer' : 'pointer-events-none'}`}
                    style={{ opacity: isMatch ? (isSelected ? 1 : 0.9) : 0.05, filter: isMatch ? 'none' : 'grayscale(100%)' }}
                  >
                    {isSelected && isMatch && (
                      <polygon points={getHexPoints()} fill={strokeColor} opacity="0.2" filter="blur(20px)" transform="scale(1.2)"/>
                    )}

                    {boosted && isMatch && (
                       <polygon points={getHexPoints()} fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.6" transform="scale(1.1)" className="animate-pulse"/>
                    )}
                    {shielded && isMatch && !boosted && (
                       <polygon points={getHexPoints()} fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.6" transform="scale(1.1)" className="animate-pulse"/>
                    )}
                    
                    <polygon
                      points={getHexPoints()}
                      fill={fillUrl}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 4 : 2}
                      strokeLinejoin="round"
                      className="transition-all duration-300 group-hover:brightness-125 group-hover:stroke-[3px] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                      style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none' }}
                    />
                    
                    <polygon points={getHexPoints()} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" transform="scale(0.85)" className="transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:stroke-white/40"/>
                    
                    <foreignObject x={-HEX_SIZE} y={-HEX_SIZE} width={HEX_SIZE * 2} height={HEX_SIZE * 2} pointerEvents="none">
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 leading-none pointer-events-none relative gap-2">
                          <div className="flex items-center justify-center w-full">
                             <span className="text-xs sm:text-sm font-black text-white tracking-wider drop-shadow-lg leading-tight whitespace-normal break-words max-w-[150px] transition-transform duration-300 group-hover:scale-105" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                               {zone.name}
                             </span>
                          </div>

                          <div className="flex flex-col items-center justify-center w-full">
                             <div className="flex justify-center w-full mb-2">
                                <span className={`text-lg font-bold text-white drop-shadow-md px-2 py-0.5 rounded-full border border-white/20 transition-colors duration-300 ${zone.ownerId === user.id ? (boosted ? 'bg-amber-600/90 border-amber-400' : (shielded ? 'bg-cyan-800/90 border-cyan-500' : 'bg-emerald-900/80')) : 'bg-red-900/80'}`}>
                                  {zone.interestRate}%
                                </span>
                              </div>
                              {(shielded || boosted) && (
                                  <div className="flex items-center justify-center gap-2 h-8">
                                    {shielded && (
                                        <div className="bg-cyan-950 p-1.5 rounded-full border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse z-10">
                                            <Shield size={24} className="text-cyan-100 fill-cyan-400/50" />
                                        </div>
                                    )}
                                    {boosted && (
                                        <div className="bg-amber-950 p-1.5 rounded-full border border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse z-10">
                                            <Zap size={24} className="text-amber-100 fill-amber-400/50" />
                                        </div>
                                    )}
                                  </div>
                              )}
                          </div>
                        </div>
                    </foreignObject>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>

      {/* ZONE DETAILS PANEL - Bottom Sheet Style on Mobile */}
      {selectedZone && ownerDetails && (
        <div 
          className="fixed bottom-[56px] md:bottom-24 md:right-6 md:left-auto left-0 right-0 md:w-80 bg-gray-900/95 md:rounded-2xl rounded-t-2xl border-t md:border border-emerald-500/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up z-40 max-h-[70vh] flex flex-col"
        >
          <div className="relative p-5 flex flex-col h-full overflow-hidden">
            <button 
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h3 className="font-bold text-lg md:text-xl text-white mb-4 pr-6 tracking-tight break-words">{selectedZone.name}</h3>
            
            <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-hide">
                {/* --- Owner Info --- */}
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                    <div className="relative shrink-0">
                        <img 
                            src={ownerDetails.avatar || `https://ui-avatars.com/api/?name=${ownerDetails.name}&background=10b981&color=fff`} 
                            className="w-10 h-10 rounded-full border border-gray-600 object-cover" 
                            alt="Owner"
                        />
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-0.5 rounded-full">
                            <Crown size={8} />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">Zone Controller</div>
                        <div className="flex items-center gap-2">
                           <div className={`font-bold text-sm truncate ${selectedZone.ownerId === user.id ? 'text-emerald-400' : 'text-white'}`}>
                                {ownerDetails.name} {selectedZone.ownerId === user.id && '(You)'}
                           </div>
                           {/* Owner Badge */}
                           {ownerDetails.badge && (
                               <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] ${getRarityColor(ownerDetails.badge.rarity)}`} title={ownerDetails.badge.name}>
                                   {renderBadgeIcon(ownerDetails.badge.icon, "w-3 h-3")}
                               </div>
                           )}
                        </div>
                    </div>
                </div>

                {/* --- Stats Grid --- */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-center">
                         <div className="text-xs text-gray-400">Yield</div>
                         <div className={`font-bold ${isBoostActive(selectedZone) ? 'text-amber-400' : 'text-cyan-400'}`}>
                             {selectedZone.interestRate}%
                         </div>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-center">
                         <div className="text-xs text-gray-400">Status</div>
                         <div className={`font-bold text-xs uppercase pt-1 ${selectedZone.ownerId === user.id ? 'text-emerald-500' : 'text-red-500'}`}>
                             {selectedZone.ownerId === user.id ? 'Occupied' : 'Hostile'}
                         </div>
                    </div>
                </div>

                {isBoostActive(selectedZone) && selectedZone.boostExpiresAt && (
                 <div className="flex items-center justify-between text-sm bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                   <span className="text-amber-400 flex items-center gap-1 text-xs"><Clock size={12}/> Boosted</span>
                   <span className="text-amber-100 font-mono text-xs">
                     {Math.floor((selectedZone.boostExpiresAt - Date.now()) / 60000)}m left
                   </span>
                 </div>
                )}

                {isShieldActive(selectedZone) && selectedZone.shieldExpiresAt && (
                 <div className="flex items-center justify-between text-sm bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
                   <span className="text-cyan-400 flex items-center gap-1 text-xs"><Shield size={12}/> Shielded</span>
                   <span className="text-cyan-100 font-mono text-xs">
                     {Math.floor((selectedZone.shieldExpiresAt - Date.now()) / 60000)}m left
                   </span>
                 </div>
                )}

                {/* --- Zone Leaderboard --- */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                        <Medal size={12} className="text-yellow-500"/> Top Runners Here
                    </h4>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                        {zoneLeaderboard.map((runner, index) => (
                            <div key={runner.id} className={`flex items-center justify-between text-xs p-1 rounded transition-colors ${runner.id === user.id ? 'bg-emerald-900/20' : 'hover:bg-white/5'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`w-4 text-center font-bold ${index === 0 ? 'text-yellow-400' : (index === 1 ? 'text-gray-300' : (index === 2 ? 'text-amber-600' : 'text-gray-600'))}`}>
                                        {index + 1}
                                    </span>
                                    <img src={runner.avatar} className="w-5 h-5 rounded-full bg-gray-700 object-cover" alt={runner.name}/>
                                    <span className={`${runner.id === user.id ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                                        {runner.name}
                                    </span>
                                </div>
                                <div className="font-mono text-gray-400">
                                    {runner.km.toFixed(1)} km
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 mt-2 border-t border-gray-800 shrink-0">
               {/* 
                 Owner Logic: Boost / Shield 
                 Contest Logic: Only if King of the Hill (#1 in local leaderboard)
               */}
               {selectedZone.ownerId === user.id ? (
                    <div className="flex gap-2">
                          {!isBoostActive(selectedZone) ? (
                              <button 
                                  onClick={() => onBoost(selectedZone.id)}
                                  disabled={!boostItem}
                                  className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border text-xs md:text-sm ${boostItem ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gray-800 opacity-50'}`}
                              >
                                  <Zap size={16} /> Boost
                              </button>
                          ) : (
                              <div className="flex-1 py-3 bg-gray-800 text-amber-500 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-500/20 text-xs md:text-sm"><Zap size={16} /> Active</div>
                          )}

                          {!isShieldActive(selectedZone) ? (
                              <button 
                                  onClick={() => onDefend(selectedZone.id)}
                                  disabled={!defenseItem}
                                  className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border text-xs md:text-sm ${defenseItem ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-800 opacity-50'}`}
                              >
                                  <Shield size={16} /> Shield
                              </button>
                          ) : (
                              <div className="flex-1 py-3 bg-gray-800 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-cyan-500/20 text-xs md:text-sm"><Shield size={16} /> Active</div>
                          )}
                    </div>
               ) : (
                  // Not Owner
                  <>
                     {isTopRunner ? (
                         <button 
                             onClick={() => onClaim(selectedZone.id)}
                             className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                         >
                             <Swords size={18} /> Claim Ownership (50 RUN)
                         </button>
                     ) : (
                         <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center">
                             <div className="text-red-400 font-bold text-xs uppercase mb-1 flex items-center justify-center gap-2">
                                <Lock size={12}/> Locked
                             </div>
                             <p className="text-gray-400 text-xs leading-tight">
                                Run <strong>{kmToTop > 0 ? kmToTop.toFixed(1) : 0.1} km</strong> more in this zone to surpass the leader and enable conquest.
                             </p>
                         </div>
                     )}
                  </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Activity Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-t-2xl md:rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
             
             {/* Header */}
             <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <UploadCloud className="text-emerald-400" /> Sync Activity
                </h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onNavigate('HOW_TO_PLAY')}
                        className="text-gray-400 hover:text-emerald-400 text-xs flex items-center gap-1 mr-2"
                        title="Guide"
                    >
                        <HelpCircle size={16} /> Help
                    </button>
                    <button onClick={() => setShowSyncModal(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
             </div>
             
             {/* Tabs */}
             <div className="flex border-b border-gray-700">
                <button 
                  onClick={() => { setSyncTab('FREE'); setUploadStep('SELECT'); }}
                  className={`flex-1 py-3 font-bold text-sm transition-colors ${syncTab === 'FREE' ? 'bg-gray-800 text-emerald-400 border-b-2 border-emerald-400' : 'bg-gray-900 text-gray-500'}`}
                >
                    Manual Upload
                </button>
                <button 
                  onClick={() => setSyncTab('PREMIUM')}
                  className={`flex-1 py-3 font-bold text-sm transition-colors flex justify-center items-center gap-2 ${syncTab === 'PREMIUM' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'bg-gray-900 text-gray-500'}`}
                >
                    <Crown size={14} /> Auto-Sync
                </button>
             </div>
             
             {/* Content */}
             <div className="p-6 overflow-y-auto">
                {/* --- FREE TAB: Manual File Upload --- */}
                {syncTab === 'FREE' && (
                    <>
                        {uploadStep === 'SELECT' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Upload Run Data</label>
                                    <input 
                                        type="file" 
                                        accept=".gpx,.tcx,.fit,.zip" 
                                        hidden 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                    />
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full border-2 border-dashed rounded-lg p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group ${selectedFile ? 'border-emerald-500 bg-emerald-900/10' : 'border-gray-600 hover:border-emerald-400 hover:bg-gray-800'}`}
                                    >
                                        <FileText className={`mb-3 ${selectedFile ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-300'}`} size={32} />
                                        {selectedFile ? (
                                            <div className="text-center">
                                                <span className="text-white font-bold block text-sm">{selectedFile.name}</span>
                                                <span className="text-xs text-emerald-400">Ready to parse</span>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <span className="text-gray-300 block mb-1 text-sm">Click to Select File</span>
                                                <span className="text-xs text-gray-500">Supports .GPX, .TCX, .FIT, .ZIP</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Parco Sempione"
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none text-sm"
                                            value={runForm.location}
                                            onChange={e => setRunForm({...runForm, location: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Distance (KM)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            placeholder="5.0"
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none text-sm"
                                            value={runForm.km}
                                            onChange={e => setRunForm({...runForm, km: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleStartUpload}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <UploadCloud size={20} /> Analyze & Upload
                                </button>
                            </div>
                        )}

                        {(uploadStep === 'UPLOADING' || uploadStep === 'PROCESSING') && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-700 border-t-emerald-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Shield className="text-emerald-400" size={20} />
                                    </div>
                                </div>
                                
                                <div className="w-full bg-black/50 rounded-lg p-4 font-mono text-xs text-emerald-400 h-32 overflow-hidden border border-gray-700 flex flex-col justify-end">
                                    {antiFraudLog.map((log, i) => (
                                        <div key={i} className="animate-fade-in"> {log}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uploadStep === 'SUCCESS' && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-slide-up">
                                <div className="bg-emerald-500/20 p-6 rounded-full border-2 border-emerald-500">
                                    <CheckCircle size={48} className="text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">Verification Complete</h3>
                                    <p className="text-gray-400 text-sm">Run data validated successfully.</p>
                                </div>
                                <button 
                                    onClick={handleFinalSubmit}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors"
                                >
                                    Confirm & Claim Rewards
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* --- PREMIUM TAB: Auto-Sync --- */}
                {syncTab === 'PREMIUM' && (
                    <div className="space-y-6 py-4">
                        {!user.isPremium ? (
                            <div className="text-center space-y-6">
                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center">
                                    <div className="bg-gray-800 p-4 rounded-full mb-4">
                                        <Lock size={32} className="text-gray-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">Premium Feature Locked</h4>
                                    <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto">
                                        Automatic Strava syncing is available for Pro Agents only. Skip the manual upload and get priority validation.
                                    </p>
                                    <button className="w-full py-4 bg-gray-700 text-gray-400 font-bold rounded-xl cursor-not-allowed text-sm">
                                        Requires Premium Subscription
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-900/50 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#FC4C02] p-2 rounded text-white font-bold text-xs">STRAVA</div>
                                        <div>
                                            <div className="text-white font-bold text-sm">Connected</div>
                                            <div className="text-xs text-emerald-400 flex items-center gap-1">
                                                <CheckCircle size={10} /> Sync Active
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                   <p className="text-sm text-gray-400 font-bold uppercase">Recent Activity found:</p>
                                   <div 
                                      className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:border-emerald-500 transition-colors"
                                      onClick={() => {
                                          setRunForm({ location: 'Parco Sempione', km: '5.2' });
                                          setSyncTab('FREE');
                                          setUploadStep('SUCCESS');
                                      }}
                                   >
                                       <div>
                                           <div className="text-white font-bold text-sm">Morning Run</div>
                                           <div className="text-xs text-gray-400">Today, 07:30 AM</div>
                                       </div>
                                       <div className="text-right">
                                           <div className="text-emerald-400 font-mono font-bold text-sm">5.2 km</div>
                                           <div className="text-xs text-gray-500">Parco Sempione</div>
                                       </div>
                                   </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* History Modal */}
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
                  {/* Pagination Footer */}
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