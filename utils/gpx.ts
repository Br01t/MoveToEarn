import { RunAnalysisData } from '../types';
import { getDistanceFromLatLonInKm } from './geo';
import { parseActivityFile as parseFile } from './fileParsers';

// Re-export parseActivityFile to maintain compatibility with existing imports
export const parseActivityFile = parseFile;

// --- ROBUST ANALYSIS & ANTI-CHEAT ---
export const analyzeRun = (
    points: { lat: number, lng: number, ele: number, time: Date }[], 
    fileName: string,
    fileDistance?: number // Distanza letta dai metadati del file
): { result: RunAnalysisData, logs: string[] } => {
    const logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

    console.group(`📊 [ANALISI_CORSA] File: ${fileName}`);
    log(`Punti traccia: ${points.length}`);
    
    points.sort((a, b) => a.time.getTime() - b.time.getTime());

    let calculatedKm = 0;
    let maxSpeed = 0;
    let elevationGain = 0;
    const startTime = points[0].time.getTime();

    if (points.length < 2) {
        console.groupEnd();
        return {
            result: {
                fileName, totalKm: 0, durationMinutes: 0, avgSpeed: 0, maxSpeed: 0, elevation: 0,
                startTime, startPoint: points[0], endPoint: points[0], points: [], isValid: false, failureReason: "Dati GPS insufficienti."
            }, logs
        };
    }

    // Calcolo geometrico per verifica incrociata
    for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const prev = points[i - 1];
        const dist = getDistanceFromLatLonInKm(prev.lat, prev.lng, curr.lat, curr.lng);
        
        const instantTimeDiffSec = (curr.time.getTime() - prev.time.getTime()) / 1000;
        if (instantTimeDiffSec > 0) {
            const instantSpeedKmh = (dist / (instantTimeDiffSec / 3600));
            // Filtro spike GPS
            if (instantSpeedKmh > 150 && dist > 0.05) continue; 
            if (instantSpeedKmh > maxSpeed) maxSpeed = instantSpeedKmh;
        }

        if (curr.ele > prev.ele) {
            const diff = curr.ele - prev.ele;
            if (diff < 50) elevationGain += diff;
        }

        calculatedKm += dist;
    }

    // LOGICA DISTANZA: Diamo priorità assoluta al metadato del file (se presente e positivo)
    // Questo garantisce il match 1:1 con Strava/Garmin
    let finalTotalKm = (fileDistance !== undefined && fileDistance > 0) ? fileDistance : calculatedKm;

    const endTime = points[points.length - 1].time.getTime();
    const totalTimeMinutes = (endTime - startTime) / (1000 * 60); 
    const avgSpeed = totalTimeMinutes > 0 ? (finalTotalKm / (totalTimeMinutes / 60)) : 0;

    log(`📏 Distanza Metadati File: ${fileDistance?.toFixed(2) || 'N/A'} km`);
    log(`📐 Distanza Calcolata Punti: ${calculatedKm.toFixed(2)} km`);
    log(`🎯 Distanza Finale ZoneRun: ${finalTotalKm.toFixed(2)} km`);
    console.groupEnd();

    let isValid = true;
    let failureReason = "";

    if (finalTotalKm < 0.1) { isValid = false; failureReason = "Distanza troppo breve."; }
    else if (avgSpeed > 25) { isValid = false; failureReason = `Velocità media sospetta: ${avgSpeed.toFixed(1)} km/h`; }
    else if (maxSpeed > 60) { isValid = false; failureReason = `Rilevato spike di velocità eccessivo.`; } 

    return {
        result: {
            fileName,
            totalKm: finalTotalKm,
            startTime,
            durationMinutes: totalTimeMinutes,
            avgSpeed,
            maxSpeed,
            elevation: elevationGain,
            startPoint: points[0],
            endPoint: points[points.length - 1],
            points, 
            isValid,
            failureReason
        },
        logs
    };
};