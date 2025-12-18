
import React, { useState, useRef, useEffect } from 'react';
import { User, Zone, RunAnalysisData, RunEntry } from '../types';
import { getDistanceFromLatLonInKm, insertZoneAndShift } from '../utils/geo';
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
          const nextRun = pendingRunsQueue[0];
          analyzeForNewZones(nextRun);
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

    let startZone = allZones.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) < 1.0);
    let endZone = allZones.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) < 1.0);

    const zonesToCreate: { lat: number; lng: number; defaultName: string; type: 'START' | 'END' }[] = [];

    if (!startZone) {
        zonesToCreate.push({
            lat: startPoint.lat, lng: startPoint.lng,
            defaultName: `New Zone ${Math.floor(startPoint.lat*100)},${Math.floor(startPoint.lng*100)}`,
            type: 'START'
        });
    }

    const distStartEnd = getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    if (!endZone && distStartEnd > 1.0) {
        zonesToCreate.push({
             lat: endPoint.lat, lng: endPoint.lng,
             defaultName: `New Zone ${Math.floor(endPoint.lat*100)},${Math.floor(endPoint.lng*100)}`,
             type: 'END'
        });
    }

    if (zonesToCreate.length > 0) {
        setPendingRunData(data);
        setZoneCreationQueue(zonesToCreate);
    } else {
        finalizeRun(data, user!, zones);
    }
  };

  const finalizeRun = async (data: RunAnalysisData, currentUser: User, currentZones: Zone[]) => {
      const allZonesMap = new Map<string, Zone>();
      currentZones.forEach(z => allZonesMap.set(z.id, z));
      sessionCreatedZonesRef.current.forEach(z => {
          if (!allZonesMap.has(z.id)) allZonesMap.set(z.id, z);
      });
      
      const fullZoneList = Array.from(allZonesMap.values());
      const result = processRunRewards(data, currentUser, fullZoneList);

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

      const modifiedZones = result.zoneUpdates.filter(u => {
          const original = allZonesMap.get(u.id);
          return !original || u !== original;
      });

      if (recordRun) {
          const dbResult = await recordRun(currentUser.id, newRun, modifiedZones);
          if (!dbResult.success) {
              console.error("❌ Sync Error:", dbResult.error);
              alert(`Sync Failed: ${dbResult.error || 'Database error'}.`);
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

      const hasCountryCode = / - [A-Z]{2}$/.test(customName);
      const countryCode = hasCountryCode ? customName.split(' - ').pop() || "XX" : "XX";
      const finalName = hasCountryCode ? customName : `${customName} - XX`;

      const sessionZonesUnique = sessionCreatedZonesRef.current.filter(sz => !zones.some(z => z.id === sz.id));
      const currentAllZones = [...zones, ...sessionZonesUnique];
      
      const placementResult = insertZoneAndShift(pendingZone.lat, pendingZone.lng, countryCode, currentAllZones);

      const newZone: Zone = {
          id: crypto.randomUUID(),
          x: placementResult.x,
          y: placementResult.y,
          lat: pendingZone.lat,
          lng: pendingZone.lng,
          ownerId: user.id,
          name: finalName,
          defenseLevel: 1,
          recordKm: 0, 
          interestRate: DEFAULT_ZONE_INTEREST_RATE,
          interestPool: 0,
          shieldExpiresAt: Date.now() + (ITEM_DURATION_SEC * 1000) 
      };

      // Persist to Database
      if (mintZone) {
          const dbRes = await mintZone(newZone, placementResult.shiftedZones);
          if (!dbRes.success) {
              console.error("❌ Minting failed in DB:", dbRes.error);
              alert(`Failed to save new zone: ${dbRes.error}`);
              return { success: false };
          }
      }

      sessionCreatedZonesRef.current.push(newZone);
      
      const nextZonesState = [...zones, newZone].map(z => {
          const shiftUpdate = placementResult.shiftedZones.find(s => s.id === z.id);
          return shiftUpdate ? { ...z, x: shiftUpdate.x, y: shiftUpdate.y } : z;
      });

      const updatedUser = { 
          ...user, 
          runBalance: user.runBalance - MINT_COST,
          govBalance: user.govBalance + MINT_REWARD_GOV 
      };

      setZones(nextZonesState);
      setUser(updatedUser);
      proceedQueue(updatedUser, nextZonesState);
      return { success: true };
  };

  const discardZoneCreation = () => {
      if (!user) return;
      proceedQueue(user, zones);
  };

  const proceedQueue = (currentUser: User, currentZones: Zone[]) => {
      const nextQueue = zoneCreationQueue.slice(1);
      setZoneCreationQueue(nextQueue);
      if (nextQueue.length === 0 && pendingRunData) {
          finalizeRun(pendingRunData, currentUser, currentZones);
      }
  };

  return {
      startSync, confirmZoneCreation, discardZoneCreation,
      closeSummary: () => setRunSummary(null),
      zoneCreationQueue, runSummary, isProcessing: pendingRunsQueue.length > 0
  };
};