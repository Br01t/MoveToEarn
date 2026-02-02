import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Flame, Calendar, CheckCircle, AlertTriangle, Clock, Database, Users } from 'lucide-react'; 
import { NotificationToast, ConfirmModal } from './AdminUI';

interface AdminEconomyTabProps {
  govToRunRate: number;
  lastBurnTimestamp: number; 
  onUpdateExchangeRate: (rate: number) => void;
  onTriggerBurn: () => Promise<any>;
  onTriggerMaintenance?: () => Promise<void>;
  onTriggerUserMaintenance?: () => Promise<void>;
  onDistributeRewards: () => void;
}

const AdminEconomyTab: React.FC<AdminEconomyTabProps> = ({ 
    govToRunRate, lastBurnTimestamp, onUpdateExchangeRate, onTriggerBurn, onTriggerMaintenance, onTriggerUserMaintenance, onDistributeRewards 
}) => {
  const [exchangeRate, setExchangeRate] = useState(govToRunRate.toString());
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showUserMaintenanceModal, setShowUserMaintenanceModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const BURN_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; 
  const [timeLeft, setTimeLeft] = useState(0);
  const [canBurn, setCanBurn] = useState(false);

  useEffect(() => {
      const checkTimer = () => {
          const now = Date.now();
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
  }, [lastBurnTimestamp]);

  const formatTime = (ms: number) => {
      const d = Math.floor(ms / (1000 * 60 * 60 * 24));
      const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      return `${d}d ${h}h ${m}m ${s}s`;
  };

  const progressPercent = Math.min(100, Math.max(0, 100 - (timeLeft / BURN_COOLDOWN_MS) * 100));
  
  const nextBurnTimestamp = useMemo(() => {
    return lastBurnTimestamp ? lastBurnTimestamp + BURN_COOLDOWN_MS : null;
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
          setShowBurnModal(false);
          setNotification({ message: `Global Burn executed!`, type: 'success' });
      } else {
          setNotification({ message: result?.message || "Burn failed", type: 'error' }); 
      }
  };

  const executeMaintenance = async () => {
      if (!onTriggerMaintenance) return;
      setIsProcessing(true);
      setShowMaintenanceModal(false);
      try {
          await onTriggerMaintenance();
      } catch (e) {
          console.error("Maintenance execution error:", e);
      } finally {
          setIsProcessing(false);
      }
  };

  const executeUserMaintenance = async () => {
    if (!onTriggerUserMaintenance) return;
    setIsProcessing(true);
    setShowUserMaintenanceModal(false);
    try {
        await onTriggerUserMaintenance();
    } catch (e) {
        console.error("User maintenance execution error:", e);
    } finally {
        setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-8">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="text-cyan-400" /> Swap Configuration
            </h3>
            <div className="flex items-end gap-4 max-w-md">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">RUN per 1 GOV</label>
                    <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono font-bold text-lg" />
                </div>
                <button onClick={handleRateUpdate} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-0.5">Update Rate</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Database size={80} className="text-blue-400" /></div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                    <Database className="text-blue-400" /> Sectors Maintenance
                </h3>
                <p className="text-xs text-gray-400 mb-4 max-w-2xl relative z-10">
                    Scans all historical runs to reconstruct ground truth for <strong>record_km</strong> in every sector.
                </p>
                <button 
                    onClick={() => setShowMaintenanceModal(true)}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg relative z-10 text-sm"
                >
                    {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Database size={16} />}
                    {isProcessing ? 'Processing...' : 'Recalculate Zones'}
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Users size={80} className="text-emerald-400" /></div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                    <Users className="text-emerald-400" /> Users Maintenance
                </h3>
                <p className="text-xs text-gray-400 mb-4 max-w-2xl relative z-10">
                    Aggregates KM from all validated runs to align <strong>total_km</strong> in profiles.
                </p>
                <button 
                    onClick={() => setShowUserMaintenanceModal(true)}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg relative z-10 text-sm"
                >
                    {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Users size={16} />}
                    {isProcessing ? 'Processing...' : 'Recalculate Users KM'}
                </button>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Flame size={120} /></div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Flame className="text-red-500" /> Global Token Burn
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                        <span>Cooldown</span>
                        <span className={canBurn ? 'text-emerald-400' : 'text-red-400'}>{canBurn ? 'READY' : 'LOCKED'}</span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700 mb-2">
                        <div className={`h-full transition-all duration-1000 ${canBurn ? 'bg-emerald-500 w-full' : 'bg-red-500'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    {!canBurn && (
                        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2">
                            <span className="block text-[10px] text-red-400 uppercase font-bold tracking-wider">Next Burn In</span>
                            <span className="font-mono text-xl font-bold text-white">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center md:flex-row gap-4"> 
                    {lastBurnTimestamp > 0 && (
                        <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 min-w-[200px]">
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase mb-1"><Calendar size={12}/> Ultimo Burn</div>
                            <p className="font-mono text-sm text-white mb-3">{new Date(lastBurnTimestamp).toLocaleDateString()}</p>
                            {nextBurnTimestamp && (
                                <><div className="flex items-center gap-2 text-[11px] font-bold uppercase"><Clock size={12}/> Sblocco Burn</div>
                                <p className="font-mono text-sm text-white">{new Date(nextBurnTimestamp).toLocaleDateString()}</p></>
                            )}
                        </div>
                    )}
                    <button onClick={() => setShowBurnModal(true)} disabled={!canBurn} className={`px-8 py-4 rounded-xl font-bold text-lg ${canBurn ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}><Flame size={24} /> TRIGGER BURN</button>
                </div>
            </div>
        </div>

        {showBurnModal && <ConfirmModal title="INITIATE GLOBAL BURN?" message="This will permanently destroy 2% of all circulating RUN tokens. This action cannot be undone." onConfirm={executeBurn} onCancel={() => setShowBurnModal(false)} isDestructive confirmLabel="CONFIRM BURN" />}
        {showMaintenanceModal && <ConfirmModal title="RUN SECTOR MAINTENANCE?" message="This will scan every activity ever recorded to verify zone records. It may take a few seconds." onConfirm={executeMaintenance} onCancel={() => setShowMaintenanceModal(false)} confirmLabel="Start Maintenance" />}
        {showUserMaintenanceModal && <ConfirmModal title="RUN USER MAINTENANCE?" message="This will aggregate kilometers from all validated runs to align 'total_km' in user profiles. This ensures leaderboard accuracy." onConfirm={executeUserMaintenance} onCancel={() => setShowUserMaintenanceModal(false)} confirmLabel="Start Maintenance" />}
    </div>
  );
};

export default AdminEconomyTab;