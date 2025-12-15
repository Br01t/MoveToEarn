
import React, { useState, useRef, useEffect } from 'react';
import { User, Zone, RunAnalysisData, RunEntry } from '../types';
import { getDistanceFromLatLonInKm, calculateHexPosition } from '../utils/geo';
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
  }, [pendingRunsQueue, zoneCreationQueue.length, pendingRunData, runSummary]);

  // --- LOGIC: Check if new zones are needed ---
  const analyzeForNewZones = (data: RunAnalysisData) => {
    const { startPoint, endPoint } = data;
    // Use both global zones and session zones for checking overlap
    const allZones = [...zones, ...sessionCreatedZonesRef.current];

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
      // Merge global zones + session zones for accurate reward calculation
      // This is vital: It ensures the user gets rewards for zones they JUST created in this batch
      const allZonesMap = new Map<string, Zone>();
      currentZones.forEach(z => allZonesMap.set(z.id, z));
      sessionCreatedZonesRef.current.forEach(z => allZonesMap.set(z.id, z));
      
      const fullZoneList = Array.from(allZonesMap.values());

      // Result includes updated zones with new Interest Pool values and split rewards
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

      // Identify modified zones to update in DB
      // We must include any zones created in this session (INSERT)
      // AND any existing zones that were modified (UPDATE) during reward processing
      const modifiedZones = result.zoneUpdates.filter(u => {
          const isNew = sessionCreatedZonesRef.current.some(nz => nz.id === u.id);
          if (isNew) return true;

          const original = allZonesMap.get(u.id);
          // Check if stats changed from what we knew before this run
          return original && (original.recordKm !== u.recordKm || original.interestPool !== u.interestPool);
      });

      // DB SAVE (Atomic)
      if (recordRun) {
          const dbResult = await recordRun(currentUser.id, newRun, modifiedZones);
          if (!dbResult.success) {
              alert(`Sync Failed: ${dbResult.error || 'Database error'}. Local state not updated.`);
              return; 
          }
      } else if (result.totalRunEarned > 0) {
          // Fallback legacy logging if recordRun not available
          logTransaction(currentUser.id, 'IN', 'RUN', result.totalRunEarned, `Run Reward: ${result.locationName}`);
      }

      // Update State
      setZones(result.zoneUpdates);
      setUser(finalUser);
      
      batchStatsRef.current.totalKm += data.totalKm;
      batchStatsRef.current.duration += data.durationMinutes;
      batchStatsRef.current.runEarned += result.totalRunEarned;
      batchStatsRef.current.involvedZoneNames.push(...result.involvedZoneNames);
      if (result.isReinforced) batchStatsRef.current.reinforcedCount++;

      setPendingRunData(null);
      setPendingRunsQueue(prev => prev.slice(1)); // Remove processed run
  };

  // --- ACTIONS: Modal Interactions ---
  const confirmZoneCreation = (customName: string) => {
      if (!user || !pendingRunData) return { success: false, msg: "No active run" };
      
      const pendingZone = zoneCreationQueue[0];
      if (user.runBalance < MINT_COST) return { success: false, msg: "Insufficient funds" };

      // LOG TRANSACTIONS
      logTransaction(user.id, 'OUT', 'RUN', MINT_COST, `Zone Mint Fee: ${customName}`);
      logTransaction(user.id, 'IN', 'GOV', MINT_REWARD_GOV, `Zone Mint Reward: ${customName}`);

      const hasCountryCode = / - [A-Z]{2}$/.test(customName);
      const finalName = hasCountryCode ? customName : `${customName} - XX`;

      // Calculate Position - Nearest Neighbor logic
      // We pass ALL zones (existing + session created) to find the right neighbor to snap to.
      const currentAllZones = [...zones, ...sessionCreatedZonesRef.current];
      const hexPos = calculateHexPosition(null, pendingZone.lat, pendingZone.lng, "XX", currentAllZones);

      const newZone: Zone = {
          id: crypto.randomUUID(),
          x: hexPos.x,
          y: hexPos.y,
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
      
      // Add to session ref so subsequent runs/creations in this batch see it
      sessionCreatedZonesRef.current.push(newZone);
      
      setUser(updatedUser);
      // Immediately update zones in state so dashboard reflects it (even though it's optimistic until finalizeRun commits it)
      setZones(prev => [...prev, newZone]); 

      proceedQueue(updatedUser, [...zones, newZone]);
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