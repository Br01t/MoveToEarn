
import { supabase } from '../../supabaseClient';
import { User, Zone, RunEntry } from '../../types';
import { CONQUEST_COST, CONQUEST_REWARD_GOV, MINT_COST, MINT_REWARD_GOV } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { sendSlackNotification } from '../../utils/slack';
import { useLanguage } from '../../LanguageContext';

interface ZonesHookProps {
    user: User | null;
    zones: Zone[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
    playSound: (type: any) => void;
}

export const useZones = ({ user, zones, setUser, setZones, logTransaction, playSound }: ZonesHookProps) => {
  const { showToast } = useGlobalUI();
  const { t } = useLanguage();

  const recordRun = async (userId: string, runData: RunEntry, updatedZones: Zone[]) => {
      try {
          if (!userId) throw new Error("User ID is missing.");
          
          // Debugging log per identificare i tipi passati
          console.debug("Attempting atomic_record_run sync...", {
              run_id: runData.id,
              user_id: userId,
              zones_count: runData.involvedZones?.length || 0
          });

          const { data, error: rpcError } = await supabase.rpc('atomic_record_run', {
              p_run_id: runData.id,
              p_user_id: userId,
              p_location_name: runData.location,
              p_km: runData.km,
              p_duration: Math.floor(runData.duration || 0),
              p_run_earned: runData.runEarned,
              p_gov_earned: runData.govEarned || 0,
              p_avg_speed: runData.avgSpeed || 0,
              p_max_speed: runData.maxSpeed || 0,
              p_elevation: Math.floor(runData.elevation || 0),
              p_timestamp: runData.timestamp,
              p_involved_zones: runData.involvedZones || [],
              p_zone_breakdown: runData.zoneBreakdown || {}
          });

          if (rpcError || (data && !data.success)) {
              const errorMsg = rpcError?.message || data?.error || "Sync internal error";
              console.error("RPC Sync Failure:", errorMsg, rpcError);
              throw new Error(errorMsg);
          }

          sendSlackNotification(`*Activity Synced!* \nAgent: \`${user?.name}\` \nDistance: \`${runData.km.toFixed(2)} KM\``, 'INFO', 'SYNC');
          return { success: true };
      } catch (err: any) {
          console.error("RecordRun Hook Catch:", err.message);
          return { success: false, error: err.message };
      }
  };

  const mintZone = async (newZone: Zone, shiftedZones: Zone[]) => {
      if (!user) return { success: false, error: "Not logged in" };
      try {
          const { data, error: rpcError } = await supabase.rpc('atomic_mint_zone', {
              p_user_id: user.id,
              p_zone_id: newZone.id,
              p_name: newZone.name,
              p_x: Math.round(newZone.x),
              p_y: Math.round(newZone.y),
              p_lat: newZone.lat,
              p_lng: newZone.lng,
              p_cost: MINT_COST,
              p_reward_gov: MINT_REWARD_GOV
          });

          if (rpcError || (data && !data.success)) {
              throw new Error(rpcError?.message || data?.error || "Minting failed");
          }

          // Aggiornamento posizioni zone shiftate (se presenti)
          if (shiftedZones && shiftedZones.length > 0) {
              for (const sz of shiftedZones) {
                  await supabase.from('zones').update({ x: Math.round(sz.x), y: Math.round(sz.y) }).eq('id', sz.id);
              }
          }

          playSound('SUCCESS');
          sendSlackNotification(`*Zone Minted!* \nController: \`${user.name}\` \nSector: \`${newZone.name}\``, 'SUCCESS', 'MAP');
          return { success: true };
      } catch (err: any) {
          console.error("Mint Error:", err);
          playSound('ERROR');
          return { success: false, error: err.message };
      }
  };

  const claimZone = async (zoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === zoneId);
      if (!zone || zone.ownerId === user.id) return;

      try {
          const { data, error: rpcError } = await supabase.rpc('atomic_claim_zone', {
              p_user_id: user.id,
              p_zone_id: zoneId,
              p_cost: CONQUEST_COST,
              p_reward_gov: CONQUEST_REWARD_GOV
          });

          if (rpcError || (data && !data.success)) {
              throw new Error(rpcError?.message || data?.error || "Conquest failed");
          }

          playSound('SUCCESS');
          showToast(`${t('alert.zone_claimed')} +${CONQUEST_REWARD_GOV} GOV`, 'SUCCESS');
          
          const { data: profile } = await supabase.from('profiles').select('run_balance, gov_balance').eq('id', user.id).single();
          if (profile) {
              setUser({ ...user, runBalance: profile.run_balance, govBalance: profile.gov_balance });
          }
          
          setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ownerId: user.id, interestPool: 0 } : z));
          
          sendSlackNotification(`*Sector Conquered!* \nNew Controller: \`${user.name}\` \nSector: \`${zone.name}\``, 'ALERT', 'MAP');
      } catch (err: any) {
          console.error("Claim Error:", err);
          playSound('ERROR');
          showToast(err.message, 'ERROR');
      }
  };

  return { recordRun, mintZone, claimZone };
};