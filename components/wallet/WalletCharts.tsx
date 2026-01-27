import React, { useMemo, useState } from 'react';
import { Activity, Lock, TrendingUp, Flame, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, YAxis, XAxis, CartesianGrid, BarChart, Bar } from 'recharts';
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

  const formatBalance = (num: number) => {
      return num.toLocaleString('en-US', {
          useGrouping: false,
          minimumFractionDigits: 0, 
          maximumFractionDigits: 2
      });
  };

  // --- LOGICA BALANCE AD ALTA RISOLUZIONE (Ogni Transazione) ---
  const { runHistory, govHistory } = useMemo(() => {
      // Ordiniamo le transazioni dalla più recente alla più vecchia per il calcolo retroattivo
      const sortedTx = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
      
      const runData: any[] = [];
      const govData: any[] = [];

      let currentRun = runBalance;
      let currentGov = govBalance;

      // Punto iniziale: Adesso
      const now = Date.now();
      runData.push({ 
          timestamp: now, 
          value: currentRun, 
          desc: 'Current Balance',
          type: 'STATUS'
      });
      govData.push({ 
          timestamp: now, 
          value: currentGov, 
          desc: 'Current Balance',
          type: 'STATUS'
      });

      sortedTx.forEach(tx => {
          if (tx.token === 'RUN' || tx.token === 'ITEM') {
              runData.push({
                  timestamp: tx.timestamp,
                  value: currentRun,
                  desc: tx.description,
                  amount: tx.amount,
                  txType: tx.type
              });
              // Torniamo indietro nel tempo: se l'operazione era IN (entrata), prima il saldo era minore
              if (tx.type === 'IN') currentRun -= tx.amount;
              else currentRun += tx.amount;
              currentRun = Math.max(0, currentRun);
          } else if (tx.token === 'GOV') {
              govData.push({
                  timestamp: tx.timestamp,
                  value: currentGov,
                  desc: tx.description,
                  amount: tx.amount,
                  txType: tx.type
              });
              if (tx.type === 'IN') currentGov -= tx.amount;
              else currentGov += tx.amount;
              currentGov = Math.max(0, currentGov);
          }
      });

      // Se non ci sono transazioni, aggiungiamo un punto nel passato per mostrare una linea piatta
      if (runData.length === 1) runData.push({ timestamp: now - 86400000, value: currentRun, desc: 'Initial' });
      if (govData.length === 1) govData.push({ timestamp: now - 86400000, value: currentGov, desc: 'Initial' });

      return { 
          runHistory: runData.sort((a,b) => a.timestamp - b.timestamp), 
          govHistory: govData.sort((a,b) => a.timestamp - b.timestamp)
      };
  }, [transactions, runBalance, govBalance]);

  // --- LOGICA BURN PERSONALE (Aggregata per Giorno) ---
  const userBurnHistory = useMemo(() => {
    const burnMap: Record<string, number> = {};
    
    transactions.forEach(tx => {
        const desc = (tx.description || '').toLowerCase();
        if (
            tx.token === 'RUN' && 
            tx.type === 'OUT' &&
            (desc.includes('burn') || desc.includes('tax') || desc.includes('distruzione'))
        ) {
            const d = new Date(tx.timestamp);
            const dateKey = d.toISOString().split('T')[0]; 
            burnMap[dateKey] = (burnMap[dateKey] || 0) + tx.amount;
        }
    });

    const result = Object.keys(burnMap).sort().map(key => {
        const d = new Date(key);
        return {
            timestamp: d.getTime(),
            dateLabel: `${d.getDate()}/${d.getMonth()+1}`,
            amount: burnMap[key]
        };
    });

    if (result.length === 0) return [{ timestamp: Date.now(), dateLabel: 'Today', amount: 0 }];
    return result;
  }, [transactions]);

  const totalPersonalBurned = useMemo(() => {
    return userBurnHistory.reduce((acc, curr) => acc + curr.amount, 0);
  }, [userBurnHistory]);

  // Formattatori per gli assi
  const formatYAxis = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return Math.round(num).toString();
  };

  const formatDateAxis = (ts: number) => {
      const d = new Date(ts);
      return `${d.getDate()}/${d.getMonth()+1}`;
  };

  // Tooltip Custom per mostrare le descrizioni delle transazioni
  const CustomTooltip = ({ active, payload, label, color }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      return (
        <div className="glass-panel-heavy p-3 rounded-lg border border-white/10 shadow-2xl">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{date}</p>
          <p className="text-sm font-bold text-white mb-1">
             {payload[0].value.toFixed(2)} <span className="text-[10px] text-gray-400 font-mono">TOKEN</span>
          </p>
          {data.desc && (
              <div className="pt-1 mt-1 border-t border-white/5 flex items-start gap-2">
                  <Info size={10} className="mt-0.5 text-gray-400 shrink-0" />
                  <p className="text-[10px] text-gray-300 leading-tight italic">{data.desc}</p>
              </div>
          )}
          {data.amount && (
              <p className={`text-[9px] font-black mt-1 ${data.txType === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.txType === 'IN' ? '+' : '-'}{data.amount.toFixed(2)}
              </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* RUN CHART */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20"></div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {runChartType === 'BALANCE' ? <Activity className="text-emerald-400" size={20} /> : <Flame className="text-orange-500" size={20} />}
                        {runChartType === 'BALANCE' ? 'RUN Balance' : 'RUN Burned'}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-3xl font-mono font-bold ${runChartType === 'BALANCE' ? 'text-emerald-400' : 'text-orange-500'}`}>
                            {runChartType === 'BALANCE' ? formatBalance(runBalance) : totalPersonalBurned.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            {runChartType === 'BALANCE' ? 'Current' : 'Total Burn Contribution'}
                        </span>
                    </div>
                </div>
                
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 shrink-0">
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
            
            <div className="w-full h-[250px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    {runChartType === 'BALANCE' ? (
                        <AreaChart data={runHistory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                            <XAxis 
                                dataKey="timestamp" 
                                type="number" 
                                domain={['dataMin', 'dataMax']} 
                                tickFormatter={formatDateAxis}
                                stroke="#6b7280" 
                                tick={{fontSize: 10}} 
                                tickLine={false} 
                                axisLine={false} 
                                minTickGap={50} 
                            />
                            <YAxis stroke="#6b7280" tick={{fontSize: 10}} tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={35} />
                            <Tooltip content={<CustomTooltip color="#10b981" />} />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRun)" animationDuration={1000} />
                        </AreaChart>
                    ) : (
                        <BarChart data={userBurnHistory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                            <XAxis dataKey="dateLabel" stroke="#6b7280" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" tick={{fontSize: 10}} tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={35} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#f97316' }}
                                formatter={(value: number) => [value.toFixed(2), 'Burned']}
                            />
                            <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>

        {/* GOV CHART */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-lg border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20"></div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lock className="text-cyan-400" size={20} /> 
                        GOV Balance History
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-mono font-bold text-cyan-400">
                            {govBalance.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current Holdings</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded border border-cyan-500/20 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={12} /> Holdings
                    </div>
                </div>
            </div>
            
            <div className="w-full h-[250px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={govHistory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                        <XAxis 
                            dataKey="timestamp" 
                            type="number" 
                            domain={['dataMin', 'dataMax']} 
                            tickFormatter={formatDateAxis}
                            stroke="#6b7280" 
                            tick={{fontSize: 10}} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={50} 
                        />
                        <YAxis stroke="#6b7280" tick={{fontSize: 10}} tickFormatter={formatYAxis} tickLine={false} axisLine={false} width={35} />
                        <Tooltip content={<CustomTooltip color="#06b6d4" />} />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorGov)" animationDuration={1000} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default WalletCharts;