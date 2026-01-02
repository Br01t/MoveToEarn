import { User, Zone, RunEntry, Mission, Badge, RunAnalysisData } from '../types';
import { getDistanceFromLatLonInKm } from './geo';
import { RUN_RATE_BASE, RUN_RATE_BOOST, REWARD_SPLIT_USER, REWARD_SPLIT_POOL } from '../constants';

// --- STREAK CALCULATION ---
export const calculateStreak = (history: RunEntry[]): number => {
    if (history.length === 0) return 0;
    
    const days = Array.from(new Set(history.map(run => {
       const d = new Date(run.timestamp);
       d.setHours(0,0,0,0);
       return d.getTime();
    }))).sort((a,b) => b - a);

    if (days.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayTime = today.getTime();
    const diffSinceLastRun = (todayTime - days[0]) / (1000 * 60 * 60 * 24);

    if (diffSinceLastRun > 1) return 0; // Streak broken

    for (let i = 0; i < days.length - 1; i++) {
        const current = days[i];
        const prev = days[i+1];
        const diffDays = (current - prev) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

// --- ACHIEVEMENT LOGIC ---
export const checkAchievement = (item: Mission | Badge, currentUser: User, currentZones: Zone[]): boolean => {
    // 1. LEGACY CHECK
    if (item.conditionType === 'TOTAL_KM' && item.conditionValue) {
        return currentUser.totalKm >= item.conditionValue;
    }
    if (item.conditionType === 'OWN_ZONES' && item.conditionValue) {
        const owned = currentZones.filter(z => z.ownerId === currentUser.id).length;
        return owned >= item.conditionValue;
    }

    // 2. NEW LOGIC SYSTEM
    if (!item.logicId) return false;
    const history = currentUser.runHistory;
    
    switch (item.logicId) {
        // --- DISTANCE ---
        case 1: return currentUser.totalKm >= 10;
        case 2: return currentUser.totalKm >= 50;
        case 3: return currentUser.totalKm >= 100;
        case 4: return history.some(r => r.km >= 10.55);
        case 5: return history.some(r => r.km >= 21);
        case 6: return history.some(r => r.km >= 42.195);
        case 7: return history.some(r => r.km >= 50);
        case 8: return currentUser.totalKm >= 160;
        case 9: return currentUser.totalKm >= 500;
        case 10: return currentUser.totalKm >= 1000;
        
        // --- SPEED ---
        case 11: return history.some(r => (r.maxSpeed || 0) >= 20);
        case 12: return history.some(r => (r.maxSpeed || 0) >= 25);
        case 13: return history.some(r => (r.avgSpeed || 0) >= 12 && r.km >= 2);
        case 14: return history.some(r => (r.avgSpeed || 0) >= 15 && r.km >= 1);
        case 15: return history.some(r => (r.avgSpeed || 0) >= 10 && r.km >= 10);
        case 16: return history.some(r => (r.avgSpeed || 0) >= 12 && r.km >= 5);

        // --- TECHNICAL / ELEVATION ---
        case 18: return history.some(r => (r.elevation || 0) >= 150);
        case 19: return history.some(r => (r.elevation || 0) >= 500);
        case 20: return history.some(r => (r.elevation || 0) >= 1000);
        
        // --- TIME OF DAY ---
        case 21: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 5 && h < 7; });
        case 22: return history.some(r => { const d = new Date(r.timestamp); return d.getHours() === 4 && d.getMinutes() >= 30 || d.getHours() === 5 && d.getMinutes() <= 30; });
        case 23: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 12 && h < 14; });
        case 24: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 18 && h < 20; });
        case 25: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 22 || h < 2; });
        case 26: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h === 0; });
        
        // --- STREAK ---
        case 31: return calculateStreak(history) >= 3;
        case 32: return calculateStreak(history) >= 7;
        case 33: return calculateStreak(history) >= 14;
        case 34: return calculateStreak(history) >= 30;
        case 40: return calculateStreak(history) >= 60;

        // --- ZONE / EXPLORATION ---
        case 41: return new Set(history.map(r => r.location)).size >= 10;
        case 42: return new Set(history.map(r => r.location)).size >= 25;
        case 43: return new Set(history.map(r => r.location)).size >= 50;
        case 44: return new Set(history.map(r => r.location)).size >= 100;
        
        case 47: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 1;
        case 48: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 5;
        case 49: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 10;
        case 50: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 25;

        // --- ENDURANCE ---
        case 69: return history.some(r => (r.duration || 0) >= 90);
        case 70: return history.some(r => (r.duration || 0) >= 120);

        // --- META ---
        case 95: return currentUser.completedMissionIds.length >= 20;
        case 96: return currentUser.earnedBadgeIds.length >= 20;
        case 97: return currentUser.earnedBadgeIds.length >= 50;

        // --- ONBOARDING ---
        case 999: return true; // Welcome Badge: Always returns true (hook filters duplicates)
        
        default: return false;
    }
};

