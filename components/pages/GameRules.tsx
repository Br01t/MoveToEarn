
import React from 'react';
import { Scroll, Map, Shield, Coins, TrendingUp, Zap, Footprints, ArrowLeft, ShoppingBag, Route, Upload, Globe, Crown, Lock, FileText, CheckCircle, HelpCircle, AlertTriangle, Target, Calculator, Database, Siren, Flame, Gift, Clock, Trophy, Star, Medal } from 'lucide-react';
import { ViewState } from '../../types';
import { useLanguage } from '../../LanguageContext';

interface GameRulesProps {
  onBack?: () => void;
  onNavigate?: (view: ViewState) => void;
}

const GameRules: React.FC<GameRulesProps> = ({ onBack, onNavigate }) => {
  const { t } = useLanguage();

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
                <span className="font-bold text-sm">{t('rules.back')}</span>
              </button>
            )}
            {onNavigate && (
              <button 
                  onClick={() => onNavigate('HOW_TO_PLAY' as any)}
                  className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-lg hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                  <HelpCircle size={18} /> 
                  <span className="font-bold text-sm">{t('rules.guide')}</span>
              </button>
            )}
        </div>

        {/* Title Section */}
        <div className="text-center mb-20 space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-gray-800/50 rounded-full border border-gray-700 mb-2 shadow-2xl">
                <Scroll className="text-emerald-400" size={40} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
              {t('rules.title')}
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('rules.subtitle')}
              <br/>
              <span className="text-sm font-mono text-gray-500 mt-2 block">{t('rules.version')}</span>
            </p>
        </div>

        <div className="space-y-24">

          {/* SECTION: TOKENOMICS */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Coins className="text-emerald-400" /> {t('rules.tokenomics.title')}
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RUN TOKEN */}
                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-8 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><Footprints size={24}/></div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{t('rules.tokenomics.run.title')}</h3>
                                <span className="text-xs text-emerald-500 font-mono">{t('rules.tokenomics.run.subtitle')}</span>
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-xs text-gray-500 uppercase">Supply</span>
                           <span className="font-mono text-white">{t('rules.tokenomics.run.supply')}</span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {t('rules.tokenomics.run.desc')}
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">{t('rules.tokenomics.run.source_label')}</span>
                           <span>{t('rules.tokenomics.run.source')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">{t('rules.tokenomics.run.sink_label')}</span>
                           <span>{t('rules.tokenomics.run.sink')}</span>
                        </div>
                    </div>
                </div>

                {/* GOV TOKEN */}
                <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700 p-8 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400"><Crown size={24}/></div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{t('rules.tokenomics.gov.title')}</h3>
                                <span className="text-xs text-cyan-500 font-mono">{t('rules.tokenomics.gov.subtitle')}</span>
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-xs text-gray-500 uppercase">Supply</span>
                           <span className="font-mono text-white">{t('rules.tokenomics.gov.supply')}</span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {t('rules.tokenomics.gov.desc')}
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">{t('rules.tokenomics.gov.source_label')}</span>
                           <span>{t('rules.tokenomics.gov.source')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                           <span className="w-16 text-xs font-bold text-gray-500 uppercase">{t('rules.tokenomics.gov.sink_label')}</span>
                           <span>{t('rules.tokenomics.gov.sink')}</span>
                        </div>
                    </div>
                </div>
             </div>
          </section>

          {/* SECTION: ACHIEVEMENTS & PROGRESSION */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Trophy className="text-yellow-400" /> {t('rules.ach.title')}
             </h2>
             
             <div className="space-y-6">
                 <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
                     {t('rules.ach.intro')}
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Missions Logic */}
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Target className="text-emerald-400" size={20} /> {t('rules.missions.title')}
                         </h3>
                         <p className="text-sm text-gray-400 mb-4">
                             {t('rules.missions.desc')}
                         </p>
                         <div className="space-y-3">
                             <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 flex justify-between items-center">
                                 <span className="text-xs text-gray-300 font-bold uppercase">{t('rules.tier.common')}</span>
                                 <span className="text-xs font-mono text-emerald-400">+100-200 RUN</span>
                             </div>
                             <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30 flex justify-between items-center">
                                 <span className="text-xs text-cyan-300 font-bold uppercase">{t('rules.tier.rare')}</span>
                                 <span className="text-xs font-mono text-cyan-400">+300-500 RUN</span>
                             </div>
                             <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30 flex justify-between items-center">
                                 <span className="text-xs text-purple-300 font-bold uppercase">{t('rules.tier.epic')}</span>
                                 <span className="text-xs font-mono text-purple-400">+600-1000 RUN</span>
                             </div>
                             <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30 flex justify-between items-center">
                                 <span className="text-xs text-yellow-300 font-bold uppercase">{t('rules.tier.legendary')}</span>
                                 <span className="text-xs font-mono text-yellow-400">+1500-5000 RUN</span>
                             </div>
                         </div>
                     </div>

                     {/* Badges Logic */}
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <Medal className="text-yellow-400" size={20} /> {t('rules.badges.title')}
                         </h3>
                         <p className="text-sm text-gray-400 mb-4">
                             {t('rules.badges.desc')}
                         </p>
                         <ul className="space-y-3 text-sm text-gray-400">
                             <li className="flex gap-2">
                                 <Star size={16} className="text-yellow-400 mt-0.5" />
                                 <span><strong>{t('rules.badges.visual')}</strong> {t('rules.badges.visual_desc')}</span>
                             </li>
                             <li className="flex gap-2">
                                 <Target size={16} className="text-emerald-400 mt-0.5" />
                                 <span><strong>{t('rules.badges.meta')}</strong> {t('rules.badges.meta_desc')}</span>
                             </li>
                         </ul>
                     </div>
                 </div>
             </div>
          </section>

          {/* SECTION: BURN & REWARDS */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Flame className="text-red-500" /> {t('rules.burn.title')}
             </h2>
             
             <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Gift size={200} className="text-cyan-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                           <Flame className="text-red-400"/> {t('rules.burn.proto_title')}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                           {t('rules.burn.proto_desc')}
                        </p>
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                           <p className="text-red-200 text-xs font-mono">{t('rules.burn.effect')}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                           <TrendingUp className="text-cyan-400"/> {t('rules.burn.airdrop_title')}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                           {t('rules.burn.airdrop_desc')}
                        </p>
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 font-mono text-xs text-cyan-300 mb-2">
                           {t('rules.burn.formula')}
                        </div>
                        <div className="text-xs text-gray-500">
                           {t('rules.burn.calc')}
                        </div>
                    </div>
                </div>
             </div>
          </section>

          {/* SECTION: MATH & FORMULAS */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Calculator className="text-blue-400" /> {t('rules.math.title')}
             </h2>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={120}/></div>
                    <h3 className="text-xl font-bold text-white mb-4">{t('rules.math.yield_title')}</h3>
                    <div className="font-mono text-sm bg-black/50 p-4 rounded-lg border border-gray-700 mb-4 text-green-400">
                        {t('rules.math.yield_formula')}
                    </div>
                    <p className="text-sm text-gray-400">
                        {t('rules.math.yield_desc')}
                    </p>
                 </div>

                 <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">{t('rules.math.conquest_title')}</h3>
                    <ul className="space-y-4 text-sm text-gray-300">
                        <li className="flex gap-2">
                            <span className="font-bold text-red-400">{t('rules.math.req')}</span>
                            <span>{t('rules.math.req_desc')}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-red-400">{t('rules.math.cost')}</span>
                            <span>{t('rules.math.cost_desc')}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-emerald-400">{t('rules.math.reward')}</span>
                            <span>{t('rules.math.reward_desc')}</span>
                        </li>
                    </ul>
                 </div>
             </div>
          </section>

          {/* SECTION: ITEM DATABASE */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Database className="text-yellow-400" /> {t('rules.items.title')}
             </h2>
             
             <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-400 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">{t('rules.items.col_name')}</th>
                                <th className="px-6 py-4">{t('rules.items.col_type')}</th>
                                <th className="px-6 py-4">{t('rules.items.col_cost')}</th>
                                <th className="px-6 py-4">{t('rules.items.col_effect')}</th>
                                <th className="px-6 py-4">{t('rules.items.col_duration')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            <tr className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                    <Shield size={16} className="text-blue-400"/> {t('rules.items.shield')}
                                </td>
                                <td className="px-6 py-4"><span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">DEFENSE</span></td>
                                <td className="px-6 py-4 font-mono">250</td>
                                <td className="px-6 py-4 text-gray-300">{t('rules.items.shield_desc')}</td>
                                <td className="px-6 py-4 text-gray-400">{t('rules.items.shield_dur')}</td>
                            </tr>
                            <tr className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                    <Zap size={16} className="text-amber-400"/> {t('rules.items.shoes')}
                                </td>
                                <td className="px-6 py-4"><span className="bg-amber-900/30 text-amber-400 px-2 py-1 rounded text-xs">BOOST</span></td>
                                <td className="px-6 py-4 font-mono">500</td>
                                <td className="px-6 py-4 text-gray-300">{t('rules.items.shoes_desc')}</td>
                                <td className="px-6 py-4 text-gray-400">{t('rules.items.shoes_dur')}</td>
                            </tr>
                            <tr className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-cyan-400"/> {t('rules.items.crate')}
                                </td>
                                <td className="px-6 py-4"><span className="bg-cyan-950 text-cyan-400 px-2 py-1 rounded text-xs border border-cyan-500/20 font-bold tracking-wide">{t('rules.items.crate_tag')}</span></td>
                                <td className="px-6 py-4 font-mono">1000</td>
                                <td className="px-6 py-4 text-gray-300">{t('rules.items.crate_desc')}</td>
                                <td className="px-6 py-4 text-gray-400">{t('rules.items.crate_dur')}</td>
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
                         {t('rules.market.flash_title')}
                     </h4>
                     <p className="text-gray-400 text-sm leading-relaxed">
                         {t('rules.market.flash_desc')}
                     </p>
                 </div>
             </div>
          </section>

          {/* SECTION: FAIR PLAY */}
          <section>
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <Siren className="text-red-400" /> {t('rules.fair.title')}
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">{t('rules.fair.speed_title')}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('rules.fair.speed_desc')}
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 text-center flex-1">
                            <span className="block text-2xl font-bold text-white">3</span>
                            <span className="text-[10px] uppercase text-gray-500">{t('rules.fair.min_km')}</span>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 text-center flex-1">
                            <span className="block text-2xl font-bold text-red-400">20</span>
                            <span className="text-[10px] uppercase text-gray-500">{t('rules.fair.max_km')}</span>
                        </div>
                    </div>
                 </div>

                 <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">{t('rules.fair.valid_title')}</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex gap-3 items-start">
                            <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                            <span><strong>{t('rules.fair.valid_std')}</strong> {t('rules.fair.valid_std_desc')}</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            <span><strong>{t('rules.fair.valid_pro')}</strong> {t('rules.fair.valid_pro_desc')}</span>
                        </li>
                    </ul>
                 </div>
             </div>
          </section>

        </div>

        <div className="text-center mt-24 pt-8 border-t border-gray-800 text-gray-600 text-xs font-mono">
            {t('rules.footer_text')}
        </div>

      </div>
    </div>
  );
};

export default GameRules;