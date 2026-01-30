import React, { forwardRef, useEffect, useState, useRef, useMemo } from 'react';
import { Zone, User } from '../../types';
import { getHexPixelPosition } from '../../utils/geo';
import { Zap, Shield, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Info, Footprints, Swords, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface HexMapProps {
  zones: Zone[];
  user: User;
  view: { x: number; y: number; scale: number };
  selectedZoneId: string | null;
  onZoneClick: (zone: Zone) => void;
  filterMode: 'ALL' | 'MINE' | 'ENEMY';
  filterCountry: string;
  searchTerm: string;
  showGlobalTrajectories?: boolean;
  showOnlyVisited?: boolean;
  visitedZoneIds?: Set<string>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

const HEX_SIZE = 100;

const HexMapComponent = forwardRef<SVGSVGElement, HexMapProps>(({ 
    zones, user, view, selectedZoneId, onZoneClick, 
    filterMode, filterCountry, searchTerm, showGlobalTrajectories,
    showOnlyVisited, visitedZoneIds,
    onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd
}, ref) => {
  const { t } = useLanguage();
  const [recentlyClaimed, setRecentlyClaimed] = useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const prevOwnersRef = useRef<Record<string, string | null>>({});

  // Calcolo delle distanze personali per zona per identificare conquiste possibili o rischi
  const userDistMap = useMemo(() => {
    const dists = new Map<string, number>();
    user.runHistory.forEach(run => {
        if (run.zoneBreakdown) {
            Object.entries(run.zoneBreakdown).forEach(([id, km]) => {
                dists.set(id, (dists.get(id) || 0) + Number(km));
            });
        }
    });
    return dists;
  }, [user.runHistory]);

  useEffect(() => {
    const newClaims = new Set<string>();
    zones.forEach(z => {
      const prev = prevOwnersRef.current[z.id];
      if (prev !== undefined && prev !== z.ownerId) {
        newClaims.add(z.id);
      }
      prevOwnersRef.current[z.id] = z.ownerId;
    });

    if (newClaims.size > 0) {
      setRecentlyClaimed(prev => {
          const next = new Set(prev);
          newClaims.forEach(id => next.add(id));
          return next;
      });
      setTimeout(() => {
        setRecentlyClaimed(prev => {
            const next = new Set(prev);
            newClaims.forEach(id => next.delete(id));
            return next;
        });
      }, 2000);
    }
  }, [zones]);

  const compassState = useMemo(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const minWorldX = (0 - view.x) / view.scale;
    const maxWorldX = (width - view.x) / view.scale;
    const minWorldY = (0 - view.y) / view.scale;
    const maxWorldY = (height - view.y) / view.scale;

    const state = { north: false, south: false, east: false, west: false };
    const TRIGGER_THRESHOLD = 5 / view.scale;

    zones.forEach(z => {
        if (showOnlyVisited && visitedZoneIds && !visitedZoneIds.has(z.id)) return;

        const pos = getHexPixelPosition(z.x, z.y, HEX_SIZE);
        const distN = minWorldY - pos.y; 
        const distS = pos.y - maxWorldY; 
        const distW = minWorldX - pos.x; 
        const distE = pos.x - maxWorldX; 

        if (distN > TRIGGER_THRESHOLD) state.north = true;
        if (distS > TRIGGER_THRESHOLD) state.south = true;
        if (distW > TRIGGER_THRESHOLD) state.west = true;
        if (distE > TRIGGER_THRESHOLD) state.east = true;
    });

    return state;
  }, [zones, view.x, view.y, view.scale, showOnlyVisited, visitedZoneIds]);

  const getOwnerAttributes = (id: string | null) => {
    if (!id) return { color: 'rgba(255,255,255,0.1)', speed: 1.0 };
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 7) - hash);
    }
    const absHash = Math.abs(hash);

    if (id === user.id) return { color: '#10b981', speed: 0.8 };

    const hue = (absHash * 137.508) % 360;
    const saturation = 70 + ((absHash % 4) * 10);
    const lightness = 45 + ((absHash % 3) * 10);

    const speed = 0.6 + ((absHash % 10) * 0.2);

    return { 
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`, 
        speed: parseFloat(speed.toFixed(1)) 
    };
  };

  const flightPaths = useMemo(() => {
      const connections: { d: string, key: string, color: string, speed: number, isMine: boolean }[] = [];
      const processedPairs = new Set<string>(); 

      if (showOnlyVisited && visitedZoneIds && visitedZoneIds.size > 1) {
          const visitedZones = zones.filter(z => visitedZoneIds.has(z.id));
          
          visitedZones.forEach(startZone => {
              const startPos = getHexPixelPosition(startZone.x, startZone.y, HEX_SIZE);
              const neighbors = visitedZones
                  .filter(z => z.id !== startZone.id)
                  .map(endZone => {
                      const endPos = getHexPixelPosition(endZone.x, endZone.y, HEX_SIZE);
                      const dist = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
                      return { zone: endZone, dist, pos: endPos };
                  })
                  .sort((a, b) => a.dist - b.dist);

              neighbors.slice(0, 2).forEach(target => {
                  const pairKey = `exp-${[startZone.id, target.zone.id].sort().join('-')}`;
                  if (!processedPairs.has(pairKey)) {
                      processedPairs.add(pairKey);
                      const midX = (startPos.x + target.pos.x) / 2;
                      const midY = (startPos.y + target.pos.y) / 2;
                      const altitude = 100 + (target.dist * 0.2); 
                      const pathData = `M ${startPos.x} ${startPos.y} Q ${midX} ${midY - altitude} ${target.pos.x} ${target.pos.y}`;
                      connections.push({ d: pathData, key: pairKey, color: '#10b981', speed: 0.7, isMine: true });
                  }
              });
          });
      } else {
          const ownersMap: Record<string, Zone[]> = {};
          zones.forEach(z => {
              if (!z.ownerId) return;
              if (!ownersMap[z.ownerId]) ownersMap[z.ownerId] = [];
              ownersMap[z.ownerId].push(z);
          });

          Object.entries(ownersMap).forEach(([ownerId, ownerZones]) => {
              const isMine = ownerId === user.id;
              if (!showGlobalTrajectories && !isMine) return;
              if (ownerZones.length < 2) return;

              const attrs = getOwnerAttributes(ownerId);
              ownerZones.forEach(startZone => {
                  const startPos = getHexPixelPosition(startZone.x, startZone.y, HEX_SIZE);
                  const neighbors = ownerZones
                      .filter(z => z.id !== startZone.id)
                      .map(endZone => {
                          const endPos = getHexPixelPosition(endZone.x, endZone.y, HEX_SIZE);
                          const dist = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
                          return { zone: endZone, dist, pos: endPos };
                      })
                      .sort((a, b) => a.dist - b.dist); 

                  neighbors.slice(0, 2).forEach(target => {
                      const pairKey = [startZone.id, target.zone.id].sort().join('-');
                      if (!processedPairs.has(pairKey)) {
                          processedPairs.add(pairKey);
                          const midX = (startPos.x + target.pos.x) / 2;
                          const midY = (startPos.y + target.pos.y) / 2;
                          const altitude = 100 + (target.dist * 0.2); 
                          const pathData = `M ${startPos.x} ${startPos.y} Q ${midX} ${midY - altitude} ${target.pos.x} ${target.pos.y}`;
                          connections.push({ d: pathData, key: pairKey, color: attrs.color, speed: attrs.speed, isMine });
                      }
                  });
              });
          });
      }
      return connections;
  }, [zones, user.id, showGlobalTrajectories, showOnlyVisited, visitedZoneIds]);

  const getHexPoints = () => {
    const angles = [30, 90, 150, 210, 270, 330];
    return angles.map(angle => {
      const rad = (Math.PI / 180) * angle;
      return `${HEX_SIZE * Math.cos(rad)},${HEX_SIZE * Math.sin(rad)}`;
    }).join(' ');
  };

  const isBoostActive = (zone: Zone) => zone.boostExpiresAt && zone.boostExpiresAt > Date.now();
  const isShieldActive = (zone: Zone) => zone.shieldExpiresAt && zone.shieldExpiresAt > Date.now();

  const getFillId = (zone: Zone) => {
      if (zone.ownerId === user.id) return "url(#grad-my-zone)";
      return "url(#grad-enemy-zone)";
  };

  const getZoneLabelParts = (originalName: string) => {
      try {
          const parts = originalName.split(' - ');
          if (parts.length >= 2) {
              const locationPart = parts[0];
              const country = parts[1];
              const locSegments = locationPart.split(', ');
              if (locSegments.length >= 1) {
                  const city = locSegments[locSegments.length - 1];
                  const street = locSegments.slice(0, locSegments.length - 1).join(', ');
                  const details = street ? `${street} - ${country}` : country;
                  return { city, details };
              }
          }
          return { city: originalName, details: '' };
      } catch (e) {
          return { city: originalName, details: '' };
      }
  };

  const CompassArrow = ({ dir, isActive, icon: Icon, positionClasses, isMobile = false }: { dir: string, isActive: boolean, icon: any, positionClasses: string, isMobile?: boolean }) => {
      const showTooltip = activeTooltip === dir && isActive;
      const getFlexDir = () => (dir === 'north' && !isMobile) ? 'flex-col-reverse' : 'flex-col';
      const getTooltipAlignment = () => isMobile ? 'left-0 origin-left' : (dir === 'west' ? 'left-2' : (dir === 'east' ? 'right-2' : 'left-1/2 -translate-x-1/2'));
      const tooltipTopClass = isMobile ? 'bottom-11' : (dir === 'north' ? 'top-14' : 'bottom-14');

      return (
          <div 
              className={`absolute ${positionClasses} flex ${getFlexDir()} items-center group transition-all duration-300 ${isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-20'} ${showTooltip ? 'z-[70]' : 'z-50'}`}
              onMouseEnter={() => isActive && setActiveTooltip(dir)}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={(e) => {
                  if (isActive) {
                      e.stopPropagation();
                      setActiveTooltip(activeTooltip === dir ? null : dir);
                  }
              }}
          >
              <div className={`absolute ${tooltipTopClass} ${isMobile ? 'w-32' : 'whitespace-nowrap'} px-3 py-2 glass-panel-heavy rounded-lg border border-emerald-500/30 transition-all duration-300 pointer-events-none transform ${showTooltip ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'} ${getTooltipAlignment()} z-[80]`}>
                  <p className={`text-[10px] text-white font-bold leading-tight flex items-start gap-2 ${isMobile ? 'whitespace-normal' : 'whitespace-nowrap'}`}>
                      <Info size={10} className="text-emerald-400 mt-0.5 shrink-0"/> {t('dash.compass.hint')}
                  </p>
              </div>
              <div className={`compass-plate ${isActive ? 'compass-active' : 'compass-base'}`}>
                  <Icon className="w-4 h-4 md:w-6 md:h-6" strokeWidth={isActive ? 3 : 1.5} />
              </div>
          </div>
      );
  };

  return (
    <div 
        className="absolute inset-0 cursor-move touch-none"
        onMouseDown={(e) => { setActiveTooltip(null); onMouseDown(e); }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={(e) => { setActiveTooltip(null); onTouchStart(e); }}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      <style>
        {`
          @keyframes dash-flight { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
          .flight-path { stroke-dasharray: 12, 12; animation: dash-flight var(--flight-speed, 0.8s) linear infinite; filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 2px white); pointer-events: none; stroke-linecap: round; }
          .inner-glow-path { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none; }
          @keyframes compass-pulse { 0%, 100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 5px #10b981); } 50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 15px #10b981); } }
          .compass-plate { border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
          @media (min-width: 768px) { .compass-plate { width: 42px; height: 42px; } }
          .compass-base { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.2); }
          .compass-active { background: rgba(13, 18, 30, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(16, 185, 129, 0.6); color: #34d399; animation: compass-pulse 2s infinite ease-in-out; }
          @keyframes icon-float { 0%, 100% { transform: translate(-14px, 49px); } 50% { transform: translate(-14px, 45px); } }
          .animate-icon-float { animation: icon-float 2s ease-in-out infinite; }
          @keyframes alert-vibrate { 0%, 100% { transform: scale(1) rotate(0); } 25% { transform: scale(1.1) rotate(-5deg); } 75% { transform: scale(1.1) rotate(5deg); } }
          .alert-vibrate { animation: alert-vibrate 0.4s infinite linear; }
          @keyframes alert-glow-red { 0%, 100% { stroke: #ef4444; stroke-width: 2; opacity: 1; } 50% { stroke: #b91c1c; stroke-width: 8; opacity: 0.5; } }
          .alert-glow-red { animation: alert-glow-red 1.5s infinite ease-in-out; }
          @keyframes opportunity-glow-gold { 0%, 100% { stroke: #fbbf24; stroke-width: 2; opacity: 1; } 50% { stroke: #d97706; stroke-width: 8; opacity: 0.5; } }
          .opportunity-glow-gold { animation: opportunity-glow-gold 1.5s infinite ease-in-out; }
          .scan-laser { animation: hex-scanline 2s infinite linear; }
          @keyframes hex-scanline { 0% { transform: translateY(-100px); } 100% { transform: translateY(100px); } }
          .visited-glow { animation: visited-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
          @keyframes visited-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
        `}
      </style>

      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2310b981' stroke-width='2' stroke-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '56px 98px'
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-40">
          <div className="md:hidden absolute bottom-44 left-6 w-32 h-32 pointer-events-none">
                <CompassArrow dir="north" isActive={compassState.north} icon={ChevronUp} positionClasses="top-0 left-1/2 -translate-x-1/2" isMobile={true} />
                <CompassArrow dir="south" isActive={compassState.south} icon={ChevronDown} positionClasses="bottom-0 left-1/2 -translate-x-1/2" isMobile={true} />
                <CompassArrow dir="east" isActive={compassState.east} icon={ChevronRight} positionClasses="right-0 top-1/2 -translate-y-1/2" isMobile={true} />
                <CompassArrow dir="west" isActive={compassState.west} icon={ChevronLeft} positionClasses="left-0 top-1/2 -translate-y-1/2" isMobile={true} />
          </div>
          <div className="hidden md:block absolute inset-0 pointer-events-none">
                <CompassArrow dir="north" isActive={compassState.north} icon={ChevronUp} positionClasses="top-4 left-1/2 -translate-x-1/2" />
                <CompassArrow dir="south" isActive={compassState.south} icon={ChevronDown} positionClasses="bottom-36 left-1/2 -translate-x-1/2" />
                <CompassArrow dir="east" isActive={compassState.east} icon={ChevronRight} positionClasses="right-2 top-1/2 -translate-y-1/2" />
                <CompassArrow dir="west" isActive={compassState.west} icon={ChevronLeft} positionClasses="left-2 top-1/2 -translate-y-1/2" isMobile={true} />
          </div>
      </div>

      <svg ref={ref} width="100%" height="100%" className="touch-none select-none">
        <defs>
          <pattern id="tech-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)" /></pattern>
          <filter id="glow-flight-strong" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
          <radialGradient id="grad-my-zone" cx="50%" cy="50%" r="70%" fx="50%" fy="50%"><stop offset="40%" style={{ stopColor: '#059669', stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: '#064e3b', stopOpacity: 1 }} /></radialGradient>
          <radialGradient id="grad-enemy-zone" cx="50%" cy="50%" r="70%" fx="50%" fy="50%"><stop offset="40%" style={{ stopColor: '#b91c1c', stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: '#450a0a', stopOpacity: 1 }} /></radialGradient>
          <clipPath id="hex-clip"><polygon points={getHexPoints()} /></clipPath>
        </defs>

        <g transform={`translate(${view.x},${view.y}) scale(${view.scale})`}>
            <g className="connections-layer" style={{ pointerEvents: 'none' }}>
                {flightPaths.map(conn => (
                    <path key={conn.key} d={conn.d} stroke={conn.color} strokeWidth={conn.isMine ? 10 : 8} fill="none" className="flight-path" strokeLinecap="round" opacity={conn.isMine ? 1 : 0.95} style={{ filter: 'url(#glow-flight-strong)', '--flight-speed': `${conn.speed}s` } as any} />
                ))}
            </g>

            {zones.map((zone) => {
              const pos = getHexPixelPosition(zone.x, zone.y, HEX_SIZE);
              const isSelected = selectedZoneId === zone.id;
              const boosted = isBoostActive(zone);
              const shielded = isShieldActive(zone);
              const isJustClaimed = recentlyClaimed.has(zone.id);
              const isMine = zone.ownerId === user.id;
              const isVisited = visitedZoneIds?.has(zone.id);
              const dimMode = showOnlyVisited && !isVisited;

            //   // Calcolo logica avvisi (Conquista possibile / Territorio a rischio)
            //   const myDist = userDistMap.get(zone.id) || 0;
            //   const isTopRunner = myDist >= zone.recordKm && myDist > 0;
            //   const readyToConquer = isTopRunner && !isMine; // Opportunità: Posso conquistare
            //   const atRisk = isMine && zone.recordKm > myDist; // Pericolo: Ho perso il record, rischio di perdere la zona

              let isMatch = true;
              if (filterMode === 'MINE' && zone.ownerId !== user.id) isMatch = false;
              if (filterMode === 'ENEMY' && zone.ownerId === user.id) isMatch = false;
              if (filterCountry !== 'ALL') {
                  if (filterCountry === 'Other') { if (zone.name.match(/\-\s[A-Z]{2}$/)) isMatch = false; } 
                  else { if (!zone.name.endsWith(` - ${filterCountry}`)) isMatch = false; }
              }
              if (searchTerm && !zone.name.toLowerCase().includes(searchTerm.toLowerCase())) isMatch = false;

              const { city, details } = getZoneLabelParts(zone.name);
              const displayCity = city.length > 16 ? city.substring(0, 14) + '..' : city;
              const displayDetails = details.length > 22 ? details.substring(0, 20) + '..' : details;
              
              let strokeColor = isMine ? '#34d399' : '#7f1d1d'; 
              let strokeWidth = isMine ? 2 : 1;
              if (boosted) { strokeColor = '#fbbf24'; strokeWidth = 3; }
              else if (shielded) { strokeColor = '#06b6d4'; strokeWidth = 3; }
              else if (isSelected) { strokeColor = '#ffffff'; strokeWidth = 4; }

              if (showOnlyVisited && isVisited) {
                  strokeColor = '#10b981';
                  strokeWidth = 6;
              }

              const isInnerColored = !!(showGlobalTrajectories && zone.ownerId);
              const attrs = getOwnerAttributes(zone.ownerId);
              const innerStroke = isInnerColored ? attrs.color : "rgba(255,255,255,0.35)";

              return (
                <g 
                  key={zone.id} 
                  transform={`translate(${pos.x},${pos.y})`}
                  onClick={(e) => { e.stopPropagation(); onZoneClick(zone); }}
                  className="transition-all duration-500"
                  style={{ opacity: isMatch ? (dimMode ? 0.2 : 1) : 0.05, filter: dimMode ? 'grayscale(100%)' : 'none' }}
                >

                  {/* {atRisk && !isSelected && (
                      <polygon points={getHexPoints()} fill="none" stroke="#ef4444" className="alert-glow-red" />
                  )}
                  {readyToConquer && !isSelected && (
                      <polygon points={getHexPoints()} fill="none" stroke="#fbbf24" className="opportunity-glow-gold" />
                  )} */}

                  {isJustClaimed && isMatch && (
                    <polygon points={getHexPoints()} fill="none" stroke="white" strokeWidth="4" className="animate-ping" style={{ transformOrigin: 'center', animationDuration: '1.5s' }} />
                  )}

                  {showOnlyVisited && isVisited && (
                      <g className="visited-glow">
                          <polygon points={getHexPoints()} fill="#10b981" opacity="0.1" transform="scale(1.2)" />
                          <circle r="12" cx="0" cy="0" fill="#10b981" opacity="0.6" />
                      </g>
                  )}

                  <polygon
                    points={getHexPoints()}
                    fill={getFillId(zone)}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    className="transition-all duration-300 hover:brightness-125"
                    style={{ filter: isSelected ? 'drop-shadow(0 0 15px rgba(255,255,255,0.4))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
                  />

                  {isSelected && (
                    <g clipPath="url(#hex-clip)"><rect x="-100" y="-100" width="200" height="20" fill="rgba(255,255,255,0.2)" className="scan-laser" style={{ filter: 'blur(8px)' }} /></g>
                  )}

                  <polygon points={getHexPoints()} fill="url(#tech-dots)" opacity="0.3" pointerEvents="none" transform="scale(0.95)" />
                  <polygon points={getHexPoints()} fill="none" stroke={innerStroke} strokeWidth={isInnerColored ? 6 : 3} opacity={isInnerColored ? 0.95 : 0.35} transform="scale(0.88)" className="inner-glow-path" style={{ filter: isInnerColored ? `drop-shadow(0 0 12px ${innerStroke})` : 'none' }} />
                  
                  <g pointerEvents="none">
                      <text 
                        x="0" y="-45" textAnchor="middle" fill="white" 
                        opacity={1}
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,1)', fontFamily: '"Rajdhani", sans-serif' }}
                      >
                          <tspan x="0" dy="0" fontSize="18" fontWeight="900" letterSpacing="0.02em">{displayCity}</tspan>
                          {details && <tspan x="0" dy="1.3em" fontSize="15" fontWeight="600" fill="rgba(255,255,255,0.8)">{displayDetails}</tspan>}
                      </text>

                      {!dimMode && (
                        <g transform="translate(-40, -5)">
                            <rect x="0" y="0" width="80" height="44" rx="8" fill="rgba(0,0,0,0.7)" stroke={isMine ? 'rgba(52, 211, 153, 0.6)' : 'rgba(239, 68, 68, 0.6)'} strokeWidth="1.5" />
                            <text x="40" y="16" textAnchor="middle" fill="rgba(200, 210, 255, 0.7)" fontSize="14" fontWeight="bold" style={{ fontFamily: 'monospace' }}>{(zone.totalKm || 0).toFixed(1)} km</text>
                            <text x="40" y="34" textAnchor="middle" fill={isMine ? '#34d399' : '#fca5a5'} fontSize="12" fontWeight="bold" style={{ fontFamily: 'monospace', textShadow: '0 1px 2px black' }}>{(zone.interestPool || 0).toFixed(2)}</text>
                        </g>
                      )}

                      {/* {!dimMode && (atRisk || readyToConquer) && (
                          <g transform="translate(-10, 60)" className="alert-vibrate">
                              {atRisk && <AlertTriangle size={24} color="#ef4444" fill="#7f1d1d" />}
                              {readyToConquer && <Swords size={24} color="#fbbf24" fill="#78350f" />}
                          </g>
                      )}

                      {showOnlyVisited && isVisited && !(atRisk || readyToConquer) && (
                          <g transform="translate(-10, 60)"><Footprints size={20} color="#34d399" /></g>
                      )} */}

                      {!dimMode && (shielded || boosted) && (
                          <g className="animate-icon-float">
                              {shielded && !boosted && <Shield size={28} color="#67e8f9" fill="rgba(8, 145, 178, 0.8)" style={{ filter: 'drop-shadow(0 0 5px #06b6d4)' }} />}
                              {boosted && <Zap size={28} color="#fbbf24" fill="rgba(217, 119, 6, 0.8)" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }} />}
                          </g>
                      )}
                  </g>
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
});

export default React.memo(HexMapComponent);