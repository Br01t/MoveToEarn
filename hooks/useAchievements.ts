
import React, { useState, useEffect } from 'react';
import { User, Zone, Mission, Badge } from '../types';
import { checkAchievement } from '../utils/rewards';

interface AchievementProps {
    user: User | null;
    zones: Zone[];
    missions: Mission[];
    badges: Badge[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const useAchievements = ({ user, zones, missions, badges, setUser }: AchievementProps) => {
  const [achievementQueue, setAchievementQueue] = useState<{ type: 'MISSION' | 'BADGE'; item: Mission | Badge }[]>([]);
  const [claimSummary, setClaimSummary] = useState<{ count: number; totalRun: number; totalGov: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    let newCompletedMissions = [...user.completedMissionIds];
    let newEarnedBadges = [...user.earnedBadgeIds];
    let additionalRun = 0; 
    let additionalGov = 0;
    let hasChanges = false;
    
    const newUnlockQueue: { type: 'MISSION' | 'BADGE'; item: Mission | Badge }[] = [];

    // Check Missions
    missions.forEach((m) => {
      if (!newCompletedMissions.includes(m.id)) {
        if (checkAchievement(m, user, zones)) {
           newCompletedMissions.push(m.id);
           additionalRun += m.rewardRun;
           if (m.rewardGov) additionalGov += m.rewardGov;
           hasChanges = true;
           newUnlockQueue.push({ type: 'MISSION', item: m });
        }
      }
    });

    // Check Badges
    badges.forEach((b) => {
      if (!newEarnedBadges.includes(b.id)) {
        if (checkAchievement(b, user, zones)) {
           newEarnedBadges.push(b.id);
           additionalRun += (b.rewardRun || 0); 
           if (b.rewardGov) additionalGov += b.rewardGov;
           hasChanges = true;
           newUnlockQueue.push({ type: 'BADGE', item: b });
        }
      }
    });

    if (hasChanges) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              completedMissionIds: newCompletedMissions,
              earnedBadgeIds: newEarnedBadges,
              runBalance: prev.runBalance + additionalRun,
              govBalance: prev.govBalance + additionalGov,
            }
          : null
      );
      
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