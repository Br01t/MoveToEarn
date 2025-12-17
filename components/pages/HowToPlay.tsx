
import React from 'react';
import { ArrowLeft, Download, Monitor, Smartphone, FileText, Database, CheckCircle, ExternalLink, Map, Activity, Zap, Apple, Watch } from 'lucide-react'; 
import { useLanguage } from '../../LanguageContext';

interface HowToPlayProps {
  onBack: () => void;
  isAuthenticated?: boolean;
}

interface AppFilter {
    id: string;
    icon: any;
    t_key: string;
    color: string;
    hoverBg: string;
    name: string;
}

const SUPPORTED_APPS: AppFilter[] = [
    { id: 'strava', icon: Activity, t_key: 'app.strava', color: 'text-[#FC4C02]', hoverBg: 'hover:bg-[#FC4C02]', name: 'Strava' },
    { id: 'garmin', icon: Map, t_key: 'app.garmin', color: 'text-[#00AACE]', hoverBg: 'hover:bg-[#00AACE]', name: 'Garmin' },
    { id: 'adidas', icon: Zap, t_key: 'app.adidas', color: 'text-yellow-400', hoverBg: 'hover:bg-yellow-500', name: 'Adidas Running' },
    { id: 'apple', icon: Apple, t_key: 'app.apple', color: 'text-gray-200', hoverBg: 'hover:bg-gray-500', name: 'Apple Fitness' },
    { id: 'fitbit', icon: Watch, t_key: 'app.fitbit', color: 'text-[#00B0B9]', hoverBg: 'hover:bg-[#00B0B9]', name: 'Fitbit' },
];

