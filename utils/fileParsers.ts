import FitParser from 'fit-file-parser';

export interface ActivityPoint {
    lat: number;
    lng: number;
    ele: number;
    time: Date;
}

export interface ActivityResult {
    points: ActivityPoint[];
    distance?: number; // Distanza in KM letta dai metadati del file
}

// Helper: Parse FIT file (Binary)
export const parseFIT = (buffer: ArrayBuffer): Promise<ActivityResult[]> => {
    return new Promise((resolve, reject) => {
        try {
            const ParserClass = (FitParser as any).default || FitParser;
            const parser = new ParserClass({
                force: true,
                speedUnit: 'km/h',
                lengthUnit: 'km',
                temperatureUnit: 'celsius',
                elapsedRecordField: true,
                mode: 'cascade', 
            });

            const uint8Array = new Uint8Array(buffer);

            parser.parse(uint8Array, (error: any, data: any) => {
                if (error) {
                    reject(new Error(`Errore FIT: ${error.message}`));
                    return;
                }

                const points: ActivityPoint[] = [];
                const records = data.records || data.record || [];
                
                if (records.length === 0 && data.activity?.sessions) {
                    data.activity.sessions.forEach((s: any) => {
                        if (s.laps) s.laps.forEach((l: any) => records.push(...(l.records || l.record || [])));
                    });
                }

                for (const record of records) {
                    const rawLat = record.position_lat ?? record.lat ?? record.latitude;
                    const rawLng = record.position_long ?? record.lng ?? record.longitude ?? record.position_lon;
                    if (rawLat !== undefined && rawLng !== undefined && record.timestamp) {
                        const SEMICIRCLE_CONVERSION = 180 / 2147483648;
                        const lat = Math.abs(rawLat) > 180 ? rawLat * SEMICIRCLE_CONVERSION : rawLat;
                        const lng = Math.abs(rawLng) > 180 ? rawLng * SEMICIRCLE_CONVERSION : rawLng;
                        points.push({ lat, lng, ele: record.enhanced_altitude || record.altitude || 0, time: new Date(record.timestamp) });
                    }
                }

                // Estrazione Distanza Totale dai metadati FIT (total_distance è in metri)
                let fileDist: number | undefined = undefined;
                if (data.sessions && data.sessions[0] && data.sessions[0].total_distance !== undefined) {
                    fileDist = data.sessions[0].total_distance / 1000;
                }

                if (points.length < 2) {
                    reject(new Error("File FIT senza dati GPS."));
                } else {
                    points.sort((a, b) => a.time.getTime() - b.time.getTime());
                    resolve([{ points, distance: fileDist }]);
                }
            });
        } catch (err: any) {
            reject(new Error(`Crash Parser FIT: ${err.message}`));
        }
    });
};

// Helper: Parse TCX
export const parseTCX = (xmlDoc: Document): ActivityResult[] => {
    const results: ActivityResult[] = [];
    const activities = xmlDoc.getElementsByTagName("Activity");

    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const laps = activity.getElementsByTagName("Lap");
        const activityPoints: ActivityPoint[] = [];
        let totalMeters = 0;

        for (let j = 0; j < laps.length; j++) {
            const lap = laps[j];
            // TCX DistanceMeters è standard per ogni Lap
            const distNode = lap.getElementsByTagName("DistanceMeters")[0];
            if (distNode?.textContent) totalMeters += parseFloat(distNode.textContent);

            const trackpoints = lap.getElementsByTagName("Trackpoint");
            for (let k = 0; k < trackpoints.length; k++) {
                const tp = trackpoints[k];
                const position = tp.getElementsByTagName("Position")[0];
                const timeStr = tp.getElementsByTagName("Time")[0]?.textContent;
                if (timeStr && position) {
                    const lat = position.getElementsByTagName("LatitudeDegrees")[0]?.textContent;
                    const lng = position.getElementsByTagName("LongitudeDegrees")[0]?.textContent;
                    const ele = tp.getElementsByTagName("AltitudeMeters")[0]?.textContent;
                    if (lat && lng) {
                        activityPoints.push({ lat: parseFloat(lat), lng: parseFloat(lng), ele: ele ? parseFloat(ele) : 0, time: new Date(timeStr) });
                    }
                }
            }
        }
        if (activityPoints.length >= 2) {
            activityPoints.sort((a, b) => a.time.getTime() - b.time.getTime());
            results.push({ points: activityPoints, distance: totalMeters > 0 ? totalMeters / 1000 : undefined });
        }
    }
    return results;
};

// Helper: Parse GPX
export const parseGPXInternal = (xmlDoc: Document): ActivityResult[] => {
    const results: ActivityResult[] = [];
    const trkNodes = xmlDoc.getElementsByTagName("trk");

    // Prova a cercare estensioni di distanza totale nel metadato GPX (Strava/Garmin extensions)
    let globalDistance: number | undefined = undefined;
    const extensions = xmlDoc.getElementsByTagName("extensions");
    for (let i = 0; i < extensions.length; i++) {
        const ext = extensions[i];
        const distNode = ext.getElementsByTagName("distance")[0] || 
                         ext.getElementsByTagName("TotalDistance")[0] ||
                         ext.getElementsByTagName("gpxtpx:distance")[0];
        if (distNode && distNode.textContent) {
            const val = parseFloat(distNode.textContent);
            globalDistance = val > 500 ? val / 1000 : val; // Se > 500 probabilmente sono metri
            break;
        }
    }

    const processTrk = (node: Element) => {
        const trkpts = node.getElementsByTagName("trkpt");
        const points = [];
        for (let i = 0; i < trkpts.length; i++) {
            const p = trkpts[i];
            const timeNode = p.getElementsByTagName("time")[0];
            if (timeNode && timeNode.textContent) {
                 points.push({
                    lat: parseFloat(p.getAttribute("lat") || "0"),
                    lng: parseFloat(p.getAttribute("lon") || "0"),
                    ele: parseFloat(p.getElementsByTagName("ele")[0]?.textContent || "0"),
                    time: new Date(timeNode.textContent)
                 });
            }
        }
        return points;
    };

    if (trkNodes.length > 0) {
        for (let i = 0; i < trkNodes.length; i++) {
             const points = processTrk(trkNodes[i]);
             if (points.length >= 2) {
                 points.sort((a, b) => a.time.getTime() - b.time.getTime());
                 results.push({ points, distance: globalDistance });
             }
        }
    } else {
        const allPts = processTrk(xmlDoc as any);
        if (allPts.length >= 2) {
            allPts.sort((a, b) => a.time.getTime() - b.time.getTime());
            results.push({ points: allPts, distance: globalDistance });
        }
    }
    return results;
};

// Main Parser Entry
export const parseActivityFile = async (data: string | ArrayBuffer, filename: string): Promise<ActivityResult[]> => {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.fit') && typeof data !== 'string') return parseFIT(data as ArrayBuffer);
    if (typeof data !== 'string') throw new Error("Dati non validi.");

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) throw new Error("XML Error.");

        if (xmlDoc.getElementsByTagName("TrainingCenterDatabase").length > 0) {
            return parseTCX(xmlDoc);
        } else {
            return parseGPXInternal(xmlDoc);
        }
    } catch (e) {
        try {
            const json = JSON.parse(data);
            const points = (json.points || json.data || []).map((p: any) => ({
                lat: p.lat || p.latitude,
                lng: p.lng || p.longitude,
                ele: p.ele || p.elevation || 0,
                time: new Date(p.time || p.timestamp)
            }));
            return [{ points, distance: json.distance || json.total_km }];
        } catch {
            throw new Error("Formato file non supportato.");
        }
    }
};