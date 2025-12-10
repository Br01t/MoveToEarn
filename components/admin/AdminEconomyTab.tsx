
import React, { useState } from 'react';
import { ArrowRightLeft, Flame, Gift } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface AdminEconomyTabProps {
  govToRunRate: number;
  onUpdateExchangeRate: (rate: number) => void;
  onTriggerBurn: () => void;
  onDistributeRewards: () => void;
}

const AdminEconomyTab: React.FC<AdminEconomyTabProps> = ({ 
    govToRunRate, onUpdateExchangeRate, onTriggerBurn, onDistributeRewards 
}) => {
  const { t } = useLanguage();
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const handleConfirmBurn = () => { onTriggerBurn(); setShowBurnModal(false); };
  const handleConfirmReward = () => { onDistributeRewards(); setShowRewardModal(false); };

  return (
    <div className="space-y-8">
        {/* Rate Config */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ArrowRightLeft className="text-emerald-400" /> {t('admin.eco.swap_config')}
            </h3>
            <div className="flex items-end gap-4 max-w-sm">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">{t('admin.eco.rate_label')}</label>
                    <input 
                        type="number" 
                        value={govToRunRate} 
                        onChange={(e) => onUpdateExchangeRate(parseInt(e.target.value) || 0)} 
                        className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-emerald-500" 
                    />
                </div>
                <div className="bg-gray-900 p-2 rounded text-emerald-400 font-bold text-sm">RUN</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('admin.eco.rate_help')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
                <Flame size={48} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Trigger Burn</h3>
                <button onClick={() => setShowBurnModal(true)} className="px-8 py-3 bg-red-600 rounded-xl font-bold shadow-lg hover:bg-red-500 transition-colors">Execute Burn Protocol</button>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
                <Gift size={48} className="text-cyan-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Distribute Rewards</h3>
                <button onClick={() => setShowRewardModal(true)} className="px-8 py-3 bg-cyan-600 rounded-xl font-bold shadow-lg hover:bg-cyan-500 transition-colors">Distribute Airdrop</button>
            </div>
        </div>

        {/* Burn Modal */}
        {showBurnModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-gray-800 rounded-2xl border border-red-500 w-full max-w-md p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white">Confirm Burn</h3>
                    <p className="text-gray-300">Burning 5M RUN. Action irreversible.</p>
                    <div className="flex gap-3"><button onClick={() => setShowBurnModal(false)} className="flex-1 py-3 bg-gray-700 rounded-xl">Cancel</button><button onClick={handleConfirmBurn} className="flex-1 py-3 bg-red-600 rounded-xl font-bold">Ignite</button></div>
                </div>
            </div>
        )}

        {/* Reward Modal */}
        {showRewardModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-gray-800 rounded-2xl border border-cyan-500 w-full max-w-md p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white">Distribute Airdrop</h3>
                    <p className="text-gray-300">Sending GOV based on KM stats.</p>
                    <div className="flex gap-3"><button onClick={() => setShowRewardModal(false)} className="flex-1 py-3 bg-gray-700 rounded-xl">Cancel</button><button onClick={handleConfirmReward} className="flex-1 py-3 bg-cyan-600 rounded-xl font-bold">Send</button></div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminEconomyTab;