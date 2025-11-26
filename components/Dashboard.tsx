import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Zone, InventoryItem } from '../types';
import { Play, ZoomIn, ZoomOut, Move, X, UploadCloud, MapPin, CheckCircle, Zap, Search, ShoppingBag, Clock, Shield, Globe } from 'lucide-react';

interface DashboardProps {
  user: User;
  zones: Zone[];
  onSyncRun: (data: { km: number, name: string }) => void;
  onClaim: (zoneId: string) => void;
  onBoost: (zoneId: string) => void;
  onDefend: (zoneId: string) => void;
}

// Hexagon Configuration
const HEX_SIZE = 100; // Increased size for better visibility

const Dashboard: React.FC<DashboardProps> = ({ user, zones, onSyncRun, onClaim, onBoost, onDefend }) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'ENEMY'>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');

  // Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [runForm, setRunForm] = useState({ location: '', km: '' });

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
      const match = z.name.match(/\(([A-Z]{2})\)$/);
      if (match && match[1]) {
        countrySet.add(match[1]);
      } else {
        countrySet.add('Other');
      }
    });
    return Array.from(countrySet).sort();
  }, [zones]);

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
     setShowSyncModal(true);
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     const km = parseFloat(runForm.km);
     
     if (isNaN(km) || km <= 0) {
        alert("Please enter valid kilometers");
        return;
     }

     if (!runForm.location.trim()) {
        alert("Please enter the location name");
        return;
     }

     onSyncRun({ km, name: runForm.location });

     setShowSyncModal(false);
     setRunForm({ location: '', km: '' });
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

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-gray-900 shadow-inner">
      
      {/* HUD - Top Stats Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col md:flex-row gap-3 pointer-events-none">
         <div className="bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700 shadow-xl flex items-center gap-3 pointer-events-auto">
             <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">RUN</span>
             <span className="font-mono text-emerald-400 font-bold">{user.runBalance.toFixed(2)}</span>
         </div>
         <div className="bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700 shadow-xl flex items-center gap-3 pointer-events-auto">
             <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">GOV</span>
             <span className="font-mono text-cyan-400 font-bold">{user.govBalance.toFixed(2)}</span>
         </div>
         {earningRate > 0 && (
            <div className="bg-emerald-900/50 backdrop-blur-md px-4 py-2 rounded-lg border border-emerald-500/30 shadow-xl flex items-center gap-2 pointer-events-auto">
                <span className="text-xs text-emerald-300 uppercase font-bold tracking-wider">Earning</span>
                <span className="font-mono text-white font-bold">~ RUN {earningRate.toFixed(1)}/min</span>
            </div>
         )}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="absolute top-20 left-4 z-20 w-80 bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl p-3 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                  type="text" 
                  placeholder="Find zone..." 
                  className="w-full bg-gray-900/80 text-white rounded-lg pl-9 pr-3 py-2 text-sm border border-gray-600 focus:border-emerald-500 focus:outline-none placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          
          {/* Nation Filter */}
          <div className="relative">
             <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
             <select 
               value={filterCountry}
               onChange={(e) => setFilterCountry(e.target.value)}
               className="w-full bg-gray-900/80 text-white rounded-lg pl-9 pr-3 py-2 text-sm border border-gray-600 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
             >
               <option value="ALL">All Nations</option>
               {countries.map(c => (
                 <option key={c} value={c}>{c}</option>
               ))}
             </select>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
              <button 
                  onClick={() => setFilterMode('ALL')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterMode === 'ALL' ? 'bg-gray-600 text-white' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-700'}`}
              >
                  ALL
              </button>
              <button 
                  onClick={() => setFilterMode('MINE')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterMode === 'MINE' ? 'bg-emerald-600 text-white' : 'bg-gray-900/50 text-gray-400 hover:bg-emerald-900/30'}`}
              >
                  MINE
              </button>
              <button 
                  onClick={() => setFilterMode('ENEMY')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterMode === 'ENEMY' ? 'bg-red-600 text-white' : 'bg-gray-900/50 text-gray-400 hover:bg-red-900/30'}`}
              >
                  ENEMY
              </button>
          </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-gray-800/90 backdrop-blur p-2 rounded-lg border border-gray-700 text-xs text-white flex flex-col gap-1 mb-2">
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded-sm shadow shadow-emerald-500/50"></div> My Zones</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-sm shadow shadow-red-500/50"></div> Enemy</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-400 rounded-sm shadow shadow-amber-500/50"></div> Boosted</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-400 rounded-sm shadow shadow-cyan-500/50"></div> Shielded</span>
          </div>

          <button onClick={zoomIn} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 shadow-lg"><ZoomIn size={20}/></button>
          <button onClick={zoomOut} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 shadow-lg"><ZoomOut size={20}/></button>
          <div className="p-2 bg-gray-800 text-gray-400 rounded-lg border border-gray-600 text-center" title="Pan Mode">
            <Move size={20} />
          </div>
      </div>

      {/* Sync Run Button (Main Action) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <button 
              onClick={() => openSyncModal()}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-full border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.7)]"
            >
                <UploadCloud size={24} /> 
                Sync Activity
            </button>
      </div>

      {/* SVG Map Canvas */}
      <div 
          className="absolute inset-0 cursor-move bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
      >
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%"
          className="touch-none"
        >
          <defs>
            {/* Vibrant Neon Gradient for User Zones */}
            <linearGradient id="grad-my-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#064e3b', stopOpacity: 0.9 }} /> {/* Deep Emerald */}
              <stop offset="60%" style={{ stopColor: '#10b981', stopOpacity: 0.85 }} /> {/* Vivid Emerald */}
              <stop offset="100%" style={{ stopColor: '#6ee7b7', stopOpacity: 0.9 }} /> {/* Bright Mint */}
            </linearGradient>
            
            {/* Vibrant Neon Gradient for Enemy Zones */}
            <linearGradient id="grad-enemy-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#450a0a', stopOpacity: 0.9 }} /> {/* Deep Red */}
              <stop offset="60%" style={{ stopColor: '#dc2626', stopOpacity: 0.85 }} /> {/* Vivid Red */}
              <stop offset="100%" style={{ stopColor: '#fca5a5', stopOpacity: 0.9 }} /> {/* Bright Coral */}
            </linearGradient>

            {/* GOLD Gradient for BOOSTED Zones */}
            <linearGradient id="grad-boosted-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#78350f', stopOpacity: 0.9 }} /> {/* Deep Amber */}
              <stop offset="60%" style={{ stopColor: '#d97706', stopOpacity: 0.9 }} /> {/* Vivid Amber */}
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0.95 }} /> {/* Bright Gold */}
            </linearGradient>

            {/* CYAN Gradient for SHIELDED Zones */}
            <linearGradient id="grad-shielded-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#164e63', stopOpacity: 0.9 }} /> {/* Deep Cyan */}
              <stop offset="60%" style={{ stopColor: '#0891b2', stopOpacity: 0.9 }} /> {/* Vivid Cyan */}
              <stop offset="100%" style={{ stopColor: '#67e8f9', stopOpacity: 0.95 }} /> {/* Bright Cyan */}
            </linearGradient>

            <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
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
                
                // Country Filter
                if (filterCountry !== 'ALL') {
                    if (filterCountry === 'Other') {
                        if (zone.name.match(/\([A-Z]{2}\)$/)) isMatch = false;
                    } else {
                        if (!zone.name.endsWith(`(${filterCountry})`)) isMatch = false;
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
                    {/* Glow effect for selected */}
                    {isSelected && isMatch && (
                      <polygon 
                        points={getHexPoints()} 
                        fill={strokeColor} 
                        opacity="0.2" 
                        filter="blur(20px)"
                        transform="scale(1.2)"
                      />
                    )}

                    {/* Extra Ring for Boosted Zones */}
                    {boosted && isMatch && (
                       <polygon 
                        points={getHexPoints()} 
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3"
                        opacity="0.6"
                        transform="scale(1.1)"
                        className="animate-pulse"
                      />
                    )}
                    
                    {/* Extra Ring for Shielded Zones */}
                    {shielded && isMatch && !boosted && (
                       <polygon 
                        points={getHexPoints()} 
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3"
                        opacity="0.6"
                        transform="scale(1.1)"
                        className="animate-pulse"
                      />
                    )}
                    
                    {/* Main Hexagon */}
                    <polygon
                      points={getHexPoints()}
                      fill={fillUrl}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 4 : 2}
                      strokeLinejoin="round"
                      className="transition-all duration-300 group-hover:brightness-125 group-hover:stroke-[3px] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                      style={{
                        // Apply extra glow via filter if selected
                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none'
                      }}
                    />
                    
                    {/* Inner Border Line (Tech Look) - Brighter on hover */}
                    <polygon
                       points={getHexPoints()}
                       fill="none"
                       stroke="rgba(255,255,255,0.2)"
                       strokeWidth="1"
                       transform="scale(0.85)"
                       className="transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:stroke-white/40"
                    />
                    
                    {/* Zone Content */}
                    <foreignObject 
                        x={-HEX_SIZE} 
                        y={-HEX_SIZE} 
                        width={HEX_SIZE * 2} 
                        height={HEX_SIZE * 2} 
                        pointerEvents="none"
                    >
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 leading-none pointer-events-none relative">
                          
                          {/* Name */}
                          <span className="text-sm font-black text-white uppercase tracking-wider drop-shadow-lg break-words w-4/5 mb-1 transition-transform duration-300 group-hover:scale-110" style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
                            {zone.name}
                          </span>

                          {/* Interest Rate */}
                          <span className={`text-lg font-bold text-white drop-shadow-md px-2 rounded-full border border-white/10 transition-colors duration-300 ${zone.ownerId === user.id ? (boosted ? 'bg-amber-600/80 border-amber-400' : (shielded ? 'bg-cyan-800/80 border-cyan-500' : 'bg-emerald-900/60')) : 'bg-red-900/60'}`}>
                            {zone.interestRate}%
                          </span>

                          {/* Status Icons (Centered Below %) */}
                          {(shielded || boosted) && (
                              <div className="flex items-center justify-center gap-1 mt-1">
                                {shielded && (
                                    <div className="bg-cyan-900/90 p-1.5 rounded-full border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse z-10">
                                        <Shield size={16} className="text-cyan-200 fill-cyan-400/30" />
                                    </div>
                                )}
                                {boosted && (
                                    <div className="bg-amber-900/90 p-1.5 rounded-full border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse z-10">
                                        <Zap size={16} className="text-amber-200 fill-amber-400/30" />
                                    </div>
                                )}
                              </div>
                          )}

                        </div>
                    </foreignObject>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>

      {/* Floating Zone Control Panel */}
      {selectedZone && (
        <div className="absolute bottom-24 right-6 w-80 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up z-30">
          <div className="relative p-5">
            <button 
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-xl text-white mb-1 pr-6 tracking-tight">{selectedZone.name}</h3>
            <p className="text-xs text-gray-500 font-mono mb-4 uppercase tracking-widest">Hex [{selectedZone.x}, {selectedZone.y}]</p>

            <div className="space-y-3 mb-6">
               <div className="flex justify-between text-sm bg-black/40 p-3 rounded-lg border border-white/5">
                 <span className="text-gray-400">Status</span>
                 <span className={`font-bold uppercase tracking-wider ${selectedZone.ownerId === user.id ? 'text-emerald-400' : 'text-red-400'}`}>
                   {selectedZone.ownerId === user.id ? 'Occupied (You)' : 'Hostile'}
                 </span>
               </div>
               {selectedZone.ownerId !== user.id && (
                 <div className="flex justify-between text-sm bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="text-gray-400">Owner</span>
                    <span className="text-white font-bold">{selectedZone.ownerId || 'Unknown'}</span>
                 </div>
               )}
               <div className="flex justify-between text-sm bg-black/40 p-3 rounded-lg border border-white/5">
                 <span className="text-gray-400">Yield Rate</span>
                 <div className="text-right">
                   <span className={`font-bold ${isBoostActive(selectedZone) ? 'text-amber-400' : 'text-cyan-400'}`}>
                     {selectedZone.interestRate}%
                   </span>
                   <span className="text-xs text-gray-500 font-normal block">/ day</span>
                 </div>
               </div>
               
               {/* Boost Timer Status */}
               {isBoostActive(selectedZone) && selectedZone.boostExpiresAt && (
                 <div className="flex items-center justify-between text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                   <span className="text-amber-400 flex items-center gap-1"><Clock size={14}/> Boosted</span>
                   <span className="text-amber-100 font-mono">
                     {(() => {
                        const mins = Math.max(0, Math.floor((selectedZone.boostExpiresAt - Date.now()) / 60000));
                        const hrs = Math.floor(mins / 60);
                        return `${hrs}h ${mins % 60}m`;
                     })()} left
                   </span>
                 </div>
               )}

               {/* Shield Timer Status */}
               {isShieldActive(selectedZone) && selectedZone.shieldExpiresAt && (
                 <div className="flex items-center justify-between text-sm bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/30">
                   <span className="text-cyan-400 flex items-center gap-1"><Shield size={14}/> Shield Active</span>
                   <span className="text-cyan-100 font-mono">
                     {(() => {
                        const mins = Math.max(0, Math.floor((selectedZone.shieldExpiresAt - Date.now()) / 60000));
                        const hrs = Math.floor(mins / 60);
                        return `${hrs}h ${mins % 60}m`;
                     })()} left
                   </span>
                 </div>
               )}

               <div className="flex justify-between text-sm bg-black/40 p-3 rounded-lg border border-white/5">
                 <span className="text-gray-400">Record</span>
                 <span className="text-white font-mono">{selectedZone.recordKm.toFixed(1)} km</span>
               </div>
            </div>

            <div className="space-y-3">
               {/* Context Actions based on Ownership */}
               {selectedZone.ownerId === user.id ? (
                  <>
                    <div className="flex gap-2">
                        {/* Boost Button */}
                        {!isBoostActive(selectedZone) ? (
                            <button 
                                onClick={() => onBoost(selectedZone.id)}
                                disabled={!boostItem}
                                className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border ${boostItem ? 'bg-amber-600 hover:bg-amber-500 border-amber-400/20 shadow-lg' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                                title={boostItem ? "Activate Boost" : "Need Boost Item"}
                            >
                                <Zap size={18} fill={boostItem ? "currentColor" : "none"} />
                                {boostItem ? "Boost" : "No Item"}
                            </button>
                        ) : (
                            <div className="flex-1 py-3 bg-gray-800 text-amber-500 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-500/20">
                                <Zap size={18} /> Active
                            </div>
                        )}

                        {/* Defense Button */}
                        {!isShieldActive(selectedZone) ? (
                            <button 
                                onClick={() => onDefend(selectedZone.id)}
                                disabled={!defenseItem}
                                className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border ${defenseItem ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400/20 shadow-lg' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                                title={defenseItem ? "Deploy Shield" : "Need Shield Item"}
                            >
                                <Shield size={18} fill={defenseItem ? "currentColor" : "none"} />
                                {defenseItem ? "Shield" : "No Item"}
                            </button>
                        ) : (
                             <div className="flex-1 py-3 bg-gray-800 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-cyan-500/20">
                                <Shield size={18} /> Active
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => openSyncModal(selectedZone)}
                        className="w-full py-3 bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-emerald-500/30"
                    >
                        <CheckCircle size={18} /> Reinforce Zone
                    </button>
                  </>
               ) : (
                  <>
                     <button 
                        onClick={() => onClaim(selectedZone.id)}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        Contest Ownership (50 RUN)
                    </button>
                    <button 
                        onClick={() => openSyncModal(selectedZone)}
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <MapPin size={18} /> Sync Run Here
                    </button>
                  </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Activity Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <UploadCloud className="text-emerald-400" /> Sync Activity
                </h3>
                <button onClick={() => setShowSyncModal(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
             </div>
             
             <form onSubmit={handleSyncSubmit} className="p-6 space-y-6">
                
                <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Where did you run?</label>
                       <input 
                          type="text" 
                          required
                          placeholder="e.g. Parco Sempione or New Street"
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none placeholder-gray-600"
                          value={runForm.location}
                          onChange={e => setRunForm({...runForm, location: e.target.value})}
                       />
                       <p className="text-xs text-gray-500 mt-2">
                           If this zone exists, you will reinforce/contest it. If it's new, you can mint it.
                       </p>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Distance (KM)</label>
                      <input 
                          type="number" 
                          step="0.1"
                          required
                          placeholder="5.0"
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none placeholder-gray-600"
                          value={runForm.km}
                          onChange={e => setRunForm({...runForm, km: e.target.value})}
                      />
                   </div>
                </div>

                <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                   <CheckCircle size={20} />
                   Process Run
                </button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;