import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Flame, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react'; 
import { NotificationToast, ConfirmModal } from './AdminUI';

interface AdminEconomyTabProps {
  govToRunRate: number;
  // Assicurati che questo sia in millisecondi (e 0 se non è mai stato eseguito)
  lastBurnTimestamp: number; 
  onUpdateExchangeRate: (rate: number) => void;
  onTriggerBurn: () => Promise<any>;
  onDistributeRewards: () => void;
}

const AdminEconomyTab: React.FC<AdminEconomyTabProps> = ({ 
    govToRunRate, lastBurnTimestamp, onUpdateExchangeRate, onTriggerBurn, onDistributeRewards 
}) => {
  const [exchangeRate, setExchangeRate] = useState(govToRunRate.toString());
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burnResult, setBurnResult] = useState<{success: boolean, burned?: number} | null>(null);
  
  // UI Feedback States
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // BURN TIMER LOGIC
  const BURN_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days (Allineato al backend)
  const [timeLeft, setTimeLeft] = useState(0);
  const [canBurn, setCanBurn] = useState(false);

  useEffect(() => {
      const checkTimer = () => {
          const now = Date.now();
          // Importante: lastBurnTimestamp || 0 garantisce che se non è fornito, il cooldown sia 0.
          // Se lastBurnTimestamp è un timestamp recente (es. 10 giorni fa), questo calcolerà il tempo rimanente.
          const diff = now - (lastBurnTimestamp || 0); 

          if (diff >= BURN_COOLDOWN_MS) {
              setTimeLeft(0);
              setCanBurn(true);
          } else {
              setTimeLeft(BURN_COOLDOWN_MS - diff);
              setCanBurn(false);
          }
      };
      
      checkTimer();
      const interval = setInterval(checkTimer, 1000);
      return () => clearInterval(interval);
  }, [lastBurnTimestamp]); // Dipendenza da lastBurnTimestamp per ricalcolare quando cambia

  const formatTime = (ms: number) => {
      const d = Math.floor(ms / (1000 * 60 * 60 * 24));
      const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      return `${d}d ${h}h ${m}m ${s}s`;
  };

  const progressPercent = Math.min(100, Math.max(0, 100 - (timeLeft / BURN_COOLDOWN_MS) * 100));
  
  const nextBurnTimestamp = useMemo(() => {
    if (lastBurnTimestamp) {
      return lastBurnTimestamp + BURN_COOLDOWN_MS;
    }
    return null;
  }, [lastBurnTimestamp, BURN_COOLDOWN_MS]);

  const handleRateUpdate = () => {
      const val = parseInt(exchangeRate);
      if (val > 0) {
          onUpdateExchangeRate(val);
          setNotification({ message: "Exchange rate updated", type: 'success' });
      }
  };

  const executeBurn = async () => {
      const result = await onTriggerBurn();
      if (result && result.success) { 
          setBurnResult(result);
          setShowBurnModal(false);
          setNotification({ message: `Global Burn executed!`, type: 'success' });
      } else {
          setNotification({ message: result?.message || "Burn failed", type: 'error' }); 
      }
  };
  
  return (
    <div className="space-y-8">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        
        {/* SWAP CONFIG (invariato) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="text-cyan-400" /> Swap Configuration
            </h3>
            <div className="flex items-end gap-4 max-w-md">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">RUN per 1 GOV</label>
                    <input 
                        type="number" 
                        value={exchangeRate} 
                        onChange={(e) => setExchangeRate(e.target.value)} 
                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono font-bold text-lg" 
                    />
                </div>
                <button onClick={handleRateUpdate} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-0.5">
                    Update Rate
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Controls the output of the Wallet Swap feature.</p>
        </div>

        {/* GLOBAL BURN */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Flame size={120} /></div>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Flame className="text-red-500" /> Global Token Burn (30 Day Cooldown)
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                
                {/* COLONNA SINISTRA: Timer e Barra */}
                <div className="w-full max-w-xs mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                        <span>Cooldown</span>
                        <span className={canBurn ? 'text-emerald-400' : 'text-red-400'}>{canBurn ? 'READY' : 'LOCKED'}</span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700 mb-2">
                        {/* Se canBurn è falso (bloccato), la barra mostra la percentuale di completamento */}
                        <div className={`h-full transition-all duration-1000 ${canBurn ? 'bg-emerald-500 w-full' : 'bg-red-500'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    
                    {!canBurn && (
                        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2">
                            <span className="block text-[10px] text-red-400 uppercase font-bold tracking-wider">Next Burn In</span>
                            <span className="font-mono text-xl font-bold text-white">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                {/* COLONNA DESTRA: Date del Burn e Pulsante */}
                {/* Modifica la classe container per allineare affianco su schermi medi+ */}
                <div className="flex flex-col items-center md:flex-row md:items-center gap-4"> 
                    
                    {/* POSIZIONAMENTO DEI TIMESTAMP - IL CHECK ORA È SOLO SU lastBurnTimestamp, non su canBurn */}
                    {lastBurnTimestamp > 0 && (
                        <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 min-w-[200px] shadow-lg">
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                <Calendar size={12} className="text-gray-400" /> Ultimo Burn
                            </div>
                            <p className="font-mono text-sm text-white mb-3">
                                {/* Visualizza solo la data, più pulito in un piccolo spazio */}
                                {new Date(lastBurnTimestamp).toLocaleDateString()}
                            </p>
                            
                            {nextBurnTimestamp && (
                                <>
                                    <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${canBurn ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <Clock size={12} className={canBurn ? 'text-emerald-400' : 'text-red-400'} /> Sblocco Burn
                                    </div>
                                    <p className="font-mono text-sm text-white">
                                        {new Date(nextBurnTimestamp).toLocaleDateString()}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setShowBurnModal(true)} 
                        disabled={!canBurn}
                        className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${canBurn ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        <Flame size={24} /> TRIGGER BURN
                    </button>
                </div>
                
            </div>
        </div>

        {/* ZONE REWARDS (invariato) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-400" /> Zone Rewards Distribution
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                Manually trigger the daily distribution of Zone Interest Pools to owners and top runners.
                (Normally automated via Cron).
            </p>
            <button onClick={onDistributeRewards} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Distribute Rewards Now
            </button>
        </div>

        {/* BURN CONFIRM MODAL (invariato) */}
        {showBurnModal && (
            <ConfirmModal 
                title="INITIATE GLOBAL BURN?"
                message="This will permanently destroy 2% of all circulating RUN tokens and distribute GOV rewards to holders. This action cannot be undone."
                onConfirm={executeBurn}
                onCancel={() => setShowBurnModal(false)}
                isDestructive
                confirmLabel="CONFIRM BURN"
            />
        )}
    </div>
  );
};

export default AdminEconomyTab;