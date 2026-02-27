import { Zone } from '../types';

export const R = 6371;

export const deg2rad = (deg: number) => deg * (Math.PI / 180);
export const rad2deg = (rad: number) => rad * (180 / Math.PI);

/**
 * Decodifica una stringa HEX PostGIS (EWKB) in coordinate lat/lng.
 */
export const decodePostGISLocation = (hex: string): { lat: number; lng: number } => {
    if (!hex || hex.length < 50) return { lat: 0, lng: 0 };
    try {
        const pureHex = hex.startsWith('\\x') ? hex.substring(2) : hex;
        const bytes = new Uint8Array(pureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const view = new DataView(bytes.buffer);
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

/**
 * Calcola l'angolo (bearing) tra due punti GPS in gradi (0-360).
 */
export const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const y = Math.sin(deg2rad(lon2 - lon1)) * Math.cos(deg2rad(lat2));
    const x = Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
              Math.sin(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(lon2 - lon1));
    const brng = rad2deg(Math.atan2(y, x));
    return (brng + 360) % 360;
};

/**
 * Mappa un angolo in gradi a una delle 6 direzioni esagonali (0-5).
 * 0: E, 1: SE, 2: SW, 3: W, 4: NW, 5: NE
 */
export const bearingToHexDirection = (bearing: number) => {
    // 0 gradi è Nord.
    // Direzioni esagonali (Pointy topped): 
    // 30deg (NE), 90deg (E), 150deg (SE), 210deg (SW), 270deg (W), 330deg (NW)
    if (bearing >= 60 && bearing < 120) return 0;   // Est
    if (bearing >= 120 && bearing < 180) return 1;  // Sud-Est
    if (bearing >= 180 && bearing < 240) return 2;  // Sud-Ovest
    if (bearing >= 240 && bearing < 300) return 3;  // Ovest
    if (bearing >= 300 && bearing < 360) return 4;  // Nord-Ovest
    return 5; // Nord-Est (360/0 - 60)
};

const hexOffsets = [
    { x: 1, y: 0 },   // 0: E
    { x: 0, y: 1 },   // 1: SE
    { x: -1, y: 1 },  // 2: SW
    { x: -1, y: 0 },  // 3: W
    { x: 0, y: -1 },  // 4: NW
    { x: 1, y: -1 }   // 5: NE
];

// Coordinate di proiezione deterministica per l'ancoraggio iniziale dei cluster
const MAP_SCALE_LAT = 111 / 0.85; 
const MAP_SCALE_LNG = (111 * Math.cos(deg2rad(45))) / 0.85;

export const latLngToHexCoords = (lat: number, lng: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn("Invalid lat/lng passed to latLngToHexCoords, using origin.");
        return { q: 0, r: 0 };
    }
    const r = Math.round(lat * MAP_SCALE_LAT);
    const q = Math.round(lng * MAP_SCALE_LNG);
    return { q, r };
};

export const getHexPixelPosition = (q: number, r: number, size: number) => {
    const x = size * Math.sqrt(3) * (q + r / 2);
    const y = size * 3/2 * r;
    return { x, y };
};

/**
 * Sposta ricorsivamente una catena di zone in una direzione specifica.
 */
const shiftZoneRecursively = (
    startX: number, 
    startY: number, 
    dirIndex: number, 
    allZones: Zone[], 
    shifted: Zone[]
) => {
    const occupant = allZones.find(z => z.x === startX && z.y === startY);
    if (!occupant) return;

    const offset = hexOffsets[dirIndex];
    const nextX = occupant.x + offset.x;
    const nextY = occupant.y + offset.y;

    // Se la cella successiva è occupata, sposta anche quella
    shiftZoneRecursively(nextX, nextY, dirIndex, allZones, shifted);

    // Aggiorna la posizione dell'occupante attuale
    occupant.x = nextX;
    occupant.y = nextY;
    shifted.push(occupant);
};

export const insertZoneAndShift = (
    targetLat: number, 
    targetLng: number, 
    countryCode: string, 
    currentZones: Zone[]
): { x: number, y: number, shiftedZones: Zone[] } => {
    // LOGICA DI POSIZIONAMENTO (Visione ZoneRun):
    // 1. Nation Clustering: Le zone sono raggruppate per nazione (countryCode).
    // 2. Geodesic Anchoring: Se una nazione non ha zone, la prima viene piazzata 
    //    usando una proiezione deterministica (latLngToHexCoords) che garantisce 
    //    la separazione geografica tra i cluster nazionali.
    // 3. Topological Proximity: Le nuove zone di un cluster esistente vengono piazzate 
    //    accanto al membro più vicino, mantenendo la coerenza locale.
    // 4. Elastic Shifting: Se una posizione è occupata, la catena di zone viene 
    //    spostata ricorsivamente per fare spazio, permettendo ai cluster di espandersi 
    //    e "spingersi" a vicenda senza sovrapposizioni.

    const cluster = currentZones.filter(z => z.name.endsWith(` - ${countryCode}`));

    // 2. Se il cluster è vuoto, usiamo la proiezione deterministica come ancora
    if (cluster.length === 0) {
        const { q, r } = latLngToHexCoords(targetLat, targetLng);
        return { x: q, y: r, shiftedZones: [] };
    }

    // 3. Troviamo il membro del cluster geograficamente più vicino
    const clusterWithCoords = cluster.map(z => {
        // Usiamo lat/lng se presenti e validi, altrimenti decodifichiamo la location PostGIS
        let lat = z.lat;
        let lng = z.lng;
        
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
            const decoded = decodePostGISLocation(z.location);
            lat = decoded.lat;
            lng = decoded.lng;
        }
        
        return {
            zone: { ...z },
            coords: { lat, lng }
        };
    });

    const sortedCluster = clusterWithCoords.sort((a, b) => {
        const distA = getDistanceFromLatLonInKm(targetLat, targetLng, a.coords.lat, a.coords.lng);
        const distB = getDistanceFromLatLonInKm(targetLat, targetLng, b.coords.lat, b.coords.lng);
        return distA - distB;
    });

    const closest = sortedCluster[0];
    
    // 4. Calcoliamo la direzione ideale rispetto al membro più vicino
    const bearing = getBearing(closest.coords.lat, closest.coords.lng, targetLat, targetLng);
    const direction = bearingToHexDirection(bearing);
    
    const offset = hexOffsets[direction];
    let targetX = closest.zone.x + offset.x;
    let targetY = closest.zone.y + offset.y;

    // 5. Gestione inserimento con spostamento (Shifting)
    // Se la posizione ideale è occupata, "spingiamo" la catena di esagoni in quella direzione
    // per fare spazio alla nuova zona al centro (come richiesto dall'utente).
    const shiftedZones: Zone[] = [];
    const collision = currentZones.find(z => z.x === targetX && z.y === targetY);
    
    if (collision) {
        // Spostiamo ricorsivamente tutto ciò che ostacola l'inserimento topologico
        shiftZoneRecursively(targetX, targetY, direction, currentZones, shiftedZones);
    }

    return { 
        x: targetX, 
        y: targetY, 
        shiftedZones 
    };
};