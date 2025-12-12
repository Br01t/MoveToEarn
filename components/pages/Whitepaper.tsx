
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Scroll, Globe, Target, Scale, Activity, Map as MapIcon, 
  RefreshCw, Award, Flame, Menu, X, Terminal, Cpu, Layers, MousePointerClick
} from 'lucide-react';
import { ViewState } from '../../types';
import { useLanguage } from '../../LanguageContext';

interface WhitepaperProps {
  onBack?: () => void;
  onNavigate?: (view: ViewState) => void;
}

export const Whitepaper: React.FC<WhitepaperProps> = ({ onBack, onNavigate }) => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = 'intro';
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute('id') || 'intro';
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const sections = [
    { id: 'intro', title: t('wp.nav.intro'), icon: Terminal },
    { id: 'overview', title: t('wp.nav.overview'), icon: Globe },
    { id: 'goals', title: t('wp.nav.goals'), icon: Target },
    { id: 'tokenomics', title: t('wp.nav.tokenomics'), icon: Scale },
    { id: 'economy', title: t('wp.nav.economy'), icon: Activity },
    { id: 'gameplay', title: t('wp.nav.gameplay'), icon: Layers },
    { id: 'zones', title: t('wp.nav.zones'), icon: MapIcon },
    { id: 'swap', title: t('wp.nav.swap'), icon: RefreshCw },
    { id: 'missions', title: t('wp.nav.missions'), icon: Award },
    { id: 'rebuy', title: t('wp.nav.rebuy'), icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER NAV (FIXED) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="font-bold text-white tracking-wider flex items-center gap-2">
            <Scroll size={20} className="text-emerald-400" /> <span className="hidden md:inline">ZoneRun Protocol</span> Whitepaper
          </span>
        </div>
        
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="pt-20 pb-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 md:px-8">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 border-r border-gray-800">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-3 ${
                  activeSection === section.id 
                    ? 'bg-emerald-900/20 text-emerald-400 border-l-2 border-emerald-500' 
                    : 'text-gray-500 hover:text-gray-200 hover:bg-gray-900'
                }`}
              >
                <section.icon size={16} />
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* MOBILE NAVIGATION MENU */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-950 pt-20 px-6 overflow-y-auto md:hidden animate-fade-in">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full text-left p-4 rounded-xl bg-gray-900 border border-gray-800 text-white font-bold flex items-center gap-3 active:scale-95 transition-transform"
                >
                  <section.icon size={20} className="text-emerald-400" />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-4xl space-y-16">
          
          {/* 0. INTRODUZIONE */}
          <section id="intro" className="scroll-mt-24">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Terminal size={120} /></div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">ZoneRun <span className="text-emerald-400">Protocol</span></h1>
                <p className="text-lg leading-relaxed text-gray-300">
                  {t('wp.intro.body')}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">RUN (Utility)</span>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold border border-cyan-500/20">GOV (Governance)</span>
                </div>
            </div>
          </section>

          {/* 1. PANORAMICA */}
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Globe className="text-emerald-400" /> {t('wp.overview.title')}
            </h2>
            <div className="prose prose-invert max-w-none text-gray-400">
              <p>
                {t('wp.overview.body')}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <li className="bg-gray-900 p-4 rounded-xl border border-gray-800">🏃 <strong>{t('wp.overview.move')}:</strong> {t('wp.overview.move')}</li>
                <li className="bg-gray-900 p-4 rounded-xl border border-gray-800">🗺️ <strong>{t('wp.overview.expand')}:</strong> {t('wp.overview.expand')}</li>
                <li className="bg-gray-900 p-4 rounded-xl border border-gray-800">⚔️ <strong>{t('wp.overview.conquer')}:</strong> {t('wp.overview.conquer')}</li>
                <li className="bg-gray-900 p-4 rounded-xl border border-gray-800">🗳️ <strong>{t('wp.overview.govern')}:</strong> {t('wp.overview.govern')}</li>
              </ul>
            </div>
          </section>

          {/* 2. OBIETTIVI */}
          <section id="goals" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Target className="text-emerald-400" /> {t('wp.goals.title')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{t('wp.goals.short')}</h3>
                <p className="text-sm text-gray-400 pl-4 border-l-2 border-emerald-500">
                  {t('wp.goals.short_desc')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{t('wp.goals.mid')}</h3>
                <p className="text-sm text-gray-400 pl-4 border-l-2 border-cyan-500">
                  {t('wp.goals.mid_desc')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{t('wp.goals.long')}</h3>
                <p className="text-sm text-gray-400 pl-4 border-l-2 border-purple-500">
                  {t('wp.goals.long_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* 3. TOKENOMICS */}
          <section id="tokenomics" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Scale className="text-emerald-400" /> {t('wp.tokenomics.title')}
            </h2>
            
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 text-center mb-8">
              <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">{t('wp.tokenomics.supply')}</p>
              <div className="text-4xl font-black text-white mt-2">1.000.000.000 <span className="text-cyan-400">GOV</span></div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-700">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800 text-gray-200 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">{t('wp.tokenomics.col_area')}</th>
                    <th className="px-6 py-4">{t('wp.tokenomics.col_alloc')}</th>
                    <th className="px-6 py-4">%</th>
                    <th className="px-6 py-4 hidden md:table-cell">{t('wp.tokenomics.col_desc')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 font-bold text-white">{t('wp.tokenomics.row1')}</td>
                    <td className="px-6 py-4 font-mono">150M</td>
                    <td className="px-6 py-4 text-emerald-400">15%</td>
                    <td className="px-6 py-4 hidden md:table-cell">{t('wp.tokenomics.row1_desc')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-white">{t('wp.tokenomics.row2')}</td>
                    <td className="px-6 py-4 font-mono">300M</td>
                    <td className="px-6 py-4 text-blue-400">30%</td>
                    <td className="px-6 py-4 hidden md:table-cell">{t('wp.tokenomics.row2_desc')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-white">{t('wp.tokenomics.row3')}</td>
                    <td className="px-6 py-4 font-mono">450M</td>
                    <td className="px-6 py-4 text-yellow-400">45%</td>
                    <td className="px-6 py-4 hidden md:table-cell">{t('wp.tokenomics.row3_desc')}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-white">{t('wp.tokenomics.row4')}</td>
                    <td className="px-6 py-4 font-mono">100M</td>
                    <td className="px-6 py-4 text-purple-400">10%</td>
                    <td className="px-6 py-4 hidden md:table-cell">{t('wp.tokenomics.row4_desc')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. ECONOMIA */}
          <section id="economy" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Activity className="text-emerald-400" /> {t('wp.economy.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-lg">
                  <Layers size={20}/> {t('wp.economy.run')}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t('wp.economy.run_desc')}
                </p>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-lg">
                  <Award size={20}/> {t('wp.economy.gov')}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t('wp.economy.gov_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* 5. GAMEPLAY */}
          <section id="gameplay" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Layers className="text-emerald-400" /> {t('wp.gameplay.title')}
            </h2>
            <p className="text-gray-400 mb-4">
              {t('wp.gameplay.desc')}
            </p>
          </section>

          {/* 6. SISTEMA ZONE */}
          <section id="zones" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <MapIcon className="text-emerald-400" /> {t('wp.zones.title')}
            </h2>
            
            {/* NUOVA SEZIONE: LOGICA MAPPA */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl border border-emerald-500/30 mb-8 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10"><Cpu size={120} /></div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 relative z-10">
                    <MousePointerClick className="text-emerald-400" /> {t('wp.zones.gen_title')}
                </h3>
                <div className="text-sm text-gray-300 space-y-3 relative z-10 leading-relaxed">
                    <p>
                        {t('wp.zones.gen_body')}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-white mb-3">{t('wp.zones.pool_title')}</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        {t('wp.zones.pool_desc')}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                            <h4 className="font-bold text-red-400 text-sm uppercase mb-2">{t('wp.zones.case_a')}</h4>
                            <p className="text-xs text-gray-300">
                                {t('wp.zones.case_a_desc')}
                            </p>
                        </div>
                        <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                            <h4 className="font-bold text-emerald-400 text-sm uppercase mb-2">{t('wp.zones.case_b')}</h4>
                            <p className="text-xs text-gray-300">
                                {t('wp.zones.case_b_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <h3 className="text-lg font-bold text-white mb-3">{t('wp.zones.costs_title')}</h3>
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="bg-gray-900 text-gray-200 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">{t('wp.zones.col_action')}</th>
                                <th className="px-4 py-3">{t('wp.zones.col_cost')}</th>
                                <th className="px-4 py-3">{t('wp.zones.col_reward')}</th>
                                <th className="px-4 py-3">{t('wp.zones.col_effect')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 border-t border-gray-800">
                            <tr>
                                <td className="px-4 py-3 font-bold text-white">{t('wp.zones.act_mint')}</td>
                                <td className="px-4 py-3 font-mono text-red-400">150 RUN</td>
                                <td className="px-4 py-3 font-mono text-cyan-400">15 GOV</td>
                                <td className="px-4 py-3">{t('wp.zones.eff_mint')}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-bold text-white">{t('wp.zones.act_conq')}</td>
                                <td className="px-4 py-3 font-mono text-red-400">350 RUN</td>
                                <td className="px-4 py-3 font-mono text-cyan-400">25 GOV</td>
                                <td className="px-4 py-3">{t('wp.zones.eff_conq')}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-bold text-white">{t('wp.zones.act_boost')}</td>
                                <td className="px-4 py-3 font-mono text-red-400">~100 RUN</td>
                                <td className="px-4 py-3">-</td>
                                <td className="px-4 py-3">{t('wp.zones.eff_boost')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          </section>

          {/* 7. SWAP */}
          <section id="swap" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <RefreshCw className="text-emerald-400" /> {t('wp.swap.title')}
            </h2>
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <p className="text-gray-400 mb-4">{t('wp.swap.desc')}</p>
                <div className="flex flex-wrap gap-4 text-sm font-mono font-bold">
                    <span className="bg-black/40 px-3 py-1 rounded text-white">⏳ {t('wp.swap.freq')}</span>
                    <span className="bg-black/40 px-3 py-1 rounded text-white">⏱️ {t('wp.swap.window')}</span>
                    <span className="bg-black/40 px-3 py-1 rounded text-emerald-400">🔁 {t('wp.swap.rate')}</span>
                    <span className="bg-black/40 px-3 py-1 rounded text-yellow-400">📦 {t('wp.swap.pool')}</span>
                </div>
            </div>
          </section>

          {/* 8. MISSIONI */}
          <section id="missions" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Award className="text-emerald-400" /> {t('wp.missions.title')}
            </h2>
            <div className="space-y-4 text-sm text-gray-400">
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                    <span>{t('wp.missions.first_zone')}</span>
                    <span className="font-mono text-cyan-400 font-bold">150 RUN + 5 GOV</span>
                </div>
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                    <span>{t('wp.missions.first_conq')}</span>
                    <span className="font-mono text-cyan-400 font-bold">300 RUN + 10 GOV</span>
                </div>
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-yellow-500/20">
                    <span className="text-yellow-500 font-bold">{t('wp.missions.badge_carto')}</span>
                    <span className="font-mono text-cyan-400 font-bold">20 GOV</span>
                </div>
            </div>
          </section>

          {/* 9. RE-BUY */}
          <section id="rebuy" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 pb-2 border-b border-gray-800">
              <Flame className="text-emerald-400" /> {t('wp.rebuy.title')}
            </h2>
            <p className="text-gray-400 mb-6">
                {t('wp.rebuy.desc')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="text-2xl font-bold text-white">40%</div>
                    <div className="text-xs text-gray-500 uppercase mt-1">{t('wp.rebuy.treasury')}</div>
                </div>
                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                    <div className="text-2xl font-bold text-emerald-400">30%</div>
                    <div className="text-xs text-emerald-500 uppercase mt-1">{t('wp.rebuy.buy_gov')}</div>
                </div>
                <div className="p-4 bg-red-900/20 rounded-xl border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400">20%</div>
                    <div className="text-xs text-red-500 uppercase mt-1">{t('wp.rebuy.burn')}</div>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400">10%</div>
                    <div className="text-xs text-blue-500 uppercase mt-1">{t('wp.rebuy.lp')}</div>
                </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};