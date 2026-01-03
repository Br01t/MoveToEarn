import React from 'react';
import { supabase } from '../../supabaseClient';
import { Item, Mission, Badge, Zone, LeaderboardConfig, LevelConfig, User, AchievementLog } from '../../types';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface AdminActionsProps {
    fetchGameData: () => Promise<void>;
    user: User | null;
    lastBurnTimestamp: number;
    setLastBurnTimestamp: React.Dispatch<React.SetStateAction<number>>;
    fetchUserProfile: (id: string) => Promise<void>;
    setAllUsers: React.Dispatch<React.SetStateAction<Record<string, Omit<User, 'inventory'>>>>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
    setBugReports: React.Dispatch<React.SetStateAction<any[]>>;
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>;
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
    allUsers: Record<string, Omit<User, 'inventory'>>;
}

export const useAdminActions = ({ 
    fetchGameData, user, lastBurnTimestamp, setLastBurnTimestamp, fetchUserProfile, setAllUsers, logTransaction, setBugReports, setSuggestions, setZones, allUsers 
}: AdminActionsProps) => {
  const { showToast } = useGlobalUI();

  const triggerGlobalBurn = async () => {
      if (!user || !user.isAdmin) return { success: false, message: "Unauthorized" };
      const now = Date.now();
      const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
      if (lastBurnTimestamp > 0 && (now - lastBurnTimestamp < DAYS_30)) {
          return { success: false, message: "Cooldown Active." };
      }
      const { data, error } = await supabase.rpc('trigger_global_burn', { admin_uuid: user.id });
      if (error) return { success: false, message: `Database Error: ${error.message}` };
      setLastBurnTimestamp(Date.now());
      await fetchUserProfile(user.id);
      await fetchGameData();
      
      return { success: true, totalBurned: data?.total_burned || 0, count: data?.users_affected || 0 };
  };

  const addItem = async (item: Item) => {
      const { error } = await supabase.from('items').insert({
          name: item.name, description: item.description, price_run: item.priceRun,
          quantity: item.quantity, type: item.type, effect_value: item.effectValue, icon: item.icon
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const updateItem = async (item: Item) => {
      const { error } = await supabase.from('items').update({
          name: item.name, description: item.description, price_run: item.priceRun,
          quantity: item.quantity, type: item.type, effect_value: item.effectValue
      }).eq('id', item.id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const removeItem = async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const addMission = async (m: Mission) => {
      const { error } = await supabase.from('missions').insert({
          title: m.title, description: m.description, reward_run: m.rewardRun, reward_gov: m.rewardGov,
          condition_type: m.conditionType, condition_value: m.conditionValue, rarity: m.rarity,
          logic_id: m.logicId, category: m.category, difficulty: m.difficulty
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };
  const updateMission = async (m: Mission) => {
      const { error } = await supabase.from('missions').update({
          title: m.title, description: m.description, reward_run: m.rewardRun, reward_gov: m.rewardGov,
          condition_type: m.conditionType, condition_value: m.conditionValue, rarity: m.rarity,
          logic_id: m.logicId, category: m.category, difficulty: m.difficulty
      }).eq('id', m.id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };
  const removeMission = async (id: string) => {
      const { error } = await supabase.from('missions').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const addBadge = async (b: Badge) => {
      const { error } = await supabase.from('badges').insert({
          name: b.name, description: b.description, icon: b.icon, rarity: b.rarity,
          condition_type: b.conditionType, condition_value: b.conditionValue,
          reward_run: b.rewardRun, reward_gov: b.rewardGov,
          logic_id: b.logicId, category: b.category, difficulty: b.difficulty
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };
  const updateBadge = async (b: Badge) => {
      const { error } = await supabase.from('badges').update({
          name: b.name, description: b.description, icon: b.icon, rarity: b.rarity,
          condition_type: b.conditionType, condition_value: b.conditionValue,
          reward_run: b.rewardRun, reward_gov: b.rewardGov,
          logic_id: b.logicId, category: b.category, difficulty: b.difficulty
      }).eq('id', b.id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };
  const removeBadge = async (id: string) => {
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const updateZone = async (id: string, updates: Partial<Zone>) => {
      setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
      const { data, error } = await supabase.from('zones').update(dbUpdates).eq('id', id).select();
      if (error) {
          await fetchGameData();
          return { error: error.message, success: false };
      }
      return { success: !!(data && data.length > 0), error: data && data.length > 0 ? undefined : "Permission Denied" };
  };

  const deleteZone = async (id: string) => {
      const { error = null } = await supabase.from('zones').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const distributeZoneRewards = async () => {
      const { error } = await supabase.rpc('distribute_zone_rewards');
      if (error) showToast("Distribution Failed: " + error.message, 'ERROR');
      else {
          showToast("Rewards Distributed Successfully via RPC!", 'SUCCESS');
          await fetchGameData();
      }
  };

  const updateBugStatus = async (id: string, status: string) => {
      const { error } = await supabase.from('bug_reports').update({ status }).eq('id', id);
      if (!error) setBugReports(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
      return { success: !error, error: error?.message };
  };

  const deleteBugReport = async (id: string) => {
      const { error = null } = await supabase.from('bug_reports').delete().eq('id', id);
      if (!error) setBugReports(prev => prev.filter(b => b.id !== id));
      return { success: !error, error: error?.message };
  };

  const deleteSuggestion = async (id: string) => {
      const { error = null } = await supabase.from('suggestions').delete().eq('id', id);
      if (!error) setSuggestions(prev => prev.filter(s => s.id !== id));
      return { success: !error, error: error?.message };
  };

  const addLeaderboard = async (config: LeaderboardConfig) => {
      const { error } = await supabase.from('leaderboards').insert({
          title: config.title, description: config.description, metric: config.metric, type: config.type,
          start_time: config.startTime, end_time: config.endTime, reward_pool: config.rewardPool, reward_currency: config.rewardCurrency
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const updateLeaderboard = async (config: LeaderboardConfig) => {
      const { error } = await supabase.from('leaderboards').update({
          title: config.title, description: config.description, metric: config.metric, type: config.type,
          start_time: config.startTime, end_time: config.endTime, reward_pool: config.rewardPool, reward_currency: config.rewardCurrency
      }).eq('id', config.id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const deleteLeaderboard = async (id: string) => {
      const { error = null } = await supabase.from('leaderboards').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const resetLeaderboard = async (id: string) => {
      const { error } = await supabase.from('leaderboards').update({ last_reset_timestamp: Date.now() }).eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const addLevel = async (level: LevelConfig) => {
      const { error } = await supabase.from('levels').insert({
          level: level.level, min_km: level.minKm, title: level.title, icon: level.icon
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const updateLevel = async (level: LevelConfig) => {
      const { error } = await supabase.from('levels').update({
          level: level.level, min_km: level.minKm, title: level.title, icon: level.icon
      }).eq('id', level.id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const deleteLevel = async (id: string) => {
      const { error = null } = await supabase.from('levels').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const revokeUserAchievement = async (userId: string, type: 'MISSION' | 'BADGE', idToRemove: string) => {
      const { data: profile } = await supabase.from('profiles').select('mission_log, badge_log').eq('id', userId).single();
      if (!profile) return { success: false, error: "User not found" };
      let updates: any = {};
      if (type === 'MISSION') {
          const newLog = (profile.mission_log || []).filter((entry: AchievementLog) => entry.id !== idToRemove);
          updates.mission_log = newLog;
      } else {
          const newLog = (profile.badge_log || []).filter((entry: AchievementLog) => entry.id !== idToRemove);
          updates.badge_log = newLog;
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (!error && allUsers[userId]) {
          const prevUser = allUsers[userId];
          setAllUsers(prev => ({
              ...prev,
              [userId]: {
                  ...prevUser,
                  missionLog: type === 'MISSION' ? updates.mission_log : prevUser.missionLog,
                  badgeLog: type === 'BADGE' ? updates.badge_log : prevUser.badgeLog,
                  completedMissionIds: type === 'MISSION' ? updates.mission_log.map((x: any) => x.id) : prevUser.completedMissionIds,
                  earnedBadgeIds: type === 'BADGE' ? updates.badge_log.map((x: any) => x.id) : prevUser.earnedBadgeIds
              }
          }));
      }
      return { success: !error, error: error?.message };
  };

  const adjustUserBalance = async (userId: string, runChange: number, govChange: number) => {
      const { data: profile } = await supabase.from('profiles').select('run_balance, gov_balance').eq('id', userId).single();
      if (!profile) return { success: false, error: "User not found" };
      const newRun = (profile.run_balance || 0) + runChange;
      const newGov = (profile.gov_balance || 0) + govChange;
      const { error } = await supabase.from('profiles').update({ run_balance: newRun, gov_balance: newGov }).eq('id', userId);
      if (!error) {
          await logTransaction(userId, runChange >= 0 ? 'IN' : 'OUT', 'RUN', Math.abs(runChange), 'Admin Adjustment');
          await logTransaction(userId, govChange >= 0 ? 'IN' : 'OUT', 'GOV', Math.abs(govChange), 'Admin Adjustment');
          setAllUsers(prev => ({ ...prev, [userId]: { ...prev[userId], runBalance: newRun, govBalance: newGov } }));
      }
      return { success: !error, error: error?.message };
  };

  return { triggerGlobalBurn, addItem, updateItem, removeItem, addMission, updateMission, removeMission, addBadge, updateBadge, removeBadge, updateZone, deleteZone, distributeZoneRewards, updateBugStatus, deleteBugReport, deleteSuggestion, addLeaderboard, updateLeaderboard, deleteLeaderboard, resetLeaderboard, addLevel, updateLevel, deleteLevel, revokeUserAchievement, adjustUserBalance };
};