
import FitParser from 'fit-file-parser';

export interface ActivityPoint {
    lat: number;
    lng: number;
    ele: number;
    time: Date;
}

// Helper: Parse FIT file (Binary)
export const parseFIT = (buffer: ArrayBuffer): Promise<ActivityPoint[][]> => {
    console.log("📂 [PARSER] Detected FIT format.");
    return new Promise((resolve, reject) => {
        const parser = new FitParser({
            force: true,
            speedUnit: 'km/h',
            lengthUnit: 'km',
            temperatureUnit: 'celsius',
            elapsedRecordField: true,
            mode: 'cascade', 
        });

        parser.parse(buffer, (error: any, data: any) => {
            if (error) {
                console.error("❌ [PARSER] FIT Parsing Error", error);
                reject(new Error("Failed to parse FIT file structure."));
                return;
            }

            const points: ActivityPoint[] = [];
            const records = data.records || [];
            
            if (records.length === 0) {
                if (data.activity?.sessions) {
                    data.activity.sessions.forEach((session: any) => {
                        if (session.laps) {
                            session.laps.forEach((lap: any) => {
                                if (lap.records) records.push(...lap.records);
                            });
                        }
                    });
                }
            }

            for (const record of records) {
                if (record.position_lat && record.position_long && record.timestamp) {
                    const SEMICIRCLE_CONVERSION = 180 / 2147483648;
                    const lat = record.position_lat * SEMICIRCLE_CONVERSION;
                    const lng = record.position_long * SEMICIRCLE_CONVERSION;
                    const ele = record.enhanced_altitude || record.altitude || 0;
                    
                    points.push({
                        lat,
                        lng,
                        ele,
                        time: new Date(record.timestamp)
                    });
                }
            }

            if (points.length < 2) {
                reject(new Error("No GPS tracks found in FIT file."));
            } else {
                // Ensure strictly sorted by time
                points.sort((a, b) => a.time.getTime() - b.time.getTime());
                resolve([points]);
            }
        });
    });
};

// Helper: Parse JSON
export const parseJSON = (text: string): ActivityPoint[][] => {
    console.log("📂 [PARSER] Detected JSON format.");
    try {
        const json = JSON.parse(text);
        const points: ActivityPoint[] = [];
        
        let candidates: any[] = [];
        
        if (Array.isArray(json)) candidates = json;
        else if (Array.isArray(json.data)) candidates = json.data;
        else if (Array.isArray(json.points)) candidates = json.points;
        else if (Array.isArray(json.track)) candidates = json.track;
        else if (Array.isArray(json.locations)) candidates = json.locations;

        if (candidates.length < 2) throw new Error("No track points found in JSON.");

        for (const p of candidates) {
            const lat = p.latitude || p.lat || p.y;
            const lng = p.longitude || p.lon || p.lng || p.x;
            const ele = p.elevation || p.ele || p.altitude || p.alt || 0;
            const timeStr = p.timestamp || p.time || p.date || p.startTime;

            if (lat !== undefined && lng !== undefined && timeStr) {
                const time = new Date(timeStr);
                if (!isNaN(time.getTime())) {
                    points.push({
                        lat: parseFloat(lat),
                        lng: parseFloat(lng),
                        ele: parseFloat(ele),
                        time: time
                    });
                }
            }
        }

        if (points.length < 2) throw new Error("Valid GPS data not found in JSON array.");
        
        points.sort((a, b) => a.time.getTime() - b.time.getTime());
        return [points];

    } catch (e: any) {
        console.error("JSON Parse Error:", e);
        throw new Error("Invalid JSON file format.");
    }
};

