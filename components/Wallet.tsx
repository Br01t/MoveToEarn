
import React, { useState } from 'react';
import { User } from '../types';
import { Flame, Link as LinkIcon, Wallet as WalletIcon, CheckCircle, CreditCard, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface WalletProps {
  user: User;
  onBuyFiat: (amountUSD: number) => void;
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

const Wallet: React.FC<WalletProps> = ({ user, onBuyFiat }) => {
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleFiatPurchase = () => {
      const val = parseFloat(fiatAmount);
      if (isNaN(val) || val <= 0) return;
      onBuyFiat(val);
      setFiatAmount('');
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
        
        {/* Transaction Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 h-fit">
          <div className="mb-6">
             <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <CreditCard className="text-cyan-400" /> Buy GOV Token
             </h2>
             <p className="text-gray-400 text-sm">Purchase Governance tokens directly with fiat currency to increase your voting power.</p>
          </div>

          <div className="space-y-6 animate-fade-in">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <label className="block text-xs text-gray-400 mb-2">Pay with USD ($)</label>
                  <div className="flex justify-between items-center">
                      <input 
                      type="number" 
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(e.target.value)}
                      placeholder="100.00"
                      className="bg-transparent text-2xl font-bold text-white focus:outline-none w-2/3"
                      />
                      <DollarSign className="text-gray-500" />
                  </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <label className="block text-xs text-gray-400 mb-2">You Receive (Est.)</label>
                  <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-cyan-400">
                          {fiatAmount ? (parseFloat(fiatAmount) * 10).toFixed(2) : '0.00'}
                      </span>
                      <span className="font-bold text-gray-300">GOV</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Rate: $1.00 ≈ 10.00 GOV</p>
              </div>

              <button 
                  onClick={handleFiatPurchase}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
              >
                  Purchase GOV
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
