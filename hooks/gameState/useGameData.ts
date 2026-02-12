import { useState, useEffect, useCallback } from 'react';
import { User, Zone, Item, Mission, Badge, InventoryItem, BugReport, LeaderboardConfig, LevelConfig, Suggestion, Transaction, RunEntry, AchievementLog } from '../../types';
import { supabase } from '../../supabaseClient';
import { decodePostGISLocation } from '../../utils/geo';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchGameData = useCallback(async () => {
      setIsSyncing(true);
      setSyncError(null);
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

          if (profilesRes.error || zonesRes.error) {
              throw new Error("Errore sincronizzazione protocollo.");
          }

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
                      missionLog: p.mission_log || [],
                      badgeLog: p.badge_log || [],
                      completedMissionIds: (p.mission_log || []).map((x: any) => x.id),
                      earnedBadgeIds: (p.badge_log || []).map((x: any) => x.id),
                      favoriteBadgeId: p.favorite_badge_id
                  };
              });
              setAllUsers(usersMap);
          }

          if (missionsRes.data) setMissions(missionsRes.data.map((m: any) => ({ ...m, rewardRun: m.reward_run, rewardGov: m.reward_gov, logicId: m.logic_id, conditionType: m.condition_type, conditionValue: m.condition_value })));
          if (badgesRes.data) setBadges(badgesRes.data.map((b: any) => ({ ...b, rewardRun: b.reward_run, rewardGov: b.reward_gov, logicId: b.logic_id, conditionType: b.condition_type, conditionValue: b.condition_value })));
          if (itemsRes.data) setMarketItems(itemsRes.data.map((i: any) => ({ ...i, priceRun: i.price_run, effectValue: i.effect_value })));

          if (zonesRes.data) {
              setZones(zonesRes.data.map((z: any) => {
                  const decoded = decodePostGISLocation(z.location);
                  return {
                      id: z.id,
                      name: z.name || 'Unknown Zone',
                      ownerId: z.owner_id,
                      x: z.x, y: z.y,
                      lat: decoded.lat,
                      lng: decoded.lng,
                      location: z.location,
                      defenseLevel: z.defense_level || 1,
                      recordKm: Number(z.record_km) || 0,
                      totalKm: Number(z.total_km) || Number(z.record_km) || 0,
                      interestRate: z.interest_rate || 2.0,
                      interestPool: Number(z.interest_pool) || 0,
                      lastDistributionTime: z.last_distribution_time,
                      boostExpiresAt: z.boost_expires_at,
                      shieldExpiresAt: z.shield_expires_at
                  };
              }));
          }

          if (leaderboardsRes.data) setLeaderboards(leaderboardsRes.data.map((l: any) => ({ ...l, startTime: l.start_time, endTime: l.end_time, rewardPool: l.reward_pool, rewardCurrency: l.reward_currency, lastResetTimestamp: l.last_reset_timestamp })));
          if (levelsRes.data) setLevels(levelsRes.data.map((l: any) => ({ ...l, minKm: l.min_km })));
          if (reportsRes.data) setBugReports(reportsRes.data.map((r: any) => ({ ...r, userId: r.user_id, userName: r.user_name })));
          if (suggestionsRes.data) setSuggestions(suggestionsRes.data.map((s: any) => ({ ...s, userId: s.user_id, userName: s.user_name })));

          if (lastBurnRes.data?.timestamp) {
              setLastBurnTimestamp(new Date(lastBurnRes.data.timestamp).getTime());
          }
          if (totalBurnRes.data) {
              setTotalBurned(totalBurnRes.data.reduce((acc, curr) => acc + (curr.amount || 0), 0));
          }

      } catch (err: any) {
          console.error("❌ [DATA] Fetch error:", err);
          setSyncError(err.message || "Connessione instabile.");
      } finally {
          setIsSyncing(false);
      }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
      if (recoveryMode || window.location.hash.includes('type=recovery')) return;

      try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (error) throw error;
          
          if (data) {
              const [invRes, itemDefsRes, txRes, runRes] = await Promise.all([
                  supabase.from('inventory').select('*').eq('user_id', userId),
                  supabase.from('items').select('*'),
                  supabase.from('transactions').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50),
                  supabase.from('runs').select('*').eq('user_id', userId).order('timestamp', { ascending: false })
              ]);

              let builtInventory: InventoryItem[] = [];
              if (invRes.data && itemDefsRes.data) {
                  builtInventory = invRes.data.map((row: any) => {
                      const def = itemDefsRes.data.find((i: any) => i.id === row.item_id);
                      if (!def) return null;
                      return { ...def, priceRun: def.price_run, effectValue: def.effect_value, quantity: row.quantity };
                  }).filter((i): i is InventoryItem => i !== null);
              }

              if (txRes.data) {
                  setTransactions(txRes.data.map((t: any) => ({ ...t, userId: t.user_id, timestamp: new Date(t.timestamp).getTime() })));
              }

              let runHistory: RunEntry[] = [];
              if (runRes.data) {
                  runHistory = runRes.data.map((r: any) => ({
                      id: r.id,
                      location: r.location_name || 'Unknown',
                      km: Number(r.km),
                      timestamp: new Date(r.timestamp).getTime(),
                      runEarned: Number(r.run_earned),
                      govEarned: Number(r.gov_earned || 0),
                      duration: Number(r.duration || 0),
                      elevation: Number(r.elevation || 0),
                      maxSpeed: Number(r.max_speed || 0),
                      avgSpeed: Number(r.avg_speed || 0),
                      involvedZones: r.involved_zones || [],
                      zoneBreakdown: r.zone_breakdown || {}
                  }));
              }

              setUser({
                  id: data.id,
                  name: data.name || 'Runner',
                  email: data.email,
                  avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
                  runBalance: data.run_balance || 0,
                  govBalance: data.gov_balance || 0,
                  totalKm: data.total_km || 0,
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
      } catch (err) {
          console.error("❌ [PROFILE] Fetch error:", err);
      }
  }, [recoveryMode]);

  const fetchZoneLeaderboard = useCallback(async (zoneId: string) => {
      try {
          const { data, error } = await supabase
              .from('runs')
              .select('user_id, zone_breakdown');

          if (error) throw error;

          const runnerStats: Record<string, number> = {};
          
          data.forEach(run => {
              const breakdown = run.zone_breakdown || {};
              const kmInZone = breakdown[zoneId];
              if (kmInZone !== undefined) {
                  runnerStats[run.user_id] = (runnerStats[run.user_id] || 0) + Number(kmInZone);
              }
          });

          return Object.entries(runnerStats)
              .map(([uid, km]) => ({
                  id: uid,
                  name: allUsers[uid]?.name || 'Runner',
                  avatar: allUsers[uid]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
                  km: km
              }))
              .sort((a, b) => b.km - a.km);
      } catch (err) {
          console.error("Zone LB Fetch Error:", err);
          return [];
      }
  }, [allUsers]);

  const uploadFile = useCallback(async (file: File, folder: string): Promise<string | null> => {
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('zonerun-assets')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
              .from('zonerun-assets')
              .getPublicUrl(filePath);

          return data.publicUrl;
      } catch (err) {
          console.error("Upload failed:", err);
          return null;
      }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      try {
        if (window.location.hash.includes('type=recovery')) {
            setRecoveryMode(true);
            setLoading(false);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserProfile(session.user.id);
            await fetchGameData();
        }
      } catch (err) { console.warn("Auth issue:", err); }
      finally { setLoading(false); }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true);
          setUser(null);
          return;
      }
      
      if (session && !recoveryMode && !window.location.hash.includes('type=recovery')) {
          fetchUserProfile(session.user.id);
          setTimeout(() => fetchGameData(), 500);
      } else if (!session) { 
          setUser(null); setZones([]); setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchGameData, fetchUserProfile, recoveryMode]);

  return {
      user, zones, allUsers, missions, badges, marketItems, leaderboards, levels, bugReports, suggestions, transactions,
      govToRunRate, loading, recoveryMode, lastBurnTimestamp, totalBurned, isSyncing, syncError,
      setUser, setZones, setAllUsers, setTransactions, setMarketItems, setBugReports, setSuggestions, setGovToRunRate, setRecoveryMode, setLastBurnTimestamp, setTotalBurned,
      fetchGameData, fetchUserProfile, fetchZoneLeaderboard, uploadFile
  };
};