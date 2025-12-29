import { supabase } from '../../supabaseClient';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { sendSlackNotification } from '../../utils/slack';

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
          
          // Slack Notification: New User sent to RUNNERS channel
          sendSlackNotification(`*Nuovo Runner iscritto!* \nUtente: \`${username}\` \nEmail: \`${email}\``, 'SUCCESS', 'RUNNERS');
      }
      return { data, error };
  };

  const logout = async () => { 
      try {
          // Sign out from all devices and clear cookies/localstorage
          await supabase.auth.signOut({ scope: 'global' }); 
          
          // Manual cleanup of any potential leftover Supabase keys in localStorage
          Object.keys(localStorage).forEach(key => {
              if (key.includes('supabase.auth.token') || key.startsWith('sb-')) {
                  localStorage.removeItem(key);
              }
          });

          setUser(null); 
          setZones([]); 
      } catch (err) {
          console.error("Sign out failed", err);
          setUser(null); 
      }
  };

  return { login, register, logout, resetPassword, updatePassword };
};