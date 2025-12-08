
import { RunAnalysisData } from '../types';
import { getDistanceFromLatLonInKm } from './geo';

// Returns an array of tracks, where each track is an array of points
export const parseGPX = (text: string): { lat: number, lng: number, ele: number, time: Date }[][] => {
    console.log("📂 [GPX] Starting XML Parsing...");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        console.error("❌ [GPX] XML Parsing Error");
        throw new Error("Malformed XML/GPX file.");
    }

    const tracks: { lat: number, lng: number, ele: number, time: Date }[][] = [];
    const trkNodes = xmlDoc.getElementsByTagName("trk");

    const extractPointsFromNode = (node: Element) => {
        const trkpts = node.getElementsByTagName("trkpt");
        const points = [];
        for (let i = 0; i < trkpts.length; i++) {
            const p = trkpts[i];
            const latStr = p.getAttribute("lat");
            const lngStr = p.getAttribute("lon");

            if (!latStr || !lngStr) continue;

            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            
            const eleNode = p.getElementsByTagName("ele")[0];
            const ele = eleNode && eleNode.textContent ? parseFloat(eleNode.textContent) : 0;
            
            const timeNode = p.getElementsByTagName("time")[0];
            let time = new Date();
            
            if (timeNode && timeNode.textContent) {
                 const t = new Date(timeNode.textContent);
                 if (!isNaN(t.getTime())) {
                     time = t;
                 } else {
                     continue;
                 }
            } else {
                 continue;
            }
            
            points.push({ lat, lng, ele, time });
        }
        return points;
    };

    if (trkNodes.length > 0) {
        console.log(`📂 [GPX] Found ${trkNodes.length} tracks (<trk>).`);
        for (let i = 0; i < trkNodes.length; i++) {
             const points = extractPointsFromNode(trkNodes[i]);
             if (points.length >= 2) tracks.push(points);
        }
    } else {
        // Fallback: try finding loose trkpts if no <trk> structure exists (rare but possible)
        console.log("📂 [GPX] No <trk> elements found. Searching for loose <trkpt>...");
        const allTrkPts = xmlDoc.getElementsByTagName("trkpt");
        if (allTrkPts.length >= 2) {
             // Treat all loose points as a single track
             // Create a dummy node to use the same extractor or just iterate
             const points = [];
             for (let i = 0; i < allTrkPts.length; i++) {
                const p = allTrkPts[i];
                const lat = parseFloat(p.getAttribute("lat") || "0");
                const lng = parseFloat(p.getAttribute("lon") || "0");
                const ele = parseFloat(p.getElementsByTagName("ele")[0]?.textContent || "0");
                const timeStr = p.getElementsByTagName("time")[0]?.textContent;
                if(timeStr) points.push({ lat, lng, ele, time: new Date(timeStr) });
             }
             if (points.length >= 2) tracks.push(points);
        }
    }

    if (tracks.length === 0) {
        throw new Error("No valid tracks with time data found in GPX.");
    }

    console.log(`✅ [GPX] Successfully extracted ${tracks.length} tracks.`);
    return tracks;
};

export const analyzeRun = (points: { lat: number, lng: number, ele: number, time: Date }[], fileName: string): { result: RunAnalysisData, logs: string[] } => {
    const logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

    log(`📊 [ANALYSIS] Analyzing track with ${points.length} points...`);
    let totalKm = 0;
    let maxSpeed = 0;
    let totalTime = 0;
    let elevationGain = 0;
    
    const startTime = points[0].time.getTime();

    if (points.length < 2) {
        return {
            result: {
                fileName: fileName,
                totalKm: 0, durationMinutes: 0, avgSpeed: 0, maxSpeed: 0, elevation: 0,
                startTime: startTime,
                startPoint: points[0], endPoint: points[0], points: [], isValid: false, failureReason: "Not enough data points."
            },
            logs
        };
    }

    const SMOOTH_WINDOW = 3; 

    for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const prev = points[Math.max(0, i - 1)];
        const prevSmoothed = points[Math.max(0, i - SMOOTH_WINDOW)];

        const dist = getDistanceFromLatLonInKm(prev.lat, prev.lng, curr.lat, curr.lng);
        
        const distSmooth = getDistanceFromLatLonInKm(prevSmoothed.lat, prevSmoothed.lng, curr.lat, curr.lng);
        const timeDiffHours = (curr.time.getTime() - prevSmoothed.time.getTime()) / (1000 * 60 * 60);

        let instantSpeed = 0;
        if (timeDiffHours > 0) {
            instantSpeed = distSmooth / timeDiffHours;
        }

        if (instantSpeed > 300) {
            // Glitch ignored
            continue; 
        }

        if (instantSpeed > maxSpeed) {
            maxSpeed = instantSpeed;
        }

        if (curr.ele > prev.ele) {
            elevationGain += (curr.ele - prev.ele);
        }

        totalKm += dist;
    }

    const endTime = points[points.length - 1].time.getTime();
    totalTime = (endTime - startTime) / (1000 * 60); // minutes
    
    const avgSpeed = totalTime > 0 ? (totalKm / (totalTime / 60)) : 0; // km/h

    log(`📉 [STATS] ${totalKm.toFixed(2)}km | ${totalTime.toFixed(1)}min | Avg: ${avgSpeed.toFixed(1)}km/h | Max: ${maxSpeed.toFixed(1)}km/h`);

    let isValid = true;
    let failureReason = "";

    if (totalKm === 0) { isValid = false; failureReason = "Distance is 0km."; }
    else if (avgSpeed > 25) { isValid = false; failureReason = `Avg speed suspicious: ${avgSpeed.toFixed(1)} km/h`; }
    else if (maxSpeed > 50) { isValid = false; failureReason = `Max speed spike: ${maxSpeed.toFixed(1)} km/h`; } 
    else if (totalTime < 1) { isValid = false; failureReason = "Duration too short (< 1 min)."; }

    log(`🛡️ [ANTI-FRAUD] Result: ${isValid ? 'PASSED' : 'FAILED'} (${failureReason})`);

    return {
        result: {
            fileName: fileName,
            totalKm,
            startTime,
            durationMinutes: totalTime,
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