// --- PROCESS RUN & REWARDS ---
export const processRunRewards = (
    data: RunAnalysisData, 
    user: User, 
    allZones: Zone[]
): { 
    totalRunEarned: number; 
    zoneUpdates: Zone[]; 
    locationName: string;
    involvedZoneNames: string[];
    involvedZoneIds: string[]; 
    zoneBreakdown: Record<string, number>; 
    isReinforced: boolean;
} => {
    
    // 1. Identify Involved Zones (START and END only, 1km radius)
    const involvedZoneIds = new Set<string>();
    const terminals = [data.startPoint, data.endPoint];
    const THRESHOLD_KM = 1.0;

    for (const p of terminals) {
        let closestZone: Zone | null = null;
        let minDistance = Infinity;

        for (const z of allZones) {
            const d = getDistanceFromLatLonInKm(p.lat, p.lng, z.lat, z.lng);
            if (d < minDistance) {
                minDistance = d;
                closestZone = z;
            }
        }

        // Only add if within 1km
        if (closestZone && minDistance < THRESHOLD_KM) {
            involvedZoneIds.add(closestZone.id);
        }
    }

    const involvedZonesList = Array.from(involvedZoneIds);
    const zoneCount = involvedZonesList.length;
    
    let totalGrossRun = 0;
    const zoneBreakdown: Record<string, number> = {};
    const involvedZoneNames: string[] = [];
    let isReinforced = false;
    
    // 2. OPTIMIZED UPDATE LOGIC
    const updatedZones = allZones.map(z => {
        if (involvedZoneIds.has(z.id)) {
            involvedZoneNames.push(z.name);
            // Split KM equally among start and end zones (if they are different)
            const kmPerZone = data.totalKm / zoneCount;
            zoneBreakdown[z.id] = parseFloat(kmPerZone.toFixed(4));

            const isBoostActive = z.boostExpiresAt ? z.boostExpiresAt > Date.now() : false;
            const effectiveRate = isBoostActive ? RUN_RATE_BOOST : RUN_RATE_BASE;

            const zoneEarnings = kmPerZone * effectiveRate;
            totalGrossRun += zoneEarnings;

            const poolContribution = zoneEarnings * REWARD_SPLIT_POOL;

            let newZone = { ...z };
            newZone.interestPool = (newZone.interestPool || 0) + poolContribution;
            newZone.totalKm = (newZone.totalKm || 0) + kmPerZone;

            if (z.ownerId === user.id) {
                isReinforced = true;
                newZone.recordKm = (newZone.recordKm || 0) + kmPerZone;
                
                // Defense Level Logic
                if (newZone.recordKm > 50 && newZone.defenseLevel < 2) newZone.defenseLevel = 2;
                if (newZone.recordKm > 150 && newZone.defenseLevel < 3) newZone.defenseLevel = 3;
                if (newZone.recordKm > 500 && newZone.defenseLevel < 4) newZone.defenseLevel = 4;
                if (newZone.recordKm > 1000 && newZone.defenseLevel < 5) newZone.defenseLevel = 5;
            }
            return newZone;
        }
        
        return z; 
    });

    if (zoneCount === 0) {
        // Uncharted Territory (No zones within 1km of start or end)
        totalGrossRun = data.totalKm * RUN_RATE_BASE;
    }

    // Determine primary location name
    let locationName = "Unknown Territory";
    if (zoneCount > 0) {
        const startP = data.startPoint;
        const sortedByProx = involvedZonesList.sort((a,b) => {
            const zA = allZones.find(z => z.id === a)!;
            const zB = allZones.find(z => z.id === b)!;
            const distA = getDistanceFromLatLonInKm(startP.lat, startP.lng, zA.lat, zA.lng);
            const distB = getDistanceFromLatLonInKm(startP.lat, startP.lng, zB.lat, zB.lng);
            return distA - distB;
        });

        const primaryZone = allZones.find(z => z.id === sortedByProx[0]);
        if (primaryZone) {
            locationName = primaryZone.name;
            if (zoneCount > 1) {
                locationName += ` (+${zoneCount - 1} others)`;
            }
        }
    } else {
        locationName = "Uncharted Area"; 
    }

    const totalUserRun = totalGrossRun * REWARD_SPLIT_USER;

    return {
        totalRunEarned: parseFloat(totalUserRun.toFixed(2)),
        zoneUpdates: updatedZones,
        locationName,
        involvedZoneNames,
        involvedZoneIds: involvedZonesList,
        zoneBreakdown,
        isReinforced
    };
};