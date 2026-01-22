
import { supabase } from '../../supabaseClient';
import { User } from '../../types';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { PREMIUM_COST } from '../../constants';

interface UserHookProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    fetchUserProfile: (id: string) => Promise<void>;
    logTransaction: (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => Promise<void>;
    playSound: (type: any) => void;
}

export const useUser = ({ user, setUser, fetchUserProfile, logTransaction, playSound }: UserHookProps) => {
  const { showToast } = useGlobalUI();

  const login = async (email: string, password: string) => {
      // Fix: Use any cast to resolve property existence errors on signInWithPassword.
      const res = await (supabase.auth as any).signInWithPassword({ email, password });
      if (res.data.user) {
          playSound('SUCCESS');
          await fetchUserProfile(res.data.user.id);
      }
      return res;
  };
  
  const resetPassword = async (email: string) => {
      const productionUrl = (import.meta as any).env.VITE_SITE_URL;
      const redirectTo = productionUrl || window.location.origin;
      // Fix: Use any cast to resolve property existence errors on resetPasswordForEmail.
      return await (supabase.auth as any).resetPasswordForEmail(email, { redirectTo });
  };

  const updatePassword = async (newPassword: string) => {
      // Fix: Use any cast to resolve property existence errors on updateUser.
      const res = await (supabase.auth as any).updateUser({ password: newPassword });
      if (!res.error) playSound('SUCCESS');
      return res;
  };

  const register = async (email: string, password: string, username: string) => {
      // Fix: Use any cast to resolve property existence errors on signUp.
      const { data, error } = await (supabase.auth as any).signUp({ email, password, options: { data: { name: username } } });
      if (data.user && !error) {
          playSound('SUCCESS');
          await supabase.from('profiles').insert({ 
              id: data.user.id, 
              email: email, 
              name: username, 
              run_balance: 0, 
              gov_balance: 0, 
              total_km: 0,
              is_premium: false,
              is_admin: false
          });
          await fetchUserProfile(data.user.id);
      }
      return { data, error };
  };

  const logout = async () => { 
      try {
          // playSound('CLICK') rimosso: gestito dal listener globale sull'elemento UI
          // Fix: Use any cast to resolve property existence errors on signOut.
          await (supabase.auth as any).signOut({ scope: 'global' }); 
          Object.keys(localStorage).forEach(key => {
              if (key.includes('supabase.auth.token') || key.startsWith('sb-')) {
                  localStorage.removeItem(key);
              }
          });
          setUser(null); 
      } catch (err) {
          console.error("Sign out failed", err);
          setUser(null); 
      }
  };

  const updateUser = async (updates: Partial<User>) => {
      if (!user) return;
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
      if (updates.favoriteBadgeId !== undefined) dbUpdates.favorite_badge_id = updates.favoriteBadgeId;

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (!error) {
          playSound('SUCCESS');
          setUser({ ...user, ...updates });
          showToast("Profile Updated", 'SUCCESS');
      } else {
          playSound('ERROR');
          showToast("Update failed: " + error.message, 'ERROR');
      }
  };

  const upgradePremium = async () => {
      if (!user) return;
      if (user.govBalance < PREMIUM_COST) {
          playSound('ERROR');
          showToast("Insufficient GOV for Premium", 'ERROR');
          return;
      }

      const newGov = parseFloat((user.govBalance - PREMIUM_COST).toFixed(2));
      const { error } = await supabase.from('profiles').update({ 
          is_premium: true,
          gov_balance: newGov
      }).eq('id', user.id);

      if (!error) {
          playSound('SUCCESS');
          await logTransaction(user.id, 'OUT', 'GOV', PREMIUM_COST, 'Premium Upgrade');
          setUser({ ...user, isPremium: true, govBalance: newGov });
          showToast("Agent Status: PREMIUM", 'SUCCESS');
      }
  };

  return { login, register, logout, resetPassword, updatePassword, updateUser, upgradePremium };
};