// Helper: Parse CSV
export const parseCSV = (text: string): ActivityPoint[][] => {
    console.log("📂 [PARSER] Detected CSV format.");
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV file is empty or invalid.");

    const headerRow = lines[0].toLowerCase();
    const delimiter = headerRow.includes(';') ? ';' : ',';
    const headers = headerRow.split(delimiter).map(h => h.trim().replace(/['"]+/g, ''));

    const latIdx = headers.findIndex(h => h.includes('lat'));
    const lngIdx = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
    const eleIdx = headers.findIndex(h => h.includes('ele') || h.includes('alt'));
    const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('date'));

    if (latIdx === -1 || lngIdx === -1 || timeIdx === -1) {
        throw new Error("CSV missing required columns (Latitude, Longitude, Time).");
    }

    const points: ActivityPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(delimiter).map(c => c.trim().replace(/['"]+/g, ''));
        if (cols.length <= Math.max(latIdx, lngIdx, timeIdx)) continue;

        const latVal = parseFloat(cols[latIdx]);
        const lngVal = parseFloat(cols[lngIdx]);
        const eleVal = eleIdx !== -1 ? parseFloat(cols[eleIdx]) : 0;
        const timeStr = cols[timeIdx];

        if (!isNaN(latVal) && !isNaN(lngVal) && timeStr) {
            let time: Date;
            if (/^\d+$/.test(timeStr)) {
                const ts = parseInt(timeStr);
                time = new Date(ts < 100000000000 ? ts * 1000 : ts); 
            } else {
                time = new Date(timeStr);
            }

            if (!isNaN(time.getTime())) {
                points.push({ lat: latVal, lng: lngVal, ele: eleVal, time });
            }
        }
    }

    if (points.length < 2) throw new Error("No valid GPS points extracted from CSV.");
    
    points.sort((a, b) => a.time.getTime() - b.time.getTime());
    return [points];
};

// XML Parsers (GPX/TCX)
export const parseTCX = (xmlDoc: Document): ActivityPoint[][] => {
    const tracks: ActivityPoint[][] = [];
    const activities = xmlDoc.getElementsByTagName("Activity");

    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const laps = activity.getElementsByTagName("Lap");
        const activityPoints: ActivityPoint[] = [];

        for (let j = 0; j < laps.length; j++) {
            const lap = laps[j];
            const track = lap.getElementsByTagName("Track")[0]; 
            if (!track) continue;

            const trackpoints = track.getElementsByTagName("Trackpoint");
            for (let k = 0; k < trackpoints.length; k++) {
                const tp = trackpoints[k];
                const timeStr = tp.getElementsByTagName("Time")[0]?.textContent;
                const position = tp.getElementsByTagName("Position")[0];
                const altitude = tp.getElementsByTagName("AltitudeMeters")[0];

                if (timeStr && position) {
                    const latStr = position.getElementsByTagName("LatitudeDegrees")[0]?.textContent;
                    const lngStr = position.getElementsByTagName("LongitudeDegrees")[0]?.textContent;
                    const eleStr = altitude?.textContent;

                    if (latStr && lngStr) {
                        const time = new Date(timeStr);
                        if (!isNaN(time.getTime())) {
                            activityPoints.push({
                                lat: parseFloat(latStr),
                                lng: parseFloat(lngStr),
                                ele: eleStr ? parseFloat(eleStr) : 0,
                                time: time
                            });
                        }
                    }
                }
            }
        }
        if (activityPoints.length >= 2) {
            activityPoints.sort((a, b) => a.time.getTime() - b.time.getTime());
            tracks.push(activityPoints);
        }
    }
    return tracks;
};

export const parseGPXInternal = (xmlDoc: Document): ActivityPoint[][] => {
    const tracks: ActivityPoint[][] = [];
    const trkNodes = xmlDoc.getElementsByTagName("trk");

    const extractPointsFromNode = (node: Element) => {
        const trkpts = node.getElementsByTagName("trkpt");
        const points = [];
        for (let i = 0; i < trkpts.length; i++) {
            const p = trkpts[i];
            const lat = parseFloat(p.getAttribute("lat") || "0");
            const lng = parseFloat(p.getAttribute("lon") || "0");
            const eleNode = p.getElementsByTagName("ele")[0];
            const ele = eleNode && eleNode.textContent ? parseFloat(eleNode.textContent) : 0;
            const timeNode = p.getElementsByTagName("time")[0];
            
            if (timeNode && timeNode.textContent) {
                 const time = new Date(timeNode.textContent);
                 if (!isNaN(time.getTime())) {
                     points.push({ lat, lng, ele, time });
                 }
            }
        }
        return points;
    };

    if (trkNodes.length > 0) {
        for (let i = 0; i < trkNodes.length; i++) {
             const points = extractPointsFromNode(trkNodes[i]);
             if (points.length >= 2) {
                 points.sort((a, b) => a.time.getTime() - b.time.getTime());
                 tracks.push(points);
             }
        }
    } else {
        const allTrkPts = xmlDoc.getElementsByTagName("trkpt");
        if (allTrkPts.length >= 2) {
             const points = [];
             for (let i = 0; i < allTrkPts.length; i++) {
                const p = allTrkPts[i];
                const lat = parseFloat(p.getAttribute("lat") || "0");
                const lng = parseFloat(p.getAttribute("lon") || "0");
                const ele = parseFloat(p.getElementsByTagName("ele")[0]?.textContent || "0");
                const timeStr = p.getElementsByTagName("time")[0]?.textContent;
                if(timeStr) {
                    const time = new Date(timeStr);
                    if(!isNaN(time.getTime())) points.push({ lat, lng, ele, time });
                }
             }
             if (points.length >= 2) {
                 points.sort((a, b) => a.time.getTime() - b.time.getTime());
                 tracks.push(points);
             }
        }
    }
    return tracks;
};

// Main Parser Entry
export const parseActivityFile = async (data: string | ArrayBuffer, filename: string): Promise<{ lat: number, lng: number, ele: number, time: Date }[][]> => {
    console.log("📂 [PARSER] Starting Parsing:", filename);
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.fit') && typeof data !== 'string') {
        return parseFIT(data as ArrayBuffer);
    }

    if (typeof data !== 'string') throw new Error("Invalid file content for text parser.");

    if (lowerName.endsWith('.json')) return parseJSON(data);
    if (lowerName.endsWith('.csv')) return parseCSV(data);

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const parserError = xmlDoc.getElementsByTagName("parsererror");
        
        if (parserError.length > 0) throw new Error("Malformed XML file.");

        if (xmlDoc.getElementsByTagName("TrainingCenterDatabase").length > 0) {
            const tcxTracks = parseTCX(xmlDoc);
            if (tcxTracks.length === 0) throw new Error("No valid GPS tracks found in TCX file.");
            return tcxTracks;
        } else if (xmlDoc.getElementsByTagName("gpx").length > 0 || xmlDoc.getElementsByTagName("trk").length > 0) {
            const gpxTracks = parseGPXInternal(xmlDoc);
            if (gpxTracks.length === 0) throw new Error("No valid tracks with time data found in GPX.");
            return gpxTracks;
        }
    } catch (e) {
        // Fallback checks
        if (data.trim().startsWith('{') || data.trim().startsWith('[')) return parseJSON(data);
        const firstLine = data.split('\n')[0].toLowerCase();
        if ((firstLine.includes('lat') || firstLine.includes('lon')) && (firstLine.includes(',') || firstLine.includes(';'))) return parseCSV(data);
        
        throw e;
    }

    throw new Error("Unknown file format. Please upload a standard GPX, TCX, FIT, JSON or CSV file.");
};