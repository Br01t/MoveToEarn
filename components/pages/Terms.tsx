
import React from 'react';
import { FileText, ShieldAlert, Activity, AlertTriangle, Scale, Lock, Users, Ban } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { ViewState } from '../../types';

interface TermsProps {
  onNavigate?: (view: ViewState) => void;
}

const Terms: React.FC<TermsProps> = ({ onNavigate }) => {
  const { t, tRich } = useLanguage();

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
            <FileText className="text-emerald-400" size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
          {t('page.terms.title')}
        </h1>
        <p className="text-gray-500">{t('page.terms.last_updated')}: <span className="text-emerald-400 font-mono">January 15, 2025</span></p>
      </div>

      {/* Critical Disclaimer Banner */}
      <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl flex items-start gap-4 backdrop-blur-sm">
          <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
              <h4 className="text-red-400 font-bold text-lg mb-2">{t('page.terms.disclaimer.title')}</h4>
              <p className="text-red-200/80 text-sm leading-relaxed">
                  {tRich('page.terms.disclaimer.body')}
              </p>
          </div>
      </div>

      {/* Main Content */}
      <div className="glass-panel rounded-2xl p-8 space-y-8 shadow-2xl">
        
        <Section title={t('page.terms.sec1.title')} icon={Scale}>
            <p>
                {tRich('page.terms.sec1.body')}
            </p>
        </Section>

        <Section title={t('page.terms.sec2.title')} icon={Activity}>
            <p>
                <strong>{t('page.terms.sec2.p1_title')}</strong> {tRich('page.terms.sec2.p1_body')}
            </p>
            <p>
                <strong>{t('page.terms.sec2.p2_title')}</strong> {tRich('page.terms.sec2.p2_body')}
            </p>
            <p>
                <strong>{t('page.terms.sec2.p3_title')}</strong> {tRich('page.terms.sec2.p3_body')}
            </p>
        </Section>

        <Section title={t('page.terms.sec3.title')} icon={ShieldAlert}>
            <p>
                <strong>{t('page.terms.sec3.p1_title')}</strong> {tRich('page.terms.sec3.p1_body')}
            </p>
            <p>
                <strong>{t('page.terms.sec3.p2_title')}</strong> {tRich('page.terms.sec3.p2_body')}
            </p>
            <p>
                <strong>{t('page.terms.sec3.p3_title')}</strong> {tRich('page.terms.sec3.p3_body')}
            </p>
        </Section>

        <Section title={t('page.terms.sec4.title')} icon={Ban}>
            <p>
                {tRich('page.terms.sec4.intro')}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li><strong>{t('page.terms.sec4.li1_title')}</strong> {tRich('page.terms.sec4.li1_body')}</li>
                <li><strong>{t('page.terms.sec4.li2_title')}</strong> {tRich('page.terms.sec4.li2_body')}</li>
                <li><strong>{t('page.terms.sec4.li3_title')}</strong> {tRich('page.terms.sec4.li3_body')}</li>
                <li><strong>{t('page.terms.sec4.li4_title')}</strong> {tRich('page.terms.sec4.li4_body')}</li>
                <li><strong>{t('page.terms.sec4.li5_title')}</strong> {tRich('page.terms.sec4.li5_body')}</li>
            </ul>
        </Section>

        <Section title={t('page.terms.sec5.title')} icon={Lock}>
            <p>
                <strong>{t('page.terms.sec5.p1_title')}</strong> {tRich('page.terms.sec5.p1_body')}
            </p>
            <p>
                <strong>{t('page.terms.sec5.p2_title')}</strong> {tRich('page.terms.sec5.p2_body')} <span onClick={() => onNavigate?.('PRIVACY')} className="text-emerald-400 hover:underline cursor-pointer">{t('page.privacy.title')}</span>.
            </p>
        </Section>

        <Section title={t('page.terms.sec6.title')} icon={AlertTriangle}>
            <p>
                {tRich('page.terms.sec6.body')}
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>{tRich('page.terms.sec6.li1')}</li>
                <li>{tRich('page.terms.sec6.li2')}</li>
                <li>{tRich('page.terms.sec6.li3')}</li>
                <li>{tRich('page.terms.sec6.li4')}</li>
            </ul>
        </Section>

        <Section title={t('page.terms.sec7.title')} icon={Users}>
            <p>
                {tRich('page.terms.sec7.body')}
            </p>
        </Section>

      </div>

      <div className="text-center text-xs text-gray-600 mt-8 font-mono">
          ZoneRun Protocol &copy; {new Date().getFullYear()} • {t('page.terms.footer')}
      </div>
    </div>
  );
};

export default Terms;