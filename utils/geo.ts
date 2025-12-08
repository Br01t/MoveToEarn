
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
    { q: 1, r: 0 },   // 0: East
    { q: 0, r: 1 },   // 1: SouthEast
    { q: -1, r: 1 },  // 2: SouthWest
    { q: -1, r: 0 },  // 3: West
    { q: 0, r: -1 },  // 4: NorthWest
    { q: 1, r: -1 }   // 5: NorthEast
];

// Map 0-360 bearing to 0-5 Hex Direction Index
export const bearingToHexDirection = (bearing: number) => {
    if (bearing >= 0 && bearing < 60) return 5; // NE
    if (bearing >= 60 && bearing < 120) return 0; // E
    if (bearing >= 120 && bearing < 180) return 1; // SE
    if (bearing >= 180 && bearing < 240) return 2; // SW
    if (bearing >= 240 && bearing < 300) return 3; // W
    return 4; // NW
};

// Convert Axial Hex Coords (q, r) to Pixel Coords (x, y)
export const getHexPixelPosition = (q: number, r: number, size: number) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 3/2 * r;
    return { x, y };
};

// --- ZONE PLACEMENT LOGIC ---

// Find a valid Hex position based on a reference zone and target coordinates
// Uses Spiral Search (BFS) to avoid collisions
export const calculateHexPosition = (
    referenceZone: Zone | null, 
    targetLat: number, 
    targetLng: number, 
    countryCode: string, 
    currentZones: Zone[]
) => {
    let anchorZone = referenceZone;

    // 1. If no specific reference zone provided, find the best anchor in the same country
    if (!anchorZone) {
        // Filter zones by country to form a cluster
        const clusterZones = currentZones.filter(z => z.name.endsWith(` - ${countryCode}`));
        
        if (clusterZones.length === 0) {
            // CASE: New Country Cluster
            // If the map is completely empty, start at 0,0
            if (currentZones.length === 0) return { x: 0, y: 0 };

            // If other zones exist, start a new cluster far away to avoid overlap
            // We place it to the right of the existing map bounds
            const maxX = Math.max(...currentZones.map(z => z.x));
            // Add a buffer (e.g., 5 hexes) to separate clusters visually
            return { x: maxX + 5, y: 0 }; 
        }

        // CASE: Existing Country Cluster
        // Find the geographically nearest zone in this cluster to attach to
        let minDist = Infinity;
        clusterZones.forEach(z => {
            const d = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
            if (d < minDist) {
                minDist = d;
                anchorZone = z;
            }
        });
    }

    // Fallback (Should typically be handled by New Cluster logic, but for safety)
    if (!anchorZone) return { x: 0, y: 0 };

    // 2. Calculate Direction
    // Determine bearing from the anchor zone to the new target location
    const bearing = getBearing(anchorZone.lat, anchorZone.lng, targetLat, targetLng);
    const idealDirIndex = bearingToHexDirection(bearing);
    const idealDir = HEX_DIRECTIONS[idealDirIndex];

    // 3. Determine Coordinates
    // Try to place it directly adjacent in the calculated direction
    let proposedX = anchorZone.x + idealDir.q;
    let proposedY = anchorZone.y + idealDir.r;

    // 4. Collision Resolution (Spiral Search)
    // If the ideal spot is taken, find the nearest empty spot spiraling out from the proposed location
    const isOccupied = (x: number, y: number) => currentZones.some(z => z.x === x && z.y === y);

    if (!isOccupied(proposedX, proposedY)) {
        return { x: proposedX, y: proposedY };
    }

    // BFS Spiral to find nearest empty spot
    const queue = [{ x: proposedX, y: proposedY }];
    const visited = new Set([`${proposedX},${proposedY}`]);
    let safeGuard = 0;
    
    while (queue.length > 0 && safeGuard < 500) {
        const current = queue.shift()!;
        safeGuard++;

        for (const dir of HEX_DIRECTIONS) {
            const nx = current.x + dir.q;
            const ny = current.y + dir.r;
            const key = `${nx},${ny}`;

            if (!visited.has(key)) {
                visited.add(key);
                if (!isOccupied(nx, ny)) {
                    return { x: nx, y: ny };
                }
                queue.push({ x: nx, y: ny });
            }
        }
    }
    
    // Ultimate fallback if map is incredibly dense
    return { x: proposedX + 10, y: proposedY + 10 };
};