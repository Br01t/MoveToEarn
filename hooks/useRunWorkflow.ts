import React, { useState, useRef, useEffect } from 'react';
import { User, Zone, RunAnalysisData, RunEntry } from '../types';
import { getDistanceFromLatLonInKm, calculateHexPosition } from '../utils/geo';
import { processRunRewards } from '../utils/rewards';
import { MINT_COST, MINT_REWARD_GOV } from '../constants';

interface RunWorkflowProps {
    user: User | null;
    zones: Zone[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
}

export const useRunWorkflow = ({ user, zones, setUser, setZones }: RunWorkflowProps) => {
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

  // Temporary storage for zones created in this session (to ensure adjacency)
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
  const finalizeRun = (data: RunAnalysisData, currentUser: User, currentZones: Zone[]) => {
      // Merge global zones + session zones for accurate reward calculation
      const allZonesMap = new Map<string, Zone>();
      currentZones.forEach(z => allZonesMap.set(z.id, z));
      sessionCreatedZonesRef.current.forEach(z => allZonesMap.set(z.id, z));
      const fullZoneList = Array.from(allZonesMap.values());

      const result = processRunRewards(data, currentUser, fullZoneList);

      const newRun: RunEntry = {
          id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          location: result.locationName,
          km: data.totalKm,
          timestamp: data.startTime, 
          runEarned: result.totalRunEarned,
          duration: data.durationMinutes,
          elevation: data.elevation,
          maxSpeed: data.maxSpeed,
          avgSpeed: data.avgSpeed
      };

      const finalUser = {
          ...currentUser,
          runHistory: [newRun, ...currentUser.runHistory],
          runBalance: currentUser.runBalance + result.totalRunEarned,
          totalKm: currentUser.totalKm + data.totalKm
      };

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

      const hasCountryCode = / - [A-Z]{2}$/.test(customName);
      const finalName = hasCountryCode ? customName : `${customName} - XX`;

      // Calculate Position
      let referenceZone: Zone | null = null;
      if (pendingZone.type === 'END' && sessionCreatedZonesRef.current.length > 0) {
          referenceZone = sessionCreatedZonesRef.current[0];
      }
      const currentAllZones = [...zones, ...sessionCreatedZonesRef.current];
      const hexPos = calculateHexPosition(referenceZone, pendingZone.lat, pendingZone.lng, "XX", currentAllZones);

      const newZone: Zone = {
          id: `z_${Date.now()}_${pendingZone.type}`,
          x: hexPos.x,
          y: hexPos.y,
          lat: pendingZone.lat,
          lng: pendingZone.lng,
          ownerId: user.id,
          name: finalName,
          defenseLevel: 1,
          recordKm: pendingRunData.totalKm, 
          interestRate: 2.0
      };

      const updatedUser = { 
          ...user, 
          runBalance: user.runBalance - MINT_COST,
          govBalance: user.govBalance + MINT_REWARD_GOV 
      };
      
      sessionCreatedZonesRef.current.push(newZone);
      setUser(updatedUser);
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
      // State exposed to UI
      zoneCreationQueue,
      runSummary,
      isProcessing: pendingRunsQueue.length > 0
  };
};