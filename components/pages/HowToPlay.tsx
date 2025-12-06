
import React from 'react';
import { ArrowLeft, Play, UploadCloud, MapPin, Trophy, Shield, HelpCircle, Download } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface HowToPlayProps {
  onBack: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 pb-24">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} /> {t('htp.back')}
      </button>

      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <HelpCircle className="text-emerald-400" /> {t('htp.title')}
      </h1>

      <p className="text-xl text-gray-400 leading-relaxed">
        {t('htp.subtitle')}
      </p>

      {/* STEP 1 */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <Play size={100} className="text-emerald-500" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="bg-emerald-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">1</div>
            {t('htp.step1')}
         </h2>
         <p className="text-gray-300 mb-4">
            {t('htp.step1_desc')}
         </p>
         <div className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400 mb-6">
            <strong>{t('htp.step1_req')}</strong>
         </div>

         {/* EXPORT INSTRUCTIONS */}
         <div className="border-t border-gray-700 pt-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Download size={16} className="text-emerald-400" /> {t('htp.export_title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strava */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-[#FC4C02] font-bold mb-2 flex items-center gap-2">Strava</div>
                    <ol className="text-xs text-gray-400 list-decimal list-inside space-y-2">
                        <li>Log in to <strong>strava.com</strong> on your computer (export is restricted on mobile app).</li>
                        <li>Click on the activity you just finished.</li>
                        <li>Click the <strong>(...)</strong> three dots menu on the left sidebar.</li>
                        <li>Select <strong>Export GPX</strong>.</li>
                    </ol>
                </div>

                {/* Garmin */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-[#00AACE] font-bold mb-2 flex items-center gap-2">Garmin Connect</div>
                    <ol className="text-xs text-gray-400 list-decimal list-inside space-y-2">
                        <li>Log in to <strong>connect.garmin.com</strong>.</li>
                        <li>Open the specific activity details page.</li>
                        <li>Click the <strong>Gear Icon</strong> (Settings) in the top right.</li>
                        <li>Select <strong>Export to GPX</strong> or TCX.</li>
                    </ol>
                </div>
            </div>
            
            <p className="text-[10px] text-gray-500 mt-4 italic">
                *Tip: For Apple Health, Nike Run Club, or Adidas Running, you may need a 3rd party sync tool (like "RunGap" on iOS or "SyncMyTracks" on Android) to export the raw file.
            </p>
         </div>
      </div>

      {/* STEP 2 */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <UploadCloud size={100} className="text-cyan-500" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="bg-cyan-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">2</div>
            {t('htp.step2')}
         </h2>
         <p className="text-gray-300 mb-4">
            {t('htp.step2_desc')}
         </p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
               <strong className="text-white block mb-2">{t('htp.step2_free')}</strong>
               <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                  <li>Select "Manual Upload".</li>
                  <li>Upload the .GPX file you downloaded in Step 1.</li>
                  <li>Wait for the Anti-Fraud parser to validate your speed and location.</li>
               </ul>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-yellow-500/30">
               <strong className="text-yellow-400 block mb-2">{t('htp.step2_premium')}</strong>
               <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                  <li>Link your Strava account in Profile.</li>
                  <li>Your runs appear automatically.</li>
                  <li>Click to sync instantly.</li>
               </ul>
            </div>
         </div>
      </div>

      {/* STEP 3 */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin size={100} className="text-purple-500" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="bg-purple-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">3</div>
            {t('htp.step3')}
         </h2>
         <p className="text-gray-300 mb-4">
            {t('htp.step3_desc')}
         </p>
         <ul className="space-y-4">
            <li className="flex gap-3">
               <div className="bg-emerald-900/50 p-2 h-fit rounded text-emerald-400"><MapPin size={20}/></div>
               <div>
                  <strong className="text-white">{t('htp.mint')}</strong>
                  <p className="text-sm text-gray-400">If no one owns this area, you can pay <strong>50 RUN</strong> to Mint it. You become the owner and earn <strong>5 GOV</strong> immediately.</p>
               </div>
            </li>
            <li className="flex gap-3">
               <div className="bg-red-900/50 p-2 h-fit rounded text-red-400"><Trophy size={20}/></div>
               <div>
                  <strong className="text-white">{t('htp.conquer')}</strong>
                  <p className="text-sm text-gray-400">If the zone is owned by someone else, you can challenge them. If you run more KM in that zone than their record, you take ownership! Conquest costs <strong>50 RUN</strong> but awards <strong>10 GOV</strong>.</p>
               </div>
            </li>
            <li className="flex gap-3">
               <div className="bg-blue-900/50 p-2 h-fit rounded text-blue-400"><Shield size={20}/></div>
               <div>
                  <strong className="text-white">{t('htp.reinforce')}</strong>
                  <p className="text-sm text-gray-400">If you run in a zone you already own, you increase its Defense Level, making it harder for others to steal.</p>
               </div>
            </li>
         </ul>
      </div>

    </div>
  );
};

export default HowToPlay;