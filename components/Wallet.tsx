import React, { useState } from 'react';
import { User } from '../types';
import { ArrowRightLeft, Flame, TrendingUp, Link as LinkIcon, Wallet as WalletIcon, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface WalletProps {
  user: User;
  onExchange: (from: 'RUN' | 'GOV', amount: number) => void;
}

// Mock chart data for RUN
const runData = [
  { name: 'Mon', value: 0.45 },
  { name: 'Tue', value: 0.48 },
  { name: 'Wed', value: 0.52 },
  { name: 'Thu', value: 0.49 },
  { name: 'Fri', value: 0.55 },
  { name: 'Sat', value: 0.60 },
  { name: 'Sun', value: 0.65 },
];

// Mock chart data for GOV
const govData = [
  { name: 'Mon', value: 4.20 },
  { name: 'Tue', value: 4.15 },
  { name: 'Wed', value: 4.30 },
  { name: 'Thu', value: 4.50 },
  { name: 'Fri', value: 4.80 },
  { name: 'Sat', value: 5.10 },
  { name: 'Sun', value: 5.25 },
];

const Wallet: React.FC<WalletProps> = ({ user, onExchange }) => {
  const [exchangeAmount, setExchangeAmount] = useState<string>('');
  const [direction, setDirection] = useState<'RUN_TO_GOV' | 'GOV_TO_RUN'>('RUN_TO_GOV');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Exchange rate: 10 RUN = 1 GOV
  const RATE = 10; 

  const handleSwap = () => {
    const val = parseFloat(exchangeAmount);
    if (isNaN(val) || val <= 0) return;
    
    if (direction === 'RUN_TO_GOV') {
        if (user.runBalance >= val) onExchange('RUN', val);
    } else {
        if (user.govBalance >= val) onExchange('GOV', val);
    }
    setExchangeAmount('');
  };

  const getEstimatedOutput = () => {
    const val = parseFloat(exchangeAmount);
    if (isNaN(val)) return 0;
    return direction === 'RUN_TO_GOV' ? val / RATE : val * RATE;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* Wallet Connection Status */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isWalletConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                <WalletIcon size={24} />
             </div>
             <div>
                <h3 className="text-white font-bold text-lg">External Wallet</h3>
                <p className="text-gray-400 text-sm">
                  {isWalletConnected ? 'Connected: 0x71C...9A23' : 'Connect your Web3 wallet to withdraw tokens.'}
                </p>
             </div>
          </div>
          <button 
            onClick={() => setIsWalletConnected(!isWalletConnected)}
            className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
              isWalletConnected 
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
             {isWalletConnected ? <><CheckCircle size={18}/> Connected</> : <><LinkIcon size={18}/> Connect Wallet</>}
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Swap Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRightLeft className="text-emerald-400" /> Token Swap
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <label className="block text-xs text-gray-400 mb-2">You Pay</label>
              <div className="flex justify-between items-center">
                <input 
                  type="number" 
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-2xl font-bold text-white focus:outline-none w-1/2"
                />
                <button 
                  onClick={() => setDirection(direction === 'RUN_TO_GOV' ? 'GOV_TO_RUN' : 'RUN_TO_GOV')}
                  className="bg-gray-800 px-3 py-1 rounded text-sm font-bold border border-gray-600 hover:border-white transition-colors"
                >
                  {direction === 'RUN_TO_GOV' ? 'RUN' : 'GOV'}
                </button>
              </div>
              <div className="text-right text-xs text-gray-500 mt-2">
                Balance: {direction === 'RUN_TO_GOV' ? user.runBalance.toFixed(2) : user.govBalance.toFixed(2)}
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setDirection(prev => prev === 'RUN_TO_GOV' ? 'GOV_TO_RUN' : 'RUN_TO_GOV')} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <ArrowRightLeft size={20} className="text-gray-300" />
              </button>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <label className="block text-xs text-gray-400 mb-2">You Receive (Estimated)</label>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-emerald-400">{getEstimatedOutput().toFixed(2)}</span>
                <span className="font-bold text-gray-300">
                  {direction === 'RUN_TO_GOV' ? 'GOV' : 'RUN'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleSwap}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Swap Tokens
            </button>
          </div>
        </div>

        {/* Info & Stats */}
        <div className="space-y-8">
           {/* Burn Mechanism Card */}
           <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Flame size={120} className="text-red-500" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Flame className="text-red-500" /> Weekly Burn Event
             </h2>
             <p className="text-gray-400 text-sm mb-4 leading-relaxed">
               Every week, a percentage of the total RUN supply is burned to stabilize the economy. 
               Active users are rewarded with newly minted <span className="text-cyan-400 font-bold">GOV</span> tokens 
               based on their <span className="text-white">Total Distance (KM)</span> and <span className="text-white">Zones Owned</span>.
             </p>
             <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
               <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
             </div>
             <p className="text-xs text-right text-gray-500">Next Burn: 2 Days 04:23:12</p>
           </div>

           {/* Charts Grid */}
           <div className="grid grid-cols-1 gap-4">
              {/* RUN Chart */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 h-48">
                <h3 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                  RUN Price
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={runData}>
                    <defs>
                      <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRun)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* GOV Chart */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 h-48">
                <h3 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                  GOV Price
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={govData}>
                    <defs>
                      <linearGradient id="colorGov" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorGov)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Wallet;