
import React, { useMemo, useState } from 'react';
import { Activity, Lock, TrendingUp, Flame } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { useLanguage } from '../../LanguageContext';
import { Transaction } from '../../types';

interface WalletChartsProps {
    transactions: Transaction[];
    runBalance: number;
    govBalance: number;
}

const WalletCharts: React.FC<WalletChartsProps> = ({ transactions, runBalance, govBalance }) => {
  const { t } = useLanguage();
  const [runChartType, setRunChartType] = useState<'BALANCE' | 'BURNED'>('BALANCE');

  // BACKWARDS CALCULATION ALGORITHM (Balance History)
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
              runHistory.push({ 
                  date: label, 
                  value: currentRun, 
                  fullDate: d.toDateString(),
                  timestamp: tx.timestamp
              });
              if (tx.type === 'IN') currentRun -= tx.amount;
              else currentRun += tx.amount;
              currentRun = Math.max(0, currentRun);
          } else if (tx.token === 'GOV') {
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

      // Push initial state
      if (runHistory.length > 0) {
          const lastPt = runHistory[runHistory.length - 1];
          if (lastPt.date !== 'Start') {
              runHistory.push({ date: 'Start', value: currentRun, fullDate: 'Genesis', timestamp: lastPt.timestamp - 60000 });
          }
      } else {
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

      return { 
          runData: runHistory.reverse(), 
          govData: govHistory.reverse()
      };
  }, [transactions, runBalance, govBalance]);

  // BURNED (SPENT) HISTOGRAM DATA
  // Aggregates 'OUT' transactions of type RUN by day
  const runBurnData = useMemo(() => {
    const burnMap: Record<string, number> = {};
    const sortedTx = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    sortedTx.forEach(tx => {
        if (
            tx.token === 'RUN' && 
            tx.type === 'OUT' &&
            tx.description === 'Global Burn Protocol' 
        ) {
            const d = new Date(tx.timestamp);
            // Use ISO date string (YYYY-MM-DD) for sorting key, but display simplified label
            const dateKey = d.toISOString().split('T')[0]; 
            const label = `${d.getDate()}/${d.getMonth()+1}`;
            
            if (!burnMap[dateKey]) burnMap[dateKey] = 0;
            burnMap[dateKey] += tx.amount;
        }
    });

    // Convert map to array and sort by date
    const result = Object.keys(burnMap).sort().map(key => {
        const d = new Date(key);
        const label = `${d.getDate()}/${d.getMonth()+1}`;
        return {
            date: label,
            fullDate: key,
            amount: burnMap[key]
        };
    });

    if (result.length === 0) return [{ date: 'Today', fullDate: new Date().toISOString().split('T')[0], amount: 0 }];

    return result;
}, [transactions]);

  // Format numbers for axis (e.g. 1500 -> 1.5k)
  const formatYAxis = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toString();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        
        {/* RUN CHART (TOGGLEABLE) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border-emerald-500/20 relative">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {runChartType === 'BALANCE' ? <Activity className="text-emerald-400" size={20} /> : <Flame className="text-orange-500" size={20} />}
                        {runChartType === 'BALANCE' ? 'RUN Balance' : 'RUN Burned'}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-3xl font-mono font-bold ${runChartType === 'BALANCE' ? 'text-emerald-400' : 'text-orange-500'}`}>
                            {runChartType === 'BALANCE' 
                                ? runBalance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})
                                : transactions.filter(t => t.token === 'RUN' && t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0).toLocaleString(undefined, {maximumFractionDigits: 0})
                            }
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            {runChartType === 'BALANCE' ? 'Current' : 'Total Spent'}
                        </span>
                    </div>
                </div>
                
                {/* Toggle Switch */}
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                    <button 
                        onClick={() => setRunChartType('BALANCE')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${runChartType === 'BALANCE' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t('wallet.chart.balance')}
                    </button>
                    <button 
                        onClick={() => setRunChartType('BURNED')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${runChartType === 'BURNED' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t('wallet.chart.burned')}
                    </button>
                </div>
            </div>
            
            {/* Chart Area */}
            <div className="w-full h-[250px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    {runChartType === 'BALANCE' ? (
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
                    ) : (
                        <BarChart data={runBurnData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 10}} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis stroke="#6b7280" tick={{fontSize: 10}} tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={35} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#f97316' }}
                                formatter={(value: number) => [value.toLocaleString(), 'RUN Burned']}
                                labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                            />
                            <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
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