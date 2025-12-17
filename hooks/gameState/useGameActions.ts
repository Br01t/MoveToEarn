
import { supabase } from '../../supabaseClient';
import { User, Zone, Item, InventoryItem, Transaction, RunEntry } from '../../types';
import { CONQUEST_COST, CONQUEST_REWARD_GOV, PREMIUM_COST, ITEM_DURATION_SEC } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

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
}

export const useGameActions = ({ 
    user, zones, setUser, setZones, setTransactions, setMarketItems, setAllUsers, fetchUserProfile, govToRunRate 
}: GameActionsProps) => {
  const { showToast } = useGlobalUI();

  const logTransaction = async (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => {
      // Security Check: Prevent logging invalid amounts
      if (!amount || amount <= 0 || isNaN(amount)) return;
      
      const newTx: Transaction = {
          id: crypto.randomUUID(),
          userId, type, token, amount, description, timestamp: Date.now()
      };

      setTransactions(prev => [newTx, ...prev]);

      const { error } = await supabase.from('transactions').insert({
          id: newTx.id, user_id: userId, type, token, amount, description, timestamp: newTx.timestamp
      });

      if (error) console.error("❌ [TRANSACTION LOG FAILED]", error.message);
  };

  const recordRun = async (userId: string, runData: RunEntry, updatedZones: Zone[]) => {
      try {
          // Security Integrity Check
          if (runData.runEarned < 0 || isNaN(runData.runEarned) || runData.km < 0) {
              throw new Error("Invalid Run Data detected.");
          }

          // 1. Insert the Run Log
          const { error: runError } = await supabase.from('runs').insert({
              id: runData.id, user_id: userId, location_name: runData.location,
              km: runData.km, duration: runData.duration, 
              run_earned: runData.runEarned, gov_earned: runData.govEarned || 0,
              avg_speed: runData.avgSpeed, max_speed: runData.maxSpeed, elevation: runData.elevation,
              timestamp: runData.timestamp, involved_zones: runData.involvedZones,
              zone_breakdown: runData.zoneBreakdown || {}
          });

          if (runError) throw runError;

          // 2. Update User Profile Totals (Ideally this should be a DB Trigger)
          const { data: currentProfile } = await supabase.from('profiles').select('run_balance').eq('id', userId).single();
          const { data: userRuns } = await supabase.from('runs').select('km').eq('user_id', userId);
          const exactTotalKm = userRuns ? userRuns.reduce((sum, r) => sum + (Number(r.km) || 0), 0) : 0;

          if (currentProfile) {
              const safeBalance = (currentProfile.run_balance || 0) + runData.runEarned;
              await supabase.from('profiles').update({
                  total_km: exactTotalKm, run_balance: safeBalance 
              }).eq('id', userId);
          }

          // 3. Batch Update ONLY Modified Zones (Efficient)
          if (updatedZones.length > 0) {
              const zonePayload = updatedZones.map(z => ({
                  id: z.id,
                  // Standard fields for upsert (if new) or update (if existing)
                  name: z.name,
                  location: `POINT(${z.lng} ${z.lat})`,
                  owner_id: z.ownerId, // Ensure DB field match
                  x: z.x, y: z.y, lat: z.lat, lng: z.lng,
                  // Dynamic fields modified by gameplay
                  defense_level: z.defenseLevel,
                  record_km: z.recordKm,
                  interest_rate: z.interestRate,
                  interest_pool: z.interestPool,
                  last_distribution_time: z.lastDistributionTime || null,
                  boost_expires_at: z.boostExpiresAt,
                  shield_expires_at: z.shieldExpiresAt
              }));

              const { error: zoneError } = await supabase.from('zones').upsert(zonePayload);
              if (zoneError) throw zoneError;
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

  const claimZone = async (zoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) return;

      // Security: Optimistic update with integrity check
      if (user.runBalance < CONQUEST_COST) {
          showToast("Insufficient funds (Server Check)", 'ERROR');
          return;
      }

      const updatedUser = { ...user, runBalance: user.runBalance - CONQUEST_COST, govBalance: user.govBalance + CONQUEST_REWARD_GOV };
      const updatedZones = zones.map(z => z.id === zoneId ? { ...z, ownerId: user.id, recordKm: 0, defenseLevel: 1 } : z); 
      
      setUser(updatedUser);
      setZones(updatedZones);

      await logTransaction(user.id, 'OUT', 'RUN', CONQUEST_COST, `Conquest: ${zone.name}`);
      await logTransaction(user.id, 'IN', 'GOV', CONQUEST_REWARD_GOV, `Conquest Reward: ${zone.name}`);
      
      // CRITICAL: We update DB.
      await supabase.from('profiles').update({ run_balance: updatedUser.runBalance, gov_balance: updatedUser.govBalance }).eq('id', user.id);
      
      await supabase.from('zones').update({ 
          owner_id: user.id,
          record_km: 0,
          defense_level: 1
      }).eq('id', zoneId);
  };

  const buyItem = async (item: Item) => {
      if (!user) return;
      if (user.runBalance < item.priceRun) { 
          showToast("Insufficient funds", 'ERROR'); 
          return; 
      }

      const previousUser = { ...user };
      // Prevent negative balance locally
      const newRunBalance = Math.max(0, parseFloat((user.runBalance - item.priceRun).toFixed(2)));

      // 1. Logic for Currency Items (Flash Drops)
      if (item.type === 'CURRENCY') {
          const newGovBalance = parseFloat((user.govBalance + item.effectValue).toFixed(2));
          setUser({ ...user, runBalance: newRunBalance, govBalance: newGovBalance });
          
          await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market: ${item.name}`);
          await logTransaction(user.id, 'IN', 'GOV', item.effectValue, `Opened: ${item.name}`);
          
          const { error } = await supabase.from('profiles').update({ run_balance: newRunBalance, gov_balance: newGovBalance }).eq('id', user.id);
          
          if (error) { 
              showToast("Transaction failed.", 'ERROR'); 
              setUser(previousUser); 
              return; 
          }

          // Use RPC to decrement stock securely
          const { error: stockError } = await supabase.rpc('purchase_item', { item_id_input: item.id, quantity_to_buy: 1 });
          if (!stockError) {
              const newQty = Math.max(0, item.quantity - 1);
              setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
              showToast(`Purchased ${item.name}!`, 'SUCCESS');
          }
          return;
      }

      // 2. Logic for Standard Items (Inventory)
      const currentInventory = user.inventory || [];
      const existingItemIndex = currentInventory.findIndex(i => i.id === item.id);
      let newInventory: InventoryItem[];

      if (existingItemIndex >= 0) {
          newInventory = currentInventory.map((invItem, idx) => {
              if (idx === existingItemIndex) return { ...invItem, quantity: (invItem.quantity || 0) + 1 };
              return invItem;
          });
      } else {
          const newItem: InventoryItem = {
              id: item.id, name: item.name, description: item.description || '', priceRun: Number(item.priceRun),
              type: item.type, effectValue: Number(item.effectValue), icon: item.icon || 'Box', quantity: 1
          };
          newInventory = [...currentInventory, newItem];
      }

      setUser({ ...user, runBalance: newRunBalance, inventory: newInventory });
      await logTransaction(user.id, 'OUT', 'RUN', item.priceRun, `Market: ${item.name}`);
      
      const { error: profileError } = await supabase.from('profiles').update({ run_balance: newRunBalance }).eq('id', user.id);
      if (profileError) { 
          showToast("Purchase failed. Rolling back.", 'ERROR'); 
          setUser(previousUser); 
          return; 
      }

      // Inventory DB Insert/Update
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
          showToast("Error saving item.", 'ERROR'); 
          // Rollback profile balance
          await supabase.from('profiles').update({ run_balance: user.runBalance }).eq('id', user.id); 
          setUser(previousUser); 
          return; 
      }
      
      // Secure Stock Decrement via RPC
      const { error: stockError } = await supabase.rpc('purchase_item', { item_id_input: item.id, quantity_to_buy: 1 });
      
      if (!stockError) {
          const newQty = Math.max(0, item.quantity - 1);
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
          showToast(`Added ${item.name} to inventory`, 'SUCCESS');
      } else {
          // Note: We don't rollback the purchase if stock decrement fails in MVP, but in prod we should.
          // For now, we assume if profile update worked, user bought it.
          console.error("Stock update failed", stockError);
          showToast(`Added ${item.name} (Stock Error)`, 'SUCCESS');
      }
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

      const updatedInventory = user.inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);

      setUser({ ...user, inventory: updatedInventory });
      setZones(updatedZones);
      
      await logTransaction(user.id, 'OUT', 'ITEM', item.priceRun, `Used ${item.name} on ${zone.name}`);
      
      const { data: existingRows } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id);
      const existingRow = existingRows?.[0];

      if (existingRow) {
          if (existingRow.quantity > 1) await supabase.from('inventory').update({ quantity: existingRow.quantity - 1 }).eq('id', existingRow.id);
          else await supabase.from('inventory').delete().eq('id', existingRow.id);
      } else { setUser({ ...user, inventory: previousInventory }); return; }
      
      let zoneUpdateError = null;
      try {
          if (item.type === 'BOOST') {
              const { error } = await supabase.from('zones').update({ boost_expires_at: now + duration }).eq('id', zone.id);
              zoneUpdateError = error;
          } else if (item.type === 'DEFENSE') {
              const { error } = await supabase.from('zones').update({ shield_expires_at: now + duration }).eq('id', zone.id);
              zoneUpdateError = error;
          }
      } catch (err: any) { zoneUpdateError = err; }

      if (zoneUpdateError) {
          showToast(`Failed to apply effect.`, 'ERROR');
          // Rollback inventory
          if (existingRow) await supabase.from('inventory').update({ quantity: existingRow.quantity }).eq('id', existingRow.id);
          else await supabase.from('inventory').insert({ user_id: user.id, item_id: item.id, quantity: 1 });
          setUser({ ...user, inventory: previousInventory });
          setZones(previousZones);
      } else {
          showToast(`${item.name} activated on ${zone.name}!`, item.type === 'BOOST' ? 'BOOST' : 'DEFENSE');
      }
  };

  const buyFiatGov = async (amount: number) => {
      if (!user) return;
      if (amount <= 0 || isNaN(amount)) return;
      const govAmount = amount * 10; 
      const updatedUser = { ...user, govBalance: user.govBalance + govAmount };
      setUser(updatedUser);
      await logTransaction(user.id, 'IN', 'GOV', govAmount, `Fiat Purchase (€${amount})`);
      await supabase.from('profiles').update({ gov_balance: updatedUser.govBalance }).eq('id', user.id);
      showToast(`Purchased ${govAmount} GOV!`, 'SUCCESS');
  };

  const swapGovToRun = async (amount: number) => {
      if (!user || user.govBalance < amount || amount <= 0) return;
      const runReceived = amount * govToRunRate;
      const updatedUser = { ...user, govBalance: user.govBalance - amount, runBalance: user.runBalance + runReceived };
      setUser(updatedUser);
      await logTransaction(user.id, 'OUT', 'GOV', amount, `Swap to RUN`);
      await logTransaction(user.id, 'IN', 'RUN', runReceived, `Swap from GOV`);
      await supabase.from('profiles').update({ run_balance: updatedUser.runBalance, gov_balance: updatedUser.govBalance }).eq('id', user.id);
  };

  const uploadFile = async (file: File, context: string): Promise<string | null> => {
      try {
          const fileExt = file.name.split('.').pop();
          const cleanExt = fileExt ? fileExt.replace(/[^a-z0-9]/gi, '') : 'jpg';
          // Sanitize filename to prevent path traversal
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${safeName}.${cleanExt}`;
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

  const submitSuggestion = async (title: string, description: string) => {
      if (!user) return false;
      const { error } = await supabase.from('suggestions').insert({
          user_id: user.id, user_name: user.name, title, description, timestamp: Date.now()
      });
      return !error;
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
          showToast("Profile Updated", 'SUCCESS');
      } else {
          showToast("Update Failed", 'ERROR');
      }
  };

  const upgradePremium = async () => {
      if (!user) return;
      if (user.isPremium) { showToast("Already Premium!", 'ERROR'); return; }
      if (user.govBalance < PREMIUM_COST) { showToast(`Insufficient GOV. Cost: ${PREMIUM_COST} GOV`, 'ERROR'); return; }

      const newGovBalance = user.govBalance - PREMIUM_COST;
      const updatedUser = { ...user, isPremium: true, govBalance: newGovBalance };
      
      setUser(updatedUser);
      setAllUsers(prev => ({ ...prev, [user.id]: { ...prev[user.id], isPremium: true, govBalance: newGovBalance } }));

      await logTransaction(user.id, 'OUT', 'GOV', PREMIUM_COST, 'Premium Upgrade');
      
      const { error } = await supabase.from('profiles').update({ is_premium: true, gov_balance: newGovBalance }).eq('id', user.id);

      if (error) {
          console.error("Upgrade failed:", error);
          showToast("Upgrade failed. Reverting.", 'ERROR');
          await fetchUserProfile(user.id);
      } else {
          showToast("Welcome to Premium!", 'SUCCESS');
      }
  };

  return { logTransaction, recordRun, claimZone, buyItem, useItem, buyFiatGov, swapGovToRun, uploadFile, reportBug, submitSuggestion, updateUser, upgradePremium };
};