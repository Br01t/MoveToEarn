import { Zone } from '../types';

export const R = 6371;

export const deg2rad = (deg: number) => deg * (Math.PI / 180);
export const rad2deg = (rad: number) => rad * (180 / Math.PI);

export const decodePostGISLocation = (hex: string): { lat: number; lng: number } => {
    if (!hex || hex.length < 50) return { lat: 0, lng: 0 };

    try {
        // Rimuoviamo eventuali prefissi se presenti (PostGIS standard non li ha in HEX output semplice)
        const pureHex = hex.startsWith('\\x') ? hex.substring(2) : hex;
        
        // Convertiamo HEX in Uint8Array
        const bytes = new Uint8Array(pureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const view = new DataView(bytes.buffer);

        // EWKB Header per Point 4326:
        // Byte 0: Endianness (01 = Little Endian)
        // Byte 1-4: Type (01 00 00 20 = Point + SRID flag)
        // Byte 5-8: SRID (E6 10 00 00 = 4326)
        // Byte 9-16: X (Longitude) as Double
        // Byte 17-24: Y (Latitude) as Double
        
        const isLittleEndian = bytes[0] === 1;
        const lng = view.getFloat64(9, isLittleEndian);
        const lat = view.getFloat64(17, isLittleEndian);

        return { lat, lng };
    } catch (e) {
        console.error("Errore decodifica HEX location:", e);
        return { lat: 0, lng: 0 };
    }
};

export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

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

export const HEX_DIRECTIONS = [
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: 1, r: -1 }
];

export const bearingToHexDirectionIndex = (bearing: number) => {
    const normalized = (bearing + 360) % 360;
    if (normalized >= 30 && normalized < 90) return 0;
    if (normalized >= 90 && normalized < 150) return 1;
    if (normalized >= 150 && normalized < 210) return 2;
    if (normalized >= 210 && normalized < 270) return 3;
    if (normalized >= 270 && normalized < 330) return 4;
    return 5;
};

export const getHexPixelPosition = (q: number, r: number, size: number) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 3/2 * r;
    return { x, y };
};

export const getZoneCountry = (name: string): string => {
    const parts = name.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : 'XX';
};

const shiftZoneRecursively = (
    occupantId: string, 
    pushDirectionIndex: number, 
    zoneMap: Map<string, Zone>, 
    coordMap: Map<string, string>,
    modifiedZones: Map<string, Zone>
) => {
    const occupier = zoneMap.get(occupantId);
    if (!occupier) return;

    const dir = HEX_DIRECTIONS[pushDirectionIndex];
    const newX = occupier.x + dir.q;
    const newY = occupier.y + dir.r;
    const newKey = `${newX},${newY}`;

    const nextOccupantId = coordMap.get(newKey);
    if (nextOccupantId) {
        shiftZoneRecursively(nextOccupantId, pushDirectionIndex, zoneMap, coordMap, modifiedZones);
    }

    const updatedZone = { ...occupier, x: newX, y: newY };
    coordMap.delete(`${occupier.x},${occupier.y}`);
    coordMap.set(newKey, occupier.id);
    zoneMap.set(occupier.id, updatedZone);
    modifiedZones.set(occupier.id, updatedZone);
};

export const insertZoneAndShift = (
    targetLat: number, 
    targetLng: number, 
    countryCode: string, 
    currentZones: Zone[]
): { x: number, y: number, shiftedZones: Zone[] } => {
    const zoneMap = new Map<string, Zone>();
    const coordMap = new Map<string, string>();
    currentZones.forEach(z => {
        zoneMap.set(z.id, z);
        coordMap.set(`${z.x},${z.y}`, z.id);
    });

    const modifiedZones = new Map<string, Zone>();
    const sameCountryZones = currentZones.filter(z => getZoneCountry(z.name) === countryCode);
    
    let anchor: Zone | null = null;
    let bearing = 0;
    let distanceBuffer = 1;

    if (sameCountryZones.length > 0) {
        let minDist = Infinity;
        sameCountryZones.forEach(z => {
            const d = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
            if (d < minDist) {
                minDist = d;
                anchor = z;
            }
        });
        distanceBuffer = 1; 
    } else if (currentZones.length > 0) {
        let minDist = Infinity;
        currentZones.forEach(z => {
            const d = getDistanceFromLatLonInKm(targetLat, targetLng, z.lat, z.lng);
            if (d < minDist) {
                minDist = d;
                anchor = z;
            }
        });
        distanceBuffer = 4;
    } else {
        return { x: 0, y: 0, shiftedZones: [] };
    }

    if (!anchor) return { x: 0, y: 0, shiftedZones: [] };

    bearing = getBearing(anchor.lat, anchor.lng, targetLat, targetLng);
    const hexDirIndex = bearingToHexDirectionIndex(bearing);
    const dir = HEX_DIRECTIONS[hexDirIndex];

    const targetX = anchor.x + (dir.q * distanceBuffer);
    const targetY = anchor.y + (dir.r * distanceBuffer);
    const targetKey = `${targetX},${targetY}`;

    const occupierId = coordMap.get(targetKey);
    if (occupierId) {
        shiftZoneRecursively(occupierId, hexDirIndex, zoneMap, coordMap, modifiedZones);
    }

    return { 
        x: targetX, 
        y: targetY, 
        shiftedZones: Array.from(modifiedZones.values()) 
    };
};