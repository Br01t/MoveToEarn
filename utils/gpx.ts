
import { RunAnalysisData } from '../types';
import { getDistanceFromLatLonInKm } from './geo';
import { parseActivityFile as parseFile } from './fileParsers';

// Re-export parseActivityFile to maintain compatibility with existing imports
export const parseActivityFile = parseFile;
export const parseGPX = async (data: string) => parseFile(data, 'file.gpx');

// --- ROBUST ANALYSIS & ANTI-CHEAT ---
export const analyzeRun = (points: { lat: number, lng: number, ele: number, time: Date }[], fileName: string): { result: RunAnalysisData, logs: string[] } => {
    const logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

    log(`📊 [ANALYSIS] Analyzing track with ${points.length} points...`);
    
    // Sort just in case parser missed it
    points.sort((a, b) => a.time.getTime() - b.time.getTime());

    let totalKm = 0;
    let maxSpeed = 0;
    let elevationGain = 0;
    const startTime = points[0].time.getTime();

    if (points.length < 2) {
        return {
            result: {
                fileName, totalKm: 0, durationMinutes: 0, avgSpeed: 0, maxSpeed: 0, elevation: 0,
                startTime, startPoint: points[0], endPoint: points[0], points: [], isValid: false, failureReason: "Not enough data points."
            }, logs
        };
    }

    const SMOOTH_WINDOW = 3; 
    let validPointsCount = 0;

    for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const prev = points[Math.max(0, i - 1)];
        const prevSmoothed = points[Math.max(0, i - SMOOTH_WINDOW)];

        const dist = getDistanceFromLatLonInKm(prev.lat, prev.lng, curr.lat, curr.lng);
        const distSmooth = getDistanceFromLatLonInKm(prevSmoothed.lat, prevSmoothed.lng, curr.lat, curr.lng);
        const timeDiffHours = (curr.time.getTime() - prevSmoothed.time.getTime()) / (1000 * 60 * 60);

        // --- ANTI-CHEAT: TELEPORTATION CHECK ---
        // Calculate instantaneous speed between adjacent points to catch glitches or editing
        const instantTimeDiffSec = (curr.time.getTime() - prev.time.getTime()) / 1000;
        
        if (instantTimeDiffSec > 0) {
            const instantSpeedKmh = (dist / (instantTimeDiffSec / 3600));
            // If speed between two points > 100km/h, it's likely a GPS error or teleport
            // Unless distance is very small (GPS jitter)
            if (instantSpeedKmh > 100 && dist > 0.05) {
                log(`⚠️ Ignored jump: ${instantSpeedKmh.toFixed(1)} km/h at ${curr.time.toLocaleTimeString()}`);
                continue; // Skip this point addition
            }
        }

        let smoothedSpeed = 0;
        if (timeDiffHours > 0) {
            smoothedSpeed = distSmooth / timeDiffHours;
        }

        // Glitch filtering for general calc
        if (smoothedSpeed > 300) continue; 

        if (smoothedSpeed > maxSpeed) maxSpeed = smoothedSpeed;

        if (curr.ele > prev.ele) {
            // Filter crazy elevation jumps (e.g. > 50m in 1 second)
            if ((curr.ele - prev.ele) < 50) {
                elevationGain += (curr.ele - prev.ele);
            }
        }

        totalKm += dist;
        validPointsCount++;
    }

    const endTime = points[points.length - 1].time.getTime();
    const totalTime = (endTime - startTime) / (1000 * 60); // minutes
    
    // Average Speed based on Total Distance / Total Time (excludes paused time if file has gaps, but good enough for GPX)
    const avgSpeed = totalTime > 0 ? (totalKm / (totalTime / 60)) : 0; // km/h

    log(`📉 [STATS] ${totalKm.toFixed(2)}km | ${totalTime.toFixed(1)}min | Avg: ${avgSpeed.toFixed(1)}km/h | Max: ${maxSpeed.toFixed(1)}km/h`);

    let isValid = true;
    let failureReason = "";

    // --- FINAL VALIDATION RULES ---
    if (totalKm === 0 || totalKm < 0.1) { isValid = false; failureReason = "Distance too short (< 100m)."; }
    else if (avgSpeed > 25) { isValid = false; failureReason = `Avg speed suspicious: ${avgSpeed.toFixed(1)} km/h (Limit: 25)`; }
    else if (maxSpeed > 50) { isValid = false; failureReason = `Max speed spike: ${maxSpeed.toFixed(1)} km/h (Limit: 50)`; } 
    else if (totalTime < 1) { isValid = false; failureReason = "Duration too short (< 1 min)."; }
    else if (validPointsCount < 5) { isValid = false; failureReason = "Not enough valid GPS points."; }

    log(`🛡️ [ANTI-FRAUD] Result: ${isValid ? 'PASSED' : 'FAILED'} (${failureReason})`);

    return {
        result: {
            fileName,
            totalKm,
            startTime,
            durationMinutes: totalTime,
            avgSpeed,
            maxSpeed,
            elevation: elevationGain,
            startPoint: points[0],
            endPoint: points[points.length - 1],
            points, // Return full array for detailed map matching if needed
            isValid,
            failureReason
        },
        logs
    };
};