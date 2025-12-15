
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion, Transaction, RunEntry, AchievementLog } from '../types';
import { MOCK_USERS, PREMIUM_COST, CONQUEST_REWARD_GOV, CONQUEST_COST, ITEM_DURATION_SEC } from '../constants';
import { supabase } from '../supabaseClient';

export const useGameState = () => {
  // --- DATABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>([]); // Initialized empty (Real Data Only)
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
  const [recoveryMode, setRecoveryMode] = useState(false); // Track if user is in recovery flow
  const [lastBurnTimestamp, setLastBurnTimestamp] = useState<number>(0);

  // --- DATA FETCHING ---
  const fetchGameData = async () => {
      try {
          const [
              profilesRes,
              missionsRes,
              badgesRes,
              itemsRes,
              zonesRes,
              leaderboardsRes,
              levelsRes,
              reportsRes,
              suggestionsRes,
              // transactionsRes removed from global fetch to ensure privacy
              lastBurnRes
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
              // Check cooldown based on System Transaction
              supabase.from('transactions').select('timestamp').eq('description', 'Global Burn Protocol (System)').order('timestamp', { ascending: false }).limit(1).maybeSingle()
          ]);

          // --- 1. PROFILES (USERS) ---
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
                      runHistory: [], // Only loaded for current user to save bandwidth
                      missionLog: mLog,
                      badgeLog: bLog,
                      // Derived arrays for compatibility
                      completedMissionIds: mLog.map(x => x.id),
                      earnedBadgeIds: bLog.map(x => x.id),
                      favoriteBadgeId: p.favorite_badge_id
                  };
              });
              setAllUsers(usersMap);
          }

          // --- 2. CONFIG DATA ---
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
                  // Handle inconsistent DB schema (some rows might use 'location' instead of 'name')
                  name: z.name || z.location || 'Unknown Zone', 
                  ownerId: z.owner_id,
                  x: z.x,
                  y: z.y,
                  // IMPORTANT: Requires lat/lng columns in DB (added via SQL)
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
          console.log(`[DEBUG LOG] lastBurnTimestamp aggiornato: ${timestampValue}`);

      } catch (err) {
          console.error("❌ [GAME STATE] Critical error fetching data:", err);
      }
  };

 const fetchUserProfile = async (userId: string) => {
      // 1. Fetch Profile Basics
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (data) {
          // 2. Fetch Inventory
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

          // 3. Fetch Transactions History
          const { data: txRows } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', userId)
              .order('timestamp', { ascending: false })
              .limit(100);

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

          // 4. FETCH RUN HISTORY
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
  
  // --- FETCH ZONE LEADERBOARD (ROBUST DATA FETCH) ---
  const fetchZoneLeaderboard = async (zoneId: string) => {
      console.log(`[Leaderboard Debug] 🔍 Fetching for Zone ID: ${zoneId}`);
      try {
          // --- ATTEMPT 1: RPC CALL (Best Performance & Security) ---
          // This requires the function 'get_zone_leaderboard' to be created in Supabase.
          // The SQL is provided in the instructions.
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_zone_leaderboard', { target_zone_id: zoneId });

          if (!rpcError && rpcData) {
              console.log(`[Leaderboard Debug] ⚡ RPC Success: ${rpcData.length} rows`);
              
              // Enrich with profile data
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

          console.warn("[Leaderboard Debug] RPC failed or not found, falling back to Client-Side Fetch. (Check Database RLS Policies if empty!)");

          // --- ATTEMPT 2: CLIENT-SIDE FETCH (Fallback) ---
          // NOTE: This will return EMPTY if RLS policies on 'runs' table are not set to public read.
          
          const { data: rawRuns, error } = await supabase
              .from('runs')
              .select('id, user_id, km, zone_breakdown, involved_zones')
              .contains('involved_zones', [zoneId]) // Use proper JSONB containment
              .limit(1000); // Higher limit to capture history

          if (error) {
              console.error("[Leaderboard Debug] ❌ DB Error:", error.message);
              return [];
          }

          if (!rawRuns || rawRuns.length === 0) {
              console.log("[Leaderboard Debug] No runs found. If you are not Admin, this is likely an RLS issue.");
              return [];
          }

          // Aggregate locally
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
                  // Fallback: Even split
                  const count = Array.isArray(run.involved_zones) ? run.involved_zones.length : 1;
                  zoneKm = Number(run.km) / count;
              }
              
              if (zoneKm > 0) {
                  userStats[run.user_id] = (userStats[run.user_id] || 0) + zoneKm;
              }
          });

          // Sort & Top 10
          const sortedUserIds = Object.keys(userStats).sort((a, b) => userStats[b] - userStats[a]).slice(0, 10);
          
          const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', sortedUserIds);

          const result = sortedUserIds.map(userId => {
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
          
          return result;

      } catch (err) {
          console.error("Error calculating zone leaderboard:", err);
          return [];
      }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
            await fetchUserProfile(session.user.id);
        }
        
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
      if (event === 'PASSWORD_RECOVERY') {
          console.log("🔄 Recovery mode activated");
          setRecoveryMode(true);
      }
      
      if (session) {
          fetchUserProfile(session.user.id);
          setTimeout(() => fetchGameData(), 500);
      }
      else { setUser(null); setZones([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => await supabase.auth.signInWithPassword({ email, password });
  
  const resetPassword = async (email: string) => {
      const productionUrl = (import.meta as any).env.VITE_SITE_URL;
      const redirectTo = productionUrl || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return { error };
  };

  const updatePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
          setRecoveryMode(false); 
          alert("Password updated successfully!");
      }
      return { error };
  };

  const register = async (email: string, password: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: username } } });
      if (data.user && !error) {
          await supabase.from('profiles').insert({ id: data.user.id, email: email, name: username, run_balance: 0, gov_balance: 0, total_km: 0 });
      }
      return { data, error };
  };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  const logTransaction = async (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => {
      if (amount <= 0) return;
      const newTx: Transaction = {
          id: crypto.randomUUID(),
          userId,
          type,
          token,
          amount,
          description,
          timestamp: Date.now()
      };

      setTransactions(prev => [newTx, ...prev]);

      const { error } = await supabase.from('transactions').insert({
          id: newTx.id,
          user_id: userId,
          type: type,
          token: token,
          amount: amount,
          description: description,
          timestamp: newTx.timestamp
      });

      if (error) {
          console.error("❌ [TRANSACTION LOG FAILED]", error.message);
      }
  };

  // --- RECORD RUN (ATOMIC SAVING) ---
  const recordRun = async (
      userId: string, 
      runData: RunEntry, 
      updatedZones: Zone[] 
  ) => {
      try {
          const { error: runError } = await supabase.from('runs').insert({
              id: runData.id, 
              user_id: userId,
              location_name: runData.location,
              km: runData.km, 
              duration: runData.duration, 
              run_earned: runData.runEarned,
              gov_earned: runData.govEarned || 0,
              avg_speed: runData.avgSpeed,
              max_speed: runData.maxSpeed,
              elevation: runData.elevation,
              timestamp: runData.timestamp,
              involved_zones: runData.involvedZones,
              zone_breakdown: runData.zoneBreakdown || {}
          });

          if (runError) throw runError;

          const { data: currentProfile } = await supabase.from('profiles').select('run_balance').eq('id', userId).single();
          const { data: userRuns } = await supabase.from('runs').select('km').eq('user_id', userId);
          const exactTotalKm = userRuns ? userRuns.reduce((sum, r) => sum + (Number(r.km) || 0), 0) : 0;

          if (currentProfile) {
              await supabase.from('profiles').update({
                  total_km: exactTotalKm, 
                  run_balance: currentProfile.run_balance + runData.runEarned 
              }).eq('id', userId);
          }

          if (updatedZones.length > 0) {
              const { error: zoneError } = await supabase.from('zones').upsert(
                  updatedZones.map(z => ({
                      id: z.id,
                      name: z.name,
                      location: `POINT(${z.lng} ${z.lat})`,
                      owner_id: z.ownerId,
                      x: z.x,
                      y: z.y,
                      lat: z.lat,
                      lng: z.lng,
                      defense_level: z.defenseLevel,
                      record_km: z.recordKm,
                      interest_rate: z.interestRate,
                      interest_pool: z.interestPool,
                      last_distribution_time: z.lastDistributionTime || null,
                      boost_expires_at: z.boostExpiresAt,
                      shield_expires_at: z.shieldExpiresAt
                  }))
              );
              
              if (zoneError) {
                  console.error("❌ [ZONE UPSERT FAILED]:", zoneError);
                  throw zoneError;
              }
          }

          if (runData.runEarned > 0) {
              await logTransaction(userId, 'IN', 'RUN', runData.runEarned, `Run Reward: ${runData.location}`);
          }

          return { success: true };

      } catch (err: any) {
          console.error("❌ [RECORD RUN FAILED]", err.message);
          return { success: false, error: err.message };
      }
  };

  // --- ACTIONS (Store Updates) ---
  
  const claimZone = async (zoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) return;

      const updatedUser = { ...user, runBalance: user.runBalance - CONQUEST_COST, govBalance: user.govBalance + CONQUEST_REWARD_GOV };
      const updatedZones = zones.map(z => z.id === zoneId ? { ...z, ownerId: user.id, recordKm: 0, defenseLevel: 1 } : z); 
      
      setUser(updatedUser);
      setZones(updatedZones);

      await logTransaction(user.id, 'OUT', 'RUN', CONQUEST_COST, `Conquest: ${zone.name}`);
      await logTransaction(user.id, 'IN', 'GOV', CONQUEST_REWARD_GOV, `Conquest Reward: ${zone.name}`);
      await supabase.from('profiles').update({ run_balance: updatedUser.runBalance, gov_balance: updatedUser.govBalance }).eq('id', user.id);
      await supabase.from('zones').update({ owner_id: user.id }).eq('id', zoneId);
  };

 const buyItem = async (item: Item) => {
      if (!user) return;
      if (user.runBalance < item.priceRun) {
          alert("Insufficient funds");
          return;
      }

      const previousUser = { ...user };
      const newRunBalance = parseFloat((user.runBalance - item.priceRun).toFixed(2));

      if (item.type === 'CURRENCY') {
          const newGovBalance = parseFloat((user.govBalance + item.effectValue).toFixed(2));
          setUser({ ...user, runBalance: newRunBalance, govBalance: newGovBalance });
          
          await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market: ${item.name}`);
          await logTransaction(user.id, 'IN', 'GOV', item.effectValue, `Opened: ${item.name}`);
          
          const { error } = await supabase.from('profiles').update({ 
              run_balance: newRunBalance, 
              gov_balance: newGovBalance 
          }).eq('id', user.id);

          if (error) {
              alert("Transaction failed. Rolling back.");
              setUser(previousUser);
              return;
          }
          const newQty = item.quantity - 1;
          await supabase.from('items').update({ quantity: newQty }).eq('id', item.id);
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
          return;
      }

      const currentInventory = user.inventory || [];
      const existingItemIndex = currentInventory.findIndex(i => i.id === item.id);
      let newInventory: InventoryItem[];

      if (existingItemIndex >= 0) {
          newInventory = currentInventory.map((invItem, idx) => {
              if (idx === existingItemIndex) {
                  return { ...invItem, quantity: (invItem.quantity || 0) + 1 };
              }
              return invItem;
          });
      } else {
          const newItem: InventoryItem = {
              id: item.id,
              name: item.name,
              description: item.description || '',
              priceRun: Number(item.priceRun),
              type: item.type,
              effectValue: Number(item.effectValue),
              icon: item.icon || 'Box',
              quantity: 1
          };
          newInventory = [...currentInventory, newItem];
      }

      setUser({ ...user, runBalance: newRunBalance, inventory: newInventory });
      await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market: ${item.name}`);
      
      const { error: profileError } = await supabase.from('profiles').update({ run_balance: newRunBalance }).eq('id', user.id);

      if (profileError) {
          alert(`Purchase failed: ${profileError.message}. Rolling back.`);
          setUser(previousUser);
          return;
      }

      const { data: existingRows } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id);
      const existingRow = existingRows?.[0];

      let invError;
      if (existingRow) {
          const { error } = await supabase.from('inventory').update({ quantity: existingRow.quantity + 1 }).eq('id', existingRow.id);
          invError = error;
      } else {
          const { error } = await supabase.from('inventory').insert({ user_id: user.id, item_id: item.id, quantity: 1 });
          invError = error;
      }

      if (invError) {
          alert(`Error saving item: ${invError.message}. Rolling back funds.`);
          await supabase.from('profiles').update({ run_balance: user.runBalance }).eq('id', user.id);
          setUser(previousUser); 
          return;
      }
      
      const newQty = item.quantity - 1;
      supabase.from('items').update({ quantity: newQty }).eq('id', item.id);
      setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
  };

  const useItem = async (item: InventoryItem, targetZoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === targetZoneId);
      if (!zone) return;

      const duration = ITEM_DURATION_SEC * 1000;
      const now = Date.now();
      const previousInventory = [...user.inventory];
      const previousZones = [...zones];

      const updatedZones = zones.map(z => {
          if (z.id === targetZoneId) {
              if (item.type === 'BOOST') return { ...z, boostExpiresAt: now + duration };
              else if (item.type === 'DEFENSE') return { ...z, shieldExpiresAt: now + duration };
          }
          return z;
      });

      const updatedInventory = user.inventory.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0);

      setUser({ ...user, inventory: updatedInventory });
      setZones(updatedZones);

      await logTransaction(user.id, 'OUT', 'ITEM', 1, `Used ${item.name} on ${zone.name}`);
      
      const { data: existingRows } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id);
      const existingRow = existingRows?.[0];

      if (existingRow) {
          if (existingRow.quantity > 1) {
              await supabase.from('inventory').update({ quantity: existingRow.quantity - 1 }).eq('id', existingRow.id);
          } else {
              await supabase.from('inventory').delete().eq('id', existingRow.id);
          }
      } else {
          setUser({ ...user, inventory: previousInventory });
          return;
      }
      
      let zoneUpdateError = null;
      try {
          if (item.type === 'BOOST') {
              const { error } = await supabase.from('zones').update({ boost_expires_at: now + duration }).eq('id', zone.id);
              zoneUpdateError = error;
          } else if (item.type === 'DEFENSE') {
              const { error } = await supabase.from('zones').update({ shield_expires_at: now + duration }).eq('id', zone.id);
              zoneUpdateError = error;
          }
      } catch (err: any) {
          zoneUpdateError = err;
      }

      if (zoneUpdateError) {
          alert(`Failed to apply item effect. Error: ${zoneUpdateError.message || 'Unknown DB Error'}. Refunded item.`);
          if (existingRow) {
               await supabase.from('inventory').update({ quantity: existingRow.quantity }).eq('id', existingRow.id);
          } else {
               await supabase.from('inventory').insert({ user_id: user.id, item_id: item.id, quantity: 1 });
          }
          setUser({ ...user, inventory: previousInventory });
          setZones(previousZones);
      }
  };

  const buyFiatGov = async (amount: number) => {
      if (!user) return;
      const govAmount = amount * 10; 
      const updatedUser = { ...user, govBalance: user.govBalance + govAmount };
      setUser(updatedUser);
      
      await logTransaction(user.id, 'IN', 'GOV', govAmount, `Fiat Purchase (€${amount})`);
      await supabase.from('profiles').update({ gov_balance: updatedUser.govBalance }).eq('id', user.id);
  };

  const swapGovToRun = async (amount: number) => {
      if (!user || user.govBalance < amount) return;
      const runReceived = amount * govToRunRate;
      const updatedUser = { 
          ...user, 
          govBalance: user.govBalance - amount, 
          runBalance: user.runBalance + runReceived 
      };
      setUser(updatedUser);

      await logTransaction(user.id, 'OUT', 'GOV', amount, `Swap to RUN`);
      await logTransaction(user.id, 'IN', 'RUN', runReceived, `Swap from GOV`);
      await supabase.from('profiles').update({ 
          run_balance: updatedUser.runBalance, 
          gov_balance: updatedUser.govBalance 
      }).eq('id', user.id);
  };

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
      if (data && data.length > 0) {
          return { success: true };
      } else {
          await fetchGameData();
          return { error: "Permission Denied", success: false };
      }
  };

  const deleteZone = async (id: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const distributeZoneRewards = async () => {
      const { error } = await supabase.rpc('distribute_zone_rewards');
      if (error) alert("Distribution Failed: " + error.message);
      else {
          alert("Rewards Distributed Successfully via RPC!");
          await fetchGameData();
      }
  };

  const uploadFile = async (file: File, context: string): Promise<string | null> => {
      try {
          const fileExt = file.name.split('.').pop();
          const cleanExt = fileExt ? fileExt.replace(/[^a-z0-9]/gi, '') : 'jpg';
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
          const bucketName = 'images'; 
          let folder = context === 'avatars' ? 'avatars' : (context === 'reports' ? 'bugs' : context);
          const filePath = `${folder}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, { upsert: false });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          return data.publicUrl;
      } catch (error) {
          console.error("Upload failed:", error);
          return null;
      }
  };

  const reportBug = async (description: string, screenshot?: File) => {
      if (!user) return false;
      let screenshotUrl = null;
      if (screenshot) screenshotUrl = await uploadFile(screenshot, 'reports');
      const { error } = await supabase.from('bug_reports').insert({
          user_id: user.id, user_name: user.name, description, screenshot: screenshotUrl, status: 'OPEN', timestamp: Date.now()
      });
      return !error;
  };

  const updateBugStatus = async (id: string, status: string) => {
      const { error } = await supabase.from('bug_reports').update({ status }).eq('id', id);
      if (!error) setBugReports(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
      return { success: !error, error: error?.message };
  };

  const deleteBugReport = async (id: string) => {
      const { error } = await supabase.from('bug_reports').delete().eq('id', id);
      if (!error) setBugReports(prev => prev.filter(b => b.id !== id));
      return { success: !error, error: error?.message };
  };

  const submitSuggestion = async (title: string, description: string) => {
      if (!user) return false;
      const { error } = await supabase.from('suggestions').insert({
          user_id: user.id, user_name: user.name, title, description, timestamp: Date.now()
      });
      return !error;
  };

  const deleteSuggestion = async (id: string) => {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (!error) setSuggestions(prev => prev.filter(s => s.id !== id));
      return { success: !error, error: error?.message };
  };

  const updateUser = async (updates: Partial<User>) => {
      if (!user) return;
      if (updates.avatar && user.avatar && updates.avatar !== user.avatar) {
          if (user.avatar.includes('/storage/v1/object/public/images/')) {
              try {
                  const path = user.avatar.split('/images/')[1];
                  if (path) await supabase.storage.from('images').remove([decodeURIComponent(path)]);
              } catch (cleanupErr) { console.error("Error cleaning up old avatar:", cleanupErr); }
          }
      }
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;
      if (updates.favoriteBadgeId !== undefined) dbUpdates.favorite_badge_id = updates.favoriteBadgeId;
      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (!error) {
          setUser({ ...user, ...updates });
          setAllUsers(prev => ({ ...prev, [user.id]: { ...prev[user.id], ...updates } }));
      }
  };

  const upgradePremium = async () => {
      if (!user) return;
      if (user.isPremium) {
          alert("Already Premium!");
          return;
      }
      if (user.govBalance < PREMIUM_COST) {
          alert(`Insufficient GOV. Cost: ${PREMIUM_COST} GOV`);
          return;
      }

      const newGovBalance = user.govBalance - PREMIUM_COST;
      const updatedUser = { ...user, isPremium: true, govBalance: newGovBalance };
      
      setUser(updatedUser);
      setAllUsers(prev => ({ 
          ...prev, 
          [user.id]: { 
              ...prev[user.id], 
              isPremium: true, 
              govBalance: newGovBalance 
          } 
      }));

      await logTransaction(user.id, 'OUT', 'GOV', PREMIUM_COST, 'Premium Upgrade');
      
      const { error } = await supabase.from('profiles').update({ 
          is_premium: true, 
          gov_balance: newGovBalance 
      }).eq('id', user.id);

      if (error) {
          console.error("Upgrade failed:", error);
          alert("Upgrade failed. Reverting.");
          await fetchUserProfile(user.id);
      }
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
      const { error } = await supabase.from('leaderboards').delete().eq('id', id);
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
      const { error } = await supabase.from('levels').delete().eq('id', id);
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

  return {
    user, zones, allUsers, 
    missions, badges, marketItems, leaderboards, levels, bugReports, suggestions, transactions,
    govToRunRate, loading, recoveryMode, setRecoveryMode, lastBurnTimestamp,
    login, register, logout, resetPassword, updatePassword,
    setUser, setZones, setAllUsers, setGovToRunRate,
    logTransaction, recordRun,
    claimZone, buyItem, useItem, buyFiatGov, swapGovToRun, triggerGlobalBurn,
    addItem, updateItem, removeItem,
    addMission, updateMission, removeMission,
    addBadge, updateBadge, removeBadge,
    updateZone, deleteZone,
    distributeZoneRewards,
    uploadFile,
    reportBug, updateBugStatus, deleteBugReport,
    submitSuggestion, deleteSuggestion,
    updateUser, upgradePremium,
    addLeaderboard, updateLeaderboard, deleteLeaderboard, resetLeaderboard,
    addLevel, updateLevel, deleteLevel,
    revokeUserAchievement, adjustUserBalance,
    refreshData: fetchGameData,
    fetchZoneLeaderboard
  };
};