
import React, { useState } from 'react';
import { Activity, Shield, Coins, TrendingUp, Terminal, BookOpen, ChevronRight, Zap, X } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../LanguageContext';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate: (view: ViewState) => void;
}

// Feature Definition Type
type FeatureKey = 'earn_run' | 'earn_gov' | 'spend' | 'burn';

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);

  const features: { key: FeatureKey; icon: any; color: string }[] = [
      { key: 'earn_run', icon: <Activity size={28} />, color: 'emerald' },
      { key: 'earn_gov', icon: <TrendingUp size={28} />, color: 'cyan' },
      { key: 'spend', icon: <Shield size={28} />, color: 'blue' },
      { key: 'burn', icon: <Coins size={28} />, color: 'red' },
  ];

  const getModalContent = (key: FeatureKey | null) => {
      if (!key) return null;
      return {
          title: t(`landing.modal.${key}_title`),
          body: t(`landing.modal.${key}_body`)
      };
  };

  const activeContent = getModalContent(activeFeature);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* --- BACKGROUND LAYER (STATIC) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black z-0" />
      
      {/* High Contrast Hexagonal Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2310b981' stroke-width='2' stroke-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '56px 98px'
        }}
      />
      {/* Vignette Overlay to focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-60 pointer-events-none z-0"></div>
      
      {/* Static Orbs (Animation Removed) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      {/* --- NAVBAR --- */}
      <header className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('LANDING')}>
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-lg"></div>
             <div className="glass-panel p-2.5 rounded-lg border-white/10 group-hover:border-emerald-500/50 transition-colors relative z-10">
                <Activity size={24} className="text-emerald-400" />
             </div>
          </div>
          <div className="text-2xl font-black text-white uppercase tracking-widest">
            ZONE<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">RUN</span>
          </div>
        </div>
        
        <button
            onClick={toggleLanguage}
            className="px-4 py-2 text-xs font-bold glass-panel text-gray-400 hover:text-white rounded-lg transition-all"
        >
            {language === 'en' ? 'IT' : 'EN'}
        </button>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 text-center pb-20 pt-10">
        
        <div className="mb-10 inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel shadow-[0_0_15px_rgba(16,185,129,0.1)] animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-[0.2em] uppercase">System Online v1.4</span>
        </div>

        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up delay-100 relative">
          {/* Abstract Hero Glow (Static) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>

          {/* Reduced Title Size */}
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-widest uppercase leading-[0.9] drop-shadow-2xl relative z-10">
            Run. Conquer. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 animate-gradient bg-300%">
                {t('landing.title_suffix')}
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-bold tracking-wide">
            {t('landing.subtitle')}
          </p>
          
          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 w-full max-w-lg mx-auto sm:max-w-none relative z-20">
            
            {/* Primary: Start */}
            <button
              onClick={onLogin}
              data-text={t('landing.start_btn')}
              className="btn-glitch group relative w-full sm:w-auto px-10 py-5 bg-white text-black font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-wide">
                  <Zap size={20} className="fill-black group-hover:fill-black transition-colors" /> {t('landing.start_btn')}
              </span>
            </button>

            {/* Secondary: Game Rules */}
            <button 
              onClick={() => onNavigate('RULES')}
              className="group w-full sm:w-auto px-8 py-5 glass-panel hover:bg-gray-800 text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <Terminal size={18} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
              <span className="uppercase tracking-wide">{t('landing.game_guide_btn')}</span>
            </button>

            {/* Tertiary: Whitepaper */}
            <button 
              onClick={() => onNavigate('WHITEPAPER')}
              className="group w-full sm:w-auto px-8 py-5 glass-panel bg-transparent hover:bg-gray-900 border-white/5 hover:border-white/20 text-gray-400 hover:text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <BookOpen size={18} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
              <span className="uppercase tracking-wide">{t('landing.rules_btn')}</span>
            </button>

          </div>
        </div>

        {/* FEATURE CARDS - INTERACTIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-32 max-w-7xl mx-auto w-full px-4 animate-fade-in-up delay-300 relative z-20">
          {features.map((feature) => (
              <div key={feature.key}>
                <FeatureCard 
                  icon={feature.icon}
                  title={t(`landing.card.${feature.key}`)}
                  description={t(`landing.card.${feature.key}_desc`)}
                  color={feature.color}
                  onClick={() => setActiveFeature(feature.key)}
                />
              </div>
          ))}
        </div>

        {/* LEARN MORE MODAL */}
        {activeFeature && activeContent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setActiveFeature(null)}>
                <div 
                    className="glass-panel-heavy rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-slide-up" 
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image / Gradient */}
                    <div className={`h-32 w-full bg-gradient-to-r ${
                        activeFeature === 'earn_run' ? 'from-emerald-900 to-gray-900' :
                        activeFeature === 'earn_gov' ? 'from-cyan-900 to-gray-900' :
                        activeFeature === 'spend' ? 'from-blue-900 to-gray-900' :
                        'from-red-900 to-gray-900'
                    } relative`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                        <button onClick={() => setActiveFeature(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors">
                            <X size={24} />
                        </button>
                        <div className="absolute bottom-6 left-8 flex items-center gap-4">
                            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700 shadow-xl">
                                {features.find(f => f.key === activeFeature)?.icon}
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-widest uppercase">{activeContent.title}</h3>
                        </div>
                    </div>

                    <div className="p-8">
                        <p className="text-lg text-gray-300 leading-relaxed font-medium">
                            {activeContent.body}
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                            <button 
                                onClick={() => setActiveFeature(null)}
                                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wide rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {t('landing.close')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description, color, onClick }: { icon: any, title: string, description: string, color: string, onClick: () => void }) => {
    const borderClass = {
        emerald: 'hover:border-emerald-500/50',
        cyan: 'hover:border-cyan-500/50',
        blue: 'hover:border-blue-500/50',
        red: 'hover:border-red-500/50',
    }[color];

    const textClass = {
        emerald: 'text-emerald-400',
        cyan: 'text-cyan-400',
        blue: 'text-blue-400',
        red: 'text-red-400',
    }[color];

    const iconBgClass = {
        emerald: 'bg-emerald-500/20 text-emerald-400',
        cyan: 'bg-cyan-500/20 text-cyan-400',
        blue: 'bg-blue-500/20 text-blue-400',
        red: 'bg-red-500/20 text-red-400',
    }[color];

    return (
      <div 
        onClick={onClick}
        className={`glass-panel group p-8 rounded-3xl text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer relative overflow-hidden ${borderClass}`}
      >
        <div className={`mb-6 w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-500 ${iconBgClass}`}>
          {icon}
        </div>
        
        <h3 className={`text-xl font-bold uppercase tracking-wide text-white mb-3 transition-colors`}>{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed font-medium">{description}</p>
        
        <div className={`mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${textClass}`}>
            Learn More <ChevronRight size={12} />
        </div>
        
        {/* Glow Hover */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${color}-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
      </div>
    );
};

export default LandingPage;