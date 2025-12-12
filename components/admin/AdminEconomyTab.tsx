
import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Flame, Gift, Clock, Lock } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { NotificationToast } from './AdminUI';

interface AdminEconomyTabProps {
  govToRunRate: number;
  lastBurnTimestamp?: number;
  onUpdateExchangeRate: (rate: number) => void;
  onTriggerBurn: () => Promise<any>;
  onDistributeRewards: () => void;
}

const AdminEconomyTab: React.FC<AdminEconomyTabProps> = ({ 
    govToRunRate, lastBurnTimestamp = 0, onUpdateExchangeRate, onTriggerBurn, onDistributeRewards 
}) => {
  const { t } = useLanguage();
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          const nextBurnTime = lastBurnTimestamp + DAYS_30_MS;
          const diff = nextBurnTime - now;
          setTimeLeft(Math.max(0, diff));
      }, 1000);
      return () => clearInterval(interval);
  }, [lastBurnTimestamp]);

  const canBurn = timeLeft <= 0;

  const handleConfirmBurn = async () => { 
      // Allow execution even if canBurn logic in UI says no, because maybe client time is drifted
      // The backend/hook check is the authority.
      
      const result = await onTriggerBurn(); 
      
      if (result.success) {
          setNotification({ message: `Burn Executed: ${result.totalBurned?.toFixed(0)} RUN from ${result.count} users.`, type: 'success' });
      } else {
          setNotification({ message: result.message || "Burn Failed or Cooldown Active", type: 'error' });
      }
      setShowBurnModal(false); 
  };
  
  const handleConfirmReward = () => { 
      onDistributeRewards(); 
      setShowRewardModal(false); 
      setNotification({ message: "Distribution initiated via RPC", type: 'success' });
  };

  const formatTime = (ms: number) => {
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      return `${days}d ${hours}h ${minutes}m`;
  };

  const progressPercent = Math.min(100, Math.max(0, ((DAYS_30_MS - timeLeft) / DAYS_30_MS) * 100));

  return (
    <div className="space-y-8">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

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
            {/* Burn Protocol Card */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={100} /></div>
                
                <div className={`p-4 rounded-full mb-4 relative ${canBurn ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-gray-500'}`}>
                    <Flame size={48} className={canBurn ? 'animate-pulse' : ''} />
                    {!canBurn && <Lock size={24} className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1 border border-gray-600" />}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Trigger Burn</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                    Incinerates 2% of total circulating RUN supply. Can only be triggered once every 30 days.
                </p>

                {/* Progress Bar / Timer */}
                <div className="w-full max-w-xs mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                        <span>Cooldown</span>
                        <span className={canBurn ? 'text-emerald-400' : 'text-white'}>{canBurn ? 'READY' : formatTime(timeLeft)}</span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                        <div className={`h-full transition-all duration-1000 ${canBurn ? 'bg-emerald-500 w-full' : 'bg-red-500'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>

                <button 
                    onClick={() => setShowBurnModal(true)} 
                    disabled={!canBurn}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${canBurn ? 'bg-red-600 hover:bg-red-500 text-white hover:scale-105' : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}`}
                >
                    {canBurn ? 'Execute Protocol' : <><Clock size={16} /> Locked</>}
                </button>
            </div>

            {/* Reward Distribution Card */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
                <Gift size={48} className="text-cyan-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Distribute Rewards</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                    Manually triggers the zone reward distribution cycle. Usually runs automatically via cron.
                </p>
                <button onClick={() => setShowRewardModal(true)} className="px-8 py-3 bg-cyan-600 rounded-xl font-bold shadow-lg hover:bg-cyan-500 transition-colors text-white">Distribute Airdrop</button>
            </div>
        </div>

        {/* Burn Modal */}
        {showBurnModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-gray-800 rounded-2xl border border-red-500 w-full max-w-md p-6 space-y-4 shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-slide-up">
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                        <Flame size={24} />
                        <h3 className="text-xl font-bold text-white">Confirm Global Burn</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        You are about to burn <strong className="text-red-400">2% of ALL user RUN balances</strong>.
                        <br/><br/>
                        This action is irreversible and will be recorded on the blockchain ledger.
                        Ensure you want to proceed.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowBurnModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold">Cancel</button>
                        <button onClick={handleConfirmBurn} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg">IGNITE</button>
                    </div>
                </div>
            </div>
        )}

        {/* Reward Modal */}
        {showRewardModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-gray-800 rounded-2xl border border-cyan-500 w-full max-w-md p-6 space-y-4 shadow-[0_0_50px_rgba(8,145,178,0.4)] animate-slide-up">
                    <h3 className="text-xl font-bold text-white">Distribute Zone Rewards</h3>
                    <p className="text-gray-300 text-sm">
                        This will calculate and send accumulated RUN from Zone Pools to owners and top runners.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowRewardModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold">Cancel</button>
                        <button onClick={handleConfirmReward} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg">Send</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminEconomyTab;