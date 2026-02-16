import React, { useState, useRef, useEffect } from 'react';
import { User, Zone, RunAnalysisData, RunEntry } from '../types';
import { getDistanceFromLatLonInKm, insertZoneAndShift, decodePostGISLocation } from '../utils/geo';
import { processRunRewards } from '../utils/rewards';
import { MINT_COST, MINT_REWARD_GOV, ITEM_DURATION_SEC, DEFAULT_ZONE_INTEREST_RATE } from '../constants';

interface RunWorkflowProps {
    user: User | null;
    zones: Zone[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
    recordRun?: (userId: string, runData: RunEntry, updatedZones: Zone[]) => Promise<{ success: boolean; error?: string }>;
    mintZone?: (newZone: Zone, shiftedZones: Zone[]) => Promise<{ success: boolean; error?: string }>;
}

const findClosestZoneDiscovery = (lat: number, lng: number, zones: Zone[], maxRadius: number, label: string): Zone | null => {
    const sorted = zones.map(z => {
        const dLat = z.lat;
        const dLng = z.lng;
        return {
            zone: z,
            distance: getDistanceFromLatLonInKm(lat, lng, dLat, dLng)
        };
    }).sort((a, b) => a.distance - b.distance);

    const best = sorted[0];
    if (best && best.distance <= maxRadius) {
        console.log(`   📍 [DISCOVERY] Match trovato: ${best.zone.name} a ${best.distance.toFixed(4)}km`);
        return best.zone;
    }
    return null;
};

export const useRunWorkflow = ({ user, zones, setUser, setZones, logTransaction, recordRun, mintZone }: RunWorkflowProps) => {
  const [pendingRunsQueue, setPendingRunsQueue] = useState<RunAnalysisData[]>([]);
  const [zoneCreationQueue, setZoneCreationQueue] = useState<{
    lat: number;
    lng: number;
    defaultName: string;
    type: 'START' | 'END';
  }[]>([]);
  const [pendingRunData, setPendingRunData] = useState<RunAnalysisData | null>(null);
  const [runSummary, setRunSummary] = useState<{
      totalKm: number;
      duration: number;
      runEarned: number;
      involvedZoneNames: string[];
      isReinforced: boolean;
  } | null>(null);

  const sessionCreatedZonesRef = useRef<Zone[]>([]);
  const batchStatsRef = useRef<{
      totalKm: number;
      duration: number;
      runEarned: number;
      involvedZoneNames: string[];
      reinforcedCount: number;
  }>({ totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 });

  const startSync = (dataList: RunAnalysisData[]) => {
    if (!user) return;
    batchStatsRef.current = { totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 };
    sessionCreatedZonesRef.current = [];
    setPendingRunsQueue(dataList);
  };

  useEffect(() => {
      if (pendingRunsQueue.length > 0 && zoneCreationQueue.length === 0 && !pendingRunData) {
          analyzeForNewZones(pendingRunsQueue[0]);
      } 
      else if (pendingRunsQueue.length === 0 && batchStatsRef.current.totalKm > 0 && !runSummary && zoneCreationQueue.length === 0 && !pendingRunData) {
          const stats = batchStatsRef.current;
          setRunSummary({
              totalKm: stats.totalKm,
              duration: stats.duration,
              runEarned: stats.runEarned,
              involvedZoneNames: Array.from(new Set(stats.involvedZoneNames)),
              isReinforced: stats.reinforcedCount > 0
          });
          batchStatsRef.current = { totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 };
      }
  }, [pendingRunsQueue, zoneCreationQueue.length, pendingRunData, runSummary, zones, user]);

  const analyzeForNewZones = (data: RunAnalysisData) => {
    const { startPoint, endPoint } = data;
    const sessionZonesUnique = sessionCreatedZonesRef.current.filter(sz => !zones.some(z => z.id === sz.id));
    const allZones = [...zones, ...sessionZonesUnique];
    
    const DETECTION_RADIUS = 0.8;
    const isLoop = getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng) < 0.25;

    console.group(`🔍 [DISCOVERY] Analisi per: ${data.fileName}`);
    const zonesToCreate: { lat: number; lng: number; defaultName: string; type: 'START' | 'END' }[] = [];

    if (!findClosestZoneDiscovery(startPoint.lat, startPoint.lng, allZones, DETECTION_RADIUS, "Inizio")) {
        zonesToCreate.push({ lat: startPoint.lat, lng: startPoint.lng, defaultName: `Area ${Math.floor(startPoint.lat*100)},${Math.floor(startPoint.lng*100)}`, type: 'START' });
    }

    if (!isLoop && !findClosestZoneDiscovery(endPoint.lat, endPoint.lng, allZones, DETECTION_RADIUS, "Fine")) {
        const { x: sq, y: sr } = insertZoneAndShift(startPoint.lat, startPoint.lng, "XX", []);
        const { x: eq, y: er } = insertZoneAndShift(endPoint.lat, endPoint.lng, "XX", []);
        
        if (sq !== eq || sr !== er) {
            zonesToCreate.push({ lat: endPoint.lat, lng: endPoint.lng, defaultName: `Area ${Math.floor(endPoint.lat*100)},${Math.floor(endPoint.lng*100)}`, type: 'END' });
        }
    }
    console.groupEnd();

    if (zonesToCreate.length > 0) {
        setPendingRunData(data);
        setZoneCreationQueue(zonesToCreate);
    } else {
        finalizeRun(data, user!, zones);
    }
  };

