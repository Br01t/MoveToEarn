
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion } from '../types';
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
  
  // --- CONFIG STATE ---
  const [govToRunRate, setGovToRunRate] = useState<number>(100);
  const [loading, setLoading] = useState(true);

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
              suggestionsRes
          ] = await Promise.all([
              supabase.from('profiles').select('*'),
              supabase.from('missions').select('*'),
              supabase.from('badges').select('*'),
              supabase.from('items').select('*'),
              supabase.from('zones').select('*'),
              supabase.from('leaderboards').select('*'),
              supabase.from('levels').select('*').order('level', { ascending: true }),
              supabase.from('bug_reports').select('*').order('timestamp', { ascending: false }),
              supabase.from('suggestions').select('*').order('timestamp', { ascending: false })
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
          } else if (profilesRes.error) {
              console.warn("⚠️ [GAME STATE] Failed to fetch profiles (RLS?):", profilesRes.error.message);
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
          fetchUserProfile(session.user.id);
          // Wait slightly for session propogation then fetch global data (important for Admin to get all users)
          setTimeout(() => fetchGameData(), 500);
      }
      else { setUser(null); setZones(MOCK_ZONES); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---
  const login = async (email: string, password: string) => await supabase.auth.signInWithPassword({ email, password });
  const loginWithGoogle = async () => await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  const register = async (email: string, password: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: username } } });
      if (data.user && !error) {
          await supabase.from('profiles').insert({ id: data.user.id, email: email, name: username, run_balance: 0, gov_balance: 0, total_km: 0 });
      }
      return { data, error };
  };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  // --- STORAGE HELPERS ---
  const uploadFile = async (file: File, folder: 'avatars' | 'bugs'): Promise<string | null> => {
      if (!user) return null;
      try {
          const isAvatar = folder === 'avatars';
          
          // KEY STRATEGY FOR SPACE SAVING:
          // 1. Force .webp extension (already done in compression util, but safety first)
          // 2. For avatars: Use fixed name `${user.id}.webp`. This forces overwrite (UPSERT), so only 1 file per user exists.
          // 3. For bugs: Use timestamp to allow history.
          
          const fileName = isAvatar ? `${user.id}.webp` : `${user.id}_${Date.now()}.webp`;
          const filePath = `${folder}/${fileName}`;

          // UPSERT = TRUE ensures we overwrite old files, saving space for avatars
          const { error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);

          // Add a cache-buster timestamp query param for avatars so the browser sees the new image immediately
          // even though the URL path is the same
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

  const buyItem = (item: Item) => {};
  const useItem = async (item: InventoryItem, targetZoneId: string) => {};
  const swapGovToRun = (govAmount: number) => {};
  const buyFiatGov = (amountUSD: number) => {};
  const claimZone = async (zoneId: string) => {};
  const upgradePremium = () => {};

  const reportBug = async (description: string, screenshotFile?: File): Promise<boolean> => {
      if (!user) return false;
      const newId = crypto.randomUUID();
      
      let screenshotUrl = '';
      if (screenshotFile) {
          const url = await uploadFile(screenshotFile, 'bugs');
          if (url) screenshotUrl = url;
          else console.warn("Screenshot upload failed, sending report without image.");
      }

      const { data, error } = await supabase.from('bug_reports').insert({
          id: newId, 
          user_id: user.id, 
          user_name: user.name, 
          description, 
          screenshot: screenshotUrl, // Save URL instead of Base64
          timestamp: Date.now(), 
          status: 'OPEN'
      }).select().single();

      if (error) { console.error("FAILED to save bug report:", error); return false; }
      if (data) {
          const newReport: BugReport = { id: data.id, userId: user.id, userName: user.name, description, screenshot: screenshotUrl, timestamp: data.timestamp || Date.now(), status: 'OPEN' };
          setBugReports(prev => [newReport, ...prev]);
          return true;
      }
      return false;
  };

  const submitSuggestion = async (title: string, description: string): Promise<boolean> => {
      if (!user) return false;
      const newId = crypto.randomUUID();
      const { data, error } = await supabase.from('suggestions').insert({
          id: newId, user_id: user.id, user_name: user.name, title, description, timestamp: Date.now()
      }).select().single();

      if (error) { console.error("FAILED to save suggestion:", error); return false; }
      if (data) {
          const newSuggestion: Suggestion = { id: data.id, userId: user.id, userName: user.name, title, description, timestamp: data.timestamp || Date.now() };
          setSuggestions(prev => [newSuggestion, ...prev]);
          return true;
      }
      return false;
  };

  // --- ADMIN: MANAGE REPORTS & SUGGESTIONS & USERS ---
  const updateBugStatus = async (id: string, status: 'OPEN' | 'WIP' | 'FIXED' | 'RESOLVED') => {
      const { error } = await supabase.from('bug_reports').update({ status }).eq('id', id);
      if (error) return { error: error.message };
      setBugReports(prev => prev.map(bug => bug.id === id ? { ...bug, status } : bug));
      return { success: true };
  };

  const deleteBugReport = async (id: string) => {
      const { error } = await supabase.from('bug_reports').delete().eq('id', id);
      if (error) return { error: error.message };
      setBugReports(prev => prev.filter(bug => bug.id !== id));
      return { success: true };
  };

  const deleteSuggestion = async (id: string) => {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (error) return { error: error.message };
      setSuggestions(prev => prev.filter(s => s.id !== id));
      return { success: true };
  };

  const revokeUserAchievement = async (userId: string, type: 'MISSION' | 'BADGE', idToRemove: string) => {
      const targetUser = allUsers[userId];
      if (!targetUser) return { error: "User not found" };

      let updatedList: string[] = [];
      let dbColumn = '';
      let updatePayload: any = {};

      if (type === 'MISSION') {
          updatedList = targetUser.completedMissionIds.filter(id => id !== idToRemove);
          dbColumn = 'completed_mission_ids';
          updatePayload[dbColumn] = updatedList;
      } else {
          updatedList = targetUser.earnedBadgeIds.filter(id => id !== idToRemove);
          dbColumn = 'earned_badge_ids';
          updatePayload[dbColumn] = updatedList;

          // Check if favorite badge needs removal
          if (targetUser.favoriteBadgeId === idToRemove) {
              updatePayload['favorite_badge_id'] = null;
          }
      }

      // Optimistic Update
      const updatedUser = {
          ...targetUser,
          [type === 'MISSION' ? 'completedMissionIds' : 'earnedBadgeIds']: updatedList,
          favoriteBadgeId: (type === 'BADGE' && targetUser.favoriteBadgeId === idToRemove) ? undefined : targetUser.favoriteBadgeId
      };
      
      setAllUsers(prev => ({ ...prev, [userId]: updatedUser }));

      // DB Update
      const { error } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId);

      if (error) {
          console.error("Failed to revoke:", error);
          return { error: error.message };
      }
      return { success: true };
  };

  const adjustUserBalance = async (userId: string, runChange: number, govChange: number) => {
      const targetUser = allUsers[userId];
      if (!targetUser) return { error: "User not found" };

      const newRunBalance = Math.max(0, targetUser.runBalance + runChange);
      const newGovBalance = Math.max(0, targetUser.govBalance + govChange);

      // Optimistic
      setAllUsers(prev => ({
          ...prev,
          [userId]: { ...targetUser, runBalance: newRunBalance, govBalance: newGovBalance }
      }));

      // DB
      const { error } = await supabase
          .from('profiles')
          .update({ run_balance: newRunBalance, gov_balance: newGovBalance })
          .eq('id', userId);

      if (error) {
          console.error("Failed to adjust balance:", error);
          return { error: error.message };
      }
      return { success: true };
  };

  // =================================================================
  // ==================== ADMIN CRUD OPERATIONS ======================
  // =================================================================

  // --- MARKET ITEMS ---
  const addItem = async (item: Item) => {
      const tempId = item.id;
      setMarketItems(p => [...p, item]);
      const { error } = await supabase.from('items').insert({
          id: item.id,
          name: item.name, description: item.description, 
          price_run: item.priceRun, quantity: item.quantity, type: item.type, 
          effect_value: item.effectValue, icon: item.icon
      }).select().single();

      if (error) {
          console.error("DB Insert Error", error);
          setMarketItems(p => p.filter(x => x.id !== tempId)); 
          return { error: error.message };
      }
      return { success: true };
  };
  
  const updateItem = async (item: Item) => {
      const original = marketItems.find(x => x.id === item.id);
      setMarketItems(p => p.map(x => x.id === item.id ? item : x));
      const { error } = await supabase.from('items').update({
          name: item.name, description: item.description, price_run: item.priceRun, 
          quantity: item.quantity, type: item.type, effect_value: item.effectValue
      }).eq('id', item.id);
      
      if (error && original) {
          console.error("DB Update Error", error);
          setMarketItems(p => p.map(x => x.id === item.id ? original : x)); 
          return { error: error.message };
      }
      return { success: true };
  };
  
  const removeItem = async (id: string) => {
      const originalList = [...marketItems];
      setMarketItems(p => p.filter(x => x.id !== id));
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) {
          setMarketItems(originalList);
          return { error: error.message };
      }
      return { success: true };
  };

  // --- MISSIONS ---
  const addMission = async (m: Mission) => {
      const tempId = m.id;
      setMissions(p => [...p, m]);
      
      const { error } = await supabase.from('missions').insert({
          id: m.id, 
          title: m.title, description: m.description, 
          reward_run: m.rewardRun, reward_gov: m.rewardGov, rarity: m.rarity, 
          logic_id: m.logicId, category: m.category, difficulty: m.difficulty
      }).select().single();

      if (error) {
          console.error("DB Insert Error", error);
          setMissions(p => p.filter(x => x.id !== tempId)); 
          return { error: error.message };
      }
      return { success: true };
  };

  const updateMission = async (m: Mission) => {
      const original = missions.find(x => x.id === m.id);
      setMissions(p => p.map(x => x.id === m.id ? m : x));
      
      const { error } = await supabase.from('missions').update({
          title: m.title, description: m.description, reward_run: m.rewardRun, reward_gov: m.rewardGov, 
          rarity: m.rarity,
          logic_id: m.logicId, category: m.category, difficulty: m.difficulty
      }).eq('id', m.id);
      
      if (error && original) {
          console.error("DB Update Error", error);
          setMissions(p => p.map(x => x.id === m.id ? original : x)); 
          return { error: error.message };
      }
      return { success: true };
  };

  const removeMission = async (id: string) => {
      const originalList = [...missions];
      setMissions(p => p.filter(x => x.id !== id));
      const { error } = await supabase.from('missions').delete().eq('id', id);
      if (error) {
          setMissions(originalList);
          return { error: error.message };
      }
      return { success: true };
  };

  // --- BADGES ---
  const addBadge = async (b: Badge) => {
      const tempId = b.id;
      setBadges(p => [...p, b]);
      
      const { error } = await supabase.from('badges').insert({
          id: b.id, 
          name: b.name, description: b.description, icon: b.icon, rarity: b.rarity, 
          reward_run: b.rewardRun, reward_gov: b.rewardGov,
          logic_id: b.logicId, category: b.category, difficulty: b.difficulty
      }).select().single();

      if (error) {
          console.error("DB Insert Error", error);
          setBadges(p => p.filter(x => x.id !== tempId));
          return { error: error.message };
      }
      return { success: true };
  };

  const updateBadge = async (b: Badge) => {
      const original = badges.find(x => x.id === b.id);
      setBadges(p => p.map(x => x.id === b.id ? b : x));
      
      const { error } = await supabase.from('badges').update({
          name: b.name, description: b.description, icon: b.icon, rarity: b.rarity, 
          reward_run: b.rewardRun, reward_gov: b.rewardGov,
          logic_id: b.logicId, category: b.category, difficulty: b.difficulty
      }).eq('id', b.id);
      
      if (error && original) {
          console.error("DB Update Error", error);
          setBadges(p => p.map(x => x.id === b.id ? original : x));
          return { error: error.message };
      }
      return { success: true };
  };

  const removeBadge = async (id: string) => {
      const originalList = [...badges];
      setBadges(p => p.filter(x => x.id !== id));
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (error) {
          setBadges(originalList);
          return { error: error.message };
      }
      return { success: true };
  };

  // --- ZONES ---
  const updateZone = async (id: string, updates: Partial<Zone>) => {
      const original = zones.find(z => z.id === id);
      setZones(p => p.map(z => z.id === id ? { ...z, ...updates } : z));
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
      
      const { error } = await supabase.from('zones').update(dbUpdates).eq('id', id);
      if (error && original) {
          setZones(p => p.map(z => z.id === id ? original : z));
          return { error: error.message };
      }
      return { success: true };
  };

  const deleteZone = async (id: string) => {
      const originalList = [...zones];
      setZones(p => p.filter(z => z.id !== id));
      const { error } = await supabase.from('zones').delete().eq('id', id);
      if (error) {
          setZones(originalList);
          return { error: error.message };
      }
      return { success: true };
  };

  // --- LEADERBOARDS ---
  const addLeaderboard = async (c: LeaderboardConfig) => {
      const tempId = c.id;
      setLeaderboards(p => [...p, c]);
      const { error } = await supabase.from('leaderboards').insert({
          id: c.id, 
          title: c.title, description: c.description, metric: c.metric, 
          type: c.type, start_time: c.startTime, end_time: c.endTime, 
          reward_pool: c.rewardPool, reward_currency: c.rewardCurrency
      }).select().single();

      if (error) {
          console.error("DB Error", error);
          setLeaderboards(p => p.filter(x => x.id !== tempId));
          return { error: error.message };
      }
      return { success: true };
  };

  const updateLeaderboard = async (c: LeaderboardConfig) => {
      const original = leaderboards.find(l => l.id === c.id);
      setLeaderboards(p => p.map(l => l.id === c.id ? c : l));
      const { error } = await supabase.from('leaderboards').update({
          title: c.title, description: c.description, metric: c.metric, 
          type: c.type, start_time: c.startTime, end_time: c.endTime, 
          reward_pool: c.rewardPool, reward_currency: c.rewardCurrency
      }).eq('id', c.id);
      
      if (error && original) {
          setLeaderboards(p => p.map(l => l.id === c.id ? original : l));
          return { error: error.message };
      }
      return { success: true };
  };

  const deleteLeaderboard = async (id: string) => {
      const originalList = [...leaderboards];
      setLeaderboards(p => p.filter(l => l.id !== id));
      const { error } = await supabase.from('leaderboards').delete().eq('id', id);
      if (error) {
          setLeaderboards(originalList);
          return { error: error.message };
      }
      return { success: true };
  };

  const resetLeaderboard = async (id: string) => {
      const now = Date.now();
      const original = leaderboards.find(l => l.id === id);
      setLeaderboards(p => p.map(l => l.id === id ? {...l, lastResetTimestamp: now} : l));
      const { error } = await supabase.from('leaderboards').update({ last_reset_timestamp: now }).eq('id', id);
      if (error && original) {
          setLeaderboards(p => p.map(l => l.id === id ? original : l));
          return { error: error.message };
      }
      return { success: true };
  };

  // --- LEVELS ---
  const addLevel = async (l: LevelConfig) => {
      const tempId = l.id;
      setLevels(p => [...p, l]);
      const { error } = await supabase.from('levels').insert({ 
          id: l.id, level: l.level, min_km: l.minKm, title: l.title 
      }).select().single();
      
      if (error) {
          console.error("DB Error", error);
          setLevels(p => p.filter(x => x.id !== tempId));
          return { error: error.message };
      }
      return { success: true };
  };

  const updateLevel = async (l: LevelConfig) => {
      const original = levels.find(x => x.id === l.id);
      setLevels(p => p.map(x => x.id === l.id ? l : x));
      const { error } = await supabase.from('levels').update({ level: l.level, min_km: l.minKm, title: l.title }).eq('id', l.id);
      if (error && original) {
          setLevels(p => p.map(x => x.id === l.id ? original : x));
          return { error: error.message };
      }
      return { success: true };
  };

  const deleteLevel = async (id: string) => {
      const originalList = [...levels];
      setLevels(p => p.filter(x => x.id !== id));
      const { error } = await supabase.from('levels').delete().eq('id', id);
      if (error) {
          setLevels(p => originalList);
          return { error: error.message };
      }
      return { success: true };
  };

  return {
    user, zones, allUsers, marketItems, missions, badges, govToRunRate, bugReports, suggestions, leaderboards, levels, loading, 
    setUser, setZones, setAllUsers, setMarketItems, setMissions, setBadges, setGovToRunRate, setBugReports, setLevels, setSuggestions,
    login, loginWithGoogle, register, logout, updateUser, buyItem, useItem, swapGovToRun, buyFiatGov, claimZone, upgradePremium, reportBug, submitSuggestion,
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