const ProviderSection = ({ 
    title, desc, colorClass, borderClass, bgClass, id, 
    singleNote, bulkNote, 
    singleStepsTitle, singleSteps,
    bulkStepsTitle, bulkSteps,
    recommendedDeviceSingle, recommendedDeviceBulk,
    formatSingle, formatBulk
}: {
    title: string; desc: string; colorClass: string; borderClass: string; bgClass: string; id: string; 
    singleNote: string; bulkNote: string;
    singleStepsTitle?: string; singleSteps?: React.ReactNode[];
    bulkStepsTitle?: string; bulkSteps?: React.ReactNode[];
    recommendedDeviceSingle: string; recommendedDeviceBulk: string;
    formatSingle: string; formatBulk: string;
}) => {
    const { t } = useLanguage();

    return (
        <div id={id} className={`scroll-mt-24 rounded-xl border ${borderClass} overflow-hidden glass-panel`}> 
            <div className={`p-4 border-b ${borderClass} ${bgClass}`}>
                <h2 className={`text-xl font-bold ${colorClass}`}>{title}</h2>
                <p className="text-sm text-gray-300 mt-1">{desc}</p>
            </div>
            
            <div className="p-4 md:p-6 space-y-6">
                
                <div className="overflow-x-auto rounded-lg border border-gray-700/50 bg-black/40">
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-gray-900/80 text-gray-300 uppercase font-bold text-[10px]">
                            <tr>
                                <th className="p-3">{t('htp.table.func')}</th>
                                <th className="p-3">{t('htp.table.device')}</th>
                                <th className="p-3">{t('htp.table.format')}</th>
                                <th className="p-3">{t('htp.table.notes')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            <tr>
                                <td className="p-3 font-bold text-white whitespace-nowrap">{t('htp.single_run')}</td>
                                <td className="p-3 text-gray-300">{recommendedDeviceSingle}</td>
                                <td className="p-3 font-mono text-emerald-400">{formatSingle}</td>
                                <td className="p-3 text-gray-400 italic">{singleNote}</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold text-white whitespace-nowrap">{t('htp.full_history')}</td>
                                <td className="p-3 text-gray-300">{recommendedDeviceBulk}</td>
                                <td className="p-3 font-mono text-emerald-400">{formatBulk}</td>
                                <td className="p-3 text-gray-400 italic">{bulkNote}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {singleSteps && singleSteps.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <FileText size={16} className={colorClass} /> {singleStepsTitle}
                            </h3>
                            <ul className="space-y-2">
                                {singleSteps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-gray-700/30">
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full ${bgClass} ${colorClass} flex items-center justify-center text-xs font-bold`}>
                                            {idx + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {bulkSteps && bulkSteps.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                <Database size={16} className={colorClass} /> {bulkStepsTitle}
                            </h3>
                            <ul className="space-y-2">
                                {bulkSteps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-gray-700/30">
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full ${bgClass} ${colorClass} flex items-center justify-center text-xs font-bold`}>
                                            {idx + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AppFilters = () => (
    <div className="mt-8 mb-12 border-t border-b border-gray-700/50 py-6 bg-gray-900/50 backdrop-blur-sm shadow-inner">
        <div className="flex flex-wrap gap-3 justify-center">
            {SUPPORTED_APPS.map(app => (
                <a 
                    key={app.id}
                    href={`#${app.id}`} 
                    className={`group inline-flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-full transition-all backdrop-blur-sm text-sm font-bold text-gray-200 hover:scale-105 
                                ${app.hoverBg} hover:text-black bg-gray-700/50`}
                >
                    <app.icon size={16} className={`${app.color} group-hover:text-black transition-colors`} />
                    {app.name} 
                </a>
            ))}
        </div>
    </div>
);

const HowToPlay: React.FC<HowToPlayProps> = ({ onBack, isAuthenticated = false }) => {
  const { t, tRich, language, toggleLanguage } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> {t('htp.back')}
          </button>

          {!isAuthenticated && (
            <button
                onClick={toggleLanguage}
                className="p-2 text-xl hover:scale-110 transition-transform bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-500 shadow-lg"
                title="Switch Language"
            >
                {language === 'en' ? '🇮🇹' : '🇬🇧'}
            </button>
          )}
      </div>

      <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <Download className="text-emerald-400" /> {t('htp.title')}
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
            {t('htp.intro')}
          </p>
      </div>
      
      <AppFilters /> 

      <div className="space-y-12">
          
          <ProviderSection 
              id="strava" 
              title={t('htp.strava.title')}
              desc={t('htp.strava.desc')}
              colorClass="text-[#FC4C02]"
              borderClass="border-[#FC4C02]/30"
              bgClass="bg-[#FC4C02]/10"
              singleNote={t('htp.strava.single_note')}
              bulkNote={t('htp.strava.bulk_note')}
              recommendedDeviceSingle={t('htp.pc_mobile_desk')}
              recommendedDeviceBulk={t('htp.pc_mobile_web')}
              formatSingle=".GPX"
              formatBulk=".FIT, .GPX"
              singleStepsTitle={t('htp.strava.single_step_title')}
              singleSteps={[
                  tRich('htp.strava.single_step_1'),
                  tRich('htp.strava.single_step_2'),
                  tRich('htp.strava.single_step_3'),
                  tRich('htp.strava.single_step_4')
              ]}
              bulkStepsTitle={t('htp.strava.bulk_step_title')}
              bulkSteps={[
                  tRich('htp.strava.bulk_step_1'),
                  tRich('htp.strava.bulk_step_2'),
                  tRich('htp.strava.bulk_step_3'),
                  tRich('htp.strava.bulk_step_4')
              ]}
          />

          <ProviderSection 
              id="garmin" 
              title={t('htp.garmin.title')}
              desc={t('htp.garmin.desc')}
              colorClass="text-[#00AACE]"
              borderClass="border-[#00AACE]/30"
              bgClass="bg-[#00AACE]/10"
              singleNote={t('htp.garmin.single_note')}
              bulkNote={t('htp.garmin.bulk_note')}
              recommendedDeviceSingle={t('htp.pc_mobile_desk')}
              recommendedDeviceBulk={t('htp.pc_mobile_web')}
              formatSingle=".GPX, .FIT"
              formatBulk=".FIT (Original)"
              singleStepsTitle={t('htp.garmin.single_step_title')}
              singleSteps={[
                  tRich('htp.garmin.single_step_1'),
                  tRich('htp.garmin.single_step_2'),
                  tRich('htp.garmin.single_step_3'),
                  tRich('htp.garmin.single_step_4')
              ]}
              bulkStepsTitle={t('htp.garmin.bulk_step_title')}
              bulkSteps={[
                  tRich('htp.garmin.bulk_step_1'),
                  tRich('htp.garmin.bulk_step_2'),
                  tRich('htp.garmin.bulk_step_3')
              ]}
          />

          <ProviderSection 
              id="adidas" 
              title={t('htp.adidas.title')}
              desc={t('htp.adidas.desc')}
              colorClass="text-yellow-400"
              borderClass="border-yellow-500/30"
              bgClass="bg-yellow-500/10"
              singleNote={t('htp.adidas.single_note')}
              bulkNote={t('htp.adidas.bulk_note')}
              recommendedDeviceSingle="N/A"
              recommendedDeviceBulk={t('htp.pc_mobile_web')}
              formatSingle="N/A"
              formatBulk=".JSON (Raw)"
              bulkStepsTitle={t('htp.adidas.bulk_step_title')}
              bulkSteps={[
                  tRich('htp.adidas.bulk_step_1'),
                  tRich('htp.adidas.bulk_step_2'),
                  tRich('htp.adidas.bulk_step_3'),
                  tRich('htp.adidas.bulk_step_4')
              ]}
          />

          <ProviderSection 
              id="apple" 
              title={t('htp.apple.title')}
              desc={t('htp.apple.desc')}
              colorClass="text-gray-200"
              borderClass="border-gray-500/50"
              bgClass="bg-gray-500/20"
              singleNote={t('htp.apple.single_note')}
              bulkNote={t('htp.apple.bulk_note')}
              recommendedDeviceSingle="iPhone"
              recommendedDeviceBulk="iPhone"
              formatSingle=".GPX, .TCX, .FIT"
              formatBulk=".GPX, .FIT"
              singleStepsTitle={t('htp.apple.step_title')}
              singleSteps={[
                  tRich('htp.apple.step_1'),
                  tRich('htp.apple.step_2'),
                  tRich('htp.apple.step_3'),
                  tRich('htp.apple.step_4')
              ]}
          />

          <ProviderSection 
              id="fitbit" 
              title={t('htp.fitbit.title')}
              desc={t('htp.fitbit.desc')}
              colorClass="text-[#00B0B9]"
              borderClass="border-[#00B0B9]/30"
              bgClass="bg-[#00B0B9]/10"
              singleNote={t('htp.fitbit.single_note')}
              bulkNote={t('htp.fitbit.bulk_note')}
              recommendedDeviceSingle={t('htp.mobile_app')}
              recommendedDeviceBulk={t('htp.pc_mobile_web')}
              formatSingle=".TCX"
              formatBulk=".JSON, .CSV"
              singleStepsTitle={t('htp.fitbit.single_step_title')}
              singleSteps={[
                  tRich('htp.fitbit.single_step_1'),
                  tRich('htp.fitbit.single_step_2'),
                  tRich('htp.fitbit.single_step_3'),
                  tRich('htp.fitbit.single_step_4')
              ]}
              bulkStepsTitle={t('htp.fitbit.bulk_step_title')}
              bulkSteps={[
                  tRich('htp.fitbit.bulk_step_1'),
                  tRich('htp.fitbit.bulk_step_2'),
                  tRich('htp.fitbit.bulk_step_3'),
                  tRich('htp.fitbit.bulk_step_4')
              ]}
          />

          <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 shrink-0">
                  <CheckCircle size={32} />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('htp.upload.title')}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {t('htp.upload.desc')}
                  </p>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-emerald-500/20">
                      <strong className="text-emerald-400 block mb-1 text-sm uppercase tracking-wide">{t('htp.upload.guarantee_title')}</strong>
                      <p className="text-gray-400 text-xs">
                          {tRich('htp.upload.guarantee_desc')}
                      </p>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default HowToPlay;