  const finalizeRun = async (data: RunAnalysisData, currentUser: User, currentZones: Zone[]) => {
      // Uniamo le zone attuali con quelle create nella sessione (importante!)
      const allZonesMap = new Map<string, Zone>();
      currentZones.forEach(z => allZonesMap.set(z.id, z));
      sessionCreatedZonesRef.current.forEach(z => allZonesMap.set(z.id, z));
      
      const result = processRunRewards(data, currentUser, Array.from(allZonesMap.values()));

      const newRun: RunEntry = {
          id: crypto.randomUUID(), 
          location: result.locationName,
          km: data.totalKm,
          timestamp: data.startTime, 
          runEarned: result.totalRunEarned,
          duration: data.durationMinutes,
          elevation: data.elevation,
          maxSpeed: data.maxSpeed,
          avgSpeed: data.avgSpeed,
          involvedZones: result.involvedZoneIds,
          zoneBreakdown: result.zoneBreakdown 
      };

      const finalUser = {
          ...currentUser,
          runHistory: [newRun, ...currentUser.runHistory],
          runBalance: currentUser.runBalance + result.totalRunEarned,
          totalKm: currentUser.totalKm + data.totalKm
      };

      if (recordRun) {
          const dbResult = await recordRun(currentUser.id, newRun, result.zoneUpdates);
          if (!dbResult.success) {
              setPendingRunsQueue([]);
              setPendingRunData(null);
              return; 
          }
      }

      setZones(result.zoneUpdates);
      setUser(finalUser);
      batchStatsRef.current.totalKm += data.totalKm;
      batchStatsRef.current.duration += data.durationMinutes;
      batchStatsRef.current.runEarned += result.totalRunEarned;
      batchStatsRef.current.involvedZoneNames.push(...result.involvedZoneNames);
      if (result.isReinforced) batchStatsRef.current.reinforcedCount++;

      setPendingRunData(null);
      setPendingRunsQueue(prev => prev.slice(1)); 
  };

  const confirmZoneCreation = async (customName: string) => {
      if (!user || !pendingRunData) return { success: false, msg: "No active run" };
      const pendingZone = zoneCreationQueue[0];
      if (user.runBalance < MINT_COST) return { success: false, msg: "Insufficient funds" };

      const countryCode = customName.split(' - ').pop() || "XX";
      const allPossibleZones = [...zones, ...sessionCreatedZonesRef.current];
      const placementResult = insertZoneAndShift(pendingZone.lat, pendingZone.lng, countryCode, allPossibleZones);

      const newZone: Zone = {
          id: crypto.randomUUID(),
          x: placementResult.x, y: placementResult.y,
          lat: pendingZone.lat, lng: pendingZone.lng,
          location: '',
          ownerId: user.id,
          name: customName,
          defenseLevel: 1,
          recordKm: 0, 
          totalKm: 0,
          interestRate: DEFAULT_ZONE_INTEREST_RATE,
          interestPool: 0,
          shieldExpiresAt: Date.now() + (ITEM_DURATION_SEC * 1000) 
      };

      if (mintZone) {
          const dbRes = await mintZone(newZone, placementResult.shiftedZones);
          if (!dbRes.success) return { success: false };
      }

      sessionCreatedZonesRef.current.push(newZone);
      const updatedUser = { ...user, runBalance: user.runBalance - MINT_COST, govBalance: user.govBalance + MINT_REWARD_GOV };
      const nextZones = [...zones, newZone].map(z => {
          const shift = placementResult.shiftedZones.find(s => s.id === z.id);
          return shift ? { ...z, x: shift.x, y: shift.y } : z;
      });
      setZones(nextZones);
      setUser(updatedUser);
      proceedQueue(updatedUser, nextZones);
      return { success: true };
  };

  const discardZoneCreation = () => {
      if (!user) return;
      proceedQueue(user, zones);
  };

  const proceedQueue = (currentUser: User, currentZones: Zone[]) => {
      const nextQueue = zoneCreationQueue.slice(1);
      setZoneCreationQueue(nextQueue);
      if (nextQueue.length === 0 && pendingRunData) finalizeRun(pendingRunData, currentUser, currentZones);
  };

  return {
      startSync, confirmZoneCreation, discardZoneCreation,
      closeSummary: () => setRunSummary(null),
      zoneCreationQueue, runSummary, isProcessing: pendingRunsQueue.length > 0
  };
};