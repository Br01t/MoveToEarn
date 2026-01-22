
import React from 'react';
import { X, AlertTriangle, ShoppingBag, Activity } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface InsufficientFundsModalProps {
  onClose: () => void;
  onNavigate: (view: any) => void;
  requiredAmount?: number;
  currentBalance?: number;
}

const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({ onClose, onNavigate, requiredAmount, currentBalance }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel-heavy rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-slide-up border-red-500/30 border">
        
        <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={32} className="text-red-500 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                {t('app.funds.title')}
            </h2>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {t('app.funds.body')}
            </p>

            {requiredAmount !== undefined && currentBalance !== undefined && (
                <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-bold uppercase">Required</span>
                        <span className="text-white font-mono font-bold">{requiredAmount} RUN</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-bold uppercase">Balance</span>
                        <span className="text-red-400 font-mono font-bold">{currentBalance.toFixed(2)} RUN</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => { onClose(); onNavigate('MARKETPLACE'); }}
                    className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                    <ShoppingBag size={18} /> {t('app.funds.btn')}
                </button>
                
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-transparent text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientFundsModal;