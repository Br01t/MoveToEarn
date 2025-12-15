
import React, { useMemo } from 'react';
import { Activity, Lock, TrendingUp, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis, CartesianGrid, ReferenceLine, Label } from 'recharts';
import { useLanguage } from '../../LanguageContext';
import { Transaction } from '../../types';

interface WalletChartsProps {
    transactions: Transaction[];
}

const WalletCharts: React.FC<WalletChartsProps> = ({ transactions }) => {
  const { t } = useLanguage();
  const GOV_CAP = 100000;

  // Process Transactions for RUN and GOV Supply
  const { runData, govData, currentRunTotal, currentGovTotal } = useMemo(() => {
      const sortedTx = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
      const dailyMap = new Map<string, { runChange: number, govChange: number, timestamp: number }>();

      sortedTx.forEach(tx => {
          const dateKey = new Date(tx.timestamp).toISOString().split('T')[0];
          if (!dailyMap.has(dateKey)) {
              dailyMap.set(dateKey, { runChange: 0, govChange: 0, timestamp: tx.timestamp });
          }
          const entry = dailyMap.get(dateKey)!;
          if (tx.token === 'RUN') {
              entry.runChange += (tx.type === 'IN' ? tx.amount : -tx.amount);
          } else if (tx.token === 'GOV') {
              entry.govChange += (tx.type === 'IN' ? tx.amount : -tx.amount);
          }
      });

      const runChartData: { date: string, supply: number, fullDate: string }[] = [
          { date: 'Gen', supply: 0, fullDate: 'Genesis' }
      ];
      const govChartData: { date: string, supply: number, fullDate: string }[] = [
          { date: 'Gen', supply: 0, fullDate: 'Genesis' }
      ];
      
      let runningRun = 0;
      let runningGov = 0;

      const sortedDays = Array.from(dailyMap.values()).sort((a, b) => a.timestamp - b.timestamp);

      sortedDays.forEach(day => {
          runningRun += day.runChange;
          runningGov += day.govChange;
          
          const d = new Date(day.timestamp);
          const label = `${d.getDate()}/${d.getMonth()+1}`;

          runChartData.push({ date: label, supply: Math.max(0, runningRun), fullDate: d.toDateString() });
          govChartData.push({ date: label, supply: Math.max(0, runningGov), fullDate: d.toDateString() });
      });

      if (sortedDays.length === 0) {
          const today = new Date();
          const label = `${today.getDate()}/${today.getMonth()+1}`;
          runChartData.push({ date: label, supply: 0, fullDate: today.toDateString() });
          govChartData.push({ date: label, supply: 0, fullDate: today.toDateString() });
      }

      return { 
          runData: runChartData, 
          govData: govChartData,
          currentRunTotal: runningRun,
          currentGovTotal: runningGov
      };
  }, [transactions]);

  const govPercentage = Math.min(100, (currentGovTotal / GOV_CAP) * 100);
  
  // Format numbers for axis (e.g. 1500 -> 1.5k)
  const formatYAxis = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toString();
  };

  // Logic for GOV Chart Scale:
  // If minted < 10% of cap, use 'auto' scale to show the trend curve clearly (avoid flat line).
  // If minted > 10%, use fixed [0, GOV_CAP] to visually show we are filling the "cup" towards the limit.
  const govDomain = currentGovTotal > (GOV_CAP * 0.1) ? [0, GOV_CAP] : [0, 'auto'];

  return (
    <div className="space-y-6 h-full flex flex-col">
        
        {/* RUN SUPPLY CHART */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="text-emerald-400" size={20} /> 
                        {t('wallet.run_supply')}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-mono font-bold text-emerald-400">
                            {currentRunTotal.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total RUN</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                        {t('wallet.inflationary')}
                    </div>
                </div>
            </div>
            
            {/* Cartesian Chart Area */}
            <div className="w-full h-[300px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={runData} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        
                        <XAxis 
                            dataKey="date" 
                            stroke="#9ca3af" 
                            tick={{fontSize: 10}} 
                            tickLine={false}
                            axisLine={{ stroke: '#4b5563' }}
                            dy={10}
                        >
                            <Label value="Time (Date)" offset={0} position="insideBottom" className="fill-gray-500 text-[10px] font-bold uppercase" dy={10} />
                        </XAxis>
                        
                        <YAxis 
                            stroke="#9ca3af" 
                            tick={{fontSize: 10}} 
                            tickFormatter={formatYAxis}
                            tickLine={false}
                            axisLine={false}
                            // Add 10% headroom so the curve doesn't hit the ceiling
                            domain={[0, 'dataMax * 1.1']}
                        >
                             <Label value="Token Quantity" angle={-90} position="insideLeft" className="fill-gray-500 text-[10px] font-bold uppercase" style={{ textAnchor: 'middle' }} />
                        </YAxis>

                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#10b981' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                            formatter={(value: number) => [value.toLocaleString(), 'RUN']}
                            labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                        />
                        
                        <Area 
                            type="monotone" 
                            dataKey="supply" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorRun)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* GOV SUPPLY CHART */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lock className="text-cyan-400" size={20} /> 
                        {t('wallet.gov_supply')}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-mono font-bold text-cyan-400">
                            {currentGovTotal.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">/ {GOV_CAP.toLocaleString()}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded border border-cyan-500/20 uppercase tracking-wider">
                        {govPercentage.toFixed(1)}% MINTED
                    </div>
                </div>
            </div>
            
            {/* Cartesian Chart Area */}
            <div className="w-full h-[300px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={govData} margin={{ top: 20, right: 10, left: 15, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        
                        <XAxis 
                            dataKey="date" 
                            stroke="#9ca3af" 
                            tick={{fontSize: 10}} 
                            tickLine={false}
                            axisLine={{ stroke: '#4b5563' }}
                            dy={10}
                        >
                             <Label value="Time (Date)" offset={0} position="insideBottom" className="fill-gray-500 text-[10px] font-bold uppercase" dy={10} />
                        </XAxis>

                        <YAxis 
                            stroke="#9ca3af" 
                            tick={{fontSize: 10}} 
                            tickFormatter={formatYAxis}
                            tickLine={false}
                            axisLine={false}
                            // Hybrid Domain: Auto scale when low to show curve, Fixed scale when high to show limit
                            domain={govDomain as any} 
                        >
                            <Label value="Token Quantity" angle={-90} position="insideLeft" className="fill-gray-500 text-[10px] font-bold uppercase" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        
                        {/* Reference Line for the Cap (only visible if within domain or scaled out) */}
                        <ReferenceLine 
                            y={GOV_CAP} 
                            stroke="#06b6d4" 
                            strokeDasharray="4 4" 
                            strokeOpacity={0.6}
                            label={{ position: 'insideTopRight', value: 'HARD CAP', fill: '#06b6d4', fontSize: 10, dy: -10 }} 
                        />

                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#06b6d4' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                            formatter={(value: number) => [value.toLocaleString(), 'GOV']}
                            labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                        />
                        
                        <Area 
                            type="monotone" 
                            dataKey="supply" 
                            stroke="#06b6d4" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorGov)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default WalletCharts;