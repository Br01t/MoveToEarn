
import React, { useState, useMemo, useEffect } from 'react';
import { User, Transaction } from '../types';
import { Wallet as WalletIcon, CheckCircle, Link as LinkIcon, Activity, Crown, History, ArrowDownLeft, ArrowUpRight, Flame, X, Search, Filter } from 'lucide-react';
import Pagination from './Pagination';
import { useLanguage } from '../LanguageContext';

// Sub Components
import WalletCharts from './wallet/WalletCharts';
import WalletActions from './wallet/WalletActions';

interface WalletProps {
  user: User;
  transactions: Transaction[];
  govToRunRate: number;
  onBuyFiat: (amount: number) => void;
  onSwapGovToRun: (amount: number) => void;
  lastBurnTimestamp?: number;
  totalBurned?: number;
}

const TRANSACTIONS_PER_PAGE = 7;

const Wallet: React.FC<WalletProps> = ({ user, transactions, govToRunRate, onBuyFiat, onSwapGovToRun, lastBurnTimestamp, totalBurned }) => {
  const { t, tRich } = useLanguage();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  
  // New Filter States
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [historyTokenFilter, setHistoryTokenFilter] = useState<'ALL' | 'RUN' | 'GOV'>('ALL');

  // Countdown State
  const [timeLeft, setTimeLeft] = useState(0);
  const BURN_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

  useEffect(() => {
      const checkTimer = () => {
          const now = Date.now();
          const diff = now - (lastBurnTimestamp || 0); 

          if (diff >= BURN_COOLDOWN_MS) {
              setTimeLeft(0);
          } else {
              setTimeLeft(BURN_COOLDOWN_MS - diff);
          }
      };
      
      checkTimer();
      const interval = setInterval(checkTimer, 1000);
      return () => clearInterval(interval);
  }, [lastBurnTimestamp]);

  const formatTime = (ms: number) => {
      if (ms <= 0) return "READY";
      const d = Math.floor(ms / (1000 * 60 * 60 * 24));
      const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      return `${d}d ${h}h ${m}m ${s}s`;
  };

  // Filter Transactions for current user, apply search/filter, and sort
  const myTransactions = useMemo(() => {
      let filtered = transactions
        .filter(t => t.userId === user.id)
        .sort((a, b) => b.timestamp - a.timestamp);

      // Apply Search
      if (historySearch) {
          const lowerSearch = historySearch.toLowerCase();
          filtered = filtered.filter(t => t.description.toLowerCase().includes(lowerSearch));
      }

      // Apply Type Filter (IN/OUT)
      if (historyFilter !== 'ALL') {
          filtered = filtered.filter(t => t.type === historyFilter);
      }

      // Apply Token Filter (RUN/GOV)
      if (historyTokenFilter !== 'ALL') {
          filtered = filtered.filter(t => t.token === historyTokenFilter);
      }

      return filtered;
  }, [transactions, user.id, historySearch, historyFilter, historyTokenFilter]);

  // Pagination Logic (Based on filtered results)
  const totalHistoryPages = Math.ceil(myTransactions.length / TRANSACTIONS_PER_PAGE);
  const currentHistory = myTransactions.slice(
      (historyPage - 1) * TRANSACTIONS_PER_PAGE,
      (historyPage) * TRANSACTIONS_PER_PAGE
  );

  const handleSearchChange = (val: string) => {
      setHistorySearch(val);
      setHistoryPage(1); // Reset to page 1 on search
  };

  const handleFilterChange = (type: 'ALL' | 'IN' | 'OUT') => {
      setHistoryFilter(type);
      setHistoryPage(1); // Reset to page 1 on filter change
  };

  const handleTokenFilterChange = (token: 'ALL' | 'RUN' | 'GOV') => {
      setHistoryTokenFilter(token);
      setHistoryPage(1);
  };

  const formatDate = (ts: number) => {
      const d = new Date(ts);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
               <WalletIcon className="text-emerald-400" size={32} /> {t('wallet.title')}
            </h1>
            <p className="text-gray-400 text-sm">{tRich('wallet.subtitle')}</p>
         </div>
         
         {/* External Wallet Connect */}
         {/* <button 
            onClick={() => setIsWalletConnected(!isWalletConnected)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border ${
              isWalletConnected 
                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/50' 
                : 'glass-panel text-gray-400 hover:text-white'
            }`}
          >
             {isWalletConnected ? <><CheckCircle size={16}/> 0x71...9A23</> : <><LinkIcon size={16}/> {t('wallet.connect')}</>}
          </button> */}
      </div>

      {/* PERSONAL BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Activity size={100} />
              </div>
              <div>
                  <p className="text-gray-400 text-xs font-bold tracking-wider mb-1">{t('wallet.available_run')}</p>
                  <h2 className="text-3xl font-mono font-bold text-emerald-400">{user.runBalance.toFixed(2)}</h2>
                  <p className="text-xs text-gray-500 mt-1">{tRich('wallet.utility_token')}</p>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 border border-emerald-500/20">
                  <Activity size={32} />
              </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Crown size={100} />
              </div>
              <div>
                  <p className="text-gray-400 text-xs font-bold tracking-wider mb-1">{t('wallet.available_gov')}</p>
                  <h2 className="text-3xl font-mono font-bold text-cyan-400">{user.govBalance.toFixed(1)}</h2>
                  <p className="text-xs text-gray-500 mt-1">{tRich('wallet.gov_token')}</p>
              </div>
               <div className="bg-cyan-500/10 p-4 rounded-full text-cyan-400 border border-cyan-500/20">
                  <Crown size={32} />
              </div>
          </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COL: ACTIONS & HISTORY --- */}
        <div className="flex flex-col gap-6 h-full">
            
            <WalletActions 
                govBalance={user.govBalance}
                govToRunRate={govToRunRate}
                onBuyFiat={onBuyFiat}
                onSwapGovToRun={onSwapGovToRun}
            />

            {/* RECENT TRANSACTIONS PREVIEW (Non-filtered, just last 5) */}
            <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                       <History size={16} className="text-gray-400"/> {t('wallet.recent_activity')}
                   </h3>
                   <button 
                     onClick={() => {
                         setHistoryPage(1);
                         setHistorySearch('');
                         setHistoryFilter('ALL');
                         setHistoryTokenFilter('ALL');
                         setShowHistoryModal(true);
                     }}
                     className="text-[10px] text-emerald-400 hover:underline"
                   >
                       {t('wallet.view_all')}
                   </button>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                    {/* FILTER: Exclude 'ITEM' type from the preview widget */}
                    {transactions.filter(t => t.userId === user.id && t.token !== 'ITEM').length === 0 ? (
                        <div className="text-center text-gray-500 py-8 text-xs">No recent transactions.</div>
                    ) : (
                        transactions
                            .filter(t => t.userId === user.id && t.token !== 'ITEM')
                            .sort((a,b) => b.timestamp - a.timestamp)
                            .slice(0, 5)
                            .map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'IN' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-gray-700/30 text-gray-400'}`}>
                                        {tx.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-200 line-clamp-1" title={tx.description}>{tx.description}</div>
                                        <div className="text-[10px] text-gray-500">{formatDate(tx.timestamp)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-mono text-xs font-bold ${tx.token === 'GOV' ? 'text-cyan-400' : (tx.type === 'IN' ? 'text-emerald-400' : 'text-white')}`}>
                                        {tx.type === 'IN' ? '+' : '-'}{tx.amount.toFixed(2)} {tx.token}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase">{tx.token}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* --- RIGHT COL: CHARTS --- */}
        <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
            <WalletCharts 
                transactions={transactions} 
                runBalance={user.runBalance}
                govBalance={user.govBalance}
            />
        </div>
      </div>
      
      {/* Burn Stats Footer */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border-red-500/20">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-600"></div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
             <Flame size={150} className="text-red-500" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
             <div className="bg-red-500/10 p-4 rounded-full border border-red-500/30">
                <Flame size={32} className="text-red-500 animate-pulse" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">{t('wallet.burn_event')}</h3>
                <p className="text-gray-400 text-sm">{tRich('wallet.next_burn')} <span className="text-white font-mono">{formatTime(timeLeft)}</span></p>
             </div>
          </div>

          <div className="flex gap-8 text-center relative z-10">
             <div>
                <span className="block text-2xl font-bold font-mono text-white">{((totalBurned || 0) / 1000000).toFixed(2)}</span>
                <span className="text-xs text-gray-500 uppercase font-bold">{t('wallet.run_burned')}</span>
             </div>
             <div>
                <span className="block text-2xl font-bold font-mono text-white">2%</span>
                <span className="text-xs text-gray-500 uppercase font-bold">{t('wallet.tax_rate')}</span>
             </div>
          </div>
      </div>

      {/* FULL HISTORY MODAL WITH FILTERS */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
              
              {/* Header & Filters */}
              <div className="p-6 border-b border-gray-700 bg-gray-900 rounded-t-2xl space-y-4">
                 <div className="flex justify-between items-center">
                     <h3 className="text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                         <History className="text-emerald-400" /> {t('wallet.trans_history')}
                     </h3>
                     <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                        <X size={20}/>
                     </button>
                 </div>

                 {/* Filters Row */}
                 <div className="flex flex-col sm:flex-row gap-3">
                     <div className="relative flex-1">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                         <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            value={historySearch}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                         />
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {/* Type Filters */}
                         <button 
                            onClick={() => handleFilterChange('ALL')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${historyFilter === 'ALL' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:text-white'}`}
                         >
                             All
                         </button>
                         <button 
                            onClick={() => handleFilterChange('IN')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1 ${historyFilter === 'IN' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:text-emerald-400'}`}
                         >
                             <ArrowDownLeft size={14} /> In
                         </button>
                         <button 
                            onClick={() => handleFilterChange('OUT')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1 ${historyFilter === 'OUT' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:text-gray-300'}`}
                         >
                             <ArrowUpRight size={14} /> Out
                         </button>

                         <div className="w-px bg-gray-700 mx-1"></div>

                         {/* Token Filters */}
                         <button 
                            onClick={() => handleTokenFilterChange('RUN')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${historyTokenFilter === 'RUN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:text-emerald-400'}`}
                         >
                             RUN
                         </button>
                         <button 
                            onClick={() => handleTokenFilterChange('GOV')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${historyTokenFilter === 'GOV' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' : 'bg-gray-800 text-gray-400 border border-gray-600 hover:text-cyan-400'}`}
                         >
                             GOV
                         </button>
                     </div>
                 </div>
              </div>
              
              {/* List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                 {currentHistory.length === 0 ? (
                     <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                         <Filter size={32} className="mb-3 opacity-20"/>
                         <p>No transactions found.</p>
                     </div>
                 ) : (
                     currentHistory.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${tx.type === 'IN' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-gray-700/30 text-gray-400'}`}>
                                    {tx.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{tx.description}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{formatDate(tx.timestamp)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-mono text-sm font-bold ${tx.token === 'GOV' ? 'text-cyan-400' : (tx.type === 'IN' ? 'text-emerald-400' : (tx.token === 'ITEM' ? 'text-gray-300' : 'text-white'))}`}>
                                    {tx.type === 'IN' ? '+' : '-'}{tx.amount.toFixed(2)} {tx.token === 'ITEM' ? 'RUN' : tx.token}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-end gap-1">
                                    {tx.token === 'ITEM' ? 'Item Cost' : (
                                        <><CheckCircle size={10} className="text-emerald-500" /> Confirmed</>
                                    )}
                                </div>
                            </div>
                        </div>
                     ))
                 )}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
                  <Pagination 
                     currentPage={historyPage} 
                     totalPages={totalHistoryPages} 
                     onPageChange={setHistoryPage} 
                  />
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Wallet;