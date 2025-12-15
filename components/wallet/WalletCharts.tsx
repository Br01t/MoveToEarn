
import React, { useMemo } from 'react';
import { Activity, Lock, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis, CartesianGrid, Label } from 'recharts';
import { useLanguage } from '../../LanguageContext';
import { Transaction } from '../../types';

interface WalletChartsProps {
    transactions: Transaction[];
    runBalance: number;
    govBalance: number;
}

const WalletCharts: React.FC<WalletChartsProps> = ({ transactions, runBalance, govBalance }) => {
  const { t } = useLanguage();

  // BACKWARDS CALCULATION ALGORITHM
  // 1. Start with current Balance (The Truth)
  // 2. Iterate transactions newest -> oldest to reconstruct history
  // 3. Ensure the graph extends to the first transaction event
  const { runData, govData } = useMemo(() => {
      // Sort newest first
      const sortedTx = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
      
      const runHistory: { date: string, value: number, fullDate: string, timestamp: number }[] = [];
      const govHistory: { date: string, value: number, fullDate: string, timestamp: number }[] = [];

      let currentRun = runBalance;
      let currentGov = govBalance;

      // Add "Now" point to anchor the graph at current time
      const now = new Date();
      runHistory.push({ date: 'Now', value: currentRun, fullDate: now.toDateString(), timestamp: now.getTime() });
      govHistory.push({ date: 'Now', value: currentGov, fullDate: now.toDateString(), timestamp: now.getTime() });

      sortedTx.forEach(tx => {
          const d = new Date(tx.timestamp);
          const label = `${d.getDate()}/${d.getMonth()+1}`;
          
          if (tx.token === 'RUN') {
              // 1. Record state AT transaction time (balance AFTER transaction happened)
              runHistory.push({ 
                  date: label, 
                  value: currentRun, 
                  fullDate: d.toDateString(),
                  timestamp: tx.timestamp
              });
              
              // 2. Calculate balance BEFORE this transaction
              if (tx.type === 'IN') currentRun -= tx.amount;
              else currentRun += tx.amount;
              
              // Clamp to 0 to handle potential data gaps gracefully
              currentRun = Math.max(0, currentRun);
          } else if (tx.token === 'GOV') {
              // Same logic for GOV
              govHistory.push({ 
                  date: label, 
                  value: currentGov,
                  fullDate: d.toDateString(),
                  timestamp: tx.timestamp
              });
              
              if (tx.type === 'IN') currentGov -= tx.amount;
              else currentGov += tx.amount;
              
              currentGov = Math.max(0, currentGov);
          }
      });

      // Push initial state (before first transaction).
      // We use the timestamp of the oldest transaction minus 1 minute to show the "start from 0" (or initial balance)
      if (runHistory.length > 0) {
          const lastPt = runHistory[runHistory.length - 1];
          // Don't duplicate if last point is practically same time
          if (lastPt.date !== 'Start') {
              runHistory.push({ date: 'Start', value: currentRun, fullDate: 'Genesis', timestamp: lastPt.timestamp - 60000 });
          }
      } else {
          // No history at all
          runHistory.push({ date: 'Start', value: currentRun, fullDate: 'Genesis', timestamp: now.getTime() - 60000 });
      }

      if (govHistory.length > 0) {
          const lastPt = govHistory[govHistory.length - 1];
          if (lastPt.date !== 'Start') {
              govHistory.push({ date: 'Start', value: currentGov, fullDate: 'Genesis', timestamp: lastPt.timestamp - 60000 });
          }
      } else {
          govHistory.push({ date: 'Start', value: currentGov, fullDate: 'Genesis', timestamp: now.getTime() - 60000 });
      }

      // Reverse to chronological order (Old -> New) for Charting
      return { 
          runData: runHistory.reverse(), 
          govData: govHistory.reverse()
      };
  }, [transactions, runBalance, govBalance]);

  // Format numbers for axis (e.g. 1500 -> 1.5k)
  const formatYAxis = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toString();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        
        {/* RUN PERSONAL CHART */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border-emerald-500/20">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="text-emerald-400" size={20} /> 
                        RUN Balance History
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-mono font-bold text-emerald-400">
                            {runBalance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={12} /> Personal Trend
                    </div>
                </div>
            </div>
            
            {/* Chart Area */}
            <div className="w-full h-[250px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={runData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 10}} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="#6b7280" tick={{fontSize: 10}} tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={35} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#10b981' }}
                            formatter={(value: number) => [value.toLocaleString(), 'RUN']}
                            labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRun)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* GOV PERSONAL CHART */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border-cyan-500/20">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lock className="text-cyan-400" size={20} /> 
                        GOV Balance History
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-mono font-bold text-cyan-400">
                            {govBalance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded border border-cyan-500/20 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={12} /> Holdings
                    </div>
                </div>
            </div>
            
            {/* Chart Area */}
            <div className="w-full h-[250px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={govData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 10}} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis stroke="#6b7280" tick={{fontSize: 10}} tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={35} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#06b6d4' }}
                            formatter={(value: number) => [value.toLocaleString(), 'GOV']}
                            labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                        />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorGov)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default WalletCharts;