
import React from 'react';
import { Scroll, ArrowLeft, Target, Coins, Shield, Zap, Map as MapIcon, RefreshCw, Flame, Trophy, Activity, Globe, Scale, Users, Award, Sword, Crown, ShoppingBag, Package, Wallet, User as UserIcon } from 'lucide-react';
import { ViewState } from '../../types';
import { useLanguage } from '../../LanguageContext';

interface GameRulesProps {
  onBack?: () => void;
  onNavigate?: (view: ViewState) => void;
}

const GameRules: React.FC<GameRulesProps> = ({ onBack, onNavigate }) => {
  const { t } = useLanguage();

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-700 pb-4 mt-12 first:mt-0">
          <Icon className="text-emerald-400" size={32} /> {title}
      </h2>
  );

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden pb-24">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto p-6 md:p-8 relative z-10">
        
        {/* Nav */}
        <div className="mb-12">
            {onBack && (
              <button 
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 backdrop-blur-sm"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="font-bold text-sm">{t('rules.back')}</span>
              </button>
            )}
        </div>

        {/* Title */}
        <div className="text-center mb-20">
            <div className="inline-flex p-4 bg-gray-800/80 rounded-full border border-gray-700 mb-6 shadow-2xl backdrop-blur-md">
                <Scroll className="text-emerald-400" size={48} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-2">
              {t('rules.title')}
            </h1>
            <p className="text-xl text-gray-400 font-light">{t('rules.subtitle')}</p>
            <span className="inline-block mt-4 text-xs font-mono text-emerald-500/60 border border-emerald-500/20 px-3 py-1 rounded-full">
                {t('rules.version')}
            </span>
        </div>

        <div className="space-y-16">

            {/* 1. CONCEPT */}
            <section className="bg-gray-800/30 p-8 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                <SectionHeader icon={Globe} title={t('rules.sec1.title')} />
                <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">
                    {t('rules.sec1.desc')}
                </p>
            </section>

            {/* 2. TOKENOMICS */}
            <section>
                <SectionHeader icon={Scale} title={t('rules.sec2.title')} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/80 p-6 rounded-2xl border-l-4 border-emerald-500 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="text-emerald-400" size={24} />
                            <h3 className="text-xl font-bold text-white">{t('rules.sec2.run')}</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{t('rules.sec2.run_desc')}</p>
                    </div>
                    <div className="bg-gray-800/80 p-6 rounded-2xl border-l-4 border-cyan-500 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Crown className="text-cyan-400" size={24} />
                            <h3 className="text-xl font-bold text-white">{t('rules.sec2.gov')}</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{t('rules.sec2.gov_desc')}</p>
                    </div>
                </div>
            </section>

            {/* 3. ZONES */}
            <section>
                <SectionHeader icon={MapIcon} title={t('rules.sec3.title')} />
                <p className="text-gray-300 mb-8 max-w-3xl">{t('rules.sec3.desc')}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pool Logic */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Coins size={20} className="text-yellow-400"/> {t('rules.sec3.pool')}
                        </h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {t('rules.sec3.pool_text')}
                        </p>
                        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-gray-700/50 text-center">
                            <code className="text-emerald-400 font-bold text-sm">Pool Growth = Σ(Runner KM)</code>
                        </div>
                    </div>

                    {/* Distribution Logic */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <RefreshCw size={20} className="text-blue-400"/> {t('rules.sec3.dist')}
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-red-900/30 rounded text-red-400 shrink-0"><Sword size={18}/></div>
                                <div>
                                    <strong className="text-white text-sm block mb-1">{t('rules.sec3.pvp')}</strong>
                                    <p className="text-xs text-gray-400">{t('rules.sec3.pvp_text')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-emerald-900/30 rounded text-emerald-400 shrink-0"><Users size={18}/></div>
                                <div>
                                    <strong className="text-white text-sm block mb-1">{t('rules.sec3.passive')}</strong>
                                    <p className="text-xs text-gray-400">{t('rules.sec3.passive_text')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. COSTS TABLE */}
            <section>
                <SectionHeader icon={Target} title={t('rules.sec4.title')} />
                
                <div className="overflow-hidden rounded-2xl border border-gray-700 shadow-xl">
                    <table className="w-full text-left bg-gray-800">
                        <thead className="bg-gray-900 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">{t('rules.sec4.action')}</th>
                                <th className="px-6 py-4">{t('rules.sec4.cost')}</th>
                                <th className="px-6 py-4">{t('rules.sec4.reward')}</th>
                                <th className="px-6 py-4 hidden md:table-cell">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 text-sm">
                            {/* Mint */}
                            <tr className="hover:bg-gray-750/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                    <MapIcon className="text-emerald-400" size={18}/> {t('rules.sec4.mint')}
                                </td>
                                <td className="px-6 py-4 font-mono text-red-300">150</td>
                                <td className="px-6 py-4 font-mono text-cyan-400 font-bold">+15</td>
                                <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{t('rules.sec4.mint_desc')}</td>
                            </tr>
                            {/* Conquer */}
                            <tr className="hover:bg-gray-750/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                    <Sword className="text-red-400" size={18}/> {t('rules.sec4.conquer')}
                                </td>
                                <td className="px-6 py-4 font-mono text-red-300">350</td>
                                <td className="px-6 py-4 font-mono text-cyan-400 font-bold">+25</td>
                                <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{t('rules.sec4.conq_desc')}</td>
                            </tr>
                            {/* Shield */}
                            <tr className="hover:bg-gray-750/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                    <Shield className="text-blue-400" size={18}/> {t('rules.sec4.shield')}
                                </td>
                                <td className="px-6 py-4 font-mono text-red-300">500</td>
                                <td className="px-6 py-4 text-gray-500">-</td>
                                <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{t('rules.sec4.shield_desc')}</td>
                            </tr>
                            {/* Boost */}
                            <tr className="hover:bg-gray-750/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                    <Zap className="text-yellow-400" size={18}/> {t('rules.sec4.boost')}
                                </td>
                                <td className="px-6 py-4 font-mono text-red-300">300</td>
                                <td className="px-6 py-4 text-gray-500">-</td>
                                <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{t('rules.sec4.boost_desc')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 5. MACRO ECONOMY */}
            <section>
                <SectionHeader icon={RefreshCw} title={t('rules.sec5.title')} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Earning Rates */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col h-full">
                        <div className="mb-4 bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <Activity className="text-emerald-400" size={24} />
                        </div>
                        <h4 className="font-bold text-white mb-3">{t('rules.sec5.earn')}</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div> {t('rules.sec5.earn_base')}</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> {t('rules.sec5.earn_boost')}</li>
                        </ul>
                    </div>

                    {/* Swap */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col h-full">
                        <div className="mb-4 bg-cyan-900/30 w-12 h-12 rounded-full flex items-center justify-center border border-cyan-500/30">
                            <RefreshCw className="text-cyan-400" size={24} />
                        </div>
                        <h4 className="font-bold text-white mb-2">{t('rules.sec5.swap')}</h4>
                        <p className="text-xs text-gray-400 mb-4 flex-1">{t('rules.sec5.swap_text')}</p>
                        <div className="bg-black/30 text-cyan-400 font-mono font-bold text-center py-2 rounded border border-cyan-500/30 text-sm">
                            {t('rules.sec5.swap_rate')}
                        </div>
                    </div>

                    {/* Burn */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col h-full">
                        <div className="mb-4 bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center border border-red-500/30">
                            <Flame className="text-red-500" size={24} />
                        </div>
                        <h4 className="font-bold text-white mb-2">{t('rules.sec5.burn')}</h4>
                        <p className="text-xs text-gray-400 flex-1">{t('rules.sec5.burn_text')}</p>
                    </div>
                </div>
            </section>

            {/* 6. PROGRESSION - REWRITTEN GENERIC */}
            <section>
                <SectionHeader icon={Trophy} title={t('rules.sec6.title')} />
                
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">
                        {t('rules.sec6.content')}
                    </p>
                    <div className="p-6 bg-gray-900 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Award className="text-yellow-400" size={16}/> Reward Logic
                            </h4>
                            <p className="text-sm text-gray-400">
                                <span dangerouslySetInnerHTML={{ __html: t('rules.sec6.rewards').replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-bold">$1</span>') }} />
                            </p>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <div className="flex flex-col items-center gap-1 bg-gray-800 p-3 rounded-lg border border-emerald-500/20">
                                <Target className="text-emerald-400" size={24} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Mission</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">+ RUN</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 bg-gray-800 p-3 rounded-lg border border-cyan-500/20">
                                <Trophy className="text-cyan-400" size={24} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Rare</span>
                                <span className="text-xs font-mono font-bold text-cyan-400">+ GOV</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. NAVIGATION GUIDE (NEW SECTION) */}
            <section>
                <SectionHeader icon={Globe} title={t('rules.nav.title')} />
                <p className="text-gray-400 mb-8">{t('rules.nav.desc')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Dashboard */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><MapIcon size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.dash')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.dash_desc')}</p>
                    </div>

                    {/* Market */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><ShoppingBag size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.market')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.market_desc')}</p>
                    </div>

                    {/* Inventory */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Package size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.inv')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.inv_desc')}</p>
                    </div>

                    {/* Missions */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Target size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.miss')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.miss_desc')}</p>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Trophy size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.rank')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.rank_desc')}</p>
                    </div>

                    {/* Wallet */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Wallet size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.wallet')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.wallet_desc')}</p>
                    </div>

                    {/* Profile */}
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-colors md:col-span-2 lg:col-span-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><UserIcon size={20}/></div>
                            <h4 className="font-bold text-white text-sm">{t('rules.nav.profile')}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{t('rules.nav.profile_desc')}</p>
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