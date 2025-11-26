
import React from 'react';
import { Scroll, Map, Shield, Coins } from 'lucide-react';

const GameRules: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Scroll className="text-emerald-400" /> Game Rules
      </h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Map size={24} className="text-emerald-400"/> Territory & Conquest</h2>
          <p className="mb-4">
            ZoneRun divides the world into hexagonal zones. Users explore new zones by physically running and syncing their activity.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 ml-2">
            <li><strong>Discovery:</strong> If a zone does not exist, you can mint it for <span className="text-white">100 RUN</span>.</li>
            <li><strong>Yield:</strong> Each zone generates a passive RUN interest rate (1% - 3%) for its owner.</li>
            <li><strong>Conquest:</strong> If you run more kilometers in a zone than the current owner's record, you can challenge them.</li>
          </ul>
        </section>

        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Shield size={24} className="text-blue-400"/> Defense & Strategy</h2>
          <p className="mb-4">
            Holding a zone requires strategy. Other players will try to beat your record.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-400 ml-2">
            <li><strong>Reinforce:</strong> Running repeatedly in your own zones increases the defense difficulty (Record KM).</li>
            <li><strong>Items:</strong> Use GOV tokens to buy Shields and Defense Multipliers from the marketplace.</li>
            <li><strong>Boost:</strong> Burn GOV tokens to permanently increase the APY (Yield) of a zone you own.</li>
          </ul>
        </section>

        <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Coins size={24} className="text-yellow-400"/> Tokenomics & Burn</h2>
          <p>
            The ecosystem balances itself through a weekly <strong>Burn Event</strong>. A percentage of global RUN is burned to maintain scarcity. 
            Active players are rewarded with <span className="text-cyan-400">GOV (Governance)</span> tokens based on distance run and territories held.
          </p>
        </section>
      </div>
    </div>
  );
};

export default GameRules;
