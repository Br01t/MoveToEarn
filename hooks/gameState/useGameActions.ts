import React from 'react';
import { supabase } from '../../supabaseClient';
import { User, Zone, Item, InventoryItem, Transaction, RunEntry, BugReport, Suggestion } from '../../types';
import { CONQUEST_COST, CONQUEST_REWARD_GOV, PREMIUM_COST, ITEM_DURATION_SEC, MINT_COST, MINT_REWARD_GOV } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { sendSlackNotification } from '../../utils/slack';

interface GameActionsProps {
    user: User | null;
    zones: Zone[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setMarketItems: React.Dispatch<React.SetStateAction<Item[]>>;
    setAllUsers: React.Dispatch<React.SetStateAction<Record<string, Omit<User, 'inventory'>>>>;
    fetchUserProfile: (id: string) => Promise<void>;
    govToRunRate: number;
    uploadFile: (file: File, folder: string) => Promise<string | null>;
    setBugReports: React.Dispatch<React.SetStateAction<BugReport[]>>;
    setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
}

export const useGameActions = ({ 
    user, zones, setUser, setZones, setTransactions, setMarketItems, setAllUsers, fetchUserProfile, govToRunRate,
    uploadFile, setBugReports, setSuggestions
}: GameActionsProps) => {
  const { showToast } = useGlobalUI();

  const logTransaction = async (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => {
      if (!amount || amount <= 0 || isNaN(amount)) return;
      
      const timestamp = Date.now();
      const newTx: Transaction = {
          id: crypto.randomUUID(),
          userId, type, token, amount, description, timestamp
      };

      setTransactions(prev => [newTx, ...prev]);

      const { error } = await supabase.from('transactions').insert({
          id: newTx.id, 
          user_id: userId, 
          type, 
          token, 
          amount: parseFloat(amount.toFixed(4)), 
          description, 
          timestamp: timestamp 
      });

      if (error) console.error("❌ [TRANSACTION LOG FAILED]", error.message);
  };

  const recordRun = async (userId: string, runData: RunEntry, updatedZones: Zone[]) => {
      try {
          if (!userId) throw new Error("User ID is missing.");
          console.log("💾 [RECORD RUN] Syncing run:", runData.id);

          // 1. Inserimento Log Corsa
          const { error: runError } = await supabase.from('runs').insert({
              id: runData.id, 
              user_id: userId, 
              location_name: runData.location,
              km: parseFloat(runData.km.toFixed(4)), 
              duration: Math.floor(runData.duration || 0), 
              run_earned: parseFloat(runData.runEarned.toFixed(2)), 
              gov_earned: parseFloat((runData.govEarned || 0).toFixed(2)),
              avg_speed: parseFloat((runData.avgSpeed || 0).toFixed(2)), 
              max_speed: parseFloat((runData.maxSpeed || 0).toFixed(2)), 
              elevation: Math.floor(runData.elevation || 0),
              timestamp: runData.timestamp, 
              involved_zones: runData.involvedZones || [],
              zone_breakdown: runData.zoneBreakdown || {}
          });

          if (runError) throw new Error(`Run Insert Error: ${runError.message}`);

          // 2. Aggiornamento Profilo Utente
          const { data: userRuns } = await supabase.from('runs').select('km').eq('user_id', userId);
          const exactTotalKm = userRuns ? userRuns.reduce((sum, r) => sum + (Number(r.km) || 0), 0) : 0;

          const { data: profileData } = await supabase.from('profiles').select('run_balance').eq('id', userId).single();
          const currentBalance = profileData?.run_balance || 0;

          const { error: profileUpdateError } = await supabase.from('profiles').update({
              total_km: parseFloat(exactTotalKm.toFixed(4)), 
              run_balance: parseFloat((currentBalance + runData.runEarned).toFixed(2)) 
          }).eq('id', userId);

          if (profileUpdateError) console.error("⚠️ Profile Update Failed:", profileUpdateError.message);

          // 3. Aggiornamento Zone tramite RPC o Fallback
          if (updatedZones.length > 0) {
              for (const z of updatedZones) {
                  const kmInThisZone = runData.zoneBreakdown?.[z.id] || 0;
                  const previousZone = zones.find(oz => oz.id === z.id);
                  const poolDelta = z.interestPool - (previousZone?.interestPool || 0);
                  
                  const { error: rpcError } = await supabase.rpc('record_zone_activity', {
                      target_zone_id: String(z.id),
                      runner_id: userId,
                      km_delta: parseFloat(kmInThisZone.toFixed(6)),
                      interest_pool_delta: parseFloat(poolDelta.toFixed(6))
                  });

                  if (rpcError) {
                      console.warn(`[RECORD RUN] RPC Failed for zone ${z.id}, using manual fallback update:`, rpcError.message);
                      // FIX: Aggiunto total_km al fallback manuale
                      await supabase.from('zones').update({
                          interest_pool: parseFloat(z.interestPool.toFixed(6)),
                          record_km: parseFloat(z.recordKm.toFixed(6)),
                          total_km: parseFloat((z.totalKm || 0).toFixed(6)), // <-- Campo mancante aggiunto
                          defense_level: z.defenseLevel
                      }).eq('id', z.id);
                  }
              }
          }

          if (runData.runEarned > 0) {
              await logTransaction(userId, 'IN', 'RUN', runData.runEarned, `Run Reward: ${runData.location}`);
          }

          sendSlackNotification(`*Activity Synced!* \nAgent: \`${user?.name}\` \nDistance: \`${runData.km.toFixed(2)} KM\` \nLocation: \`${runData.location}\` \nRewards: \`+${runData.runEarned} RUN\``, 'INFO', 'SYNC');

          return { success: true };
      } catch (err: any) {
          console.error("❌ [RECORD RUN FAILED]", err.message);
          return { success: false, error: err.message };
      }
  };

  const mintZone = async (newZone: Zone, shiftedZones: Zone[]) => {
      if (!user) return { success: false, error: "Not logged in" };
      console.log("🛠️ [MINT ZONE] Attempting to create zone:", newZone.name);

      try {
          const { error: zoneError } = await supabase.from('zones').insert({
              id: newZone.id,
              name: newZone.name,
              location: `POINT(${newZone.lng} ${newZone.lat})`,
              owner_id: user.id,
              x: Math.round(newZone.x),
              y: Math.round(newZone.y),
              lat: newZone.lat,
              lng: newZone.lng,
              defense_level: 1, 
              record_km: 0,
              total_km: 0,
              interest_rate: parseFloat(newZone.interestRate.toFixed(2)),
              interest_pool: 0,
              boost_expires_at: newZone.boostExpiresAt || 0,
              shield_expires_at: newZone.shieldExpiresAt || 0
          });

          if (zoneError) throw new Error(`Database insert failed: ${zoneError.message}`);

          if (shiftedZones && shiftedZones.length > 0) {
              for (const sz of shiftedZones) {
                  await supabase.from('zones').update({ 
                      x: Math.round(sz.x), 
                      y: Math.round(sz.y) 
                  }).eq('id', sz.id);
              }
          }

          const newRun = user.runBalance - MINT_COST;
          const newGov = user.govBalance + MINT_REWARD_GOV;
          
          const { error: profileError } = await supabase.from('profiles').update({
              run_balance: parseFloat(newRun.toFixed(2)),
              gov_balance: parseFloat(newGov.toFixed(2))
          }).eq('id', user.id);

          if (profileError) console.error("⚠️ Balance update warning:", profileError.message);

          await logTransaction(user.id, 'OUT', 'RUN', MINT_COST, `Mint Zone: ${newZone.name}`);
          await logTransaction(user.id, 'IN', 'GOV', MINT_REWARD_GOV, `Mint Reward: ${newZone.name}`);

          sendSlackNotification(`*Zone Minted!* \nController: \`${user.name}\` \nSector: \`${newZone.name}\` \nCoordinates: \`${newZone.lat.toFixed(4)}, ${newZone.lng.toFixed(4)}\``, 'SUCCESS', 'MAP');

          console.log("✅ [MINT ZONE] Success!");
          return { success: true };
      } catch (err: any) {
          console.error("❌ [MINT ZONE FAILED]", err.message);
          return { success: false, error: err.message };
      }
  };

  const claimZone = async (zoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) return;

      if (user.runBalance < CONQUEST_COST) {
          showToast("Insufficient funds", 'ERROR');
          return;
      }

      const updatedUser = { 
          ...user, 
          runBalance: parseFloat((user.runBalance - CONQUEST_COST).toFixed(2)), 
          govBalance: parseFloat((user.govBalance + CONQUEST_REWARD_GOV).toFixed(2)) 
      };
      setUser(updatedUser);

      await logTransaction(user.id, 'OUT', 'RUN', CONQUEST_COST, `Conquest: ${zone.name}`);
      await logTransaction(user.id, 'IN', 'GOV', CONQUEST_REWARD_GOV, `Conquest Reward: ${zone.name}`);
      
      await supabase.from('profiles').update({ 
          run_balance: updatedUser.runBalance, 
          gov_balance: updatedUser.govBalance 
      }).eq('id', user.id);
      
      const { error } = await supabase.from('zones').update({
          owner_id: user.id,
          interest_pool: 0,
          record_km: 0,
          defense_level: 1
      }).eq('id', zoneId);

      if (!error) {
          setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ownerId: user.id, interestPool: 0, recordKm: 0, defenseLevel: 1 } : z));
          sendSlackNotification(`*Zone Conquered!* \nNew Ruler: \`${user.name}\` \nSector Seized: \`${zone.name}\``, 'ALERT', 'MAP');
      }
  };

  const buyItem = async (item: Item) => {
      if (!user) return;
      if (user.runBalance < item.priceRun) {
          showToast("Insufficient funds", 'ERROR');
          return;
      }

      const { data: invRow } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id).maybeSingle();
      
      let res;
      if (invRow) {
          res = await supabase.from('inventory').update({ quantity: invRow.quantity + 1 }).eq('id', invRow.id);
      } else {
          res = await supabase.from('inventory').insert({ user_id: user.id, item_id: item.id, quantity: 1 });
      }

      if (res.error) {
          showToast("Purchase failed: " + res.error.message, 'ERROR');
          return;
      }

      const newRunBalance = parseFloat((user.runBalance - item.priceRun).toFixed(2));
      let newGovBalance = user.govBalance;

      if (item.type === 'CURRENCY') {
          newGovBalance += item.effectValue;
          await logTransaction(user.id, 'IN', 'GOV', item.effectValue, `Flash Drop: ${item.name}`);
      }

      await supabase.from('profiles').update({ run_balance: newRunBalance, gov_balance: newGovBalance }).eq('id', user.id);
      await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market Purchase: ${item.name}`);
      
      await supabase.from('items').update({ quantity: Math.max(0, item.quantity - 1) }).eq('id', item.id);
      
      showToast(item.name + " purchased!", 'SUCCESS');
      await fetchUserProfile(user.id);
      setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i));
  };

  const useItem = async (item: InventoryItem, targetZoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === targetZoneId);
      if (!zone) return;

      const updates: any = {};
      const expiry = Date.now() + (ITEM_DURATION_SEC * 1000);

      if (item.type === 'BOOST') updates.boost_expires_at = expiry;
      if (item.type === 'DEFENSE') updates.shield_expires_at = expiry;

      const { error } = await supabase.from('zones').update(updates).eq('id', targetZoneId);

      if (!error) {
          const { data: invRow } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id).single();
          if (invRow) {
              if (invRow.quantity > 1) {
                  await supabase.from('inventory').update({ quantity: invRow.quantity - 1 }).eq('id', invRow.id);
              } else {
                  await supabase.from('inventory').delete().eq('id', invRow.id);
              }
          }

          setZones(prev => prev.map(z => z.id === targetZoneId ? { 
              ...z, 
              boostExpiresAt: item.type === 'BOOST' ? expiry : z.boostExpiresAt,
              shieldExpiresAt: item.type === 'DEFENSE' ? expiry : z.shieldExpiresAt
          } : z));

          showToast("Item activated on " + zone.name, item.type === 'BOOST' ? 'BOOST' : 'DEFENSE');
          await fetchUserProfile(user.id);
      }
  };

  const swapGovToRun = async (govAmount: number) => {
      if (!user || govAmount <= 0) return;
      if (user.govBalance < govAmount) {
          showToast("Insufficient GOV", 'ERROR');
          return;
      }

      const runToReceive = govAmount * govToRunRate;
      const newGov = parseFloat((user.govBalance - govAmount).toFixed(2));
      const newRun = parseFloat((user.runBalance + runToReceive).toFixed(2));

      const { error = null } = await supabase.from('profiles').update({
          gov_balance: newGov,
          run_balance: newRun
      }).eq('id', user.id);

      if (!error) {
          await logTransaction(user.id, 'OUT', 'GOV', govAmount, 'Liquidity Swap');
          await logTransaction(user.id, 'IN', 'RUN', runToReceive, 'Swap Settlement');
          setUser({ ...user, govBalance: newGov, runBalance: newRun });
          showToast("Swap successful!", 'SUCCESS');
      }
  };

  const buyFiatGov = async (fiatAmount: number) => {
      if (!user) return;
      const govToReceive = fiatAmount * 10;
      const newGov = parseFloat((user.govBalance + govToReceive).toFixed(2));

      const { error } = await supabase.from('profiles').update({ gov_balance: newGov }).eq('id', user.id);

      if (!error) {
          await logTransaction(user.id, 'IN', 'GOV', govToReceive, `Fiat Purchase: €${fiatAmount}`);
          setUser({ ...user, govBalance: newGov });
          showToast(`Purchase Complete: +${govToReceive} GOV`, 'SUCCESS');
      }
  };

  const reportBug = async (description: string, screenshot?: File) => {
      if (!user) return false;
      try {
          let screenshotUrl = '';
          if (screenshot) {
              const resUrl = await uploadFile(screenshot, 'bugs');
              if (resUrl) screenshotUrl = resUrl;
          }

          const newReport = {
              user_id: user.id,
              user_name: user.name,
              description,
              screenshot: screenshotUrl,
              timestamp: Date.now(),
              status: 'OPEN'
          };

          const { data, error } = await supabase.from('bug_reports').insert(newReport).select().single();
          if (error) throw error;
          
          setBugReports(prev => [{
              id: data.id,
              userId: data.user_id,
              userName: data.user_name,
              description: data.description,
              screenshot: data.screenshot,
              timestamp: data.timestamp,
              status: data.status
          }, ...prev]);

          sendSlackNotification(`*New Bug Report!* \nAgent: \`${user.name}\` \nDescription: \`${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\``, 'WARNING', 'BUGS');

          return true;
      } catch (err) {
          console.error("Bug report failed:", err);
          return false;
      }
  };

  const submitSuggestion = async (title: string, description: string) => {
      if (!user) return false;
      try {
          const newSuggestion = {
              user_id: user.id,
              user_name: user.name,
              title,
              description,
              timestamp: Date.now()
          };

          const { data, error } = await supabase.from('suggestions').insert(newSuggestion).select().single();
          if (error) throw error;

          setSuggestions(prev => [{
              id: data.id,
              userId: data.user_id,
              userName: data.user_name,
              title: data.title,
              description: data.description,
              timestamp: data.timestamp
          }, ...prev]);

          sendSlackNotification(`*New Strategy Proposed!* \nAgent: \`${user.name}\` \nTitle: \`${title}\` \nDetails: \`${description.substring(0, 100)}...\``, 'INFO', 'IDEAS');

          return true;
      } catch (err) {
          console.error("Suggestion failed:", err);
          return false;
      }
  };

  const upgradePremium = async () => {
      if (!user) return;
      if (user.govBalance < PREMIUM_COST) {
          showToast("Insufficient GOV for Premium", 'ERROR');
          return;
      }

      const newGov = parseFloat((user.govBalance - PREMIUM_COST).toFixed(2));
      const { error } = await supabase.from('profiles').update({ 
          is_premium: true,
          gov_balance: newGov
      }).eq('id', user.id);

      if (!error) {
          await logTransaction(user.id, 'OUT', 'GOV', PREMIUM_COST, 'Premium Upgrade');
          setUser({ ...user, isPremium: true, govBalance: newGov });
          showToast("Agent Status: PREMIUM", 'SUCCESS');
      }
  };

  const updateUser = async (updates: Partial<User>) => {
      if (!user) return;
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
      if (updates.favoriteBadgeId !== undefined) dbUpdates.favorite_badge_id = updates.favoriteBadgeId;

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (!error) {
          setUser({ ...user, ...updates });
          showToast("Profile Updated", 'SUCCESS');
      } else {
          showToast("Update failed: " + error.message, 'ERROR');
      }
  };

  return {
      logTransaction, recordRun, mintZone, claimZone, buyItem, useItem, swapGovToRun, buyFiatGov, reportBug, submitSuggestion, upgradePremium, updateUser
  };
};