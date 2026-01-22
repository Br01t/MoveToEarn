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
    if (item.conditionType === 'TOTAL_KM' && item.conditionValue) {
        return currentUser.totalKm >= item.conditionValue;
    }
    if (item.conditionType === 'OWN_ZONES' && item.conditionValue) {
        const owned = currentZones.filter(z => z.ownerId === currentUser.id).length;
        return owned >= item.conditionValue;
    }

    if (!item.logicId) return false;
    const history = currentUser.runHistory;
    
    switch (item.logicId) {
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
        
        case 11: return history.some(r => (r.maxSpeed || 0) >= 20);
        case 12: return history.some(r => (r.maxSpeed || 0) >= 25);
        case 13: return history.some(r => (r.avgSpeed || 0) >= 12 && r.km >= 2);
        case 14: return history.some(r => (r.avgSpeed || 0) >= 15 && r.km >= 1);
        case 15: return history.some(r => (r.avgSpeed || 0) >= 10 && r.km >= 10);
        case 16: return history.some(r => (r.avgSpeed || 0) >= 12 && r.km >= 5);

        case 18: return history.some(r => (r.elevation || 0) >= 150);
        case 19: return history.some(r => (r.elevation || 0) >= 500);
        case 20: return history.some(r => (r.elevation || 0) >= 1000);
        
        case 21: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 5 && h < 7; });
        case 22: return history.some(r => { const d = new Date(r.timestamp); return d.getHours() === 4 && d.getMinutes() >= 30 || d.getHours() === 5 && d.getMinutes() <= 30; });
        case 23: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 12 && h < 14; });
        case 24: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 18 && h < 20; });
        case 25: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h >= 22 || h < 2; });
        case 26: return history.some(r => { const h = new Date(r.timestamp).getHours(); return h === 0; });
        
        case 31: return calculateStreak(history) >= 3;
        case 32: return calculateStreak(history) >= 7;
        case 33: return calculateStreak(history) >= 14;
        case 34: return calculateStreak(history) >= 30;
        case 40: return calculateStreak(history) >= 60;

        case 41: return new Set(history.map(r => r.location)).size >= 10;
        case 42: return new Set(history.map(r => r.location)).size >= 25;
        case 43: return new Set(history.map(r => r.location)).size >= 50;
        case 44: return new Set(history.map(r => r.location)).size >= 100;
        
        case 47: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 1;
        case 48: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 5;
        case 49: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 10;
        case 50: return currentZones.filter(z => z.ownerId === currentUser.id).length >= 25;

        case 69: return history.some(r => (r.duration || 0) >= 90);
        case 70: return history.some(r => (r.duration || 0) >= 120);

        case 95: return currentUser.completedMissionIds.length >= 20;
        case 96: return currentUser.earnedBadgeIds.length >= 20;
        case 97: return currentUser.earnedBadgeIds.length >= 50;

        case 999: return true; 
        
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
    const totalKm = data.totalKm;
    const { startPoint, endPoint } = data;
    const RADIUS_KM = 1.0; 

    const startZone = allZones.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) <= RADIUS_KM);
    const endZone = allZones.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) <= RADIUS_KM);

    const zoneKmBuckets: Record<string, number> = {};
    
    if (startZone && endZone) {
        if (startZone.id === endZone.id) {
            zoneKmBuckets[startZone.id] = totalKm;
        } else {
            zoneKmBuckets[startZone.id] = parseFloat((totalKm / 2).toFixed(4));
            zoneKmBuckets[endZone.id] = parseFloat((totalKm / 2).toFixed(4));
        }
    } else if (startZone) {
        zoneKmBuckets[startZone.id] = totalKm;
    } else if (endZone) {
        zoneKmBuckets[endZone.id] = totalKm;
    }

    const involvedZoneIds = Object.keys(zoneKmBuckets);
    const involvedZoneNames: string[] = [];
    const zoneUpdates: Zone[] = [...allZones];
    let totalRunEarned = 0;
    let isReinforced = false;

    if (involvedZoneIds.length === 0) {
        totalRunEarned = totalKm * RUN_RATE_BASE;
    } else {
        involvedZoneIds.forEach(id => {
            const zoneIdx = zoneUpdates.findIndex(z => z.id === id);
            if (zoneIdx !== -1) {
                const zone = zoneUpdates[zoneIdx];
                const kmForThisZone = zoneKmBuckets[id];
                involvedZoneNames.push(zone.name);

                const isBoosted = zone.boostExpiresAt && zone.boostExpiresAt > Date.now();
                const rate = isBoosted ? RUN_RATE_BOOST : RUN_RATE_BASE;
                const generatedReward = kmForThisZone * rate;

                totalRunEarned += generatedReward * REWARD_SPLIT_USER;
                const poolAddition = generatedReward * REWARD_SPLIT_POOL;

                const updatedZone = {
                    ...zone,
                    totalKm: (zone.totalKm || 0) + kmForThisZone,
                    interestPool: (zone.interestPool || 0) + poolAddition
                };

                zoneUpdates[zoneIdx] = updatedZone;
                if (zone.ownerId === user.id) isReinforced = true;
            }
        });
    }

    return {
        totalRunEarned: parseFloat(totalRunEarned.toFixed(2)),
        zoneUpdates,
        locationName: involvedZoneNames.length > 0 ? involvedZoneNames.join(', ') : data.fileName,
        involvedZoneNames,
        involvedZoneIds,
        zoneBreakdown: zoneKmBuckets,
        isReinforced
    };
};