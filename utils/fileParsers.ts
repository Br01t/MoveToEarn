import FitParser from 'fit-file-parser';

export interface ActivityPoint {
    lat: number;
    lng: number;
    ele: number;
    time: Date;
}

// Helper: Parse FIT file (Binary)
export const parseFIT = (buffer: ArrayBuffer): Promise<ActivityPoint[][]> => {
    console.log("📂 [PARSER] Avvio parsing FIT. Dimensione buffer:", buffer.byteLength);
    
    return new Promise((resolve, reject) => {
        try {
            // Risolve il costruttore per compatibilità ESM/CJS
            const ParserClass = (FitParser as any).default || FitParser;
            if (typeof ParserClass !== 'function') {
                console.error("❌ [PARSER] FitParser constructor non trovato.");
                reject(new Error("Inizializzazione FIT Parser fallita."));
                return;
            }

            const parser = new ParserClass({
                force: true,
                speedUnit: 'km/h',
                lengthUnit: 'km',
                temperatureUnit: 'celsius',
                elapsedRecordField: true,
                mode: 'cascade', 
            });

            // Converte ArrayBuffer in Uint8Array per il parser
            const uint8Array = new Uint8Array(buffer);

            parser.parse(uint8Array, (error: any, data: any) => {
                if (error) {
                    console.error("❌ [PARSER] Errore FIT:", error);
                    reject(new Error(`Errore nel parse del file FIT: ${error.message || error}`));
                    return;
                }

                const points: ActivityPoint[] = [];
                // Alcuni file FIT usano 'records', altri 'record' o strutture annidate
                const records = data.records || data.record || [];
                
                // Se non ci sono record principali, controlliamo sessioni/laps (Garmin/Wahoo)
                if (records.length === 0 && data.activity?.sessions) {
                    data.activity.sessions.forEach((session: any) => {
                        if (session.laps) {
                            session.laps.forEach((lap: any) => {
                                if (lap.records) records.push(...lap.records);
                                else if (lap.record) records.push(...lap.record);
                            });
                        }
                    });
                }

                for (const record of records) {
                    // Supporto a diversi nomi di campo (position_lat, lat, latitude)
                    const rawLat = record.position_lat ?? record.lat ?? record.latitude;
                    const rawLng = record.position_long ?? record.lng ?? record.longitude ?? record.position_lon;
                    const timestamp = record.timestamp;

                    // Solo record con coordinate GPS reali e tempo
                    if (rawLat !== undefined && rawLng !== undefined && timestamp) {
                        // CONVERSIONE INTELLIGENTE: Semicircles -> Gradi
                        // I semicircoli sono valori interi grandi. Se il valore assoluto è > 180, convertiamo.
                        // Se è <= 180, il parser ha già fornito i gradi o il file è in gradi.
                        const SEMICIRCLE_CONVERSION = 180 / 2147483648;
                        const lat = Math.abs(rawLat) > 180 ? rawLat * SEMICIRCLE_CONVERSION : rawLat;
                        const lng = Math.abs(rawLng) > 180 ? rawLng * SEMICIRCLE_CONVERSION : rawLng;
                        
                        const ele = record.enhanced_altitude || record.altitude || 0;
                        
                        points.push({
                            lat,
                            lng,
                            ele,
                            time: new Date(timestamp)
                        });
                    }
                }

                if (points.length < 2) {
                    console.warn("⚠️ [PARSER] File FIT senza punti GPS validi.");
                    reject(new Error("Nessun punto GPS trovato nel file FIT."));
                } else {
                    // Ordina per tempo
                    points.sort((a, b) => a.time.getTime() - b.time.getTime());
                    console.log(`✅ [PARSER] Estratti ${points.length} punti dal FIT.`);
                    resolve([points]);
                }
            });
        } catch (err: any) {
            console.error("❌ [PARSER] Errore critico FIT:", err);
            reject(new Error(`Crash Parser FIT: ${err.message}`));
        }
    });
};

// Helper: Parse JSON
export const parseJSON = (text: string): ActivityPoint[][] => {
    console.log("📂 [PARSER] Rilevato formato JSON.");
    try {
        const json = JSON.parse(text);
        const points: ActivityPoint[] = [];
        
        let candidates: any[] = [];
        
        if (Array.isArray(json)) candidates = json;
        else if (Array.isArray(json.data)) candidates = json.data;
        else if (Array.isArray(json.points)) candidates = json.points;
        else if (Array.isArray(json.track)) candidates = json.track;
        else if (Array.isArray(json.locations)) candidates = json.locations;

        if (candidates.length < 2) throw new Error("Nessun punto traccia nel JSON.");

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

        if (points.length < 2) throw new Error("Coordinate GPS valide non trovate nel JSON.");
        
        points.sort((a, b) => a.time.getTime() - b.time.getTime());
        return [points];

    } catch (e: any) {
        console.error("JSON Parse Error:", e);
        throw new Error("Formato JSON non valido.");
    }
};

// Helper: Parse CSV
export const parseCSV = (text: string): ActivityPoint[][] => {
    console.log("📂 [PARSER] Rilevato formato CSV.");
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) throw new Error("File CSV vuoto.");

    const headerRow = lines[0].toLowerCase();
    const delimiter = headerRow.includes(';') ? ';' : ',';
    const headers = headerRow.split(delimiter).map(h => h.trim().replace(/['"]+/g, ''));

    const latIdx = headers.findIndex(h => h.includes('lat'));
    const lngIdx = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
    const eleIdx = headers.findIndex(h => h.includes('ele') || h.includes('alt'));
    const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('date'));

    if (latIdx === -1 || lngIdx === -1 || timeIdx === -1) {
        throw new Error("CSV manca di colonne obbligatorie (Latitude, Longitude, Time).");
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

    if (points.length < 2) throw new Error("Nessun punto GPS estratto dal CSV.");
    
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
export const parseActivityFile = async (data: string | ArrayBuffer, filename: string): Promise<ActivityPoint[][]> => {
    console.log("📂 [PARSER] Analisi file:", filename);
    const lowerName = filename.toLowerCase();

    // Gestione binaria per FIT
    if (lowerName.endsWith('.fit') && typeof data !== 'string') {
        return parseFIT(data as ArrayBuffer);
    }

    if (typeof data !== 'string') throw new Error("Contenuto non valido per il parser testuale.");

    if (lowerName.endsWith('.json')) return parseJSON(data);
    if (lowerName.endsWith('.csv')) return parseCSV(data);

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const parserError = xmlDoc.getElementsByTagName("parsererror");
        
        if (parserError.length > 0) throw new Error("File XML malformato.");

        if (xmlDoc.getElementsByTagName("TrainingCenterDatabase").length > 0) {
            return parseTCX(xmlDoc);
        } else if (xmlDoc.getElementsByTagName("gpx").length > 0 || xmlDoc.getElementsByTagName("trk").length > 0) {
            return parseGPXInternal(xmlDoc);
        }
    } catch (e) {
        if (data.trim().startsWith('{') || data.trim().startsWith('[')) return parseJSON(data);
        throw e;
    }

    throw new Error("Formato sconosciuto. Usa GPX, TCX, FIT, JSON o CSV.");
};