
import React from 'react';
import { Scroll, Map, Shield, Coins, TrendingUp, Zap, Footprints, ArrowLeft, ShoppingBag, Award } from 'lucide-react';

interface GameRulesProps {
  onBack?: () => void;
}

const GameRules: React.FC<GameRulesProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 pb-20">
      
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} /> Back
        </button>
      )}

      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Scroll className="text-emerald-400" /> Game Rules & Logic
      </h1>

      <p className="text-xl text-gray-400 leading-relaxed">
        ZoneRun operates on a dual-token economy. <strong className="text-emerald-400">RUN</strong> is the utility currency you earn by moving. <strong className="text-cyan-400">GOV</strong> is the governance token that signifies power and rank.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Basics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Footprints className="text-emerald-400"/> 1. Moving & Earning
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-2">
             Physical activity is the engine of the economy.
           </p>
           <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
             <li><strong>Rate:</strong> 1 KM = 10 RUN tokens.</li>
             <li><strong>Sync:</strong> Manually log your run location and distance in the Dashboard.</li>
             <li><strong>Yield:</strong> Owned zones generate passive RUN automatically.</li>
           </ul>
        </div>

        {/* 2. Zones */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Map className="text-purple-400"/> 2. How to get GOV
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-2">
             GOV tokens are scarce. There are only 5 ways to get them:
           </p>
           <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
             <li><strong>Mint Zone:</strong> Pay 50 RUN to create a new zone. <span className="text-cyan-400">Reward: +5 GOV</span>.</li>
             <li><strong>Conquer:</strong> Pay 500 RUN to take a zone. <span className="text-cyan-400">Reward: +10 GOV</span>.</li>
             <li><strong>Missions:</strong> Complete goals (e.g., "Own 10 distinct Zones" or "Capture a Capital City") for bounties.</li>
             <li><strong>Market:</strong> Buy "Supply Crates" using RUN.</li>
             <li><strong>Fiat:</strong> Purchase directly with USD in Wallet.</li>
           </ul>
        </div>

        {/* 3. Market */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-emerald-500/30">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <ShoppingBag className="text-emerald-400"/> 3. Marketplace & Items
           </h2>
           <p className="text-gray-300 text-sm leading-relaxed mb-3">
             The Marketplace accepts <strong>RUN</strong> only. Use your running earnings to gain a strategic advantage.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <div className="text-amber-400 font-bold flex items-center gap-1 mb-1"><Zap size={16}/> Yield Boost</div>
                 <p className="text-xs text-gray-400">Increases zone interest rate massively for a period of time.</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <div className="text-cyan-400 font-bold flex items-center gap-1 mb-1"><Shield size={16}/> Zone Shield</div>
                 <p className="text-xs text-gray-400">Protects a zone from being conquered for a period of time.</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <div className="text-emerald-400 font-bold flex items-center gap-1 mb-1"><Coins size={16}/> GOV Packs</div>
                 <p className="text-xs text-gray-400">Convert your RUN earnings into liquid GOV tokens.</p>
              </div>
           </div>
        </div>

        {/* 4. Burn Cycle */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors md:col-span-2">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Coins className="text-red-400"/> 4. The Burn Protocol & Weekly Rewards
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-4">
             To maintain the value of RUN, a "Burn Event" is triggered weekly by the Admins. This removes a percentage of RUN from circulation.
           </p>
           <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
              <h4 className="text-white font-bold mb-2">Proportional Airdrop</h4>
              <p className="text-sm text-gray-300">
                 When the burn happens, loyal players receive a <strong>GOV Airdrop</strong> calculated dynamically:
              </p>
              <div className="flex gap-4 mt-3 text-xs font-mono text-cyan-400">
                  <span>[ Total KM / 5 ]</span>
                  <span>+</span>
                  <span>[ Owned Zones * 10 ]</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GameRules;
