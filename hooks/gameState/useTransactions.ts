import { supabase } from '../../supabaseClient';
import { User, Transaction } from '../../types';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface TransactionsHookProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    govToRunRate: number;
}

export const useTransactions = ({ user, setUser, setTransactions, govToRunRate }: TransactionsHookProps) => {
  const { showToast } = useGlobalUI();

  const logTransaction = async (userId: string, type: 'IN' | 'OUT', token: 'RUN' | 'GOV' | 'ITEM', amount: number, description: string) => {
      if (!amount || amount <= 0 || isNaN(amount)) return;
      const timestamp = Date.now();
      const newTx: Transaction = { id: crypto.randomUUID(), userId, type, token, amount, description, timestamp };
      setTransactions(prev => [newTx, ...prev]);
      await supabase.from('transactions').insert({ id: newTx.id, user_id: userId, type, token, amount: parseFloat(amount.toFixed(4)), description, timestamp });
  };

  const swapGovToRun = async (govAmount: number) => {
      if (!user || govAmount <= 0 || user.govBalance < govAmount) return;

      const runToReceive = govAmount * govToRunRate;
      const newGov = parseFloat((user.govBalance - govAmount).toFixed(2));
      const newRun = parseFloat((user.runBalance + runToReceive).toFixed(2));

      const { error } = await supabase.from('profiles').update({ gov_balance: newGov, run_balance: newRun }).eq('id', user.id);

      if (!error) {
          await logTransaction(user.id, 'OUT', 'GOV', govAmount, 'Liquidity Swap');
          await logTransaction(user.id, 'IN', 'RUN', runToReceive, 'Swap Settlement');
          setUser({ ...user, govBalance: newGov, runBalance: newRun });
          showToast("Swap successful!", 'SUCCESS');
      }
  };

  const buyFiatGov = async (fiatAmount: number) => {
      if (!user) return;
      const govToReceive = fiatAmount * 10;
      const newGov = parseFloat((user.govBalance + govToReceive).toFixed(2));
      const { error } = await supabase.from('profiles').update({ gov_balance: newGov }).eq('id', user.id);
      if (!error) {
          await logTransaction(user.id, 'IN', 'GOV', govToReceive, `Fiat Purchase: €${fiatAmount}`);
          setUser({ ...user, govBalance: newGov });
          showToast(`Purchase Complete: +${govToReceive} GOV`, 'SUCCESS');
      }
  };

  return { logTransaction, swapGovToRun, buyFiatGov };
};