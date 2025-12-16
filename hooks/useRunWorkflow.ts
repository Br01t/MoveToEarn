
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
}

export const useRunWorkflow = ({ user, zones, setUser, setZones, logTransaction, recordRun }: RunWorkflowProps) => {
  // Queue for processing multiple runs
  const [pendingRunsQueue, setPendingRunsQueue] = useState<RunAnalysisData[]>([]);
  
  // Queue for Zone Naming Modals (Start/End points)
  const [zoneCreationQueue, setZoneCreationQueue] = useState<{
    lat: number;
    lng: number;
    defaultName: string;
    type: 'START' | 'END';
  }[]>([]);

  // Current Run being processed (while waiting for user input)
  const [pendingRunData, setPendingRunData] = useState<RunAnalysisData | null>(null);

  // Final Summary Modal State
  const [runSummary, setRunSummary] = useState<{
      totalKm: number;
      duration: number;
      runEarned: number;
      involvedZoneNames: string[];
      isReinforced: boolean;
  } | null>(null);

  // Temporary storage for zones created in this session (to ensure adjacency logic works immediately)
  const sessionCreatedZonesRef = useRef<Zone[]>([]);
  
  // Accumulator for batch stats
  const batchStatsRef = useRef<{
      totalKm: number;
      duration: number;
      runEarned: number;
      involvedZoneNames: string[];
      reinforcedCount: number;
  }>({ totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 });

  // --- ENTRY POINT ---
  const startSync = (dataList: RunAnalysisData[]) => {
    if (!user) return;
    // Reset batch stats
    batchStatsRef.current = { totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 };
    sessionCreatedZonesRef.current = [];
    setPendingRunsQueue(dataList);
  };

  // --- PROCESSOR LOOP ---
  useEffect(() => {
      // If we have runs waiting, and no active modal (creation or summary), and no active run being held
      if (pendingRunsQueue.length > 0 && zoneCreationQueue.length === 0 && !pendingRunData) {
          const nextRun = pendingRunsQueue[0];
          analyzeForNewZones(nextRun);
      } 
      // If queue is empty but we have stats, show summary
      else if (pendingRunsQueue.length === 0 && batchStatsRef.current.totalKm > 0 && !runSummary && zoneCreationQueue.length === 0 && !pendingRunData) {
          const stats = batchStatsRef.current;
          setRunSummary({
              totalKm: stats.totalKm,
              duration: stats.duration,
              runEarned: stats.runEarned,
              involvedZoneNames: Array.from(new Set(stats.involvedZoneNames)),
              isReinforced: stats.reinforcedCount > 0
          });
          // Clear stats to prevent loop
          batchStatsRef.current = { totalKm: 0, duration: 0, runEarned: 0, involvedZoneNames: [], reinforcedCount: 0 };
      }
  }, [pendingRunsQueue, zoneCreationQueue.length, pendingRunData, runSummary, zones, user]);

  // --- LOGIC: Check if new zones are needed ---
  const analyzeForNewZones = (data: RunAnalysisData) => {
    const { startPoint, endPoint } = data;
    
    // Merge Strategy: Prioritize `zones` state
    const sessionZonesUnique = sessionCreatedZonesRef.current.filter(sz => !zones.some(z => z.id === sz.id));
    const allZones = [...zones, ...sessionZonesUnique];

    let startZone = allZones.find(z => getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, z.lat, z.lng) < 1.0);
    let endZone = allZones.find(z => getDistanceFromLatLonInKm(endPoint.lat, endPoint.lng, z.lat, z.lng) < 1.0);

    const zonesToCreate: { lat: number; lng: number; defaultName: string; type: 'START' | 'END' }[] = [];

    if (!startZone) {
        zonesToCreate.push({
            lat: startPoint.lat,
            lng: startPoint.lng,
            defaultName: `New Zone ${Math.floor(startPoint.lat*100)},${Math.floor(startPoint.lng*100)}`,
            type: 'START'
        });
    }

    const distStartEnd = getDistanceFromLatLonInKm(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    if (!endZone && distStartEnd > 1.0) {
        zonesToCreate.push({
             lat: endPoint.lat,
             lng: endPoint.lng,
             defaultName: `New Zone ${Math.floor(endPoint.lat*100)},${Math.floor(endPoint.lng*100)}`,
             type: 'END'
        });
    }

    if (zonesToCreate.length > 0) {
        setPendingRunData(data); // Pause queue
        setZoneCreationQueue(zonesToCreate); // Trigger Modal
    } else {
        finalizeRun(data, user!, zones); // No new zones, proceed
    }
  };

  // --- LOGIC: Commit Run Data ---
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

      // OPTIMIZATION: Filter strictly for changes before DB call.
      // This relies on `processRunRewards` returning strict references for unchanged zones.
      const modifiedZones = result.zoneUpdates.filter(u => {
          const original = allZonesMap.get(u.id);
          // If purely new, keep it
          if (!original) return true;
          // If reference is different, it means logic updated it
          return u !== original;
      });

      if (recordRun) {
          // Send ONLY the actually modified zones to the DB handler
          const dbResult = await recordRun(currentUser.id, newRun, modifiedZones);
          if (!dbResult.success) {
              alert(`Sync Failed: ${dbResult.error || 'Database error'}.`);
              return; 
          }
      } else if (result.totalRunEarned > 0) {
          logTransaction(currentUser.id, 'IN', 'RUN', result.totalRunEarned, `Run Reward: ${result.locationName}`);
      }

      // Update Local State with the full list (React needs the full picture)
      setZones(result.zoneUpdates);
      setUser(finalUser);
      
      // Batch Stats Accumulation
      batchStatsRef.current.totalKm += data.totalKm;
      batchStatsRef.current.duration += data.durationMinutes;
      batchStatsRef.current.runEarned += result.totalRunEarned;
      batchStatsRef.current.involvedZoneNames.push(...result.involvedZoneNames);
      if (result.isReinforced) batchStatsRef.current.reinforcedCount++;

      setPendingRunData(null);
      setPendingRunsQueue(prev => prev.slice(1)); 
  };

  // --- ACTIONS: Modal Interactions ---
  const confirmZoneCreation = (customName: string) => {
      if (!user || !pendingRunData) return { success: false, msg: "No active run" };
      
      const pendingZone = zoneCreationQueue[0];
      if (user.runBalance < MINT_COST) return { success: false, msg: "Insufficient funds" };

      logTransaction(user.id, 'OUT', 'RUN', MINT_COST, `Zone Mint Fee: ${customName}`);
      logTransaction(user.id, 'IN', 'GOV', MINT_REWARD_GOV, `Zone Mint Reward: ${customName}`);

      const hasCountryCode = / - [A-Z]{2}$/.test(customName);
      const countryCode = hasCountryCode ? customName.split(' - ').pop() || "XX" : "XX";
      const finalName = hasCountryCode ? customName : `${customName} - XX`;

      // --- DYNAMIC PLACEMENT & SHIFTING ---
      const sessionZonesUnique = sessionCreatedZonesRef.current.filter(sz => !zones.some(z => z.id === sz.id));
      const currentAllZones = [...zones, ...sessionZonesUnique];
      
      // This function calculates the new spot AND returns any zones that had to move to make room
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

      const updatedUser = { 
          ...user, 
          runBalance: user.runBalance - MINT_COST,
          govBalance: user.govBalance + MINT_REWARD_GOV 
      };
      
      sessionCreatedZonesRef.current.push(newZone);
      
      // Update State: We must merge the new zone AND any shifted zones
      setZones(prev => {
          // 1. Add new zone
          const listWithNew = [...prev, newZone];
          // 2. Apply shifts (if any)
          if (placementResult.shiftedZones.length > 0) {
              return listWithNew.map(z => {
                  const shiftUpdate = placementResult.shiftedZones.find(s => s.id === z.id);
                  return shiftUpdate ? { ...z, x: shiftUpdate.x, y: shiftUpdate.y } : z;
              });
          }
          return listWithNew;
      });

      // Pass the updated world state to the next step (recursive queue processing)
      const nextZonesState = [...zones, newZone].map(z => {
          const shiftUpdate = placementResult.shiftedZones.find(s => s.id === z.id);
          return shiftUpdate ? { ...z, x: shiftUpdate.x, y: shiftUpdate.y } : z;
      });

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
      startSync,
      confirmZoneCreation,
      discardZoneCreation,
      closeSummary: () => setRunSummary(null),
      zoneCreationQueue,
      runSummary,
      isProcessing: pendingRunsQueue.length > 0
  };
};