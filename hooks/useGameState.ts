
import { useGameData } from './gameState/useGameData';
import { useGameAuth } from './gameState/useGameAuth';
import { useGameActions } from './gameState/useGameActions';
import { useAdminActions } from './gameState/useAdminActions';

export const useGameState = () => {
  const data = useGameData();
  const auth = useGameAuth(data.setUser, data.setZones, data.setRecoveryMode);
  
  // Update: Passing missing dependencies from useGameData to useGameActions
  const actions = useGameActions({
      user: data.user,
      zones: data.zones,
      setUser: data.setUser,
      setZones: data.setZones,
      setTransactions: data.setTransactions,
      setMarketItems: data.setMarketItems,
      setAllUsers: data.setAllUsers,
      fetchUserProfile: data.fetchUserProfile,
      govToRunRate: data.govToRunRate,
      uploadFile: data.uploadFile,
      setBugReports: data.setBugReports,
      setSuggestions: data.setSuggestions
  });

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
    refreshData: data.fetchGameData, 
    // Explicitly exposing uploadFile from data hook
    uploadFile: data.uploadFile
  };
};