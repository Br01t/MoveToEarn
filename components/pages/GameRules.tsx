import React from 'react';
import { Scroll, Map, Shield, Coins, TrendingUp, Zap, Footprints, ArrowLeft } from 'lucide-react';

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
        ZoneRun is a Move-to-Earn ecosystem where physical activity translates into digital territory control.
        Here is how the economy works.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Basics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Footprints className="text-emerald-400"/> 1. The Basics
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-2">
             Every kilometer you run in the real world earns you <strong className="text-emerald-400">RUN tokens</strong>.
           </p>
           <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
             <li>Sync your run via the Dashboard.</li>
             <li>Enter the location name and distance.</li>
             <li>Instant payout to your wallet.</li>
           </ul>
        </div>

        {/* 2. Zones */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Map className="text-purple-400"/> 2. Zones & Conquest
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-2">
             The map is divided into hexagonal zones.
           </p>
           <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
             <li><strong>New Zone:</strong> If you run in a new area, you can pay a fee to MINT it and become the first owner.</li>
             <li><strong>Existing Zone:</strong> If you run in an occupied zone, you reinforce it (if yours) or contest it (if hostile).</li>
             <li><strong>Conquest:</strong> To steal a zone, you must run more total KM in that zone than the current owner's record.</li>
           </ul>
        </div>

        {/* 3. Interest (The Key Update) */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-emerald-500/30">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <TrendingUp className="text-emerald-400"/> 3. Yield & Interest Logic
           </h2>
           <p className="text-gray-300 text-sm leading-relaxed mb-3">
             Owning zones generates passive income. Every zone has an <strong>Interest Rate (APY)</strong>.
           </p>
           <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-2">
              <p className="text-sm text-gray-300">
                <span className="text-emerald-400 font-bold">The Owner</span> takes the majority share of the zone's daily yield.
              </p>
              <p className="text-sm text-gray-300">
                <span className="text-cyan-400 font-bold">Top Runners</span> on the zone's leaderboard also earn a proportional share of the interest.
              </p>
              <p className="text-xs text-gray-500 italic mt-2">
                *Tip: Even if you can't own a zone, running frequently there puts you on the leaderboard and earns you passive rewards!
              </p>
           </div>
        </div>

        {/* 4. Items */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Zap className="text-yellow-400"/> 4. Strategic Items
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed mb-2">
             Spend <strong className="text-cyan-400">GOV</strong> tokens in the Marketplace.
           </p>
           <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
             <li><strong>Boost:</strong> Temporarily doubles the Interest Rate of a zone you own.</li>
             <li><strong>Shield:</strong> Makes your zone immune to conquest for 24 hours.</li>
           </ul>
        </div>

        {/* 5. Burn Cycle */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-colors">
           <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
             <Coins className="text-red-400"/> 5. Burn & Rewards
           </h2>
           <p className="text-gray-400 text-sm leading-relaxed">
             <strong>Weekly Cycle:</strong> A percentage of all RUN tokens spent on minting and fees is BURNED to ensure scarcity.
             <br/><br/>
             Active users are rewarded with newly minted <strong>GOV tokens</strong> based on their activity (Total KM) and Zones held during the cycle.
           </p>
        </div>
      </div>
    </div>
  );
};

export default GameRules;