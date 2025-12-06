
import React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

const Terms: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <FileText className="text-emerald-400" /> {t('page.terms.title')}
      </h1>

      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-gray-300 space-y-4">
        <p>By accessing ZoneRun, you agree to these terms.</p>
        
        <h3 className="text-xl font-bold text-white mt-6">1. Fair Play</h3>
        <p>
            GPS spoofing, automated bots, or emulating movement without physical activity is strictly prohibited 
            and will result in a permanent ban and forfeiture of all assets.
        </p>

        <h3 className="text-xl font-bold text-white mt-6">2. Virtual Assets</h3>
        <p>
            RUN and GOV tokens, as well as Zone NFTs, are virtual items. Their value fluctuates based on market demand. 
            ZoneRun developers do not guarantee any monetary value.
        </p>

        <h3 className="text-xl font-bold text-white mt-6">3. Safety</h3>
        <p>
            ZoneRun encourages outdoor activity. You agree to run safely, obey local traffic laws, 
            and respect private property boundaries when exploring new zones.
        </p>
      </div>
    </div>
  );
};

export default Terms;