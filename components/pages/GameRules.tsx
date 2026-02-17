import React from 'react';
import { ArrowLeft, Terminal, Map as MapIcon, ShoppingBag, Package, Target, Trophy, Wallet, User as UserIcon, BookOpen, Activity, Swords, Zap, Coins, Download } from 'lucide-react';
import { ViewState } from '../../types';
import { useLanguage } from '../../LanguageContext';
import LanguageDropdown from '../ui/LanguageDropdown';

interface GameRulesProps {
  onBack?: () => void;
  onNavigate?: (view: ViewState) => void;
  isAuthenticated?: boolean;
}

export const GameRules: React.FC<GameRulesProps> = ({ onBack, onNavigate, isAuthenticated = false }) => {
  const { t, tRich } = useLanguage();

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-700/50 pb-4 mt-16 first:mt-0">
          <Icon className="text-emerald-400" size={32} /> {title}
      </h2>
  );

  const InterfaceCard = ({ icon: Icon, title, desc, className = "" }: { icon: any, title: string, desc: React.ReactNode, className?: string }) => (
    <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 group ${className}`}>
        <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <Icon size={20} />
            </div>
            <h4 className="font-bold text-white text-base">{title}</h4>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed pl-1">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden pb-24 font-sans selection:bg-emerald-500 selection:text-black">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black z-0" />
      
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2310b981' stroke-width='2' stroke-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '56px 98px'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-60 pointer-events-none z-0"></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto p-6 md:p-8 relative z-10">
        
        <div className="mb-12 flex justify-between items-center">
            {onBack ? (
              <button 
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-700 hover:border-emerald-500 backdrop-blur-sm"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="font-bold text-sm">{t('rules.back')}</span>
              </button>
            ) : <div></div>}

            {!isAuthenticated && <LanguageDropdown align="right" />}
        </div>

        <div className="text-center mb-16">
            <div className="inline-flex p-4 glass-panel rounded-full mb-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Terminal className="text-emerald-400 relative z-10" size={48} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
              {t('rules.title')}
            </h1>
            <p className="text-xl text-gray-400 font-light">{t('rules.subtitle')}</p>
            
            <div className="mt-12 text-left glass-panel p-8 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-cyan-500"></div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('rules.intro.title')}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{tRich('rules.intro.body')}</p>
            </div>

            {onNavigate && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                    <button 
                        onClick={() => onNavigate('WHITEPAPER')}
                        className="inline-flex items-center gap-2 px-6 py-3 glass-panel hover:bg-gray-800 rounded-xl transition-all group"
                    >
                        <BookOpen size={18} className="text-cyan-400" />
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white">{t('rules.whitepaper_link')}</span>
                    </button>
                    
                    <button 
                        onClick={() => onNavigate('HOW_TO_PLAY')}
                        className="inline-flex items-center gap-2 px-6 py-3 glass-panel hover:bg-gray-800 rounded-xl transition-all group"
                    >
                        <Download size={18} className="text-emerald-400" />
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white">{t('rules.export_guide_link')}</span>
                    </button>
                </div>
            )}
        </div>

        <div className="space-y-16">
            <section>
                <SectionHeader icon={Activity} title={t('rules.gameplay.title')} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative glass-panel border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-lg hover:-translate-y-1 transition-transform border-y border-r border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black text-white italic">{t('rules.mech.move_title')}</h3>
                            <Activity size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium">{tRich('rules.mech.move_desc')}</p>
                    </div>

                    <div className="group relative glass-panel border-l-4 border-purple-500 p-6 rounded-r-xl shadow-lg hover:-translate-y-1 transition-transform border-y border-r border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black text-white italic">{t('rules.mech.mint_title')}</h3>
                            <MapIcon size={32} className="text-purple-500" />
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium">{tRich('rules.mech.mint_desc')}</p>
                    </div>

                    <div className="group relative glass-panel border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg hover:-translate-y-1 transition-transform border-y border-r border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black text-white italic">{t('rules.mech.conquer_title')}</h3>
                            <Swords size={32} className="text-red-500" />
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium">{tRich('rules.mech.conquer_desc')}</p>
                    </div>

                    <div className="group relative glass-panel border-l-4 border-yellow-500 p-6 rounded-r-xl shadow-lg hover:-translate-y-1 transition-transform border-y border-r border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-xl pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black text-white italic">{t('rules.mech.earn_title')}</h3>
                            <Coins size={32} className="text-yellow-500" />
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium">{tRich('rules.mech.earn_desc')}</p>
                    </div>
                </div>
            </section>

            <section>
                <SectionHeader icon={Terminal} title={t('rules.nav.title')} />
                <p className="text-gray-400 mb-8 text-sm max-w-2xl glass-panel p-4 rounded-xl">{t('rules.nav.desc')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    <InterfaceCard 
                        icon={MapIcon} 
                        title={t('rules.nav.dash')} 
                        desc={tRich('rules.nav.dash_desc')}
                        className="lg:col-span-3"
                    />
                    <InterfaceCard 
                        icon={ShoppingBag} 
                        title={t('rules.nav.market')} 
                        desc={tRich('rules.nav.market_desc')}
                        className="lg:col-span-3"
                    />
                    <InterfaceCard 
                        icon={Package} 
                        title={t('rules.nav.inv')} 
                        desc={tRich('rules.nav.inv_desc')}
                        className="lg:col-span-3"
                    />
                    <InterfaceCard 
                        icon={Target} 
                        title={t('rules.nav.miss')} 
                        desc={tRich('rules.nav.miss_desc')}
                        className="lg:col-span-3"
                    />

                    <InterfaceCard 
                        icon={Trophy} 
                        title={t('rules.nav.rank')} 
                        desc={tRich('rules.nav.rank_desc')}
                        className="lg:col-span-4"
                    />
                    <InterfaceCard 
                        icon={Wallet} 
                        title={t('rules.nav.wallet')} 
                        desc={tRich('rules.nav.wallet_desc')}
                        className="lg:col-span-4"
                    />
                    
                    <InterfaceCard 
                        icon={UserIcon} 
                        title={t('rules.nav.profile')} 
                        desc={tRich('rules.nav.profile_desc')}
                        className="md:col-span-2 lg:col-span-4" 
                    />
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};