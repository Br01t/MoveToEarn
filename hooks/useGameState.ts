
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion } from '../types';
import { MOCK_ZONES, MOCK_USERS, PREMIUM_COST, CONQUEST_REWARD_GOV } from '../constants';
import { supabase } from '../supabaseClient';

export const useGameState = () => {
  // --- DATABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES); 
  const [usersMock, setUsersMock] = useState(MOCK_USERS); 
  
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

  // --- INITIALIZATION & AUTH LISTENER ---
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        await fetchGameData();
        if (error) throw error;
        if (session) await fetchUserProfile(session.user.id);
        else setLoading(false);
      } catch (err) {
        console.warn("Supabase connection issue:", err);
        setLoading(false);
      }
    };
    initSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserProfile(session.user.id);
      else { setUser(null); setZones(MOCK_ZONES); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- REAL DATA FETCHING ---
  const fetchGameData = async () => {
      try {
          const [
              { data: missionData },
              { data: badgeData },
              { data: itemData },
              { data: lbData },
              { data: levelData },
              { data: reportData },
              { data: suggestData },
              { data: zoneData }
          ] = await Promise.all([
              supabase.from('missions').select('*'),
              supabase.from('badges').select('*'),
              supabase.from('items').select('*'),
              supabase.from('leaderboards').select('*'),
              supabase.from('levels').select('*').order('level', { ascending: true }),
              supabase.from('bug_reports').select('*').order('timestamp', { ascending: false }),
              supabase.from('suggestions').select('*').order('timestamp', { ascending: false }),
              supabase.from('zones').select('*')
          ]);

          if (missionData) {
              setMissions(missionData.map((m: any) => ({
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

          if (badgeData) {
              setBadges(badgeData.map((b: any) => ({
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

          if (itemData) {
              setMarketItems(itemData.map((i: any) => ({
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

          if (lbData) {
              setLeaderboards(lbData.map((l: any) => ({
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

          if (levelData) {
              setLevels(levelData.map((l: any) => ({
                  id: l.id,
                  level: l.level,
                  minKm: l.min_km,
                  title: l.title
              })));
          }

          if (reportData) {
              setBugReports(reportData.map((r: any) => ({
                  id: r.id,
                  userId: r.user_id,
                  userName: r.user_name,
                  description: r.description,
                  screenshot: r.screenshot,
                  timestamp: r.timestamp,
                  status: r.status
              })));
          }

          if (suggestData) {
              setSuggestions(suggestData.map((s: any) => ({
                  id: s.id,
                  userId: s.user_id,
                  userName: s.user_name,
                  title: s.title,
                  description: s.description,
                  timestamp: s.timestamp
              })));
          }

          if (zoneData && zoneData.length > 0) {
              setZones(zoneData.map((z: any) => ({
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

      } catch (err) {
          console.error("Error fetching game data:", err);
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
                completedMissionIds: [], 
                earnedBadgeIds: [], 
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

  const updateUser = async (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    if (user) {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
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

  const reportBug = async (description: string, screenshot?: string) => {
      if (!user) return;
      
      const newReport: BugReport = { 
          id: `bug_${Date.now()}`, 
          userId: user.id, 
          userName: user.name, 
          description, 
          screenshot, 
          timestamp: Date.now(), 
          status: 'OPEN' 
      };
      
      // Optimistic update
      setBugReports(prev => [newReport, ...prev]);
      
      const { error } = await supabase.from('bug_reports').insert({
          user_id: user.id, 
          user_name: user.name, 
          description, 
          screenshot, 
          timestamp: Date.now(), 
          status: 'OPEN'
      });

      if (error) {
          console.error("FAILED to save bug report to DB:", error);
          alert("Error saving bug report. Check console.");
      }
  };

  const submitSuggestion = async (title: string, description: string) => {
      if (!user) return;
      
      const newSuggestion: Suggestion = { 
          id: `idea_${Date.now()}`, 
          userId: user.id, 
          userName: user.name, 
          title, 
          description, 
          timestamp: Date.now() 
      };
      
      // Optimistic update
      setSuggestions(prev => [newSuggestion, ...prev]);
      
      const { error } = await supabase.from('suggestions').insert({
          user_id: user.id, 
          user_name: user.name, 
          title, 
          description, 
          timestamp: Date.now()
      });

      if (error) {
          console.error("FAILED to save suggestion to DB:", error);
          alert("Error saving suggestion. Check console.");
      }
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
    user, zones, usersMock, marketItems, missions, badges, govToRunRate, bugReports, suggestions, leaderboards, levels, loading, 
    setUser, setZones, setMarketItems, setMissions, setBadges, setUsersMock, setGovToRunRate, setBugReports, setLevels,
    login, loginWithGoogle, register, logout, updateUser, buyItem, useItem, swapGovToRun, buyFiatGov, claimZone, upgradePremium, reportBug, submitSuggestion,
    // CRUD Exports
    addItem, updateItem, removeItem,
    addMission, updateMission, removeMission,
    addBadge, updateBadge, removeBadge,
    updateZone, deleteZone,
    addLeaderboard, updateLeaderboard, deleteLeaderboard, resetLeaderboard,
    addLevel, updateLevel, deleteLevel
  };
};