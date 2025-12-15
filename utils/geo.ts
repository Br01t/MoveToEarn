
import { Zone } from '../types';

export const R = 6371; // Radius of the earth in km

export const deg2rad = (deg: number) => deg * (Math.PI / 180);
export const rad2deg = (rad: number) => rad * (180 / Math.PI);

// Calculate distance between two lat/lng points in KM
export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
};

// Calculate Bearing (Direction) from Point A to Point B (0-360 degrees)
export const getBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
  const startLatRad = deg2rad(startLat);
  const startLngRad = deg2rad(startLng);
  const destLatRad = deg2rad(destLat);
  const destLngRad = deg2rad(destLng);

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = Math.atan2(y, x);
  return (rad2deg(brng) + 360) % 360;
};

// --- HEX GRID MATH ---

// Axial Hex Directions (Pointy Topped)
// 0: East, 1: SouthEast, 2: SouthWest, 3: West, 4: NorthWest, 5: NorthEast
export const HEX_DIRECTIONS = [
    { q: 1, r: 0 },   // 0: East (approx 90deg)
    { q: 0, r: 1 },   // 1: SouthEast (approx 150deg)
    { q: -1, r: 1 },  // 2: SouthWest (approx 210deg)
    { q: -1, r: 0 },  // 3: West (approx 270deg)
    { q: 0, r: -1 },  // 4: NorthWest (approx 330deg)
    { q: 1, r: -1 }   // 5: NorthEast (approx 30deg)
];

// Map 0-360 bearing to 0-5 Hex Direction Index
export const bearingToHexDirectionIndex = (bearing: number) => {
    // Hex sectors are 60 degrees wide.
    // 0 (East) is centered at 90 degrees bearing? No, usually North is 0.
    // Let's map standard Map Bearing (0=N, 90=E, 180=S, 270=W) to Hex Sides.
    
    // Hex layout "Pointy Top":
    // N (approx) -> NE (5) or NW (4)
    
    // We align sectors:
    // 30-90: East (0)
    // 90-150: SE (1)
    // 150-210: SW (2)
    // 210-270: West (3)
    // 270-330: NW (4)
    // 330-30: NE (5)
    
    const normalized = (bearing + 360) % 360;
    
    if (normalized >= 30 && normalized < 90) return 0;
    if (normalized >= 90 && normalized < 150) return 1;
    if (normalized >= 150 && normalized < 210) return 2;
    if (normalized >= 210 && normalized < 270) return 3;
    if (normalized >= 270 && normalized < 330) return 4;
    return 5; // 330 to 30
};

// Convert Axial Hex Coords (q, r) to Pixel Coords (x, y)
export const getHexPixelPosition = (q: number, r: number, size: number) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 3/2 * r;
    return { x, y };
};

export const getZoneCountry = (name: string): string => {
    const parts = name.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : 'XX';
};

// --- DYNAMIC PLACEMENT ENGINE ---

/**
 * Recursive function to shift zones if a spot is taken.
 * Returns a map of ALL modified zones (id -> Zone).
 */
const shiftZoneRecursively = (
    occupantId: string, 
    pushDirectionIndex: number, 
    zoneMap: Map<string, Zone>, 
    coordMap: Map<string, string>, // "x,y" -> zoneId
    modifiedZones: Map<string, Zone>
) => {
    const occupier = zoneMap.get(occupantId);
    if (!occupier) return;

    const dir = HEX_DIRECTIONS[pushDirectionIndex];
    const newX = occupier.x + dir.q;
    const newY = occupier.y + dir.r;
    const newKey = `${newX},${newY}`;

    // Check if the NEW spot is also occupied
    const nextOccupantId = coordMap.get(newKey);
    if (nextOccupantId) {
        // RECURSION: Push the next guy in the SAME direction
        shiftZoneRecursively(nextOccupantId, pushDirectionIndex, zoneMap, coordMap, modifiedZones);
    }

    // Move the current occupier
    // We update the object directly but also track it in modifiedZones
    const updatedZone = { ...occupier, x: newX, y: newY };
    
    // Update lookup maps for subsequent logic in this frame
    coordMap.delete(`${occupier.x},${occupier.y}`);
    coordMap.set(newKey, occupier.id); // Update key with ID
    zoneMap.set(occupier.id, updatedZone);
    
    modifiedZones.set(occupier.id, updatedZone);
};

export const insertZoneAndShift = (
    targetLat: number, 
    targetLng: number, 
    countryCode: string, 
    currentZones: Zone[]
): { x: number, y: number, shiftedZones: Zone[] } => {
    
    // 1. Setup Lookup Maps
    const zoneMap = new Map<string, Zone>();
    const coordMap = new Map<string, string>(); // "x,y" -> id
    currentZones.forEach(z => {
        zoneMap.set(z.id, z);
        coordMap.set(`${z.x},${z.y}`, z.id);
    });

    const modifiedZones = new Map<string, Zone>();

    // 2. Identify Relation (Ally or Alien)
    const sameCountryZones = currentZones.filter(z => getZoneCountry(z.name) === countryCode);
    
    let anchor: Zone | null = null;
    let bearing = 0;
    let distanceBuffer = 1; // Standard adjacency

    if (sameCountryZones.length > 0) {
        // CASE A: Existing Country Cluster
        // Find nearest geographical neighbor in same country
        let minDist = Infinity;
        sameCountryZones.forEach(z => {
            const d = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
            if (d < minDist) {
                minDist = d;
                anchor = z;
            }
        });
        // We want to be adjacent to anchor
        distanceBuffer = 1; 
    } else if (currentZones.length > 0) {
        // CASE B: New Country Cluster
        // Find nearest global zone to maintain world geography relative to map center
        let minDist = Infinity;
        currentZones.forEach(z => {
            const d = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
            if (d < minDist) {
                minDist = d;
                anchor = z;
            }
        });
        // We want to be separated from the other country
        distanceBuffer = 4; // Gap for visual separation
    } else {
        // CASE C: Genesis (First zone ever)
        return { x: 0, y: 0, shiftedZones: [] };
    }

    if (!anchor) return { x: 0, y: 0, shiftedZones: [] }; // Should not happen given logic above

    // 3. Calculate Vector
    bearing = getBearing(anchor.lat, anchor.lng, targetLat, targetLng);
    const hexDirIndex = bearingToHexDirectionIndex(bearing);
    const dir = HEX_DIRECTIONS[hexDirIndex];

    // 4. Determine Target Spot
    const targetX = anchor.x + (dir.q * distanceBuffer);
    const targetY = anchor.y + (dir.r * distanceBuffer);
    const targetKey = `${targetX},${targetY}`;

    // 5. Collision & Shifting Logic
    const occupierId = coordMap.get(targetKey);
    
    if (occupierId) {
        // Spot is taken. We must SHIFT the occupier (and anything behind it)
        // We shift them in the SAME direction we are entering.
        shiftZoneRecursively(occupierId, hexDirIndex, zoneMap, coordMap, modifiedZones);
    }

    return { 
        x: targetX, 
        y: targetY, 
        shiftedZones: Array.from(modifiedZones.values()) 
    };
};

// Legacy support wrapper (to minimize refactoring breakages elsewhere, though usage in hook is updated)
export const calculateHexPosition = (
    _ref: Zone | null, 
    lat: number, 
    lng: number, 
    cc: string, 
    zones: Zone[]
) => {
    const res = insertZoneAndShift(lat, lng, cc, zones);
    return { x: res.x, y: res.y };
};