
import React, { useState } from 'react';
import { MapPin, Crown, CheckCircle, X, Edit2, Info, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface ZoneDiscoveryModalProps {
  isOpen: boolean;
  data: {
    lat: number;
    lng: number;
    defaultName: string;
    cost: number;
    reward: number;
  };
  onConfirm: (name: string) => void;
  onDiscard: () => void;
}

const ZoneDiscoveryModal: React.FC<ZoneDiscoveryModalProps> = ({ isOpen, data, onConfirm, onDiscard }) => {
  const { t } = useLanguage();
  const [customName, setCustomName] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const nameToSubmit = customName.trim() || data.defaultName;

    // Validation: Check for "Name, City - CC" format
    // Regex looks for: characters, comma, characters, " - ", two uppercase letters
    const isValidFormat = /.+,.+\s-\s[A-Z]{2}$/.test(nameToSubmit);

    if (!isValidFormat && !warning) {
        setWarning("Format recommended: 'Name, City - CC' (e.g. 'Central Park, NY - US') for proper map grouping. Click Mint again to ignore.");
        return;
    }

    onConfirm(nameToSubmit);
    setCustomName('');
    setWarning(null);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 rounded-2xl border-2 border-emerald-500 w-full max-w-sm shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col animate-slide-up relative">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-900/40 to-gray-900 text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
             <MapPin size={32} className="text-black" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">{t('discovery.title')}</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            {t('discovery.subtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 relative z-10">
           {/* Coords */}
           <div className="bg-black/40 p-3 rounded-lg border border-gray-700 text-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">{t('discovery.coords')}</span>
              <span className="font-mono text-emerald-400 text-sm">
                 {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
              </span>
           </div>

           {/* Naming Input */}
           <div>
              <label className="text-xs font-bold text-gray-300 uppercase mb-2 flex items-center gap-2">
                 <Edit2 size={12} className="text-emerald-400"/> {t('discovery.name_label')}
              </label>
              <input 
                 type="text" 
                 placeholder={data.defaultName || t('discovery.name_placeholder')}
                 value={customName}
                 onChange={(e) => {
                     setCustomName(e.target.value);
                     setWarning(null); // Clear warning on edit
                 }}
                 className={`w-full bg-gray-800 border focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${warning ? 'border-yellow-500' : 'border-gray-600'}`}
                 autoFocus
              />
              <div className="mt-2 flex items-start gap-2 text-[10px] text-gray-500">
                 <Info size={12} className="shrink-0 mt-0.5" />
                 {t('discovery.naming_tip')}
              </div>
              
              {/* Warning Message */}
              {warning && (
                  <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-500/50 rounded-lg flex items-start gap-2 animate-fade-in">
                      <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-yellow-200 leading-tight">{warning}</p>
                  </div>
              )}
           </div>

           {/* Cost/Reward Stats */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-center">
                 <span className="block text-[10px] text-red-300 uppercase font-bold">{t('discovery.cost')}</span>
                 <span className="text-lg font-bold text-white">{data.cost} RUN</span>
              </div>
              <div className="bg-cyan-900/20 border border-cyan-900/50 p-3 rounded-lg text-center">
                 <span className="block text-[10px] text-cyan-300 uppercase font-bold">{t('discovery.reward')}</span>
                 <span className="text-lg font-bold text-white">+{data.reward} GOV</span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-3 relative z-10">
           <button 
             onClick={onDiscard}
             className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
           >
             <X size={16} /> {t('discovery.discard_btn')}
           </button>
           <button 
             onClick={handleSubmit}
             className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
           >
             <Crown size={16} /> {warning ? 'Confirm Anyway' : t('discovery.mint_btn')}
           </button>
        </div>

      </div>
    </div>
  );
};

export default ZoneDiscoveryModal;