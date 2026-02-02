import React, { useState, useEffect, useRef } from 'react';
import { User, Zone, Mission, Badge, AchievementLog } from '../types';
import { checkAchievement } from '../utils/rewards';
import { supabase } from '../supabaseClient';

interface AchievementProps {
    user: User | null;
    zones: Zone[];
    missions: Mission[];
    badges: Badge[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
}

export const useAchievements = ({ user, zones, missions, badges, setUser, logTransaction }: AchievementProps) => {
  const [achievementQueue, setAchievementQueue] = useState<{ type: 'MISSION' | 'BADGE'; item: Mission | Badge }[]>([]);
  const [claimSummary, setClaimSummary] = useState<{ count: number; totalRun: number; totalGov: number } | null>(null);
  
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    
    let newMissionLog = [...user.missionLog];
    let newBadgeLog = [...user.badgeLog];
    
    let additionalRun = 0; 
    let additionalGov = 0;
    let hasChanges = false;
    
    const newUnlockQueue: { type: 'MISSION' | 'BADGE'; item: Mission | Badge }[] = [];
    const timestamp = Date.now();

    missions.forEach((m) => {
      if (!newMissionLog.some(log => log.id === m.id) && !processedIdsRef.current.has(m.id)) {
        if (checkAchievement(m, user, zones)) {
           processedIdsRef.current.add(m.id);
           newMissionLog.push({ id: m.id, claimedAt: timestamp });
           
           let runReward = m.rewardRun;
           if (newMissionLog.length === 1 && runReward === 150) {
               runReward = 300;
           }

           additionalRun += runReward;
           if (m.rewardGov) additionalGov += m.rewardGov;
           hasChanges = true;
           
           newUnlockQueue.push({ type: 'MISSION', item: { ...m, rewardRun: runReward } });
           
           if (runReward > 0) logTransaction(user.id, 'IN', 'RUN', runReward, `Mission Reward: ${m.title}`);
           if (m.rewardGov && m.rewardGov > 0) logTransaction(user.id, 'IN', 'GOV', m.rewardGov, `Mission Reward: ${m.title}`);
        }
      }
    });

    badges.forEach((b) => {
      if (!newBadgeLog.some(log => log.id === b.id) && !processedIdsRef.current.has(b.id)) {
        if (checkAchievement(b, user, zones)) {
           processedIdsRef.current.add(b.id);
           newBadgeLog.push({ id: b.id, claimedAt: timestamp });
           
           const rRun = b.rewardRun || 0;
           const rGov = b.rewardGov || 0;
           
           additionalRun += rRun; 
           if (rGov) additionalGov += rGov;
           hasChanges = true;
           newUnlockQueue.push({ type: 'BADGE', item: b });

           if (rRun > 0) logTransaction(user.id, 'IN', 'RUN', rRun, `Badge Reward: ${b.name}`);
           if (rGov > 0) logTransaction(user.id, 'IN', 'GOV', rGov, `Badge Reward: ${b.name}`);
        }
      }
    });

    if (hasChanges) {
      const newRunBalance = user.runBalance + additionalRun;
      const newGovBalance = user.govBalance + additionalGov;

      setUser((prev) =>
        prev
          ? {
              ...prev,
              missionLog: newMissionLog,
              badgeLog: newBadgeLog,
              completedMissionIds: newMissionLog.map(x => x.id),
              earnedBadgeIds: newBadgeLog.map(x => x.id),
              runBalance: newRunBalance,
              govBalance: newGovBalance,
            }
          : null
      );
      
      const updateDb = async () => {
          await supabase.from('profiles').update({
              mission_log: newMissionLog,
              badge_log: newBadgeLog,
              run_balance: newRunBalance,
              gov_balance: newGovBalance
          }).eq('id', user.id);
      };
      updateDb();
      
      if (newUnlockQueue.length > 0) {
          setAchievementQueue(prev => [...prev, ...newUnlockQueue]);
      }
    }

  }, [user?.totalKm, user?.runHistory, zones, missions, badges]);

  const handleCloseNotification = () => {
    setAchievementQueue(prev => prev.slice(1));
  };

  const handleClaimAllNotifications = () => {
      setAchievementQueue([]);
      setClaimSummary({ count: achievementQueue.length, totalRun: 0, totalGov: 0 });
      setTimeout(() => setClaimSummary(null), 3000);
  };

  return {
      achievementQueue,
      claimSummary,
      handleCloseNotification,
      handleClaimAllNotifications
  };
};