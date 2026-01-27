
import { useGameData } from './gameState/useGameData';
import { useUser } from './gameState/useUser';
import { useZones } from './gameState/useZones';
import { useInventory } from './gameState/useInventory';
import { useTransactions } from './gameState/useTransactions';
import { useMissions } from './gameState/useMissions';
import { useAdmin } from './gameState/useAdmin';
import { useGlobalUI } from '../contexts/GlobalUIContext';

export const useGameState = () => {
  const data = useGameData();
  const { playSound } = useGlobalUI();

  const transactions = useTransactions({
      user: data.user,
      setUser: data.setUser,
      setTransactions: data.setTransactions,
      govToRunRate: data.govToRunRate
  });

  const userActions = useUser({
      user: data.user,
      setUser: data.setUser,
      fetchUserProfile: data.fetchUserProfile,
      logTransaction: transactions.logTransaction,
      playSound // Passiamo il controllo sonoro
  });

  const zonesActions = useZones({
      user: data.user,
      zones: data.zones,
      setUser: data.setUser,
      setZones: data.setZones,
      logTransaction: transactions.logTransaction,
      playSound // Passiamo il controllo sonoro
  });

  const inventoryActions = useInventory({
      user: data.user,
      zones: data.zones,
      setZones: data.setZones,
      setMarketItems: data.setMarketItems,
      fetchUserProfile: data.fetchUserProfile,
      logTransaction: transactions.logTransaction,
      playSound // Passiamo il controllo sonoro
  });

  const missionsActions = useMissions({
      user: data.user,
      uploadFile: data.uploadFile,
      setBugReports: data.setBugReports,
      setSuggestions: data.setSuggestions,
      playSound // Passiamo il controllo sonoro
  });

  const adminActions = useAdmin({
      fetchGameData: data.fetchGameData,
      user: data.user,
      setUser: data.setUser,
      lastBurnTimestamp: data.lastBurnTimestamp,
      setLastBurnTimestamp: data.setLastBurnTimestamp,
      fetchUserProfile: data.fetchUserProfile,
      setAllUsers: data.setAllUsers,
      logTransaction: transactions.logTransaction,
      setBugReports: data.setBugReports,
      setSuggestions: data.setSuggestions,
      setZones: data.setZones,
      allUsers: data.allUsers
  });

  return {
    ...data,
    ...userActions,
    ...zonesActions,
    ...inventoryActions,
    ...transactions,
    ...missionsActions,
    ...adminActions,
    refreshData: data.fetchGameData
  };
};