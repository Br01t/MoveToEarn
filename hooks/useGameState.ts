
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion, Transaction, RunEntry, AchievementLog } from '../types';
import { MOCK_USERS, PREMIUM_COST, CONQUEST_REWARD_GOV, CONQUEST_COST } from '../constants';
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
              transactionsRes
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
              supabase.from('transactions').select('*').order('timestamp', { ascending: false }).limit(200) // Limit global fetch
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

          if (transactionsRes.data) {
              setTransactions(transactionsRes.data.map((t: any) => ({
                  id: t.id,
                  userId: t.user_id,
                  type: t.type,
                  token: t.token,
                  amount: t.amount,
                  description: t.description,
                  timestamp: t.timestamp
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

      } catch (err) {
          console.error("❌ [GAME STATE] Critical error fetching data:", err);
      }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
        setLoading(true);
        // 1. Get Profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // 2. Get Runs (Limit 50 most recent for performance)
        const { data: runsData } = await supabase
            .from('runs')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(50);

        // Map DB runs to frontend RunEntry using User's Schema
        const mappedRuns: RunEntry[] = (runsData || []).map((r: any) => ({
            id: r.id,
            location: r.location_name || 'Unknown',
            km: r.km, 
            timestamp: r.timestamp,
            runEarned: r.run_earned,
            govEarned: r.gov_earned,
            duration: r.duration, 
            avgSpeed: r.avg_speed,
            maxSpeed: r.max_speed,
            elevation: r.elevation, 
            involvedZones: r.involved_zones || [],
            // Fetch proper zone breakdown from the dedicated column
            zoneBreakdown: r.zone_breakdown || {}
        }));

        if (profile) {
            const mLog = (profile.mission_log || []) as AchievementLog[];
            const bLog = (profile.badge_log || []) as AchievementLog[];

            const realUser: User = {
                id: profile.id,
                name: profile.name || 'Runner',
                email: profile.email,
                avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
                runBalance: profile.run_balance || 0,
                govBalance: profile.gov_balance || 0,
                totalKm: profile.total_km || 0,
                isPremium: profile.is_premium || false,
                isAdmin: profile.is_admin || false,
                inventory: [], 
                runHistory: mappedRuns, 
                missionLog: mLog,
                badgeLog: bLog,
                // Derive for backward compatibility
                completedMissionIds: mLog.map(x => x.id), 
                earnedBadgeIds: bLog.map(x => x.id), 
                favoriteBadgeId: profile.favorite_badge_id
            };
            setUser(realUser);
        }
    } catch (err) {
        console.error("Error loading user profile:", err);
        setUser(null);
    } finally {
        setLoading(false);
    }
  };

  // --- FETCH ZONE LEADERBOARD (REAL DATA) ---
  const fetchZoneLeaderboard = async (zoneId: string) => {
      try {
          // Get all runs that involved this zone (by ID)
          // Ensure we select the new zone_breakdown column
          const { data, error } = await supabase
              .from('runs')
              .select('user_id, km, involved_zones, zone_breakdown')
              .contains('involved_zones', [zoneId]);

          if (error) throw error;

          if (!data || data.length === 0) return [];

          // Aggregate KM by User ID
          const userTotals: Record<string, number> = {};
          data.forEach((run: any) => {
              let kmForThisZone = 0;
              
              // 1. Try Precise Breakdown
              const breakdown = run.zone_breakdown || {};
              if (breakdown && breakdown[zoneId]) {
                  kmForThisZone = Number(breakdown[zoneId]);
              }
              // 2. Fallback to Even Split if breakdown missing/invalid
              else {
                  const zoneCount = run.involved_zones ? run.involved_zones.length : 1;
                  kmForThisZone = run.km / (zoneCount > 0 ? zoneCount : 1);
              }
              
              userTotals[run.user_id] = (userTotals[run.user_id] || 0) + kmForThisZone;
          });

          // Map to Leaderboard Entry format and Filter 0 KM
          const leaderboard = Object.entries(userTotals)
              .map(([userId, totalKm]) => {
                  const profile = allUsers[userId] || { name: 'Unknown Runner', avatar: null };
                  return {
                      id: userId,
                      name: profile.name,
                      avatar: profile.avatar,
                      km: totalKm
                  };
              })
              .filter(entry => entry.km > 0.01) // Strict filter: Must have run > 0
              .sort((a, b) => b.km - a.km) // Descending Order
              .slice(0, 10); // Top 10

          return leaderboard;

      } catch (err) {
          console.error("Error fetching zone leaderboard:", err);
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
      // HANDLE PASSWORD RECOVERY EVENT
      // This happens when the user clicks the link in the email and is redirected back to the app
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
      
      console.log(`📧 Sending reset email. Redirecting to: ${redirectTo}`);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo,
      });
      return { error };
  };

  const updatePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
          setRecoveryMode(false); // Exit recovery mode on success
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

  const logTransaction = async (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV', amount: number, description: string) => {
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
          // 1. Insert Run
          // Now writing explicitly to 'zone_breakdown' column
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
              // Saving JSON breakdown properly
              zone_breakdown: runData.zoneBreakdown || {}
          });

          if (runError) throw runError;

          // 2. Update Profile Stats
          const { data: currentProfile } = await supabase.from('profiles').select('total_km, run_balance').eq('id', userId).single();
          
          if (currentProfile) {
              await supabase.from('profiles').update({
                  total_km: currentProfile.total_km + runData.km,
                  run_balance: currentProfile.run_balance + runData.runEarned
              }).eq('id', userId);
          }

          // 3. Update Zones (Batch Upsert)
          if (updatedZones.length > 0) {
              const { error: zoneError } = await supabase.from('zones').upsert(
                  updatedZones.map(z => ({
                      id: z.id,
                      name: z.name,
                      // FIXED: Sending WKT geometry for 'location' column (Point format)
                      // This resolves "parse error - invalid geometry"
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
                      boost_expires_at: z.boostExpiresAt || null,
                      shield_expires_at: z.shieldExpiresAt || null
                  }))
              );
              
              if (zoneError) {
                  // Enhanced logging for debugging
                  console.error("❌ [ZONE UPSERT FAILED]:", zoneError);
                  throw zoneError;
              }
          }

          // 4. Log Transaction
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

      // Optimistic
      const updatedUser = { ...user, runBalance: user.runBalance - CONQUEST_COST, govBalance: user.govBalance + CONQUEST_REWARD_GOV };
      const updatedZones = zones.map(z => z.id === zoneId ? { ...z, ownerId: user.id, recordKm: 0, defenseLevel: 1 } : z); 
      
      setUser(updatedUser);
      setZones(updatedZones);

      // DB
      await logTransaction(user.id, 'OUT', 'RUN', CONQUEST_COST, `Conquest: ${zone.name}`);
      await logTransaction(user.id, 'IN', 'GOV', CONQUEST_REWARD_GOV, `Conquest Reward: ${zone.name}`);
      await supabase.from('profiles').update({ run_balance: updatedUser.runBalance, gov_balance: updatedUser.govBalance }).eq('id', user.id);
      await supabase.from('zones').update({ owner_id: user.id }).eq('id', zoneId);
  };

  const buyItem = async (item: Item) => {
      if (!user || user.runBalance < item.priceRun) return;

      // Special Case: Currency/Flash Drop (Immediate Use)
      if (item.type === 'CURRENCY') {
          const updatedUser = { 
              ...user, 
              runBalance: user.runBalance - item.priceRun,
              govBalance: user.govBalance + item.effectValue
          };
          setUser(updatedUser);
          
          await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market: ${item.name}`);
          await logTransaction(user.id, 'IN', 'GOV', item.effectValue, `Opened: ${item.name}`);
          
          await supabase.from('profiles').update({ 
              run_balance: updatedUser.runBalance, 
              gov_balance: updatedUser.govBalance 
          }).eq('id', user.id);
          
          // Update item stock (global)
          const newQty = item.quantity - 1;
          await supabase.from('items').update({ quantity: newQty }).eq('id', item.id);
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
          return;
      }

      // Standard Item
      const existingItem = user.inventory.find(i => i.id === item.id);
      let newInventory: InventoryItem[];
      
      if (existingItem) {
          newInventory = user.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
          newInventory = [...user.inventory, { ...item, quantity: 1 }];
      }

      const updatedUser = { ...user, runBalance: user.runBalance - item.priceRun, inventory: newInventory };
      setUser(updatedUser);

      await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market: ${item.name}`);
      await supabase.from('profiles').update({ run_balance: updatedUser.runBalance }).eq('id', user.id);
      
      const newQty = item.quantity - 1;
      await supabase.from('items').update({ quantity: newQty }).eq('id', item.id);
      setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
  };

  const useItem = async (item: InventoryItem, targetZoneId: string) => {
      if (!user) return;
      const zoneIndex = zones.findIndex(z => z.id === targetZoneId);
      if (zoneIndex === -1) return;

      const updatedZones = [...zones];
      const zone = updatedZones[zoneIndex];
      const now = Date.now();

      if (item.type === 'BOOST') {
          zone.interestRate = parseFloat((zone.interestRate + item.effectValue).toFixed(2));
          zone.boostExpiresAt = now + 86400000; 
      } else if (item.type === 'DEFENSE') {
          zone.shieldExpiresAt = now + 86400000;
      }

      const newInventory = user.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      
      setUser({ ...user, inventory: newInventory });
      setZones(updatedZones);

      await supabase.from('zones').update({ 
          interest_rate: zone.interestRate,
          boost_expires_at: zone.boostExpiresAt,
          shield_expires_at: zone.shieldExpiresAt
      }).eq('id', zone.id);
  };

  const buyFiatGov = async (amount: number) => {
      if (!user) return;
      // Mock Fiat Purchase
      const govAmount = amount * 10; // 1 EUR = 10 GOV
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

  // --- ADMIN ACTIONS ---
  
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
      // 1. Optimistic Update (Immediate Feedback)
      setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));

      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;

      const { data, error } = await supabase.from('zones').update(dbUpdates).eq('id', id).select();
      
      if (error) {
          console.error("❌ Zone update error:", error);
          await fetchGameData();
          return { error: error.message, success: false };
      }

      if (data && data.length > 0) {
          return { success: true };
      } else {
          await fetchGameData();
          return { error: "Permission Denied (RLS policy blocks update)", success: false };
      }
  };

  const deleteZone = async (id: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const distributeZoneRewards = async () => {
      const { error } = await supabase.rpc('distribute_zone_rewards');
      if (error) {
          console.error("Distribution failed:", error);
          alert("Distribution Failed: " + error.message);
      } else {
          alert("Rewards Distributed Successfully via RPC!");
          await fetchGameData();
      }
  };

  // Helper: Upload file to Supabase Storage - STRICTLY BUCKET 'images'
  const uploadFile = async (file: File, context: string): Promise<string | null> => {
      try {
          const fileExt = file.name.split('.').pop();
          const cleanExt = fileExt ? fileExt.replace(/[^a-z0-9]/gi, '') : 'jpg';
          // Add timestamp for uniqueness
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
          
          // MAP CONTEXT TO FOLDER
          // User Requirement: Bucket 'images' -> folders 'avatars' & 'bugs'
          const bucketName = 'images'; 
          let folder = '';
          
          if (context === 'avatars') folder = 'avatars';
          else if (context === 'reports') folder = 'bugs'; // Map 'reports' logic to 'bugs' folder
          else folder = context; // Fallback

          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from(bucketName)
              .upload(filePath, file, { upsert: false });

          if (uploadError) {
              console.error(`Supabase Storage Error (${bucketName}/${filePath}):`, uploadError);
              throw uploadError;
          }

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
      
      if (screenshot) {
          screenshotUrl = await uploadFile(screenshot, 'reports');
          // If screenshot fails but text exists, report is still valid?
          // For now, if upload returns null, we might log it but proceed
          if (!screenshotUrl) console.warn("Screenshot upload failed, sending report without image.");
      }

      const { error } = await supabase.from('bug_reports').insert({
          user_id: user.id,
          user_name: user.name,
          description,
          screenshot: screenshotUrl,
          status: 'OPEN',
          timestamp: Date.now()
      });
      return !error;
  };

  const updateBugStatus = async (id: string, status: string) => {
      const { error } = await supabase.from('bug_reports').update({ status }).eq('id', id);
      if (!error) {
          setBugReports(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
      }
      return { success: !error, error: error?.message };
  };

  const deleteBugReport = async (id: string) => {
      const { error } = await supabase.from('bug_reports').delete().eq('id', id);
      if (!error) {
          setBugReports(prev => prev.filter(b => b.id !== id));
      }
      return { success: !error, error: error?.message };
  };

  const submitSuggestion = async (title: string, description: string) => {
      if (!user) return false;
      const { error } = await supabase.from('suggestions').insert({
          user_id: user.id,
          user_name: user.name,
          title,
          description,
          timestamp: Date.now()
      });
      return !error;
  };

  const deleteSuggestion = async (id: string) => {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (!error) {
          setSuggestions(prev => prev.filter(s => s.id !== id));
      }
      return { success: !error, error: error?.message };
  };

  // --- PROFILE UPDATE ---
  const updateUser = async (updates: Partial<User>) => {
      if (!user) return;
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;
      if (updates.favoriteBadgeId !== undefined) dbUpdates.favorite_badge_id = updates.favoriteBadgeId;

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      
      if (!error) {
          setUser({ ...user, ...updates });
          // Also update allUsers locally for UI consistency
          setAllUsers(prev => ({
              ...prev,
              [user.id]: { ...prev[user.id], ...updates }
          }));
      }
  };

  const upgradePremium = async () => {
      if (!user) return;
      if (user.govBalance < PREMIUM_COST) {
          alert(`Insufficient GOV. Cost: ${PREMIUM_COST}`);
          return;
      }
      
      const newGov = user.govBalance - PREMIUM_COST;
      const { error } = await supabase.from('profiles').update({ 
          is_premium: true,
          gov_balance: newGov
      }).eq('id', user.id);

      if (!error) {
          setUser({ ...user, isPremium: true, govBalance: newGov });
          await logTransaction(user.id, 'OUT', 'GOV', PREMIUM_COST, 'Premium Upgrade');
          alert("Welcome to Premium, Agent.");
      }
  };

  // --- LEADERBOARDS CRUD ---
  const addLeaderboard = async (config: LeaderboardConfig) => {
      const { error } = await supabase.from('leaderboards').insert({
          title: config.title,
          description: config.description,
          metric: config.metric,
          type: config.type,
          start_time: config.startTime,
          end_time: config.endTime,
          reward_pool: config.rewardPool,
          reward_currency: config.rewardCurrency
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const updateLeaderboard = async (config: LeaderboardConfig) => {
      const { error } = await supabase.from('leaderboards').update({
          title: config.title,
          description: config.description,
          metric: config.metric,
          type: config.type,
          start_time: config.startTime,
          end_time: config.endTime,
          reward_pool: config.rewardPool,
          reward_currency: config.rewardCurrency
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
      const { error } = await supabase.from('leaderboards').update({
          last_reset_timestamp: Date.now()
      }).eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  // --- LEVELS CRUD ---
  const addLevel = async (level: LevelConfig) => {
      const { error } = await supabase.from('levels').insert({
          level: level.level,
          min_km: level.minKm,
          title: level.title,
          icon: level.icon
      });
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const updateLevel = async (level: LevelConfig) => {
      const { error } = await supabase.from('levels').update({
          level: level.level,
          min_km: level.minKm,
          title: level.title,
          icon: level.icon
      }).eq('id', level.id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  const deleteLevel = async (id: string) => {
      const { error } = await supabase.from('levels').delete().eq('id', id);
      if (!error) await fetchGameData();
      return { error: error?.message, success: !error };
  };

  // --- USER MANAGEMENT (ADMIN) ---
  const revokeUserAchievement = async (userId: string, type: 'MISSION' | 'BADGE', idToRemove: string) => {
      // 1. Fetch current logs
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
      
      if (!error) {
          // Update local cache
          if (allUsers[userId]) {
              const prevUser = allUsers[userId];
              setAllUsers(prev => ({
                  ...prev,
                  [userId]: {
                      ...prevUser,
                      missionLog: type === 'MISSION' ? updates.mission_log : prevUser.missionLog,
                      badgeLog: type === 'BADGE' ? updates.badge_log : prevUser.badgeLog,
                      // Derive IDs for compatibility
                      completedMissionIds: type === 'MISSION' ? updates.mission_log.map((x: any) => x.id) : prevUser.completedMissionIds,
                      earnedBadgeIds: type === 'BADGE' ? updates.badge_log.map((x: any) => x.id) : prevUser.earnedBadgeIds
                  }
              }));
          }
      }
      return { success: !error, error: error?.message };
  };

  const adjustUserBalance = async (userId: string, runChange: number, govChange: number) => {
      // Using RPC is safer for balance updates to avoid race conditions, but direct update for MVP admin tool is acceptable
      const { data: profile } = await supabase.from('profiles').select('run_balance, gov_balance').eq('id', userId).single();
      if (!profile) return { success: false, error: "User not found" };

      const newRun = (profile.run_balance || 0) + runChange;
      const newGov = (profile.gov_balance || 0) + govChange;

      const { error } = await supabase.from('profiles').update({
          run_balance: newRun,
          gov_balance: newGov
      }).eq('id', userId);

      if (!error) {
          await logTransaction(userId, runChange >= 0 ? 'IN' : 'OUT', 'RUN', Math.abs(runChange), 'Admin Adjustment');
          await logTransaction(userId, govChange >= 0 ? 'IN' : 'OUT', 'GOV', Math.abs(govChange), 'Admin Adjustment');
          
          setAllUsers(prev => ({
              ...prev,
              [userId]: { ...prev[userId], runBalance: newRun, govBalance: newGov }
          }));
      }
      return { success: !error, error: error?.message };
  };

  return {
    user, zones, allUsers, 
    missions, badges, marketItems, leaderboards, levels, bugReports, suggestions, transactions,
    govToRunRate, loading, recoveryMode, setRecoveryMode,
    login, register, logout, resetPassword, updatePassword,
    setUser, setZones, setAllUsers, setGovToRunRate,
    logTransaction, recordRun,
    claimZone, buyItem, useItem, buyFiatGov, swapGovToRun,
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
    fetchZoneLeaderboard // Exported for Dashboard usage
  };
};