
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion, Transaction } from '../types';
import { MOCK_ZONES, MOCK_USERS, PREMIUM_COST, CONQUEST_REWARD_GOV } from '../constants';
import { supabase } from '../supabaseClient';

export const useGameState = () => {
  // --- DATABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES); 
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
  const [govToRunRate, setGovToRunRate] = useState<number>(100);
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
                      completedMissionIds: p.completed_mission_ids || [], 
                      earnedBadgeIds: p.earned_badge_ids || [],         
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

          if (zonesRes.data && zonesRes.data.length > 0) {
              setZones(zonesRes.data.map((z: any) => ({
                  id: z.id,
                  name: z.name,
                  ownerId: z.owner_id,
                  x: z.x,
                  y: z.y,
                  lat: z.lat || 0,
                  lng: z.lng || 0,
                  defenseLevel: 1, 
                  recordKm: z.record_km,
                  interestRate: z.interest_rate,
                  boostExpiresAt: z.boost_expires_at,
                  shieldExpiresAt: z.shield_expires_at
              })));
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

          // --- 3. ADMIN DATA (May be empty if not admin) ---
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
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (profile) {
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
                runHistory: [], 
                completedMissionIds: profile.completed_mission_ids || [], 
                earnedBadgeIds: profile.earned_badge_ids || [], 
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

  // --- INITIALIZATION & AUTH LISTENER ---
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
            await fetchUserProfile(session.user.id);
        }
        
        // Fetch global data regardless of session (RLS will filter what can be seen)
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
          setRecoveryMode(true);
      }
      
      if (session) {
          fetchUserProfile(session.user.id);
          setTimeout(() => fetchGameData(), 500);
      }
      else { setUser(null); setZones(MOCK_ZONES); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---
  const login = async (email: string, password: string) => await supabase.auth.signInWithPassword({ email, password });
  const loginWithGoogle = async () => await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  
  const resetPassword = async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
      });
      return { error };
  };

  const updatePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) setRecoveryMode(false);
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

  // --- HELPER: LOG TRANSACTION ---
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

      // Optimistic update
      setTransactions(prev => [newTx, ...prev]);

      // DB Insert
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

  // --- STORAGE HELPERS ---
  const uploadFile = async (file: File, folder: 'avatars' | 'bugs'): Promise<string | null> => {
      if (!user) return null;
      try {
          const isAvatar = folder === 'avatars';
          const fileName = isAvatar ? `${user.id}.webp` : `${user.id}_${Date.now()}.webp`;
          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);

          if (isAvatar) {
              return `${data.publicUrl}?t=${Date.now()}`;
          }

          return data.publicUrl;
      } catch (error) {
          console.error("Upload failed:", error);
          return null;
      }
  };

  const updateUser = async (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    if (user) {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;
        if (updates.favoriteBadgeId) dbUpdates.favorite_badge_id = updates.favoriteBadgeId;
        await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    }
  };

  const buyItem = async (item: Item) => {
      if (!user || user.runBalance < item.priceRun || item.quantity <= 0) return;
      
      const newBalance = user.runBalance - item.priceRun;
      
      // 1. Log Transaction
      await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market Purchase: ${item.name}`);

      // 2. Update User State
      const existingItem = user.inventory.find(i => i.id === item.id);
      let newInventory;
      if (existingItem) {
          newInventory = user.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
          newInventory = [...user.inventory, { ...item, quantity: 1 }];
      }
      
      setUser({ ...user, runBalance: newBalance, inventory: newInventory });
      
      // 3. Update DB
      await supabase.from('profiles').update({ run_balance: newBalance }).eq('id', user.id);
      await supabase.from('items').update({ quantity: item.quantity - 1 }).eq('id', item.id);
      
      setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
  };

  const useItem = async (item: InventoryItem, targetZoneId: string) => {
      if (!user) return;
      // ... (Implementation handled by zones logic mainly, but we reduce quantity here if needed)
      // For now, assume this logic is local only for demo or handles inventory update elsewhere
  };

  const swapGovToRun = async (govAmount: number) => {
      if (!user || user.govBalance < govAmount) return;
      const runReceived = govAmount * govToRunRate;
      
      // Log Transactions
      await logTransaction(user.id, 'OUT', 'GOV', govAmount, 'Liquidity Swap (Out)');
      await logTransaction(user.id, 'IN', 'RUN', runReceived, 'Liquidity Swap (In)');

      const newUser = {
          ...user,
          govBalance: user.govBalance - govAmount,
          runBalance: user.runBalance + runReceived
      };
      setUser(newUser);
      
      await supabase.from('profiles').update({ 
          gov_balance: newUser.govBalance, 
          run_balance: newUser.runBalance 
      }).eq('id', user.id);
  };

  const buyFiatGov = async (amountUSD: number) => {
      if (!user) return;
      const govAmount = amountUSD * 10; // Rate example
      
      await logTransaction(user.id, 'IN', 'GOV', govAmount, `Fiat Purchase (€${amountUSD})`);

      const newUser = { ...user, govBalance: user.govBalance + govAmount };
      setUser(newUser);
      
      await supabase.from('profiles').update({ gov_balance: newUser.govBalance }).eq('id', user.id);
  };

  const claimZone = async (zoneId: string) => {
      if (!user || user.runBalance < 50) return;
      
      // Update Zone logic
      const targetZone = zones.find(z => z.id === zoneId);
      if (!targetZone) return;

      await logTransaction(user.id, 'OUT', 'RUN', 50, `Zone Conquest Fee: ${targetZone.name}`);
      await logTransaction(user.id, 'IN', 'GOV', CONQUEST_REWARD_GOV, `Zone Conquest Reward: ${targetZone.name}`);

      const newUser = {
          ...user,
          runBalance: user.runBalance - 50,
          govBalance: user.govBalance + CONQUEST_REWARD_GOV
      };
      setUser(newUser);

      const newZoneData = { ownerId: user.id, recordKm: 0.1, defenseLevel: 1 };
      setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ...newZoneData } : z));
      
      await supabase.from('profiles').update({ run_balance: newUser.runBalance, gov_balance: newUser.govBalance }).eq('id', user.id);
      await supabase.from('zones').update({ owner_id: user.id, record_km: 0.1, defense_level: 1 }).eq('id', zoneId);
  };

  const upgradePremium = () => {
      if (!user) return;
      // ... implementation
  };

  // --- BUG REPORT & SUGGESTIONS ---
  const reportBug = async (description: string, screenshot?: File) => {
      if (!user) return false;
      try {
          let screenshotUrl = null;
          if (screenshot) {
              screenshotUrl = await uploadFile(screenshot, 'bugs');
          }
          const { error } = await supabase.from('bug_reports').insert({
              user_id: user.id,
              user_name: user.name,
              description,
              screenshot: screenshotUrl,
              status: 'OPEN',
              timestamp: Date.now()
          });
          if (!error) {
              // Refresh bugs list if user is admin, or just generally useful
              if(user.isAdmin) {
                  const { data } = await supabase.from('bug_reports').select('*').order('timestamp', { ascending: false });
                  if(data) setBugReports(data.map((r: any) => ({
                      id: r.id,
                      userId: r.user_id,
                      userName: r.user_name,
                      description: r.description,
                      screenshot: r.screenshot,
                      timestamp: r.timestamp,
                      status: r.status
                  })));
              }
              return true;
          }
      } catch (e) {
          console.error(e);
      }
      return false;
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
      if (!error) {
          if(user.isAdmin) {
              const { data } = await supabase.from('suggestions').select('*').order('timestamp', { ascending: false });
              if(data) setSuggestions(data.map((s: any) => ({
                  id: s.id,
                  userId: s.user_id,
                  userName: s.user_name,
                  title: s.title,
                  description: s.description,
                  timestamp: s.timestamp
              })));
          }
          return true;
      }
      return false;
  };

  // --- ADMIN ACTIONS ---

  // BUGS & SUGGESTIONS
  const updateBugStatus = async (id: string, status: string) => {
      const { error } = await supabase.from('bug_reports').update({ status }).eq('id', id);
      if (!error) {
          setBugReports(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
          return { success: true };
      }
      return { error: error.message };
  };

  const deleteBugReport = async (id: string) => {
      const { error } = await supabase.from('bug_reports').delete().eq('id', id);
      if (!error) {
          setBugReports(prev => prev.filter(b => b.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  const deleteSuggestion = async (id: string) => {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (!error) {
          setSuggestions(prev => prev.filter(s => s.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  // USERS
  const revokeUserAchievement = async (userId: string, type: 'MISSION' | 'BADGE', idToRemove: string) => {
      // 1. Fetch current arrays
      const { data: profile, error } = await supabase.from('profiles').select('completed_mission_ids, earned_badge_ids').eq('id', userId).single();
      if (error) return { error: error.message };

      let updates: any = {};
      if (type === 'MISSION') {
          updates.completed_mission_ids = (profile.completed_mission_ids || []).filter((id: string) => id !== idToRemove);
      } else {
          updates.earned_badge_ids = (profile.earned_badge_ids || []).filter((id: string) => id !== idToRemove);
          // Also unset favorite if it was the removed one
          const { data: favData } = await supabase.from('profiles').select('favorite_badge_id').eq('id', userId).single();
          if (favData?.favorite_badge_id === idToRemove) {
              updates.favorite_badge_id = null;
          }
      }

      const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (updateError) return { error: updateError.message };
      
      // Update local state if it's the current user or in allUsers
      if (allUsers[userId]) {
          const updatedUser = { ...allUsers[userId] };
          if (type === 'MISSION') updatedUser.completedMissionIds = updates.completed_mission_ids;
          else updatedUser.earnedBadgeIds = updates.earned_badge_ids;
          if (updates.favorite_badge_id === null) updatedUser.favoriteBadgeId = undefined;
          
          setAllUsers(prev => ({ ...prev, [userId]: updatedUser }));
          if (user && user.id === userId) setUser(prev => prev ? ({ ...prev, ...updates }) : null);
      }
      return { success: true };
  };

  const adjustUserBalance = async (userId: string, runChange: number, govChange: number) => {
      const { data: profile, error } = await supabase.from('profiles').select('run_balance, gov_balance').eq('id', userId).single();
      if (error) return { error: error.message };

      const newRun = (profile.run_balance || 0) + runChange;
      const newGov = (profile.gov_balance || 0) + govChange;

      // UPDATE PROFILE
      const { error: updateError } = await supabase.from('profiles').update({ run_balance: newRun, gov_balance: newGov }).eq('id', userId);
      
      if (updateError) {
          console.error("❌ Admin Balance Update Failed:", updateError.message);
          return { error: updateError.message };
      }

      // UPDATE LOCAL STATE
      if (allUsers[userId]) {
          setAllUsers(prev => ({ ...prev, [userId]: { ...prev[userId], runBalance: newRun, govBalance: newGov } }));
          if (user && user.id === userId) setUser(prev => prev ? ({ ...prev, runBalance: newRun, govBalance: newGov }) : null);
      }
      
      // LOG TRANSACTIONS (Awaited to ensure completion)
      const promises = [];
      if (runChange !== 0) promises.push(logTransaction(userId, runChange > 0 ? 'IN' : 'OUT', 'RUN', Math.abs(runChange), 'Admin Adjustment'));
      if (govChange !== 0) promises.push(logTransaction(userId, govChange > 0 ? 'IN' : 'OUT', 'GOV', Math.abs(govChange), 'Admin Adjustment'));
      
      await Promise.all(promises);

      return { success: true };
  };

  // ITEMS
  const addItem = async (item: Item) => {
      const dbItem = {
          id: item.id,
          name: item.name,
          description: item.description,
          price_run: item.priceRun,
          quantity: item.quantity,
          type: item.type,
          effect_value: item.effectValue,
          icon: item.icon
      };
      const { error } = await supabase.from('items').insert(dbItem);
      if (!error) {
          setMarketItems(prev => [...prev, item]);
          return { success: true };
      }
      return { error: error.message };
  };

  const updateItem = async (item: Item) => {
      const dbItem = {
          name: item.name,
          description: item.description,
          price_run: item.priceRun,
          quantity: item.quantity,
          type: item.type,
          effect_value: item.effectValue,
          icon: item.icon
      };
      const { error } = await supabase.from('items').update(dbItem).eq('id', item.id);
      if (!error) {
          setMarketItems(prev => prev.map(i => i.id === item.id ? item : i));
          return { success: true };
      }
      return { error: error.message };
  };

  const removeItem = async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) {
          setMarketItems(prev => prev.filter(i => i.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  // MISSIONS
  const addMission = async (mission: Mission) => {
      const dbMission = {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          reward_run: mission.rewardRun,
          reward_gov: mission.rewardGov,
          rarity: mission.rarity,
          logic_id: mission.logicId,
          category: mission.category,
          difficulty: mission.difficulty,
          condition_type: mission.conditionType,
          condition_value: mission.conditionValue
      };
      const { error } = await supabase.from('missions').insert(dbMission);
      if (!error) {
          setMissions(prev => [...prev, mission]);
          return { success: true };
      }
      return { error: error.message };
  };

  const updateMission = async (mission: Mission) => {
      const dbMission = {
          title: mission.title,
          description: mission.description,
          reward_run: mission.rewardRun,
          reward_gov: mission.rewardGov,
          rarity: mission.rarity,
          logic_id: mission.logicId,
          category: mission.category,
          difficulty: mission.difficulty,
          condition_type: mission.conditionType,
          condition_value: mission.conditionValue
      };
      const { error } = await supabase.from('missions').update(dbMission).eq('id', mission.id);
      if (!error) {
          setMissions(prev => prev.map(m => m.id === mission.id ? mission : m));
          return { success: true };
      }
      return { error: error.message };
  };

  const removeMission = async (id: string) => {
      const { error } = await supabase.from('missions').delete().eq('id', id);
      if (!error) {
          setMissions(prev => prev.filter(m => m.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  // BADGES
  const addBadge = async (badge: Badge) => {
      const dbBadge = {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          reward_run: badge.rewardRun,
          reward_gov: badge.rewardGov,
          logic_id: badge.logicId,
          category: badge.category,
          difficulty: badge.difficulty,
          condition_type: badge.conditionType,
          condition_value: badge.conditionValue
      };
      const { error } = await supabase.from('badges').insert(dbBadge);
      if (!error) {
          setBadges(prev => [...prev, badge]);
          return { success: true };
      }
      return { error: error.message };
  };

  const updateBadge = async (badge: Badge) => {
      const dbBadge = {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          reward_run: badge.rewardRun,
          reward_gov: badge.rewardGov,
          logic_id: badge.logicId,
          category: badge.category,
          difficulty: badge.difficulty,
          condition_type: badge.conditionType,
          condition_value: badge.conditionValue
      };
      const { error } = await supabase.from('badges').update(dbBadge).eq('id', badge.id);
      if (!error) {
          setBadges(prev => prev.map(b => b.id === badge.id ? badge : b));
          return { success: true };
      }
      return { error: error.message };
  };

  const removeBadge = async (id: string) => {
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (!error) {
          setBadges(prev => prev.filter(b => b.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  // ZONES
  const updateZone = async (id: string, updates: Partial<Zone>) => {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
      
      const { error } = await supabase.from('zones').update(dbUpdates).eq('id', id);
      if (!error) {
          setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
          return { success: true };
      }
      return { error: error.message };
  };

  const deleteZone = async (id: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', id);
      if (!error) {
          setZones(prev => prev.filter(z => z.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  // LEADERBOARDS
  const addLeaderboard = async (config: LeaderboardConfig) => {
      const dbLb = {
          id: config.id,
          title: config.title,
          description: config.description,
          metric: config.metric,
          type: config.type,
          start_time: config.startTime,
          end_time: config.endTime,
          reward_pool: config.rewardPool,
          reward_currency: config.rewardCurrency,
          last_reset_timestamp: config.lastResetTimestamp
      };
      const { error } = await supabase.from('leaderboards').insert(dbLb);
      if (!error) {
          setLeaderboards(prev => [...prev, config]);
          return { success: true };
      }
      return { error: error.message };
  };

  const updateLeaderboard = async (config: LeaderboardConfig) => {
      const dbLb = {
          title: config.title,
          description: config.description,
          metric: config.metric,
          type: config.type,
          start_time: config.startTime,
          end_time: config.endTime,
          reward_pool: config.rewardPool,
          reward_currency: config.rewardCurrency,
          last_reset_timestamp: config.lastResetTimestamp
      };
      const { error } = await supabase.from('leaderboards').update(dbLb).eq('id', config.id);
      if (!error) {
          setLeaderboards(prev => prev.map(l => l.id === config.id ? config : l));
          return { success: true };
      }
      return { error: error.message };
  };

  const deleteLeaderboard = async (id: string) => {
      const { error } = await supabase.from('leaderboards').delete().eq('id', id);
      if (!error) {
          setLeaderboards(prev => prev.filter(l => l.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  const resetLeaderboard = async (id: string) => {
      const now = Date.now();
      const { error } = await supabase.from('leaderboards').update({ last_reset_timestamp: now }).eq('id', id);
      if (!error) {
          setLeaderboards(prev => prev.map(l => l.id === id ? { ...l, lastResetTimestamp: now } : l));
          return { success: true };
      }
      return { error: error.message };
  };

  // LEVELS
  const addLevel = async (level: LevelConfig) => {
      const dbLvl = {
          id: level.id,
          level: level.level,
          min_km: level.minKm,
          title: level.title,
          icon: level.icon
      };
      const { error } = await supabase.from('levels').insert(dbLvl);
      if (!error) {
          setLevels(prev => [...prev, level].sort((a,b) => a.level - b.level));
          return { success: true };
      }
      return { error: error.message };
  };

  const updateLevel = async (level: LevelConfig) => {
      const dbLvl = {
          level: level.level,
          min_km: level.minKm,
          title: level.title,
          icon: level.icon
      };
      const { error } = await supabase.from('levels').update(dbLvl).eq('id', level.id);
      if (!error) {
          setLevels(prev => prev.map(l => l.id === level.id ? level : l).sort((a,b) => a.level - b.level));
          return { success: true };
      }
      return { error: error.message };
  };

  const deleteLevel = async (id: string) => {
      const { error } = await supabase.from('levels').delete().eq('id', id);
      if (!error) {
          setLevels(prev => prev.filter(l => l.id !== id));
          return { success: true };
      }
      return { error: error.message };
  };

  return {
    user, zones, allUsers, marketItems, missions, badges, govToRunRate, bugReports, suggestions, leaderboards, levels, transactions, loading, recoveryMode,
    setUser, setZones, setAllUsers, setMarketItems, setMissions, setBadges, setGovToRunRate, setBugReports, setLevels, setSuggestions, setTransactions, setRecoveryMode,
    login, loginWithGoogle, register, logout, resetPassword, updatePassword, updateUser, buyItem, useItem, swapGovToRun, buyFiatGov, claimZone, upgradePremium, reportBug, submitSuggestion,
    logTransaction, // EXPORTED
    // Storage & Admin Actions
    uploadFile,
    updateBugStatus, deleteBugReport, deleteSuggestion, revokeUserAchievement, adjustUserBalance,
    // CRUD Exports
    addItem, updateItem, removeItem,
    addMission, updateMission, removeMission,
    addBadge, updateBadge, removeBadge,
    updateZone, deleteZone,
    addLeaderboard, updateLeaderboard, deleteLeaderboard, resetLeaderboard,
    addLevel, updateLevel, deleteLevel,
    // Expose data fetcher
    refreshData: fetchGameData
  };
};