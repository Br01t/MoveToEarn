
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion, Transaction, RunEntry, AchievementLog } from '../../types';
import { supabase } from '../../supabaseClient';

export const useGameData = () => {
  // --- DATABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>([]); 
  const [allUsers, setAllUsers] = useState<Record<string, Omit<User, 'inventory'>>>({}); 
  
  // Real DB Data
  const [missions, setMissions] = useState<Mission[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [marketItems, setMarketItems] = useState<Item[]>([]);
  const [leaderboards, setLeaderboards] = useState<LeaderboardConfig[]>([]);
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // --- CONFIG STATE ---
  const [govToRunRate, setGovToRunRate] = useState<number>(3000); // 1 GOV = 3000 RUN
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [lastBurnTimestamp, setLastBurnTimestamp] = useState<number>(0);
  const [totalBurned, setTotalBurned] = useState<number>(0);

  // --- DATA FETCHING ---
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
                      name: p.name || 'Runner',
                      email: p.email,
                      avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
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

          // Increased limit to 1000 to support accurate charting from the first transaction
          const { data: txRows } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', userId)
              .order('timestamp', { ascending: false })
              .limit(1000);

          if (txRows) {
              const mappedTxs: Transaction[] = txRows.map((t: any) => ({
                  id: t.id,
                  userId: t.user_id,
                  type: t.type,
                  token: t.token,
                  amount: t.amount,
                  description: t.description,
                  timestamp: typeof t.timestamp === 'string' ? new Date(t.timestamp).getTime() : t.timestamp
              }));
              setTransactions(mappedTxs);
          }

          const { data: runRows } = await supabase
              .from('runs')
              .select('*')
              .eq('user_id', userId)
              .order('timestamp', { ascending: false });

          let runHistory: RunEntry[] = [];
          if (runRows) {
              runHistory = runRows.map((r: any) => {
                  let involvedZones: string[] = [];
                  if (Array.isArray(r.involved_zones)) {
                      involvedZones = r.involved_zones;
                  } else if (typeof r.involved_zones === 'string') {
                      try {
                          const parsed = JSON.parse(r.involved_zones);
                          if (Array.isArray(parsed)) involvedZones = parsed;
                      } catch (e) { 
                          console.warn("Failed to parse involved_zones", r.id); 
                      }
                  }

                  let zoneBreakdown: Record<string, number> = {};
                  if (typeof r.zone_breakdown === 'object' && r.zone_breakdown !== null) {
                      zoneBreakdown = r.zone_breakdown;
                  } else if (typeof r.zone_breakdown === 'string') {
                      try {
                          zoneBreakdown = JSON.parse(r.zone_breakdown);
                      } catch (e) { 
                          console.warn("Failed to parse zone_breakdown", r.id); 
                      }
                  }

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
                      involvedZones: involvedZones,
                      zoneBreakdown: zoneBreakdown
                  };
              });
          }

          const dynamicTotalKm = runHistory.reduce((acc, curr) => acc + (Number(curr.km) || 0), 0);

          setUser({
              id: data.id,
              name: data.username || data.name || 'Runner',
              email: data.email,
              avatar: data.avatar_url || data.avatar || 'https://via.placeholder.com/150',
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
      console.log(`[Leaderboard Debug] 🔍 Fetching for Zone ID: ${zoneId}`);
      try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_zone_leaderboard', { target_zone_id: zoneId });

          if (!rpcError && rpcData) {
              const userIds = rpcData.map((r: any) => r.user_id);
              const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
              
              return rpcData.map((row: any) => {
                  const profile = profiles?.find(p => p.id === row.user_id);
                  const fallbackName = allUsers[row.user_id] ? allUsers[row.user_id].name : 'Runner';
                  const fallbackAvatar = allUsers[row.user_id] ? allUsers[row.user_id].avatar : null;
                  
                  return {
                      id: row.user_id,
                      name: profile?.name || fallbackName,
                      avatar: profile?.avatar || fallbackAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user_id}`,
                      km: Number(row.km)
                  };
              });
          }

          console.warn("[Leaderboard Debug] RPC failed or not found, falling back to Client-Side Fetch.");
          
          const { data: rawRuns, error } = await supabase
              .from('runs')
              .select('id, user_id, km, zone_breakdown, involved_zones')
              .contains('involved_zones', [zoneId])
              .limit(1000); 

          if (error || !rawRuns || rawRuns.length === 0) return [];

          const userStats: Record<string, number> = {};
          rawRuns.forEach((run: any) => {
              let zoneKm = 0;
              let breakdown = run.zone_breakdown;
              if (typeof breakdown === 'string') {
                  try { breakdown = JSON.parse(breakdown); } catch (e) { breakdown = {}; }
              }

              if (breakdown && breakdown[zoneId]) {
                  zoneKm = Number(breakdown[zoneId]);
              } else {
                  const count = Array.isArray(run.involved_zones) ? run.involved_zones.length : 1;
                  zoneKm = Number(run.km) / count;
              }
              if (zoneKm > 0) userStats[run.user_id] = (userStats[run.user_id] || 0) + zoneKm;
          });

          const sortedUserIds = Object.keys(userStats).sort((a, b) => userStats[b] - userStats[a]).slice(0, 10);
          const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', sortedUserIds);

          return sortedUserIds.map(userId => {
              const profile = profilesData?.find(p => p.id === userId);
              const fallbackName = allUsers[userId] ? allUsers[userId].name : 'Runner';
              const fallbackAvatar = allUsers[userId] ? allUsers[userId].avatar : null;
              return {
                  id: userId,
                  name: profile?.name || fallbackName, 
                  avatar: profile?.avatar || fallbackAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                  km: userStats[userId]
              };
          });

      } catch (err) {
          console.error("Error calculating zone leaderboard:", err);
          return [];
      }
  };

  // Added uploadFile function for handling cloud storage uploads with Base64 fallback
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);

          return data.publicUrl;
      } catch (err) {
          console.error("Error uploading file:", err);
      }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) await fetchUserProfile(session.user.id);
        await fetchGameData();
        if (error) throw error;
        if (!session) setLoading(false);
      } catch (err) {
        console.warn("Supabase connection issue:", err);
        setLoading(false);
      }
    };
    initSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
      if (session) {
          fetchUserProfile(session.user.id);
          setTimeout(() => fetchGameData(), 500);
      }
      else { setUser(null); setZones([]); }
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