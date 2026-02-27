import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Coins, TrendingUp, Terminal, BookOpen, Zap, Volume2, VolumeX, Users, ArrowRight, Globe, Trophy, Cpu, X } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../LanguageContext';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import { NAVBAR_LOGO_URL } from '../constants';
import LanguageDropdown from './ui/LanguageDropdown';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
  const { t, tRich } = useLanguage();
  const { isMuted, toggleMute, playSound } = useGlobalUI();
  const [activeFeature, setActiveFeature] = React.useState<string | null>(null);

  const handleActionClick = (action: () => void) => {
    playSound('CLICK');
    action();
  };

  const handleNavAction = (view: ViewState) => {
    playSound('CLICK');
    onNavigate(view);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const getModalContent = (key: string | null) => {
    if (!key) return null;
    return {
        title: t(`landing.modal.${key}_title`),
        body: tRich(`landing.modal.${key}_body`)
    };
  };

  const activeContent = getModalContent(activeFeature);

  return (
    <div className="relative w-full bg-black flex flex-col overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0" />
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2310b981' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '56px 98px'
        }}
      />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => handleNavAction('LANDING')}
          >
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-lg"></div>
               <div className="glass-panel p-1.5 rounded-xl border-white/10 group-hover:border-emerald-500/50 transition-colors relative z-10">
                  <img src={NAVBAR_LOGO_URL} alt="ZoneRun Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
               </div>
            </div>
            <div className="text-xl font-black text-white uppercase tracking-widest">
              ZONE<span className="text-emerald-400">RUN</span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
              <LanguageDropdown align="right" />
              <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl glass-panel transition-all border ${isMuted ? 'text-red-400 border-red-500/30 bg-red-900/10' : 'text-gray-400 border-white/10 hover:text-white hover:border-white/30'}`}
              >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button 
                onClick={() => handleActionClick(onLogin)}
                className="hidden sm:block px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all text-sm uppercase tracking-wider"
              >
                {t('auth.login')}
              </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center space-y-8 max-w-4xl"
        >

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
            {t('landing.hero_title_1')} {t('landing.hero_title_2')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400">
              {tRich('landing.title_suffix')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {tRich('landing.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(onLogin)}
              className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <Zap size={20} className="fill-black" /> {t('landing.start_btn')}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavAction('RULES')}
              className="w-full sm:w-auto px-8 py-5 glass-panel hover:bg-white/5 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider border border-white/10"
            >
              <Terminal size={18} className="text-emerald-400" />
              {t('landing.game_guide_btn')}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavAction('WHITEPAPER')}
              className="w-full sm:w-auto px-8 py-5 glass-panel hover:bg-white/5 text-gray-400 hover:text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider border border-white/5"
            >
              <BookOpen size={18} className="text-cyan-400" />
              {t('landing.rules_btn')}
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{t('landing.scroll_hint')}</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent"
          />
        </motion.div>
      </section>

      {/* Community Section - Moved Up */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="glass-panel-heavy rounded-[3rem] p-12 md:p-20 border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Users size={200} className="text-cyan-400" />
            </div>

            <div className="max-w-2xl">
              <motion.div {...fadeInUp}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-6">
                  {t('landing.community_tag')}
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-8 leading-none">
                  {t('landing.community_title')}
                </h2>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                  {t('landing.community_subtitle')}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    onClick={() => handleNavAction('COMMUNITY')}
                    className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-all flex items-center gap-3 uppercase tracking-wider"
                  >
                    {t('landing.community_btn')} <ArrowRight size={20} />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* The Vision Section - Relevant Info */}
      <section className="relative py-32 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeInUp}>
            <span className="font-mono text-emerald-500 text-sm tracking-[0.3em] uppercase mb-6 block">{t('landing.vision_tag')}</span>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
              {t('landing.vision_title')}
            </h2>
            <div className="space-y-6 text-xl text-gray-400 font-medium leading-relaxed">
              <p>
                {t('landing.vision_p1')}
              </p>
              <p>
                {t('landing.vision_p2')}
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative z-10 w-full h-full glass-panel-heavy rounded-[4rem] border border-white/10 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="relative flex flex-col items-center text-center p-12">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-8">
                    <Globe size={48} className="text-emerald-400" />
                  </div>
                  <span className="text-3xl font-black text-white uppercase tracking-widest mb-2">{t('landing.vision_card_title')}</span>
                  <span className="text-emerald-500 font-mono font-bold tracking-widest">{t('landing.vision_card_subtitle')}</span>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mechanics Section - Redesigned: Technical Editorial Style */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
            <motion.div {...fadeInUp} className="max-w-2xl">
              <span className="font-mono text-emerald-500 text-sm tracking-[0.3em] uppercase mb-4 block">{t('landing.mechanics_system_tag')}</span>
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                {t('landing.mechanics_main_title').split(' ')[0]} <span className="italic serif text-emerald-500/80">{t('landing.mechanics_main_title').split(' ').slice(1).join(' ')}</span>
              </h2>
            </motion.div>
            <motion.p 
              {...fadeInUp} 
              transition={{ delay: 0.2 }}
              className="text-gray-500 max-w-sm text-right font-medium leading-relaxed"
            >
              {t('landing.mechanics_subtitle')}
            </motion.p>
          </div>

          <div className="space-y-px bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden">
            <MechanicRow 
              num="01"
              title={t('landing.card.earn_run')}
              desc={tRich('landing.card.earn_run_desc')}
              icon={<Activity size={24} />}
              color="emerald"
              onClick={() => { playSound('OPEN'); setActiveFeature('earn_run'); }}
            />
            <MechanicRow 
              num="02"
              title={t('landing.card.earn_gov')}
              desc={tRich('landing.card.earn_gov_desc')}
              icon={<TrendingUp size={24} />}
              color="cyan"
              onClick={() => { playSound('OPEN'); setActiveFeature('earn_gov'); }}
            />
            <MechanicRow 
              num="03"
              title={t('landing.card.spend')}
              desc={tRich('landing.card.spend_desc')}
              icon={<Shield size={24} />}
              color="blue"
              onClick={() => { playSound('OPEN'); setActiveFeature('spend'); }}
            />
            <MechanicRow 
              num="04"
              title={t('landing.card.burn')}
              desc={tRich('landing.card.burn_desc')}
              icon={<Coins size={24} />}
              color="red"
              onClick={() => { playSound('OPEN'); setActiveFeature('burn'); }}
            />
          </div>
        </div>
      </section>

      {/* Modal for Feature Details */}
      {activeFeature && activeContent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in" onClick={() => setActiveFeature(null)}>
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="glass-panel-heavy rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-white/10" 
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className={`h-40 w-full bg-gradient-to-br ${
                      activeFeature === 'earn_run' ? 'from-emerald-900/40 to-black' :
                      activeFeature === 'earn_gov' ? 'from-cyan-900/40 to-black' :
                      activeFeature === 'spend' ? 'from-blue-900/40 to-black' :
                      'from-red-900/40 to-black'
                  } relative flex items-center px-12 border-b border-white/5`}>
                      <button onClick={() => { playSound('CLICK'); setActiveFeature(null); }} className="absolute top-6 right-6 bg-white/5 hover:bg-white/10 p-2 rounded-full text-white transition-colors border border-white/10">
                          <X size={24} />
                      </button>
                      <div className="flex items-center gap-6">
                          <div className="p-5 bg-black/60 rounded-3xl border border-white/10 shadow-xl">
                              {activeFeature === 'earn_run' && <Activity size={32} className="text-emerald-400" />}
                              {activeFeature === 'earn_gov' && <TrendingUp size={32} className="text-cyan-400" />}
                              {activeFeature === 'spend' && <Shield size={32} className="text-blue-400" />}
                              {activeFeature === 'burn' && <Coins size={32} className="text-red-400" />}
                          </div>
                          <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{activeContent.title}</h3>
                      </div>
                  </div>

                  <div className="p-12">
                      <div className="text-xl text-gray-300 leading-relaxed font-medium">
                          {activeContent.body}
                      </div>
                      
                      <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                          <button 
                              onClick={() => { playSound('CLICK'); setActiveFeature(null); }}
                              className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                          >
                              {t('landing.close')}
                          </button>
                      </div>
                  </div>
              </motion.div>
          </div>
      )}

    </div>
  );
};

const MechanicRow = ({ num, title, desc, icon, color, onClick }: { num: string, title: string, desc: React.ReactNode, icon: any, color: string, onClick: () => void }) => {
  const colorClasses = {
    emerald: 'group-hover:text-emerald-400',
    cyan: 'group-hover:text-cyan-400',
    blue: 'group-hover:text-blue-400',
    red: 'group-hover:text-red-400',
  };

  const bgClasses = {
    emerald: 'group-hover:bg-emerald-500/5',
    cyan: 'group-hover:bg-cyan-500/5',
    blue: 'group-hover:bg-blue-500/5',
    red: 'group-hover:bg-red-500/5',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={`group flex flex-col md:flex-row items-center gap-8 p-10 md:p-16 bg-black transition-all duration-500 cursor-pointer ${bgClasses[color as keyof typeof bgClasses]}`}
    >
      <div className="font-mono text-4xl md:text-6xl font-black text-white/10 group-hover:text-white/20 transition-colors shrink-0">
        {num}
      </div>
      
      <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]} group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>

      <div className="flex-1 text-center md:text-left">
        <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-2 group-hover:translate-x-2 transition-transform duration-500">
          {title}
        </h3>
        <div className="text-gray-500 group-hover:text-gray-300 transition-colors duration-500 text-lg max-w-2xl">
          {desc}
        </div>
      </div>

      <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <ArrowRight size={32} className={colorClasses[color as keyof typeof colorClasses]} />
      </div>
    </motion.div>
  );
};

export default LandingPage;