
import { useGameData } from './gameState/useGameData';
import { useGameAuth } from './gameState/useGameAuth';
import { useGameActions } from './gameState/useGameActions';
import { useAdminActions } from './gameState/useAdminActions';

export const useGameState = () => {
  // 1. DATA CORE (State & Fetchers)
  const data = useGameData();

  // 2. AUTHENTICATION
  const auth = useGameAuth(data.setUser, data.setZones, data.setRecoveryMode);

  // 3. GAMEPLAY ACTIONS
  const actions = useGameActions({
      user: data.user,
      zones: data.zones,
      setUser: data.setUser,
      setZones: data.setZones,
      setTransactions: data.setTransactions,
      setMarketItems: data.setMarketItems,
      setAllUsers: data.setAllUsers,
      fetchUserProfile: data.fetchUserProfile,
      govToRunRate: data.govToRunRate
  });

  // 4. ADMIN ACTIONS
  const admin = useAdminActions({
      fetchGameData: data.fetchGameData,
      user: data.user,
      lastBurnTimestamp: data.lastBurnTimestamp,
      setLastBurnTimestamp: data.setLastBurnTimestamp,
      fetchUserProfile: data.fetchUserProfile,
      setAllUsers: data.setAllUsers,
      logTransaction: actions.logTransaction,
      setBugReports: data.setBugReports,
      setSuggestions: data.setSuggestions,
      setZones: data.setZones,
      allUsers: data.allUsers
  });

  return {
    ...data,
    ...auth,
    ...actions,
    ...admin,
    refreshData: data.fetchGameData, // Alias for consistency
  };
};