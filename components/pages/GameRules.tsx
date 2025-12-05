
import React from 'react';
import { Scroll, Map, Shield, Coins, TrendingUp, Zap, Footprints, ArrowLeft, ShoppingBag, Route, Upload, Globe, Crown, Lock, FileText, CheckCircle, HelpCircle, AlertTriangle, Target, Calculator, Database, Siren, Flame, Gift, Clock, Trophy, Star, Medal } from 'lucide-react';
import { ViewState } from '../../types';

interface GameRulesProps {
  onBack?: () => void;
  onNavigate?: (view: ViewState) => void;
}

const GameRules: React.FC<GameRulesProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-40 left-[-100px] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto p-6 md:p-8 relative z-10">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="font-bold text-sm">Dashboard</span>
              </button>
            )}
            {onNavigate && (
              <button 
                  onClick={() => onNavigate('HOW_TO_PLAY' as any)}
                  className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                  <HelpCircle size={18} /> 
                  <span className="font-bold text-sm">Step-by-Step Guide</span>
              </button>
            )}
        </div>

        {/* Title Section */}
        <div className="text-center mb-20 space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-gray-800/50 rounded-full border border-gray-700 mb-2 shadow-2xl">
                <Scroll className="text-emerald-400" size={40} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
              Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Whitepaper</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Technical documentation for the ZoneRun Move-to-Earn ecosystem.
              <br/>
              <span className="text-sm font-mono text-gray-500 mt-2 block">v.1.0.4-MVP // PUBLIC RELEASE</span>
            </p>
        </div>

        <div className="space-y-24">

          {/* SECTION: TOKENOMICS */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Coins className="text-emerald-400" /> Token Economy
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RUN TOKEN */}
                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-8 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><Footprints size={24}/></div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">RUN</h3>
                                <span className="text-xs text-emerald-500 font-mono">UTILITY TOKEN</span>
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-xs text-gray-500 uppercase">Supply</span>
                           <span className="font-mono text-white">Uncapped / Inflationary</span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Generated exclusively through physical movement. It is the fuel of the ecosystem, used for all operational costs.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">Source</span>
                           <span>Running (10 RUN / KM)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">Sink</span>
                           <span>Minting Zones, Marketplace, Contest Fees</span>
                        </div>
                    </div>
                </div>

                {/* GOV TOKEN */}
                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-8 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400"><Crown size={24}/></div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">GOV</h3>
                                <span className="text-xs text-cyan-500 font-mono">VALUE ACCUMULATION</span>
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-xs text-gray-500 uppercase">Supply</span>
                           <span className="font-mono text-white">Deflationary / Hard Cap</span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        The ultimate store of value. It represents prestige and accumulation of wealth within the game. It is not for voting, but for ranking and premium access.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">Source</span>
                           <span>Missions, Conquests, Leaderboard Airdrops</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">Sink</span>
                           <span>Premium Subscriptions, Exclusive Cosmetic Badges</span>
                        </div>
                    </div>
                </div>
             </div>
          </section>

          {/* SECTION: ACHIEVEMENTS & PROGRESSION (NEW) */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Trophy className="text-yellow-400" /> Achievements & Progression
             </h2>
             
             <div className="space-y-6">
                 <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
                     Beyond the simple "Move-to-Earn" mechanic of earning RUN for kilometers, the ZoneRun protocol rewards strategic playstyles through the <strong>Missions System</strong>. 
                     Completing missions is the primary method for "mining" new GOV tokens into your wallet.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Missions Logic */}
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Target className="text-emerald-400" size={20} /> Mission Contracts
                         </h3>
                         <p className="text-sm text-gray-400 mb-4">
                             The system automatically tracks your stats across various categories (Speed, Distance, Exploration, Time of Day). 
                             When criteria are met, the mission is marked as complete and <strong className="text-cyan-400">GOV is instantly credited</strong>.
                         </p>
                         <div className="space-y-3">
                             <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 flex justify-between items-center">
                                 <span className="text-xs text-gray-300 font-bold uppercase">Common Tier</span>
                                 <span className="text-xs font-mono text-emerald-400">+10-20 GOV</span>
                             </div>
                             <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30 flex justify-between items-center">
                                 <span className="text-xs text-cyan-300 font-bold uppercase">Rare Tier</span>
                                 <span className="text-xs font-mono text-cyan-400">+30-50 GOV</span>
                             </div>
                             <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30 flex justify-between items-center">
                                 <span className="text-xs text-purple-300 font-bold uppercase">Epic Tier</span>
                                 <span className="text-xs font-mono text-purple-400">+60-100 GOV</span>
                             </div>
                             <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30 flex justify-between items-center">
                                 <span className="text-xs text-yellow-300 font-bold uppercase">Legendary Tier</span>
                                 <span className="text-xs font-mono text-yellow-400">+150-500 GOV</span>
                             </div>
                         </div>
                     </div>

                     {/* Badges Logic */}
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Medal className="text-yellow-400" size={20} /> Prestige Badges
                         </h3>
                         <p className="text-sm text-gray-400 mb-4">
                             Badges are non-transferable cosmetic proofs of achievement. While they do not grant GOV directly, 
                             collecting badges is required to unlock <strong>"Meta-Missions"</strong> (e.g., "The Collector", "Legendary Runner") which pay out the highest GOV rewards in the game.
                         </p>
                         <ul className="space-y-3 text-sm text-gray-400">
                             <li className="flex gap-2">
                                 <Star size={16} className="text-yellow-400 mt-0.5" />
                                 <span><strong>Visual Prestige:</strong> Equip your rarest badge to display it on the Global Leaderboard and Zone Ownership cards.</span>
                             </li>
                             <li className="flex gap-2">
                                 <Target size={16} className="text-emerald-400 mt-0.5" />
                                 <span><strong>Meta Progression:</strong> Collecting 10 Epic/Legendary badges unlocks the "Legendary Runner" mission worth 250 GOV.</span>
                             </li>
                         </ul>
                     </div>
                 </div>
             </div>
          </section>

          {/* SECTION: BURN & REWARDS */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Flame className="text-red-500" /> Weekly Burn & Rewards
             </h2>
             
             <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Gift size={200} className="text-cyan-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                           <Flame className="text-red-400"/> The Burn Protocol
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                           To maintain the value of RUN, the protocol executes a "Burn Event" every Sunday at 00:00 UTC. 
                           A percentage (typically 10-20%) of the global floating RUN supply is permanently removed from circulation.
                        </p>
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                           <p className="text-red-200 text-xs font-mono">EFFECT: Increases scarcity of RUN tokens.</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                           <TrendingUp className="text-cyan-400"/> Proportional Airdrop
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                           Simultaneously, the protocol mints a fixed supply of GOV tokens and distributes them to active players.
                           Your reward is calculated based on your contribution relative to the total network.
                        </p>
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 font-mono text-xs text-cyan-300 mb-2">
                           Reward = (YourScore / GlobalScore) * Pool
                        </div>
                        <div className="text-xs text-gray-500">
                           <strong>YourScore</strong> = (TotalKM * 0.5) + (ZonesOwned * 10)
                        </div>
                    </div>
                </div>
             </div>
          </section>

          {/* SECTION: MATH & FORMULAS */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Calculator className="text-blue-400" /> Game Math
             </h2>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={120}/></div>
                    <h3 className="text-xl font-bold text-white mb-4">Zone Yield Formula</h3>
                    <div className="font-mono text-sm bg-black/50 p-4 rounded-lg border border-gray-700 mb-4 text-green-400">
                        Yield(min) = (InterestRate * ZoneLevel) / 2
                    </div>
                    <p className="text-sm text-gray-400">
                        Zones generate passive income every 10 minutes based on their Interest Rate. 
                        The rate increases when the owner runs in their own zone (Reinforcement) or applies a Boost item.
                    </p>
                 </div>

                 <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Conquest Logic</h3>
                    <ul className="space-y-4 text-sm text-gray-300">
                        <li className="flex gap-2">
                            <span className="font-bold text-red-400">Requirement:</span>
                            <span>Run KM - Current Zone Record</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-red-400">Cost:</span>
                            <span>50 RUN (Paid to Protocol)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-emerald-400">Reward:</span>
                            <span>Ownership + 10 GOV</span>
                        </li>
                    </ul>
                 </div>
             </div>
          </section>

          {/* SECTION: ITEM DATABASE */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Database className="text-yellow-400" /> Item Database
             </h2>
             
             <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-400 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Cost (RUN)</th>
                                <th className="px-6 py-4">Effect</th>
                                <th className="px-6 py-4">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            <tr className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                    <Shield size={16} className="text-blue-400"/> Zone Shield v1
                                </td>
                                <td className="px-6 py-4"><span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">DEFENSE</span></td>
                                <td className="px-6 py-4 font-mono">250</td>
                                <td className="px-6 py-4 text-gray-300">Prevents conquest attempts</td>
                                <td className="px-6 py-4 text-gray-400">24 Hours</td>
                            </tr>
                            <tr className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                    <Zap size={16} className="text-amber-400"/> Nanofiber Shoes
                                </td>
                                <td className="px-6 py-4"><span className="bg-amber-900/30 text-amber-400 px-2 py-1 rounded text-xs">BOOST</span></td>
                                <td className="px-6 py-4 font-mono">500</td>
                                <td className="px-6 py-4 text-gray-300">+1.0% Yield Rate</td>
                                <td className="px-6 py-4 text-gray-400">24 Hours</td>
                            </tr>
                            <tr className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-cyan-400"/> GOV Supply Crate
                                </td>
                                <td className="px-6 py-4"><span className="bg-cyan-950 text-cyan-400 px-2 py-1 rounded text-xs border border-cyan-500/20 font-bold tracking-wide">SEASONAL / LIMITED</span></td>
                                <td className="px-6 py-4 font-mono">1000</td>
                                <td className="px-6 py-4 text-gray-300">Instant +50 GOV</td>
                                <td className="px-6 py-4 text-gray-400">Instant</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
             </div>

             {/* MARKET SUPPLY EXPLANATION */}
             <div className="bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500 p-6 rounded-r-xl flex items-start gap-4">
                 <div className="bg-yellow-900/30 p-3 rounded-lg text-yellow-400 shrink-0">
                     <Clock size={24} />
                 </div>
                 <div>
                     <h4 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                         Limited Market Availability & Flash Drops
                     </h4>
                     <p className="text-gray-400 text-sm leading-relaxed">
                         Premium items like the <strong>GOV Supply Crate</strong> are <u>not permanently in stock</u>. 
                         They are released in limited quantities during specific <strong>Flash Drops</strong> or scheduled Seasonal Events. 
                         Players must act quickly when stock arrives, as global quantities are strictly scarce.
                     </p>
                 </div>
             </div>
          </section>

          {/* SECTION: FAIR PLAY */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Siren className="text-red-400" /> Fair Play & Anti-Cheat
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">Speed Limitations</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        The protocol is designed for walking, jogging, and running. 
                        Activities exceeding human capabilities are automatically rejected by the Oracle.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 text-center flex-1">
                            <span className="block text-2xl font-bold text-white">3</span>
                            <span className="text-[10px] uppercase text-gray-500">Min KM/H</span>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 text-center flex-1">
                            <span className="block text-2xl font-bold text-red-400">20</span>
                            <span className="text-[10px] uppercase text-gray-500">Max KM/H</span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">Validation Process</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex gap-3 items-start">
                            <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                            <span><strong>Standard (Free):</strong> Files (.gpx) are queued for "Anti-Fraud Parser" analysis. Delay: 1-5 minutes.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            <span><strong>Premium (Pro):</strong> Direct API connection to Strava/Garmin. Trusted device data is accepted instantly.</span>
                        </li>
                    </ul>
                 </div>
             </div>
          </section>

        </div>

        <div className="text-center mt-24 pt-8 border-t border-gray-800 text-gray-600 text-xs font-mono">
            ZONE RUN PROTOCOL // DECENTRALIZED MOVE-TO-EARN // 2025
        </div>

      </div>
    </div>
  );
};

export default GameRules;