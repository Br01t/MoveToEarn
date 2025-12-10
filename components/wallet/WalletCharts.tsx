
import React from 'react';
import { Activity, Lock, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLanguage } from '../../LanguageContext';

const runSupplyData = [
  { month: 'Jan', supply: 10.5 },
  { month: 'Feb', supply: 12.2 },
  { month: 'Mar', supply: 14.8 },
  { month: 'Apr', supply: 18.5 },
  { month: 'May', supply: 23.0 },
  { month: 'Jun', supply: 28.5 },
  { month: 'Jul', supply: 35.0 },
];

const govSupplyData = [
  { month: 'Jan', supply: 10 },
  { month: 'Feb', supply: 25 },
  { month: 'Mar', supply: 38 },
  { month: 'Apr', supply: 45 },
  { month: 'May', supply: 48 },
  { month: 'Jun', supply: 49.2 },
  { month: 'Jul', supply: 49.8 },
];

const WalletCharts: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 h-full flex flex-col">
        
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
                        <YAxis hide domain={[0, 55]} /> 
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#06b6d4' }}
                            formatter={(value: number) => [`${value}M`, 'Circulating']}
                        />
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
  );
};

export default WalletCharts;