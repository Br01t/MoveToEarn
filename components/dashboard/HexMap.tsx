
import React, { forwardRef, useEffect, useState, useRef, useMemo } from 'react';
import { Zone, User } from '../../types';
import { getHexPixelPosition } from '../../utils/geo';
import { Zap, Shield } from 'lucide-react';
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
  // Interaction handlers passed from parent
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

const HEX_SIZE = 100;

// Named component for dev tools and memoization
const HexMapComponent = forwardRef<SVGSVGElement, HexMapProps>(({ 
    zones, user, view, selectedZoneId, onZoneClick, 
    filterMode, filterCountry, searchTerm,
    onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd
}, ref) => {
  
  const [recentlyClaimed, setRecentlyClaimed] = useState<Set<string>>(new Set());
  const prevOwnersRef = useRef<Record<string, string | null>>({});

  // Detect Ownership Changes for Animation
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

  // --- 1. CALCULATE FLIGHT PATHS (Global Network) ---
  const flightPaths = useMemo(() => {
      const myZones = zones.filter(z => z.ownerId === user.id);
      if (myZones.length < 2) return [];

      const connections: { d: string, key: string }[] = [];
      const processedPairs = new Set<string>(); 

      // For every zone I own, connect to the 2 nearest zones I also own.
      myZones.forEach(startZone => {
          const startPos = getHexPixelPosition(startZone.x, startZone.y, HEX_SIZE);

          const neighbors = myZones
              .filter(z => z.id !== startZone.id)
              .map(endZone => {
                  const endPos = getHexPixelPosition(endZone.x, endZone.y, HEX_SIZE);
                  const dist = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
                  return { zone: endZone, dist, pos: endPos };
              })
              .sort((a, b) => a.dist - b.dist); 

          const closestNeighbors = neighbors.slice(0, 2);

          closestNeighbors.forEach(target => {
              const pairKey = [startZone.id, target.zone.id].sort().join('-');
              
              if (!processedPairs.has(pairKey)) {
                  processedPairs.add(pairKey);
                  
                  const endPos = target.pos;
                  const midX = (startPos.x + endPos.x) / 2;
                  const midY = (startPos.y + endPos.y) / 2;
                  
                  const altitude = 80 + (target.dist * 0.15); 
                  
                  const controlX = midX;
                  const controlY = midY - altitude;

                  const pathData = `M ${startPos.x} ${startPos.y} Q ${controlX} ${controlY} ${endPos.x} ${endPos.y}`;

                  connections.push({
                      d: pathData,
                      key: pairKey
                  });
              }
          });
      });

      return connections;
  }, [zones, user.id]);

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

  const formatZoneLabel = (originalName: string) => {
      try {
          const parts = originalName.split(' - ');
          if (parts.length === 2) {
              const [locationPart, country] = parts;
              const locSegments = locationPart.split(', ');
              if (locSegments.length >= 2) {
                  const city = locSegments[locSegments.length - 1];
                  const street = locSegments.slice(0, locSegments.length - 1).join(', ');
                  return `${city}, ${street} - ${country}`;
              }
          }
          return originalName;
      } catch (e) {
          return originalName;
      }
  };

  return (
    <div 
        className="absolute inset-0 cursor-move touch-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      <style>
        {`
          @keyframes dash-flight {
            0% { stroke-dashoffset: 40; }
            100% { stroke-dashoffset: 0; }
          }
          .flight-path {
            stroke-dasharray: 12, 8;
            animation: dash-flight 1.5s linear infinite;
          }
          @keyframes icon-float {
            0%, 100% { transform: translate(-14px, 28px); }
            50% { transform: translate(-14px, 24px); }
          }
          .animate-icon-float {
            animation: icon-float 2s ease-in-out infinite;
          }
        `}
      </style>
      <svg 
        ref={ref}
        width="100%" 
        height="100%"
        className="touch-none select-none"
      >
        <defs>
          <pattern id="tech-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
             <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)" />
          </pattern>

          <filter id="glow-flight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="grad-flight-path" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.1 }} />
             <stop offset="20%" style={{ stopColor: '#a855f7', stopOpacity: 0.8 }} />
             <stop offset="50%" style={{ stopColor: '#e9d5ff', stopOpacity: 1 }} />
             <stop offset="80%" style={{ stopColor: '#d8b4fe', stopOpacity: 0.8 }} />
             <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.1 }} />
          </linearGradient>

          <radialGradient id="grad-my-zone" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="40%" style={{ stopColor: '#059669', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#064e3b', stopOpacity: 0.9 }} />
          </radialGradient>
          
          <radialGradient id="grad-enemy-zone" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="40%" style={{ stopColor: '#b91c1c', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#450a0a', stopOpacity: 0.9 }} />
          </radialGradient>
        </defs>

        <g transform={`translate(${view.x},${view.y}) scale(${view.scale})`}>
            
            {zones.map((zone) => {
              const pos = getHexPixelPosition(zone.x, zone.y, HEX_SIZE);
              const isSelected = selectedZoneId === zone.id;
              const boosted = isBoostActive(zone);
              const shielded = isShieldActive(zone);
              const isJustClaimed = recentlyClaimed.has(zone.id);
              const isMine = zone.ownerId === user.id;

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

              const formattedName = formatZoneLabel(zone.name);
              const displayName = formattedName.length > 20 ? formattedName.substring(0, 18) + '..' : formattedName;
              
              let strokeColor = isMine ? '#34d399' : '#7f1d1d'; 
              let strokeWidth = isMine ? 2 : 1;
              
              if (boosted) { strokeColor = '#fbbf24'; strokeWidth = 3; }
              else if (shielded) { strokeColor = '#06b6d4'; strokeWidth = 3; }
              else if (isSelected) { strokeColor = '#ffffff'; strokeWidth = 4; }

              return (
                <g 
                  key={zone.id} 
                  transform={`translate(${pos.x},${pos.y})`}
                  onClick={(e) => { e.stopPropagation(); onZoneClick(zone); }}
                  className={`transition-all duration-300 group ${isMatch ? 'cursor-pointer' : 'pointer-events-none'}`}
                  style={{ opacity: isMatch ? (isSelected ? 1 : 0.9) : 0.05, filter: isMatch ? 'none' : 'grayscale(100%)' }}
                >
                  {isJustClaimed && isMatch && (
                    <polygon points={getHexPoints()} fill="none" stroke="white" strokeWidth="4" className="animate-ping" style={{ transformOrigin: 'center', animationDuration: '1.5s' }} />
                  )}

                  <polygon
                    points={getHexPoints()}
                    fill={getFillId(zone)}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    className="transition-all duration-300 group-hover:brightness-125"
                    style={{ filter: isSelected ? 'drop-shadow(0 0 15px rgba(255,255,255,0.4))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
                  />

                  <polygon 
                    points={getHexPoints()}
                    fill="url(#tech-dots)"
                    opacity="0.3"
                    pointerEvents="none"
                    transform="scale(0.95)"
                  />
                  
                  <polygon 
                    points={getHexPoints()} 
                    fill="none" 
                    stroke="rgba(255,255,255,0.15)" 
                    strokeWidth="2" 
                    transform="scale(0.85)" 
                    className="transition-all duration-300 group-hover:stroke-white/40"
                  />
                  
                  <g pointerEvents="none">
                      <text 
                          x="0" 
                          y="-28" 
                          textAnchor="middle" 
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="18"
                          fontWeight="900"
                          style={{ textShadow: '0 2px 4px rgba(0,0,0,1)', letterSpacing: '0.02em', fontFamily: '"Rajdhani", sans-serif' }}
                      >
                          {displayName}
                      </text>

                      <g transform="translate(-40, -5)">
                          <rect 
                              x="0" 
                              y="0" 
                              width="80" 
                              height="26" 
                              rx="6" 
                              fill="rgba(0,0,0,0.6)"
                              stroke={isMine ? 'rgba(52, 211, 153, 0.5)' : 'rgba(239, 68, 68, 0.5)'}
                              strokeWidth="1"
                          />
                          <text 
                              x="40" 
                              y="17" 
                              textAnchor="middle" 
                              fill={isMine ? '#34d399' : '#fca5a5'}
                              fontSize="14"
                              fontWeight="bold"
                              style={{ fontFamily: 'monospace', textShadow: '0 1px 2px black' }}
                          >
                              {(zone.interestPool || 0).toFixed(2)}
                          </text>
                      </g>

                      {(shielded || boosted) && (
                          <g className="animate-icon-float">
                              {shielded && !boosted && (
                                  <Shield size={28} color="#67e8f9" fill="rgba(8, 145, 178, 0.8)" style={{ filter: 'drop-shadow(0 0 5px #06b6d4)' }} />
                              )}
                              {boosted && (
                                  <Zap size={28} color="#fbbf24" fill="rgba(217, 119, 6, 0.8)" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }} />
                              )}
                          </g>
                      )}
                  </g>
                </g>
              );
            })}

            <g className="connections-layer" style={{ filter: 'url(#glow-flight)', pointerEvents: 'none' }}>
                {flightPaths.map(conn => (
                    <path 
                        key={conn.key}
                        d={conn.d}
                        stroke="url(#grad-flight-path)"
                        strokeWidth="4"
                        fill="none"
                        className="flight-path"
                        strokeLinecap="round"
                    />
                ))}
            </g>
        </g>
      </svg>
    </div>
  );
});

// MEMOIZATION OPTIMIZATION
// Prevents re-renders of the heavy map unless crucial data changes
export default React.memo(HexMapComponent, (prevProps, nextProps) => {
    return (
        prevProps.zones === nextProps.zones &&
        prevProps.view.x === nextProps.view.x &&
        prevProps.view.y === nextProps.view.y &&
        prevProps.view.scale === nextProps.view.scale &&
        prevProps.selectedZoneId === nextProps.selectedZoneId &&
        prevProps.filterMode === nextProps.filterMode &&
        prevProps.filterCountry === nextProps.filterCountry &&
        prevProps.searchTerm === nextProps.searchTerm &&
        prevProps.user.id === nextProps.user.id
    );
});