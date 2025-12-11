
import React, { useState, useEffect } from 'react';
import { User, Zone, Mission, Badge, AchievementLog } from '../types';
import { checkAchievement } from '../utils/rewards';
import { supabase } from '../supabaseClient';

interface AchievementProps {
    user: User | null;
    zones: Zone[];
    missions: Mission[];
    badges: Badge[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV', amount: number, description: string) => Promise<void>;
}

export const useAchievements = ({ user, zones, missions, badges, setUser, logTransaction }: AchievementProps) => {
  const [achievementQueue, setAchievementQueue] = useState<{ type: 'MISSION' | 'BADGE'; item: Mission | Badge }[]>([]);
  const [claimSummary, setClaimSummary] = useState<{ count: number; totalRun: number; totalGov: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Work with Logs instead of raw IDs for checking
    let newMissionLog = [...user.missionLog];
    let newBadgeLog = [...user.badgeLog];
    
    let additionalRun = 0; 
    let additionalGov = 0;
    let hasChanges = false;
    
    const newUnlockQueue: { type: 'MISSION' | 'BADGE'; item: Mission | Badge }[] = [];
    const timestamp = Date.now();

    // Check Missions
    missions.forEach((m) => {
      // Check if already in log
      if (!newMissionLog.some(log => log.id === m.id)) {
        if (checkAchievement(m, user, zones)) {
           newMissionLog.push({ id: m.id, claimedAt: timestamp });
           
           additionalRun += m.rewardRun;
           if (m.rewardGov) additionalGov += m.rewardGov;
           hasChanges = true;
           newUnlockQueue.push({ type: 'MISSION', item: m });
           
           // LOG
           if (m.rewardRun > 0) logTransaction(user.id, 'IN', 'RUN', m.rewardRun, `Mission Reward: ${m.title}`);
           if (m.rewardGov && m.rewardGov > 0) logTransaction(user.id, 'IN', 'GOV', m.rewardGov, `Mission Reward: ${m.title}`);
        }
      }
    });

    // Check Badges
    badges.forEach((b) => {
      // Check if already in log
      if (!newBadgeLog.some(log => log.id === b.id)) {
        if (checkAchievement(b, user, zones)) {
           newBadgeLog.push({ id: b.id, claimedAt: timestamp });
           
           const rRun = b.rewardRun || 0;
           const rGov = b.rewardGov || 0;
           
           additionalRun += rRun; 
           if (rGov) additionalGov += rGov;
           hasChanges = true;
           newUnlockQueue.push({ type: 'BADGE', item: b });

           // LOG
           if (rRun > 0) logTransaction(user.id, 'IN', 'RUN', rRun, `Badge Reward: ${b.name}`);
           if (rGov > 0) logTransaction(user.id, 'IN', 'GOV', rGov, `Badge Reward: ${b.name}`);
        }
      }
    });

    if (hasChanges) {
      const newRunBalance = user.runBalance + additionalRun;
      const newGovBalance = user.govBalance + additionalGov;

      // 1. Optimistic Update (Immediate UI Feedback)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              missionLog: newMissionLog,
              badgeLog: newBadgeLog,
              // Update helper arrays for compatibility
              completedMissionIds: newMissionLog.map(x => x.id),
              earnedBadgeIds: newBadgeLog.map(x => x.id),
              runBalance: newRunBalance,
              govBalance: newGovBalance,
            }
          : null
      );
      
      // 2. Persist to Supabase (Fire and Forget)
      // We update the JSONB logs and the balances ONLY (Legacy columns removed)
      const updateDb = async () => {
          const { error } = await supabase.from('profiles').update({
              mission_log: newMissionLog,
              badge_log: newBadgeLog,
              run_balance: newRunBalance,
              gov_balance: newGovBalance
          }).eq('id', user.id);

          if (error) {
              console.error("❌ Failed to save achievements to DB:", error);
          }
      };
      updateDb();
      
      if (newUnlockQueue.length > 0) {
          setAchievementQueue(prev => [...prev, ...newUnlockQueue]);
      }
    }

  }, [user?.totalKm, user?.runHistory, zones, missions, badges]);

  // Actions for UI
  const handleCloseNotification = () => {
    setAchievementQueue(prev => prev.slice(1));
  };

  const handleClaimAllNotifications = () => {
      let totalRun = 0;
      let totalGov = 0;

      achievementQueue.forEach(entry => {
          if (entry.type === 'MISSION') {
              const m = entry.item as Mission;
              totalRun += m.rewardRun;
              if (m.rewardGov) totalGov += m.rewardGov;
          } else {
              const b = entry.item as Badge;
              totalRun += (b.rewardRun || 0);
              if (b.rewardGov) totalGov += b.rewardGov;
          }
      });

      const count = achievementQueue.length;

      setAchievementQueue([]);
      setClaimSummary({ count, totalRun, totalGov });

      setTimeout(() => {
          setClaimSummary(null);
      }, 3000);
  };

  return {
      achievementQueue,
      claimSummary,
      handleCloseNotification,
      handleClaimAllNotifications
  };
};