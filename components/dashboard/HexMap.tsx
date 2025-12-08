
import React, { forwardRef } from 'react';
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
  onWheel: (e: React.WheelEvent) => void;
}

const HEX_SIZE = 100;

const HexMap = forwardRef<SVGSVGElement, HexMapProps>(({ 
    zones, user, view, selectedZoneId, onZoneClick, 
    filterMode, filterCountry, searchTerm,
    onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, onWheel
}, ref) => {
  
  // Helper functions internal to rendering
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
      if (isBoostActive(zone)) return "url(#grad-boosted-zone)";
      if (isShieldActive(zone)) return "url(#grad-shielded-zone)"; 
      if (zone.ownerId === user.id) return "url(#grad-my-zone)";
      return "url(#grad-enemy-zone)";
  };

  const getStrokeColor = (zone: Zone) => {
    if (isBoostActive(zone)) return '#f59e0b';
    if (isShieldActive(zone)) return '#06b6d4';
    if (zone.ownerId === user.id) return '#34d399';
    return '#f87171';
  };

  return (
    <div 
        className="absolute inset-0 cursor-move bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] touch-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
    >
      <svg 
        ref={ref}
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
              const pos = getHexPixelPosition(zone.x, zone.y, HEX_SIZE);
              const isSelected = selectedZoneId === zone.id;
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
                  onClick={(e) => { e.stopPropagation(); onZoneClick(zone); }}
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
  );
});

export default HexMap;