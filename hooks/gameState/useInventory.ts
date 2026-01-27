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
          // 1. Chiamata RPC per gestire l'acquisto lato database (transazionale)
          const { data, error: rpcError } = await supabase.rpc('atomic_buy_item', {
              p_user_id: user.id,
              p_item_id: item.id,
              p_price: item.priceRun,
              p_token_type: 'RUN'
          });

          if (rpcError || (data && !data.success)) {
              throw new Error(rpcError?.message || data?.error || "Transaction failed");
          }

          // 2. Registrazione Transazione USCITA (Costo RUN)
          // Usiamo il tipo 'ITEM' perché il WalletCharts lo interpreta correttamente come uscita RUN per acquisto
          await logTransaction(
              user.id, 
              'OUT', 
              'ITEM', 
              item.priceRun, 
              `Market Purchase: ${item.name}`
          );

          // 3. Registrazione Transazione ENTRATA (Se è un pacchetto GOV)
          if (item.type === 'CURRENCY') {
              await logTransaction(
                  user.id, 
                  'IN', 
                  'GOV', 
                  item.effectValue, 
                  `Market Item: ${item.name}`
              );
          }

          playSound('SUCCESS');
          showToast(item.name + " purchased!", 'SUCCESS');
          
          // 4. Aggiornamento Stock Ottimistico
          setMarketItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i));

          // 5. Re-sync del profilo per aggiornare i saldi reali dal DB
          await fetchUserProfile(user.id);
          
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