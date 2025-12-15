
import React from 'react';
import { Lock, Eye, MapPin, Database, User, ShieldCheck, Trash2, KeyRound } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

const Privacy: React.FC = () => {
  const { t } = useLanguage();

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="border-b border-gray-700/50 pb-8 last:border-0">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon className="text-emerald-500" size={24} /> {title}
      </h3>
      <div className="text-gray-400 text-sm leading-relaxed space-y-4 text-justify">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
            <div className="inline-flex p-4 glass-panel rounded-full mb-2">
                <Lock className="text-emerald-400" size={48} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            {t('page.privacy.title')}
            </h1>
            <p className="text-gray-500">{t('page.privacy.last_updated')}: <span className="text-emerald-400 font-mono">January 15, 2025</span></p>
        </div>

        {/* Intro */}
        <div className="glass-panel p-6 rounded-2xl text-gray-300 text-sm leading-relaxed">
            {t('page.privacy.intro')}
        </div>

        {/* Main Content */}
        <div className="glass-panel rounded-2xl p-8 space-y-8 shadow-2xl">
            
            <Section title={t('page.privacy.sec1.title')} icon={Database}>
                <p><strong>{t('page.privacy.sec1.p1_title')}</strong> {t('page.privacy.sec1.p1_body')}</p>
                <p><strong>{t('page.privacy.sec1.p2_title')}</strong> {t('page.privacy.sec1.p2_body')}</p>
                <p><strong>{t('page.privacy.sec1.p3_title')}</strong> {t('page.privacy.sec1.p3_body')}</p>
            </Section>

            <Section title={t('page.privacy.sec2.title')} icon={MapPin}>
                <p>{t('page.privacy.sec2.body')}</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>{t('page.privacy.sec2.li1')}</li>
                    <li>{t('page.privacy.sec2.li2')}</li>
                    <li>{t('page.privacy.sec2.li3')}</li>
                </ul>
            </Section>

            <Section title={t('page.privacy.sec3.title')} icon={Eye}>
                <p><strong>{t('page.privacy.sec3.p1_title')}</strong> {t('page.privacy.sec3.p1_body')}</p>
                <p><strong>{t('page.privacy.sec3.p2_title')}</strong> {t('page.privacy.sec3.p2_body')}</p>
            </Section>

            <Section title={t('page.privacy.sec4.title')} icon={KeyRound}>
                <p>{t('page.privacy.sec4.body')}</p>
            </Section>

            <Section title={t('page.privacy.sec5.title')} icon={ShieldCheck}>
                <p>{t('page.privacy.sec5.body')}</p>
            </Section>

            <Section title={t('page.privacy.sec6.title')} icon={Trash2}>
                <p>{t('page.privacy.sec6.body')}</p>
            </Section>

        </div>

        <div className="text-center text-xs text-gray-600 mt-8 font-mono">
            ZoneRun Protocol &copy; {new Date().getFullYear()} • {t('page.terms.footer')}
        </div>
    </div>
  );
};

export default Privacy;