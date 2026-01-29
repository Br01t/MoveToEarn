import { safeRpc } from '../../supabaseClient';
import { User, Zone, RunEntry } from '../../types';
import { CONQUEST_COST, CONQUEST_REWARD_GOV, MINT_COST, MINT_REWARD_GOV } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { sendSlackNotification } from '../../utils/slack';
import { useLanguage } from '../../LanguageContext';
import { logger } from '../../utils/logger';

interface ZonesHookProps {
    user: User | null;
    zones: Zone[];
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
    playSound: (type: any) => void;
}

export const useZones = ({ user, zones, setUser, setZones, playSound }: ZonesHookProps) => {
  const { showToast } = useGlobalUI();
  const { t } = useLanguage();

  const recordRun = async (userId: string, runData: RunEntry, updatedZones: Zone[]) => {
      if (!userId || !user) {
          logger.error("Attempted to record run without user context");
          return { success: false, error: "Authentication missing" };
      }

      try {
          logger.info(`Starting atomic DB sync for run ${runData.id}...`);

          /**
           * Sincronizzazione con la firma SQL:
           * p_location_name -> match database
           * NO p_zones_to_update -> rimosso perché il DB aggiorna le zone tramite il ciclo su p_zone_breakdown
           */
          const rpcRes = await safeRpc('atomic_record_run', {
              p_user_id: userId,
              p_run_id: runData.id,
              p_location_name: runData.location, // Match esatto con SQL
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

          if (!rpcRes.success) {
              throw new Error((rpcRes as any).error || "Atomic transaction failed");
          }

          sendSlackNotification(`*Activity Synced!* \nAgent: \`${user?.name}\` \nDistance: \`${runData.km.toFixed(2)} KM\``, 'INFO', 'SYNC');
          return { success: true };

      } catch (err: any) {
          logger.error("Sync sequence interrupted:", err.message);
          showToast(`Sync failed: ${err.message}`, 'ERROR');
          return { success: false, error: err.message };
      }
  };

  const mintZone = async (newZone: Zone, shiftedZones: Zone[]) => {
      if (!user) return { success: false, error: "Not logged in" };
      try {
          logger.info(`Starting atomic mint for zone ${newZone.name}...`);
          
          const rpcRes = await safeRpc('atomic_mint_zone', {
              p_user_id: user.id,
              p_zone_id: newZone.id,
              p_name: newZone.name,
              p_x: Math.round(newZone.x),
              p_y: Math.round(newZone.y),
              p_lat: newZone.lat,
              p_lng: newZone.lng,
              p_interest_rate: newZone.interestRate,
              p_shield_expires_at: newZone.shieldExpiresAt,
              p_cost: MINT_COST,
              p_reward_gov: MINT_REWARD_GOV,
              p_shifted_zones: shiftedZones.map(sz => ({ 
                  id: sz.id, 
                  x: Math.round(sz.x), 
                  y: Math.round(sz.y) 
              }))
          });

          if (!rpcRes.success) throw new Error((rpcRes as any).error || "Minting failed");

          const newRun = user.runBalance - MINT_COST;
          const newGov = user.govBalance + MINT_REWARD_GOV;
          setUser({ ...user, runBalance: newRun, govBalance: newGov });
          
          playSound('SUCCESS');
          sendSlackNotification(`*Zone Minted!* \nController: \`${user.name}\` \nSector: \`${newZone.name}\``, 'SUCCESS', 'MAP');
          return { success: true };
      } catch (err: any) {
          logger.error("Mint Error:", err);
          showToast(`Mint failed: ${err.message}`, 'ERROR');
          playSound('ERROR');
          return { success: false, error: err.message };
      }
  };

  const claimZone = async (zoneId: string) => {
      if (!user) return;
      const zone = zones.find(z => z.id === zoneId);
      if (!zone || zone.ownerId === user.id) return;

      try {
          logger.info(`Starting atomic claim for zone ${zone.name}...`);

          const rpcRes = await safeRpc('atomic_claim_zone', {
              p_user_id: user.id,
              p_zone_id: zoneId,
              p_cost: CONQUEST_COST,
              p_reward_gov: CONQUEST_REWARD_GOV
          });

          if (!rpcRes.success) throw new Error((rpcRes as any).error || "Conquest failed");

          const newRun = user.runBalance - CONQUEST_COST;
          const newGov = user.govBalance + CONQUEST_REWARD_GOV;
          
          setUser({ ...user, runBalance: newRun, govBalance: newGov });
          setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ownerId: user.id, interestPool: 0 } : z));

          playSound('SUCCESS');
          showToast(`${t('alert.zone_claimed')} +${CONQUEST_REWARD_GOV} GOV`, 'SUCCESS');
          
          sendSlackNotification(`*Sector Conquered!* \nNew Controller: \`${user.name}\` \nSector: \`${zone.name}\``, 'ALERT', 'MAP');
      } catch (err: any) {
          logger.error("Claim Error:", err);
          showToast(`Conquest failed: ${err.message}`, 'ERROR');
          playSound('ERROR');
      }
  };

  return { recordRun, mintZone, claimZone };
};