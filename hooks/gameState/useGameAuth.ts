
import { supabase } from '../../supabaseClient';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

export const useGameAuth = (
    setUser: (u: any) => void, 
    setZones: (z: any[]) => void, 
    setRecoveryMode: (b: boolean) => void
) => {
  const { showToast } = useGlobalUI();
    
  const login = async (email: string, password: string) => await supabase.auth.signInWithPassword({ email, password });
  
  const resetPassword = async (email: string) => {
      const productionUrl = (import.meta as any).env.VITE_SITE_URL;
      const redirectTo = productionUrl || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return { error };
  };

  const updatePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
          setRecoveryMode(false); 
          showToast("Password updated successfully!", 'SUCCESS');
      }
      return { error };
  };

  const register = async (email: string, password: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: username } } });
      if (data.user && !error) {
          await supabase.from('profiles').insert({ id: data.user.id, email: email, name: username, run_balance: 0, gov_balance: 0, total_km: 0 });
      }
      return { data, error };
  };

  const logout = async () => { 
      await supabase.auth.signOut(); 
      setUser(null); 
      setZones([]); // Clear sensitive data
  };

  return { login, register, logout, resetPassword, updatePassword };
};