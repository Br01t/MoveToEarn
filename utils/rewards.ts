
import { User, Zone, RunEntry, Mission, Badge, RunAnalysisData } from '../types';
import { getDistanceFromLatLonInKm } from './geo';

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
    const ownedZones = currentZones.filter(z => z.ownerId === currentUser.id);
    
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
        case 28: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h < 6; });
        case 30: return new Set(history.map(r => new Date(r.timestamp).getHours())).size >= 24;

        // --- STREAK ---
        case 31: return calculateStreak(history) >= 3;
        case 32: return calculateStreak(history) >= 7;
        case 33: return calculateStreak(history) >= 14;
        case 34: return calculateStreak(history) >= 30;
        case 37: return new Set(history.map(r => new Date(r.timestamp).toDateString())).size >= 200;
        case 38: 
           const currentMonthRuns = history.filter(r => {
               const d = new Date(r.timestamp);
               const now = new Date();
               return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
           });
           return currentMonthRuns.length >= 20;
        case 39: return new Set(history.map(r => new Date(r.timestamp).toDateString())).size >= 50;
        case 40: return calculateStreak(history) >= 60;

        // --- ZONE / EXPLORATION ---
        case 41: return new Set(history.map(r => r.location)).size >= 10;
        case 42: return new Set(history.map(r => r.location)).size >= 25;
        case 43: return new Set(history.map(r => r.location)).size >= 50;
        case 44: return new Set(history.map(r => r.location)).size >= 100;
        case 47: return ownedZones.length >= 1;
        case 48: return ownedZones.length >= 5;
        case 49: return ownedZones.length >= 10;
        case 50: return ownedZones.length >= 25;
        case 51: return history.some(r => r.govEarned && r.govEarned >= 10);
        case 52: return history.filter(r => r.govEarned && r.govEarned >= 10).length >= 10;
        case 53: return history.filter(r => r.govEarned && r.govEarned >= 10).length >= 25;
        
        // --- ENDURANCE ---
        case 69: return history.some(r => (r.duration || 0) >= 90);
        case 70: return history.some(r => (r.duration || 0) >= 120);

        // --- META ---
        case 95: return currentUser.completedMissionIds.length >= 20;
        case 96: return currentUser.earnedBadgeIds.length >= 20;
        case 97: return currentUser.earnedBadgeIds.length >= 50;
        
        default: return false;
    }
};

export interface ProcessedRunResult {
    totalRunEarned: number;
    involvedZoneNames: string[];
    isReinforced: boolean;
    zoneUpdates: Zone[];
    locationName: string;
}

export const processRunRewards = (data: RunAnalysisData, currentUser: User, fullZoneList: Zone[]): ProcessedRunResult => {
    console.log("🏁 [REWARDS] Processing run rewards...");
    const { totalKm, startPoint, endPoint } = data;

    // 1. Identify Zones (using geospatial distance)
    const startZone = fullZoneList.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) < 1.0);
    const endZone = fullZoneList.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) < 1.0);

    // 2. Determine involved zones for splitting
    const involvedZones: Zone[] = [];
    if (startZone) involvedZones.push(startZone);
    if (endZone && (!startZone || endZone.id !== startZone.id)) involvedZones.push(endZone);

    const zoneCount = involvedZones.length;
    const kmPerZone = zoneCount > 0 ? totalKm / zoneCount : 0;
    
    let totalRunEarned = 0;
    let isReinforced = false;
    const involvedZoneNames: string[] = [];

    // Create update list from fullZoneList to ensure we don't miss new zones
    const zoneUpdates = fullZoneList.map(z => ({...z}));

    if (zoneCount === 0) {
        // Wilderness Run (No zones)
        totalRunEarned = totalKm * 10;
        involvedZoneNames.push("Wilderness Run");
    } else {
        // Split logic: Divide KM and Rewards among involved zones
        involvedZones.forEach(invZone => {
            involvedZoneNames.push(invZone.name);
            
            // Calculate Reward for this segment (10 RUN per km)
            const segmentReward = kmPerZone * 10;
            totalRunEarned += segmentReward;

            // Find in update list and update recordKm
            const idx = zoneUpdates.findIndex(z => z.id === invZone.id);
            if (idx !== -1) {
                const targetZone = zoneUpdates[idx];
                // Update Record if Owner
                if (targetZone.ownerId === currentUser.id) {
                    zoneUpdates[idx] = {
                        ...targetZone,
                        recordKm: targetZone.recordKm + kmPerZone
                    };
                    isReinforced = true;
                }
            }
        });
    }

    const locationName = involvedZoneNames.length > 0 ? involvedZoneNames[0] : "Wilderness";

    return {
        totalRunEarned,
        involvedZoneNames,
        isReinforced,
        zoneUpdates,
        locationName
    };
};