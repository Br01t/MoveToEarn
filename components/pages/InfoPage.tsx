import React from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../../types';
import { useLanguage } from '../../LanguageContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { 
  BookOpen, 
  Shield, 
  FileText, 
  HelpCircle, 
  Users, 
  Bug, 
  Lightbulb, 
  Cookie, 
  ChevronRight,
  ExternalLink,
  Download,
  PlayCircle,
  ArrowUpRight
} from 'lucide-react';

interface InfoPageProps {
  onNavigate: (view: ViewState) => void;
  isAuthenticated: boolean;
  onInstall?: () => void;
  isInstallable?: boolean;
  isStandalone?: boolean;
}

const InfoPage: React.FC<InfoPageProps> = ({ 
  onNavigate, 
  isAuthenticated, 
  onInstall, 
  isInstallable, 
  isStandalone 
}) => {
  const { t } = useLanguage();
  const { openBanner } = usePrivacy();
  const { startTutorial } = useOnboarding();

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.2em] mb-6 px-2">
      {title}
    </h2>
  );

  const MainActionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick,
    color = "emerald"
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    onClick: () => void,
    color?: "emerald" | "indigo"
  }) => {
    const themes = {
      emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
      indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400"
    };

    return (
      <motion.button
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative overflow-hidden w-full p-8 rounded-[2.5rem] border bg-gradient-to-br ${themes[color]} text-left group transition-all shadow-xl shadow-black/20`}
      >
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon size={140} strokeWidth={1} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10`}>
              <Icon size={32} />
            </div>
            <ArrowUpRight size={24} className="text-white/20 group-hover:text-white transition-colors" />
          </div>
          
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
            {description}
          </p>
        </div>
      </motion.button>
    );
  };

  const CompactCard = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick,
    color = "gray"
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    onClick: () => void,
    color?: "cyan" | "red" | "yellow" | "gray" | "emerald"
  }) => {
    const colors = {
      emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      red: "text-red-400 bg-red-400/10 border-red-400/20",
      yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      gray: "text-gray-400 bg-gray-400/10 border-gray-400/20"
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full flex items-start gap-5 p-5 rounded-3xl border border-white/5 bg-white/[0.02] text-left transition-all group"
      >
        <div className={`p-3 rounded-2xl ${colors[color]} shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
            {title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {description}
          </p>
        </div>
        <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-colors mt-1 shrink-0" />
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-6 py-20 pb-40"
      >
        <div className="text-center mb-24">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-8"
          >
            Protocol Resources
          </motion.div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
            {t('info.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
            {t('info.subtitle')}
          </p>
        </div>

        <div className="space-y-24">
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MainActionCard 
                icon={Shield}
                title={t('footer.rules')}
                description={t('info.desc.rules')}
                onClick={() => onNavigate('RULES')}
                color="emerald"
              />
              <MainActionCard 
                icon={Users}
                title={t('footer.community')}
                description={t('info.desc.community')}
                onClick={() => onNavigate('COMMUNITY')}
                color="indigo"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column: Docs */}
            <section>
              <SectionTitle title={t('info.group.guides')} />
              <div className="space-y-3">
                <CompactCard 
                  icon={BookOpen}
                  title={t('footer.whitepaper')}
                  description={t('info.desc.whitepaper')}
                  onClick={() => onNavigate('WHITEPAPER')}
                  color="cyan"
                />
                <CompactCard 
                  icon={HelpCircle}
                  title={t('footer.export_guide')}
                  description={t('info.desc.how_to_play')}
                  onClick={() => onNavigate('HOW_TO_PLAY')}
                  color="emerald"
                />
                {isAuthenticated && (
                  <CompactCard 
                    icon={PlayCircle}
                    title={t('info.tutorial.title')}
                    description={t('info.desc.tutorial')}
                    onClick={startTutorial}
                    color="emerald"
                  />
                )}
              </div>
            </section>

            <section className="space-y-12">
              {isAuthenticated && (
                <div>
                  <SectionTitle title={t('info.group.support')} />
                  <div className="flex flex-col gap-3">
                    <CompactCard 
                      icon={Bug}
                      title={t('footer.report_bug')}
                      description={t('info.desc.report_bug')}
                      onClick={() => onNavigate('REPORT_BUG')}
                      color="red"
                    />
                    <CompactCard 
                      icon={Lightbulb}
                      title={t('footer.suggestion')}
                      description={t('info.desc.suggestion')}
                      onClick={() => onNavigate('SUGGESTION')}
                      color="yellow"
                    />
                  </div>
                </div>
              )}

              {isInstallable && !isStandalone && onInstall && (
                <div>
                  <SectionTitle title={t('info.group.app')} />
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={onInstall}
                    className="w-full p-6 rounded-[2rem] bg-white text-black flex items-start justify-between group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-black/5 rounded-2xl shrink-0">
                        <Download size={24} />
                      </div>
                      <div className="text-left">
                        <span className="block font-black uppercase tracking-tight text-lg leading-none mb-1">
                          {t('info.install.title')}
                        </span>
                        <span className="text-xs opacity-60 font-medium">Native Experience</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="mt-2 shrink-0" />
                  </motion.button>
                </div>
              )}
            </section>
          </div>

          <section>
            <SectionTitle title={t('info.group.legal')} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CompactCard 
                icon={FileText}
                title={t('footer.privacy')}
                description={t('info.desc.privacy')}
                onClick={() => onNavigate('PRIVACY')}
                color="gray"
              />
              <CompactCard 
                icon={FileText}
                title={t('footer.terms')}
                description={t('info.desc.terms')}
                onClick={() => onNavigate('TERMS')}
                color="gray"
              />
              <CompactCard 
                icon={Cookie}
                title={t('footer.cookies')}
                description={t('info.desc.cookies')}
                onClick={openBanner}
                color="gray"
              />
            </div>
          </section>
        </div>

        <div className="mt-32 text-center text-[10px] font-mono text-gray-700 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} ZoneRun Protocol // All Rights Reserved
        </div>
      </motion.div>
    </div>
  );
};

export default InfoPage;