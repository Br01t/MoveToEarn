
import React, { useState } from 'react';
import { User } from '../types';
import { Flame, Link as LinkIcon, Wallet as WalletIcon, CheckCircle, CreditCard, Euro, TrendingUp, Lock, Activity, ArrowRight, Crown, History, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Pagination from './Pagination';
import { useLanguage } from '../LanguageContext';

interface WalletProps {
  user: User;
  onBuyFiat: (amount: number) => void;
}

const TRANSACTIONS_PER_PAGE = 7;

// Mock Data: RUN Supply (Inflationary - Linear/Exponential growth)
const runSupplyData = [
  { month: 'Jan', supply: 10.5 },
  { month: 'Feb', supply: 12.2 },
  { month: 'Mar', supply: 14.8 },
  { month: 'Apr', supply: 18.5 },
  { month: 'May', supply: 23.0 },
  { month: 'Jun', supply: 28.5 },
  { month: 'Jul', supply: 35.0 },
];

// Mock Data: GOV Supply (Hard Cap - Logarithmic approach)
const govSupplyData = [
  { month: 'Jan', supply: 10 },
  { month: 'Feb', supply: 25 },
  { month: 'Mar', supply: 38 },
  { month: 'Apr', supply: 45 },
  { month: 'May', supply: 48 },
  { month: 'Jun', supply: 49.2 },
  { month: 'Jul', supply: 49.8 }, // Approaching 50M Cap
];

// Expanded Mock Transactions
const mockTransactions = [
    { id: 1, type: 'IN', token: 'RUN', amount: '+55.00', label: 'Run Reward', date: '2h ago', status: 'Confirmed' },
    { id: 2, type: 'OUT', token: 'RUN', amount: '-250.00', label: 'Market Purchase', date: '5h ago', status: 'Confirmed' },
    { id: 3, type: 'IN', token: 'GOV', amount: '+10.00', label: 'Zone Conquest', date: '1d ago', status: 'Confirmed' },
    { id: 4, type: 'OUT', token: 'RUN', amount: '-50.00', label: 'Mint Fee', date: '2d ago', status: 'Confirmed' },
    { id: 5, type: 'IN', token: 'RUN', amount: '+12.50', label: 'Run Reward', date: '3d ago', status: 'Confirmed' },
    { id: 6, type: 'OUT', token: 'GOV', amount: '-50.00', label: 'Premium Sub', date: '4d ago', status: 'Confirmed' },
    { id: 7, type: 'IN', token: 'GOV', amount: '+500.00', label: 'Fiat Purchase', date: '5d ago', status: 'Confirmed' },
    { id: 8, type: 'OUT', token: 'RUN', amount: '-500.00', label: 'Boost Item', date: '6d ago', status: 'Confirmed' },
    { id: 9, type: 'IN', token: 'RUN', amount: '+8.20', label: 'Run Reward', date: '1w ago', status: 'Confirmed' },
    { id: 10, type: 'IN', token: 'RUN', amount: '+15.00', label: 'Daily Yield', date: '1w ago', status: 'Confirmed' },
    { id: 11, type: 'OUT', token: 'RUN', amount: '-50.00', label: 'Mint Fee', date: '1w ago', status: 'Confirmed' },
    { id: 12, type: 'IN', token: 'GOV', amount: '+5.00', label: 'Mint Reward', date: '1w ago', status: 'Confirmed' },
    { id: 13, type: 'IN', token: 'GOV', amount: '+25.00', label: 'Mission Reward', date: '2w ago', status: 'Confirmed' },
    { id: 14, type: 'IN', token: 'RUN', amount: '+100.00', label: 'Welcome Bonus', date: '2w ago', status: 'Confirmed' },
    { id: 15, type: 'OUT', token: 'RUN', amount: '-250.00', label: 'Shield Item', date: '2w ago', status: 'Confirmed' },
    { id: 16, type: 'IN', token: 'RUN', amount: '+4.50', label: 'Run Reward', date: '3w ago', status: 'Confirmed' },
    { id: 17, type: 'IN', token: 'RUN', amount: '+11.20', label: 'Daily Yield', date: '3w ago', status: 'Confirmed' },
];

const Wallet: React.FC<WalletProps> = ({ user, onBuyFiat }) => {
  const { t } = useLanguage();
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const handleFiatPurchase = () => {
      const val = parseFloat(fiatAmount);
      if (isNaN(val) || val <= 0) return;
      onBuyFiat(val);
      setFiatAmount('');
  };

  // Pagination Logic
  const totalHistoryPages = Math.ceil(mockTransactions.length / TRANSACTIONS_PER_PAGE);
  const currentHistory = mockTransactions.slice(
      (historyPage - 1) * TRANSACTIONS_PER_PAGE,
      historyPage * TRANSACTIONS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
               <WalletIcon className="text-emerald-400" size={32} /> {t('wallet.title')}
            </h1>
            <p className="text-gray-400 text-sm">{t('wallet.subtitle')}</p>
         </div>
         
         {/* External Wallet Connect */}
         <button 
            onClick={() => setIsWalletConnected(!isWalletConnected)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border ${
              isWalletConnected 
                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/50' 
                : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'
            }`}
          >
             {isWalletConnected ? <><CheckCircle size={16}/> 0x71...9A23</> : <><LinkIcon size={16}/> {t('wallet.connect')}</>}
          </button>
      </div>

      {/* PERSONAL BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Activity size={100} />
              </div>
              <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('wallet.available_run')}</p>
                  <h2 className="text-3xl font-mono font-bold text-emerald-400">{user.runBalance.toFixed(2)}</h2>
                  <p className="text-xs text-gray-500 mt-1">{t('wallet.utility_token')}</p>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 border border-emerald-500/20">
                  <Activity size={32} />
              </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Crown size={100} />
              </div>
              <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('wallet.available_gov')}</p>
                  <h2 className="text-3xl font-mono font-bold text-cyan-400">{user.govBalance.toFixed(2)}</h2>
                  <p className="text-xs text-gray-500 mt-1">{t('wallet.gov_token')}</p>
              </div>
               <div className="bg-cyan-500/10 p-4 rounded-full text-cyan-400 border border-cyan-500/20">
                  <Crown size={32} />
              </div>
          </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COL: FIAT ON-RAMP & HISTORY --- */}
        <div className="flex flex-col gap-6 h-full">
            
            {/* BUY CARD */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <CreditCard size={120} className="text-white" />
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        {t('wallet.buy_gov')}
                    </h2>
                    <p className="text-gray-400 text-xs mb-6">
                        {t('wallet.buy_desc')} <br/>
                        {t('wallet.rate')}: <span className="text-white font-mono">€1.00 ≈ 10.00 GOV</span>
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('wallet.you_pay')}</label>
                            <div className="flex items-center bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-colors">
                                <Euro size={20} className="text-gray-400 mr-2" />
                                <input 
                                    type="number" 
                                    value={fiatAmount}
                                    onChange={(e) => setFiatAmount(e.target.value)}
                                    placeholder="50.00"
                                    className="bg-transparent text-white font-bold w-full focus:outline-none"
                                />
                                <span className="text-xs font-bold text-gray-500">EUR</span>
                            </div>
                        </div>

                        <div className="flex justify-center text-gray-500">
                            <ArrowRight size={16} className="rotate-90 md:rotate-0" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('wallet.you_receive')}</label>
                            <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3">
                                <Crown size={20} className="text-cyan-400 mr-2" fill="currentColor" fillOpacity={0.2} />
                                <span className="text-white font-bold w-full">
                                    {fiatAmount ? (parseFloat(fiatAmount) * 10).toFixed(2) : '0.00'}
                                </span>
                                <span className="text-xs font-bold text-cyan-400">GOV</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleFiatPurchase}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {t('wallet.proceed_payment')}
                        </button>
                        <p className="text-[10px] text-center text-gray-500">{t('wallet.secured_by')}</p>
                    </div>
                </div>
            </div>

            {/* RECENT TRANSACTIONS PREVIEW */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                       <History size={16} className="text-gray-400"/> {t('wallet.recent_activity')}
                   </h3>
                   <button 
                     onClick={() => {
                         setHistoryPage(1);
                         setShowHistoryModal(true);
                     }}
                     className="text-[10px] text-emerald-400 hover:underline"
                   >
                       {t('wallet.view_all')}
                   </button>
                </div>
                <div className="space-y-3 flex-1">
                    {mockTransactions.slice(0, 4).map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${tx.type === 'IN' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-gray-700/30 text-gray-400'}`}>
                                    {tx.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-200">{tx.label}</div>
                                    <div className="text-[10px] text-gray-500">{tx.date}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-mono text-xs font-bold ${tx.token === 'GOV' ? 'text-cyan-400' : (tx.type === 'IN' ? 'text-emerald-400' : 'text-white')}`}>
                                    {tx.amount} {tx.token}
                                </div>
                                <div className="text-[10px] text-gray-500">{tx.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* --- RIGHT COL: CHARTS --- */}
        <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
            
            {/* RUN SUPPLY CHART */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="text-emerald-400" size={18} /> 
                            {t('wallet.run_supply')}
                        </h3>
                        <p className="text-xs text-gray-400">{t('wallet.total_circulating')}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                            {t('wallet.inflationary')}
                        </div>
                    </div>
                </div>
                
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={runSupplyData}>
                            <defs>
                                <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value: number) => [`${value}M`, 'Supply']}
                            />
                            <Area type="monotone" dataKey="supply" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRun)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 p-2 rounded">
                   <TrendingUp size={12} className="text-emerald-500" />
                   <span>{t('wallet.supply_increases')}</span>
                </div>
            </div>

            {/* GOV SUPPLY CHART */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Lock className="text-cyan-400" size={18} /> 
                            {t('wallet.gov_supply')}
                        </h3>
                        <p className="text-xs text-gray-400">{t('wallet.minted_vs_cap')}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 uppercase tracking-wider">
                            {t('wallet.hard_cap')}
                        </div>
                    </div>
                </div>
                
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={govSupplyData}>
                            <defs>
                                <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                            <YAxis hide domain={[0, 55]} /> {/* Fixed domain to show cap approach */}
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#06b6d4' }}
                                formatter={(value: number) => [`${value}M`, 'Circulating']}
                            />
                            {/* The Cap Line */}
                            <Area type="monotone" dataKey="supply" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorGov)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                 <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 p-2 rounded">
                   <Lock size={12} className="text-cyan-500" />
                   <span>{t('wallet.deflationary')}</span>
                </div>
            </div>

        </div>
      </div>
      
      {/* Burn Stats Footer */}
      <div className="bg-gray-800 rounded-2xl border border-red-900/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-600"></div>
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
             <Flame size={150} className="text-red-500" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
             <div className="bg-red-500/10 p-4 rounded-full">
                <Flame size={32} className="text-red-500 animate-pulse" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white">{t('wallet.burn_event')}</h3>
                <p className="text-gray-400 text-sm">{t('wallet.next_burn')} <span className="text-white font-mono">48:20:10</span></p>
             </div>
          </div>

          <div className="flex gap-8 text-center relative z-10">
             <div>
                <span className="block text-2xl font-bold text-white">4.2M</span>
                <span className="text-xs text-gray-500 uppercase font-bold">{t('wallet.run_burned')}</span>
             </div>
             <div>
                <span className="block text-2xl font-bold text-white">12.5%</span>
                <span className="text-xs text-gray-500 uppercase font-bold">{t('wallet.tax_rate')}</span>
             </div>
          </div>
      </div>

      {/* FULL HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <History className="text-emerald-400" /> {t('wallet.trans_history')}
                 </h3>
                 <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                    <X size={20}/>
                 </button>
              </div>
              
              {/* List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                 {currentHistory.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${tx.type === 'IN' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-gray-700/30 text-gray-400'}`}>
                                {tx.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{tx.label}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{tx.date}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono text-sm font-bold ${tx.token === 'GOV' ? 'text-cyan-400' : (tx.type === 'IN' ? 'text-emerald-400' : 'text-white')}`}>
                                {tx.amount} {tx.token}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center justify-end gap-1">
                                {tx.status === 'Confirmed' && <CheckCircle size={10} className="text-emerald-500" />}
                                {tx.status}
                            </div>
                        </div>
                    </div>
                 ))}
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