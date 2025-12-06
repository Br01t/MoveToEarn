
import React from 'react';
import { Activity, Shield, Coins, TrendingUp } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../LanguageContext';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
  const { t, language, toggleLanguage } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-3xl font-bold text-white tracking-tighter cursor-pointer" onClick={() => onNavigate('LANDING')}>
          Zone<span className="text-emerald-400">Run</span>
        </div>
        <div className="flex items-center gap-4">
             <button
                onClick={toggleLanguage}
                className="p-2 text-xl hover:scale-110 transition-transform bg-gray-800/50 rounded-lg border border-gray-700 hover:border-emerald-500/50 backdrop-blur-sm"
                title="Switch Language"
              >
                {language === 'en' ? '🇮🇹' : '🇬🇧'}
              </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 text-center pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4">
            Run. Conquer. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">{t('landing.title_suffix')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('landing.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
            >
              {t('landing.start_btn')}
            </button>
            <button 
              onClick={() => onNavigate('RULES')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-700 text-white font-bold text-lg rounded-xl hover:border-emerald-500 transition-colors"
            >
              {t('landing.rules_btn')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-24 max-w-6xl mx-auto w-full px-4">
          <FeatureCard 
            icon={<Activity className="text-emerald-400" size={32} />}
            title={t('landing.card.earn_run')}
            description={t('landing.card.earn_run_desc')}
          />
          <FeatureCard 
            icon={<TrendingUp className="text-cyan-400" size={32} />}
            title={t('landing.card.earn_gov')}
            description={t('landing.card.earn_gov_desc')}
          />
          <FeatureCard 
            icon={<Shield className="text-blue-400" size={32} />}
            title={t('landing.card.spend')}
            description={t('landing.card.spend_desc')}
          />
          <FeatureCard 
            icon={<Coins className="text-red-400" size={32} />}
            title={t('landing.card.burn')}
            description={t('landing.card.burn_desc')}
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl text-left hover:border-emerald-500/50 transition-colors">
    <div className="mb-4 bg-gray-900 w-14 h-14 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;