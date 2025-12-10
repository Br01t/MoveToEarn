
import { useState, useEffect } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion } from '../types';
import { MOCK_ZONES, MOCK_USERS, MOCK_ITEMS, MOCK_MISSIONS, MOCK_BADGES, PREMIUM_COST, CONQUEST_REWARD_GOV, DEFAULT_LEADERBOARDS, DEFAULT_LEVELS } from '../constants';
import { supabase } from '../supabaseClient';

export const useGameState = () => {
  // --- DATABASE STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [usersMock, setUsersMock] = useState(MOCK_USERS); // Per ora manteniamo i mock per gli altri utenti
  
  // Static data handling (could be fetched from DB later)
  const [marketItems, setMarketItems] = useState<Item[]>(MOCK_ITEMS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
  const [leaderboards, setLeaderboards] = useState<LeaderboardConfig[]>(DEFAULT_LEADERBOARDS);
  const [levels, setLevels] = useState<LevelConfig[]>(DEFAULT_LEVELS);
  
  // Admin stuff
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  // --- CONFIG STATE ---
  const [govToRunRate, setGovToRunRate] = useState<number>(100);
  const [loading, setLoading] = useState(true);

  // --- INITIALIZATION & AUTH LISTENER ---
  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setZones(MOCK_ZONES); // Revert to mocks on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- REAL DATA FETCHING ---
  const fetchUserProfile = async (userId: string) => {
    try {
        setLoading(true);
        // 1. Fetch Profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (profile) {
            // Map DB profile to Frontend User Type
            // Note: We need to fetch Inventory separately or via join in production
            // For MVP, we'll keep inventory local/mocked initially or fetch if table ready
            const realUser: User = {
                id: profile.id,
                name: profile.name || 'Runner',
                email: profile.email,
                avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
                runBalance: profile.run_balance || 0,
                govBalance: profile.gov_balance || 0,
                totalKm: profile.total_km || 0,
                isPremium: profile.is_premium || false,
                isAdmin: profile.is_admin || false, // Mapped from DB
                inventory: [], // TODO: Fetch from 'inventory' table
                runHistory: [], // TODO: Fetch from 'runs' table
                completedMissionIds: [], // TODO: Fetch from 'user_missions'
                earnedBadgeIds: [], // TODO: Fetch from 'user_badges'
                favoriteBadgeId: profile.favorite_badge_id
            };
            setUser(realUser);
            
            // 2. Load Real Zones (Hybrid: Add real zones to mock zones map)
            fetchRealZones();
        }
    } catch (err) {
        console.error("Error loading user profile:", err);
        // No fallback to mock user to ensure mandatory login
        setUser(null);
    } finally {
        setLoading(false);
    }
  };

  const fetchRealZones = async () => {
      const { data: realZones, error } = await supabase.from('zones').select('*');
      if (!error && realZones) {
          // Map DB zones to Frontend types
          const mappedZones: Zone[] = realZones.map((z: any) => ({
              id: z.id,
              name: z.name,
              ownerId: z.owner_id,
              x: z.x,
              y: z.y,
              lat: 0,
              lng: 0, 
              defenseLevel: 1, 
              recordKm: z.record_km,
              interestRate: z.interest_rate,
              boostExpiresAt: z.boost_expires_at,
              shieldExpiresAt: z.shield_expires_at
          }));
          
          setZones([...MOCK_ZONES, ...mappedZones]);
      }
  };

  // --- ACTIONS (API Layer) ---

  const login = async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
  };

  const register = async (email: string, password: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: username, // Save username to user_metadata
          },
        },
      });
      
      // If we need to manually create the profile row (if triggers aren't set up in Supabase)
      if (data.user && !error) {
          const { error: profileError } = await supabase.from('profiles').insert({
              id: data.user.id,
              email: email,
              name: username,
              run_balance: 0,
              gov_balance: 0,
              total_km: 0
          });
          if (profileError) console.warn("Profile creation warning:", profileError);
      }

      return { data, error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    // Optimistic Update
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

    if (user && supabase.auth.getUser()) {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.favoriteBadgeId) dbUpdates.favorite_badge_id = updates.favoriteBadgeId;
        
        await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    }
  };

  // Economy Actions
  const buyItem = (item: Item) => {
    if (!user) return { success: false, msg: "Not logged in" };
    if (item.quantity <= 0) return { success: false, msg: "Out of stock" };
    if (user.runBalance < item.priceRun) return { success: false, msg: "Insufficient funds" };

    setMarketItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));

    if (item.type === "CURRENCY") {
      setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, govBalance: prev.govBalance + item.effectValue } : null));
      return { success: true, msg: `Purchased! +${item.effectValue} GOV` };
    }

    const newItem: InventoryItem = { ...item, quantity: 1 };
    const existingIdx = user.inventory.findIndex((i) => i.id === item.id);
    let newInventory = [...user.inventory];
    if (existingIdx >= 0) newInventory[existingIdx].quantity += 1;
    else newInventory.push(newItem);

    setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - item.priceRun, inventory: newInventory } : null));
    return { success: true, msg: "Item added to inventory" };
  };

  const useItem = async (item: InventoryItem, targetZoneId: string) => {
    if (!user) return;
    
    // Optimistic UI Update
    const zoneIndex = zones.findIndex((z) => z.id === targetZoneId);
    if (zoneIndex === -1) return;
    
    const targetZone = zones[zoneIndex];
    let updatedZones = [...zones];
    const now = Date.now();
    
    let dbUpdate = {};

    if (item.type === "DEFENSE") {
      const expires = now + 86400000;
      updatedZones[zoneIndex] = { ...targetZone, shieldExpiresAt: expires };
      dbUpdate = { shield_expires_at: expires };
    } else if (item.type === "BOOST") {
      const expires = now + 86400000;
      updatedZones[zoneIndex] = { ...targetZone, interestRate: targetZone.interestRate + item.effectValue, boostExpiresAt: expires };
      dbUpdate = { boost_expires_at: expires, interest_rate: targetZone.interestRate + item.effectValue };
    }
    
    setZones(updatedZones);
    
    // Consume Item
    const newInventory = user.inventory.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0);
    setUser((prev) => (prev ? { ...prev, inventory: newInventory } : null));

    // Real DB Sync
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        await supabase.from('zones').update(dbUpdate).eq('id', targetZoneId);
    }
  };

  const swapGovToRun = (govAmount: number) => {
      if (!user || govAmount <= 0) return;
      const runReceived = govAmount * govToRunRate;
      setUser((prev) => (prev ? {
          ...prev,
          govBalance: prev.govBalance - govAmount,
          runBalance: prev.runBalance + runReceived
      } : null));
  };

  const buyFiatGov = (amountUSD: number) => {
    if (!user) return;
    const govAmount = amountUSD * 10;
    setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance + govAmount } : null));
  };

  const claimZone = async (zoneId: string) => {
    if (!user) return;
    
    // Optimistic
    setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId ? { ...z, ownerId: user.id, shieldExpiresAt: undefined, boostExpiresAt: undefined } : z
        )
    );
    setUser((prev) => (prev ? { ...prev, runBalance: prev.runBalance - 50, govBalance: prev.govBalance + CONQUEST_REWARD_GOV } : null));

    // Real DB
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        await supabase.from('zones').update({ owner_id: user.id }).eq('id', zoneId);
        await supabase.rpc('deduct_balance', { amount: 50, currency: 'RUN', user_id: user.id });
    }
  };

  const upgradePremium = () => {
      if (!user) return;
      setUser((prev) => (prev ? { ...prev, govBalance: prev.govBalance - PREMIUM_COST, isPremium: true } : null));
  };

  // Bug Reporting (Now Real!)
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
      
      // Optimistic
      setBugReports(prev => [newReport, ...prev]);

      // Real DB
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
          await supabase.from('bug_reports').insert({
              user_id: user.id,
              user_name: user.name,
              description: description,
              screenshot: screenshot, 
              timestamp: Date.now(),
              status: 'OPEN'
          });
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
      setSuggestions(prev => [newSuggestion, ...prev]);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
          await supabase.from('suggestions').insert({
              user_id: user.id,
              user_name: user.name,
              title,
              description,
              timestamp: Date.now()
          });
      }
  };

  const addLeaderboard = (c: LeaderboardConfig) => setLeaderboards(p => [...p, c]);
  const updateLeaderboard = (c: LeaderboardConfig) => setLeaderboards(p => p.map(l => l.id === c.id ? c : l));
  const deleteLeaderboard = (id: string) => setLeaderboards(p => p.filter(l => l.id !== id));
  const resetLeaderboard = (id: string) => setLeaderboards(p => p.map(l => l.id === id ? {...l, lastResetTimestamp: Date.now()} : l));
  const addLevel = (l: LevelConfig) => setLevels(p => [...p, l]);
  const updateLevel = (l: LevelConfig) => setLevels(p => p.map(x => x.id === l.id ? l : x));
  const deleteLevel = (id: string) => setLevels(p => p.filter(x => x.id !== id));

  return {
    user,
    zones,
    usersMock,
    marketItems,
    missions,
    badges,
    govToRunRate,
    bugReports,
    suggestions,
    leaderboards,
    levels,
    loading, 
    setUser,
    setZones,
    setMarketItems,
    setMissions,
    setBadges,
    setUsersMock,
    setGovToRunRate,
    setBugReports,
    setLevels,
    // EXPOSED AUTH METHODS
    login,
    register,
    logout,
    updateUser,
    buyItem,
    useItem,
    swapGovToRun,
    buyFiatGov,
    claimZone,
    upgradePremium,
    reportBug,
    submitSuggestion,
    addLeaderboard,
    updateLeaderboard,
    deleteLeaderboard,
    resetLeaderboard,
    addLevel,
    updateLevel,
    deleteLevel
  };
};