import { supabase, safeQuery, safeRpc } from '../../supabaseClient';
import { User, Zone, Item, InventoryItem } from '../../types';
import { ITEM_DURATION_SEC } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { logger } from '../../utils/logger';

interface InventoryHookProps {
    user: User | null;
    zones: Zone[];
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
    setMarketItems: React.Dispatch<React.SetStateAction<Item[]>>;
    fetchUserProfile: (id: string) => Promise<void>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
    playSound: (type: any) => void;
}

export const useInventory = ({ user, zones, setZones, setMarketItems, fetchUserProfile, logTransaction, playSound }: InventoryHookProps) => {
  const { showToast } = useGlobalUI();

  const buyItem = async (item: Item) => {
      if (!user) return;
      
      try {
          logger.info(`Purchasing item ${item.name}...`);
          
          const rpcRes = await safeRpc('atomic_buy_item', {
              p_user_id: user.id,
              p_item_id: item.id,
              p_price: item.priceRun,
              p_token_type: 'RUN'
          });

          if (!rpcRes.success) throw new Error((rpcRes as any).error || "Transaction failed");

          await logTransaction(user.id, 'OUT', 'ITEM', item.priceRun, `Market Purchase: ${item.name}`);

          if (item.type === 'CURRENCY') {
              await logTransaction(user.id, 'IN', 'GOV', item.effectValue, `Market Item Reward: ${item.name}`);
          }

          playSound('SUCCESS');
          showToast(item.name + " purchased!", 'SUCCESS');
          
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i));
          await fetchUserProfile(user.id);
          
      } catch (err: any) {
          logger.error("Purchase Error:", err);
          showToast(`Purchase failed: ${err.message}`, 'ERROR');
          playSound('ERROR');
      }
  };

  const useItem = async (item: InventoryItem, targetZoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === targetZoneId);
      if (!zone) return;

      try {
          const updates: any = {};
          const expiry = Date.now() + (ITEM_DURATION_SEC * 1000);
          if (item.type === 'BOOST') updates.boost_expires_at = expiry;
          if (item.type === 'DEFENSE') updates.shield_expires_at = expiry;

          const res = await safeQuery(supabase.from('zones').update(updates).eq('id', targetZoneId));
          if (!res.success) throw new Error(`Failed to apply item in sector: ${(res as any).error}`);

          const invRes = await safeQuery(supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id).maybeSingle());
          
          if (invRes.success && invRes.data) {
              const invRow = invRes.data;
              if (invRow.quantity > 1) {
                  await safeQuery(supabase.from('inventory').update({ quantity: invRow.quantity - 1 }).eq('id', invRow.id));
              } else {
                  await safeQuery(supabase.from('inventory').delete().eq('id', invRow.id));
              }
          }

          playSound('SUCCESS');
          setZones(prev => prev.map(z => z.id === targetZoneId ? { 
              ...z, 
              boostExpiresAt: item.type === 'BOOST' ? expiry : z.boostExpiresAt,
              shieldExpiresAt: item.type === 'DEFENSE' ? expiry : z.shieldExpiresAt
          } : z));
          
          showToast("Item activated on " + zone.name, item.type === 'BOOST' ? 'BOOST' : 'DEFENSE');
          await fetchUserProfile(user.id);
          
      } catch (err: any) {
          logger.error("Use Item Error:", err);
          showToast(err.message, "ERROR");
          playSound('ERROR');
      }
  };

  return { buyItem, useItem };
};