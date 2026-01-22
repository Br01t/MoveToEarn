
import { supabase } from '../../supabaseClient';
import { User, Zone, Item, InventoryItem } from '../../types';
import { ITEM_DURATION_SEC } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

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
          // Allineamento parametri con atomic_buy_item nel DB
          const { data, error: rpcError } = await supabase.rpc('atomic_buy_item', {
              p_user_id: user.id,
              p_item_id: item.id,
              p_price: item.priceRun,
              p_token_type: 'RUN'
          });

          if (rpcError || (data && !data.success)) {
              throw new Error(rpcError?.message || data?.error || "Transaction failed");
          }

          playSound('SUCCESS');
          showToast(item.name + " purchased!", 'SUCCESS');
          
          // Re-sync local state
          await fetchUserProfile(user.id);
          // Aggiorna stock locale in modo ottimistico
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i));
      } catch (err: any) {
          console.error("Purchase Error:", err);
          playSound('ERROR');
          showToast(err.message, 'ERROR');
      }
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
          playSound('SUCCESS');
          // Aggiorna inventario locale
          const { data: invRow } = await supabase.from('inventory').select('*').eq('user_id', user.id).eq('item_id', item.id).single();
          if (invRow) {
              if (invRow.quantity > 1) await supabase.from('inventory').update({ quantity: invRow.quantity - 1 }).eq('id', invRow.id);
              else await supabase.from('inventory').delete().eq('id', invRow.id);
          }
          setZones(prev => prev.map(z => z.id === targetZoneId ? { 
              ...z, 
              boostExpiresAt: item.type === 'BOOST' ? expiry : z.boostExpiresAt,
              shieldExpiresAt: item.type === 'DEFENSE' ? expiry : z.shieldExpiresAt
          } : z));
          showToast("Item activated on " + zone.name, item.type === 'BOOST' ? 'BOOST' : 'DEFENSE');
          await fetchUserProfile(user.id);
      } else {
          playSound('ERROR');
          showToast("Failed to use item", "ERROR");
      }
  };

  return { buyItem, useItem };
};