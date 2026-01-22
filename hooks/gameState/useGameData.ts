import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion, Transaction, RunEntry, AchievementLog } from '../../types';
import { supabase } from '../../supabaseClient';

export const useGameData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>([]); 
  const [allUsers, setAllUsers] = useState<Record<string, Omit<User, 'inventory'>>>({}); 
  const [missions, setMissions] = useState<Mission[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [marketItems, setMarketItems] = useState<Item[]>([]);
  const [leaderboards, setLeaderboards] = useState<LeaderboardConfig[]>([]);
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [govToRunRate, setGovToRunRate] = useState<number>(3000); 
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [lastBurnTimestamp, setLastBurnTimestamp] = useState<number>(0);
  const [totalBurned, setTotalBurned] = useState<number>(0);

  const fetchGameData = async () => {
      try {
          const [
              profilesRes, missionsRes, badgesRes, itemsRes, zonesRes,
              leaderboardsRes, levelsRes, reportsRes, suggestionsRes, lastBurnRes, totalBurnRes
          ] = await Promise.all([
              supabase.from('profiles').select('*'),
              supabase.from('missions').select('*'),
              supabase.from('badges').select('*'),
              supabase.from('items').select('*'),
              supabase.from('zones').select('*'),
              supabase.from('leaderboards').select('*'),
              supabase.from('levels').select('*').order('level', { ascending: true }),
              supabase.from('bug_reports').select('*').order('timestamp', { ascending: false }),
              supabase.from('suggestions').select('*').order('timestamp', { ascending: false }),
              supabase.from('transactions').select('timestamp').eq('description', 'Global Burn Protocol (System)').order('timestamp', { ascending: false }).limit(1).maybeSingle(),
              supabase.from('transactions').select('amount').eq('description', 'Global Burn Protocol (System)')
          ]);

          if (profilesRes.data) {
              const usersMap: Record<string, Omit<User, 'inventory'>> = {};
              profilesRes.data.forEach((p: any) => {
                  const mLog = (p.mission_log || []) as AchievementLog[];
                  const bLog = (p.badge_log || []) as AchievementLog[];
                  
                  usersMap[p.id] = {
                      id: p.id,
                      name: p.name || p.username || 'Runner',
                      email: p.email,
                      avatar: p.avatar_url || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
                      runBalance: p.run_balance || 0,
                      govBalance: p.gov_balance || 0,
                      totalKm: p.total_km || 0,
                      isPremium: p.is_premium || false,
                      isAdmin: p.is_admin || false,
                      runHistory: [], 
                      missionLog: mLog,
                      badgeLog: bLog,
                      completedMissionIds: mLog.map(x => x.id),
                      earnedBadgeIds: bLog.map(x => x.id),
                      favoriteBadgeId: p.favorite_badge_id
                  };
              });
              setAllUsers(usersMap);
          }

          if (missionsRes.data) {
              setMissions(missionsRes.data.map((m: any) => ({
                  id: m.id,
                  title: m.title,
                  description: m.description,
                  rewardRun: m.reward_run,
                  rewardGov: m.reward_gov,
                  rarity: m.rarity,
                  logicId: m.logic_id,
                  category: m.category,
                  difficulty: m.difficulty,
                  conditionType: m.condition_type,
                  conditionValue: m.condition_value
              })));
          }

          if (badgesRes.data) {
              setBadges(badgesRes.data.map((b: any) => ({
                  id: b.id,
                  name: b.name,
                  description: b.description,
                  icon: b.icon,
                  rarity: b.rarity,
                  rewardRun: b.reward_run,
                  rewardGov: b.reward_gov,
                  logicId: b.logic_id,
                  category: b.category,
                  difficulty: b.difficulty,
                  conditionType: b.condition_type,
                  conditionValue: b.condition_value
              })));
          }

          if (itemsRes.data) {
              setMarketItems(itemsRes.data.map((i: any) => ({
                  id: i.id,
                  name: i.name,
                  description: i.description,
                  priceRun: i.price_run,
                  quantity: i.quantity,
                  type: i.type,
                  effectValue: i.effect_value,
                  icon: i.icon
              })));
          }

          if (zonesRes.data) {
              const mappedZones = zonesRes.data.map((z: any) => ({
                  id: z.id,
                  name: z.name || z.location || 'Unknown Zone', 
                  ownerId: z.owner_id,
                  x: z.x,
                  y: z.y,
                  lat: z.lat || 0,
                  lng: z.lng || 0,
                  defenseLevel: z.defense_level || 1, 
                  recordKm: z.record_km,
                  totalKm: z.total_km || z.record_km || 0,
                  interestRate: z.interest_rate,
                  interestPool: z.interest_pool || 0,
                  lastDistributionTime: z.last_distribution_time || 0,
                  boostExpiresAt: z.boost_expires_at,
                  shieldExpiresAt: z.shield_expires_at
              }));
              setZones(mappedZones);
          }

          if (leaderboardsRes.data) {
              setLeaderboards(leaderboardsRes.data.map((l: any) => ({
                  id: l.id,
                  title: l.title,
                  description: l.description,
                  metric: l.metric,
                  type: l.type,
                  startTime: l.start_time,
                  endTime: l.end_time,
                  rewardPool: l.reward_pool,
                  rewardCurrency: l.reward_currency,
                  lastResetTimestamp: l.last_reset_timestamp
              })));
          }

          if (levelsRes.data) {
              setLevels(levelsRes.data.map((l: any) => ({
                  id: l.id,
                  level: l.level,
                  minKm: l.min_km,
                  title: l.title,
                  icon: l.icon
              })));
          }

          if (reportsRes.data) {
              setBugReports(reportsRes.data.map((r: any) => ({
                  id: r.id,
                  userId: r.user_id,
                  userName: r.user_name,
                  description: r.description,
                  screenshot: r.screenshot,
                  timestamp: r.timestamp,
                  status: r.status
              })));
          }

          if (suggestionsRes.data) {
              setSuggestions(suggestionsRes.data.map((s: any) => ({
                  id: s.id,
                  userId: s.user_id,
                  userName: s.user_name,
                  title: s.title,
                  description: s.description,
                  timestamp: s.timestamp
              })));
          }

         let timestampValue = 0;
          if (lastBurnRes.data && lastBurnRes.data.timestamp) {
              const dbValue = lastBurnRes.data.timestamp;
              if (typeof dbValue === 'string') {
                  const ms = new Date(dbValue).getTime();
                  if (!isNaN(ms) && ms > 1000000000000) {
                      timestampValue = ms;
                  }
              } else if (typeof dbValue === 'number' && dbValue > 1000000000000) {
                  timestampValue = dbValue;
              }
          }
          setLastBurnTimestamp(timestampValue);

          if (totalBurnRes.data) {
              const total = totalBurnRes.data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
              setTotalBurned(total);
          }

      } catch (err) {
          console.error("❌ [GAME STATE] Critical error fetching data:", err);
      }
  };

  const fetchUserProfile = async (userId: string) => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (data) {
          const { data: invRows } = await supabase.from('inventory').select('*').eq('user_id', userId);
          const { data: itemDefs } = await supabase.from('items').select('*');

          let builtInventory: InventoryItem[] = [];
          if (invRows && itemDefs) {
              builtInventory = invRows.map((row: any) => {
                  const def = itemDefs.find((i: any) => i.id === row.item_id);
                  if (!def) return null;
                  return { ...def, quantity: row.quantity };
              }).filter((i): i is InventoryItem => i !== null && i !== undefined);
          }

          const { data: txRows } = await supabase.from('transactions').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(1000);
          if (txRows) {
              setTransactions(txRows.map((t: any) => ({
                  id: t.id,
                  userId: t.user_id,
                  type: t.type,
                  token: t.token,
                  amount: t.amount,
                  description: t.description,
                  timestamp: typeof t.timestamp === 'string' ? new Date(t.timestamp).getTime() : t.timestamp
              })));
          }

          const { data: runRows } = await supabase.from('runs').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
          let runHistory: RunEntry[] = [];
          if (runRows) {
              runHistory = runRows.map((r: any) => {
                  const invZones = Array.isArray(r.involved_zones) ? r.involved_zones : [];
                  const breakdown = (typeof r.zone_breakdown === 'object' && r.zone_breakdown !== null) ? r.zone_breakdown : {};

                  return {
                      id: r.id,
                      location: r.location_name || 'Unknown',
                      km: Number(r.km),
                      timestamp: typeof r.timestamp === 'string' ? new Date(r.timestamp).getTime() : r.timestamp,
                      runEarned: Number(r.run_earned),
                      govEarned: Number(r.gov_earned || 0),
                      duration: Number(r.duration || 0),
                      elevation: Number(r.elevation || 0),
                      maxSpeed: Number(r.max_speed || 0),
                      avgSpeed: Number(r.avg_speed || 0),
                      involvedZones: invZones,
                      zoneBreakdown: breakdown
                  };
              });
          }

          const dynamicTotalKm = runHistory.reduce((acc, curr) => acc + (Number(curr.km) || 0), 0);

          setUser({
              id: data.id,
              name: data.username || data.name || 'Runner',
              email: data.email,
              avatar: data.avatar_url || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
              runBalance: data.run_balance || 0,
              govBalance: data.gov_balance || 0,
              totalKm: dynamicTotalKm, 
              isPremium: data.is_premium || false,
              isAdmin: data.is_admin || false,
              inventory: builtInventory,
              runHistory: runHistory, 
              missionLog: data.mission_log || [],
              badgeLog: data.badge_log || [],
              completedMissionIds: (data.mission_log || []).map((l: any) => l.id),
              earnedBadgeIds: (data.badge_log || []).map((l: any) => l.id),
              favoriteBadgeId: data.favorite_badge_id
          });
      }
  };

  const fetchZoneLeaderboard = async (zoneId: string) => {
      try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_zone_leaderboard', { target_zone_id: zoneId });
          
          if (rpcError) {
              console.warn("RPC Error in leaderboard:", rpcError.message);
              return [];
          }

          if (rpcData && rpcData.length > 0) {
              const userIds = rpcData.map((r: any) => { return r.user_id; });
              const { data: profiles } = await supabase.from('profiles').select('id, name, avatar, avatar_url, username').in('id', userIds);
              
              return rpcData.map((row: any) => {
                  const profile = profiles?.find(p => p.id === row.user_id);
                  return {
                      id: row.user_id,
                      name: profile?.username || profile?.name || allUsers[row.user_id]?.name || 'Runner',
                      avatar: profile?.avatar_url || profile?.avatar || allUsers[row.user_id]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user_id}`,
                      km: Number(row.km)
                  };
              });
          }
          return [];
      } catch (err) {
          console.error("Critical error fetching zone leaderboard:", err);
          return [];
      }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('images').getPublicUrl(filePath);
          return data.publicUrl;
      } catch (err) {
          console.error("Error uploading file:", err);
          return null;
      }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        // Fix: Use any cast to resolve property existence errors on getSession, likely due to mismatched Supabase types in the environment.
        const { data: { session }, error } = await (supabase.auth as any).getSession();
        if (session) {
            await fetchUserProfile(session.user.id);
            await fetchGameData();
        }
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase auth issue:", err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
    
    // Fix: Use any cast to resolve property existence errors on onAuthStateChange.
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: any, session: any) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
      if (session) {
          fetchUserProfile(session.user.id);
          setTimeout(() => fetchGameData(), 500);
      }
      else { 
          setUser(null); 
          setZones([]); 
          setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return {
      user, zones, allUsers, missions, badges, marketItems, leaderboards, levels, bugReports, suggestions, transactions,
      govToRunRate, loading, recoveryMode, lastBurnTimestamp, totalBurned,
      setUser, setZones, setAllUsers, setTransactions, setMarketItems, setBugReports, setSuggestions, setGovToRunRate, setRecoveryMode, setLastBurnTimestamp, setTotalBurned,
      fetchGameData, fetchUserProfile, fetchZoneLeaderboard, uploadFile
  };
};