
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
    if (bearing >= 330 || bearing < 30) return 5; // NE (roughly) - Adjusted for pointy top
    if (bearing >= 30 && bearing < 90) return 0; // E
    if (bearing >= 90 && bearing < 150) return 1; // SE
    if (bearing >= 150 && bearing < 210) return 2; // SW
    if (bearing >= 210 && bearing < 270) return 3; // W
    return 4; // NW
};

// Convert Axial Hex Coords (q, r) to Pixel Coords (x, y)
export const getHexPixelPosition = (q: number, r: number, size: number) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 3/2 * r;
    return { x, y };
};

// --- ZONE PLACEMENT LOGIC ---

// Find a valid Hex position using Nearest Neighbor Logic
export const calculateHexPosition = (
    referenceZone: Zone | null, // Legacy param, ignored in favor of global search
    targetLat: number, 
    targetLng: number, 
    countryCode: string, 
    currentZones: Zone[]
) => {
    // 1. NEAREST NEIGHBOR SEARCH
    // Instead of relying on a random reference, iterate ALL zones to find the geographically closest one.
    // This ensures Zone B snaps to Zone A if they are real-world neighbors.
    
    let nearestZone: Zone | null = null;
    let minDistance = Infinity;

    if (currentZones.length > 0) {
        currentZones.forEach(z => {
            const dist = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearestZone = z;
            }
        });
    }

    // 2. NEW CLUSTER CASE
    // If map is empty OR the nearest zone is too far away (e.g. > 500km), start a new independent cluster.
    if (!nearestZone || minDistance > 500) {
        if (currentZones.length === 0) return { x: 0, y: 0 };
        
        // Place far to the right to avoid overlap
        const maxX = Math.max(...currentZones.map(z => z.x));
        return { x: maxX + 10, y: 0 }; 
    }

    // 3. TOPOLOGY MAPPING
    // We found a neighbor. Calculate the angle between them to place the new hex relative to the neighbor.
    const bearing = getBearing(nearestZone.lat, nearestZone.lng, targetLat, targetLng);
    const directionIndex = bearingToHexDirection(bearing);
    const idealDir = HEX_DIRECTIONS[directionIndex];

    let proposedX = nearestZone.x + idealDir.q;
    let proposedY = nearestZone.y + idealDir.r;

    // 4. COLLISION RESOLUTION (Spiral Search)
    // We try to place it at the ideal vector. If taken, we spiral OUT from that ideal spot 
    // to find the closest available slot, prioritizing the general direction of the expansion.
    
    const isOccupied = (x: number, y: number) => currentZones.some(z => z.x === x && z.y === y);

    if (!isOccupied(proposedX, proposedY)) {
        return { x: proposedX, y: proposedY };
    }

    // BFS Spiral
    const queue = [{ x: proposedX, y: proposedY }];
    const visited = new Set([`${proposedX},${proposedY}`]);
    // Pre-mark existing zones as visited to avoid checking them
    currentZones.forEach(z => visited.add(`${z.x},${z.y}`));

    let safeGuard = 0;
    while (queue.length > 0 && safeGuard < 500) {
        const current = queue.shift()!;
        safeGuard++;

        // Check neighbors of current
        for (const dir of HEX_DIRECTIONS) {
            const nx = current.x + dir.q;
            const ny = current.y + dir.r;
            const key = `${nx},${ny}`;

            if (!visited.has(key)) {
                visited.add(key);
                // If this spot is not in the original zones list, it's free
                if (!isOccupied(nx, ny)) {
                    return { x: nx, y: ny };
                }
                queue.push({ x: nx, y: ny });
            }
        }
    }
    
    // Fallback
    return { x: proposedX + 5, y: proposedY + 5 };
};