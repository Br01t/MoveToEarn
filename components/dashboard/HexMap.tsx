
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
}

const HEX_SIZE = 100;

const HexMap = forwardRef<SVGSVGElement, HexMapProps>(({ 
    zones, user, view, selectedZoneId, onZoneClick, 
    filterMode, filterCountry, searchTerm,
    onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd
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
      // FILL REFLECTS OWNERSHIP ONLY
      if (zone.ownerId === user.id) return "url(#grad-my-zone)";
      return "url(#grad-enemy-zone)";
  };

  const getStrokeColor = (zone: Zone) => {
    // STROKE REFLECTS ITEM STATUS
    if (isBoostActive(zone)) return '#fbbf24'; // Amber (Boost)
    if (isShieldActive(zone)) return '#06b6d4'; // Cyan (Shield)
    
    // Fallback: Ownership color if no item active
    if (zone.ownerId === user.id) return '#34d399'; // Emerald (Mine)
    return '#f87171'; // Red (Enemy)
  };

  const getBadgeColor = (zone: Zone, boosted: boolean, shielded: boolean) => {
      if (zone.ownerId === user.id) {
          if (boosted) return '#d97706'; // amber-600
          if (shielded) return '#0891b2'; // cyan-600
          return '#064e3b'; // emerald-900
      }
      return '#7f1d1d'; // red-900
  };

  const getBadgeStroke = (zone: Zone, boosted: boolean, shielded: boolean) => {
      if (zone.ownerId === user.id) {
          if (boosted) return '#fbbf24'; // amber-400
          if (shielded) return '#06b6d4'; // cyan-400
          return '#34d399'; // emerald-400
      }
      return '#ef4444'; // red-500
  };

  // Helper to reformat "Street, City - CC" to "City, Street - CC"
  const formatZoneLabel = (originalName: string) => {
      try {
          const parts = originalName.split(' - ');
          if (parts.length === 2) {
              const [locationPart, country] = parts;
              const locSegments = locationPart.split(', ');
              
              // Only swap if we have exactly Street and City detected
              if (locSegments.length >= 2) {
                  const city = locSegments[locSegments.length - 1];
                  const street = locSegments.slice(0, locSegments.length - 1).join(', ');
                  
                  // Construct new string: "Milan, Via Feltre - IT"
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
        style={{
            // Hexagonal Grid Background Pattern
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%231f2937' stroke-width='1' /%3E%3C/svg%3E")`,
            backgroundSize: '56px 98px'
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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

              // Format name for display (City first)
              const formattedName = formatZoneLabel(zone.name);
              const displayName = formattedName.length > 20 ? formattedName.substring(0, 18) + '..' : formattedName;

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

                  {/* Pulsing Outer Rings for Items (Matches Border Color logic) */}
                  {boosted && isMatch && (
                     <polygon points={getHexPoints()} fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.6" transform="scale(1.1)" className="animate-pulse"/>
                  )}
                  {shielded && isMatch && !boosted && (
                     <polygon points={getHexPoints()} fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.6" transform="scale(1.1)" className="animate-pulse"/>
                  )}
                  
                  {/* Main Hexagon - Stroke Color reflects Item, Fill reflects Owner */}
                  <polygon
                    points={getHexPoints()}
                    fill={fillUrl}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 4 : (boosted || shielded ? 3 : 2)}
                    strokeLinejoin="round"
                    className="transition-all duration-300 group-hover:brightness-125 group-hover:stroke-[3px] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' : 'none' }}
                  />
                  
                  <polygon points={getHexPoints()} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" transform="scale(0.85)" className="transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:stroke-white/40"/>
                  
                  <g pointerEvents="none">
                      {/* 1. Zone Name (City First) */}
                      <text 
                          x="0" 
                          y="-20" 
                          textAnchor="middle" 
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="900"
                          style={{ textShadow: '0 2px 3px rgba(0,0,0,0.9)', letterSpacing: '0.02em' }}
                      >
                          {displayName}
                      </text>

                      {/* 2. Pool Badge */}
                      <g transform="translate(-27, -5)">
                          <rect 
                              x="0" 
                              y="0" 
                              width="56" 
                              height="20" 
                              rx="6" 
                              fill={getBadgeColor(zone, boosted, shielded)}
                              fillOpacity="0.9"
                              stroke={getBadgeStroke(zone, boosted, shielded)}
                              strokeWidth="1"
                          />
                          <text 
                              x="28" 
                              y="14" 
                              textAnchor="middle" 
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                              style={{ fontFamily: 'monospace' }}
                          >
                              {(zone.interestPool || 0).toFixed(2)} RUN
                          </text>
                      </g>

                      {/* 3. Status Icons */}
                      {(shielded || boosted) && (
                          <g transform="translate(-10, 22)">
                              {shielded && !boosted && (
                                  <Shield size={20} color="#67e8f9" fill="rgba(8, 145, 178, 0.5)" />
                              )}
                              {boosted && (
                                  <Zap size={20} color="#fbbf24" fill="rgba(217, 119, 6, 0.5)" />
                              )}
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

export default HexMap;