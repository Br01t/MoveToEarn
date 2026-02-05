import React, { useState } from 'react';
import { ArrowRightLeft, Info, Crown, ArrowDown, Activity, CreditCard, Euro, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface WalletActionsProps {
  govBalance: number;
  govToRunRate: number;
  onSwapGovToRun: (amount: number) => void;
  onBuyFiat: (amount: number) => void;
}

const WalletActions: React.FC<WalletActionsProps> = ({ govBalance, govToRunRate, onSwapGovToRun, onBuyFiat }) => {
  const { t } = useLanguage();
  const { showToast } = useGlobalUI();
  const [swapGovAmount, setSwapGovAmount] = useState<string>('');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  
  // Swap Modal States
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  const handleSwapClick = () => {
      const val = parseFloat(swapGovAmount);
      if (isNaN(val) || val <= 0) return;
      if (govBalance < val) {
          showToast(t('alert.insufficient_gov'), 'ERROR');
          return;
      }
      setShowSwapConfirm(true);
      setSwapSuccess(false);
  };

  const confirmSwap = () => {
      const val = parseFloat(swapGovAmount);
      onSwapGovToRun(val);
      setSwapSuccess(true);
      setSwapGovAmount('');
  };

  const closeSwapModal = () => {
      setShowSwapConfirm(false);
      setSwapSuccess(false);
  };

  const handleFiatPurchase = () => {
      const val = parseFloat(fiatAmount);
      if (isNaN(val) || val <= 0) return;
      onBuyFiat(val);
      setFiatAmount('');
  };

  const calculatedRun = swapGovAmount ? (parseFloat(swapGovAmount) * govToRunRate) : 0;

  return (
    <>
        <div className="glass-panel rounded-2xl p-6 relative overflow-visible shrink-0">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowRightLeft className="text-yellow-400" /> {t('wallet.swap.title')}
                    </h2>
                    
                    <div className="relative group">
                        <Info size={16} className="text-gray-500 hover:text-emerald-400 cursor-help transition-colors" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-gray-900 border border-gray-600 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-[10px] text-gray-300 leading-relaxed">
                            {t('wallet.swap.info_tooltip')}
                            <div className="absolute right-1 -bottom-1 w-2 h-2 bg-gray-900 border-r border-b border-gray-600 transform rotate-45"></div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-400 text-xs mb-4">
                    {t('wallet.swap.desc')} <br/>
                    <span className="text-emerald-400">{t('wallet.swap.rate_label')}: 1 GOV = {govToRunRate} RUN</span>
                </p>

                <div className="space-y-2">
                    <div className="relative">
                        <label className="text-[10px] uppercase font-bold text-gray-500 absolute top-2 left-3">{t('wallet.swap.gov_input')}</label>
                        <div className="flex items-center bg-black/40 border border-gray-600 rounded-xl px-3 pt-6 pb-2 focus-within:border-cyan-500 transition-colors">
                            <Crown size={16} className="text-cyan-400 mr-2" />
                            <input 
                                type="number" 
                                value={swapGovAmount}
                                onChange={(e) => setSwapGovAmount(e.target.value)}
                                placeholder="0"
                                className="bg-transparent text-white font-bold w-full focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-gray-700 p-1 rounded-full border border-gray-600">
                            <ArrowDown size={14} className="text-gray-400" />
                        </div>
                    </div>
                    
                    <div className="relative opacity-80">
                        <label className="text-[10px] uppercase font-bold text-gray-500 absolute top-2 left-3">{t('wallet.swap.run_output')}</label>
                        <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-xl px-3 pt-6 pb-2">
                            <Activity size={16} className="text-emerald-400 mr-2" />
                            <span className="text-white font-bold w-full">
                                {swapGovAmount ? (parseFloat(swapGovAmount) * govToRunRate).toFixed(2) : '0'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSwapClick}
                        disabled={!swapGovAmount}
                        className="w-full py-3 mt-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        {t('wallet.swap.btn')}
                    </button>
                </div>
            </div>
        </div>

        {/* BUY FIAT CARD */}
        {/* <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <CreditCard size={120} className="text-white" />
            </div>
            
            <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {t('wallet.buy_gov')}
                </h2>
                <p className="text-gray-400 text-xs mb-6">
                    {t('wallet.buy_desc')} <br/>
                    {t('wallet.rate')}: <span className="text-white font-mono">€1.00 ≈ 10.00 GOV</span>
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">{t('wallet.you_pay')}</label>
                        <div className="flex items-center bg-black/40 border border-gray-600 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-colors">
                            <Euro size={20} className="text-gray-400 mr-2" />
                            <input 
                                type="number" 
                                value={fiatAmount}
                                onChange={(e) => setFiatAmount(e.target.value)}
                                placeholder="50.00"
                                className="bg-transparent text-white font-bold w-full focus:outline-none"
                            />
                            <span className="text-xs font-bold text-gray-500">EUR</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleFiatPurchase}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                    >
                        {t('wallet.proceed_payment')}
                    </button>
                    <p className="text-[10px] text-center text-gray-500">{t('wallet.secured_by')}</p>
                </div>
            </div>
        </div> */}

        {showSwapConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="glass-panel-heavy rounded-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-slide-up">
                    
                    {swapSuccess && (
                        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent animate-pulse"></div>
                    )}

                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-black/20 relative z-10">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {swapSuccess ? <CheckCircle className="text-emerald-400" /> : <ArrowRightLeft className="text-yellow-400" />}
                            {swapSuccess ? t('wallet.swap.success_title') : t('wallet.swap.confirm_title')}
                        </h3>
                        {!swapSuccess && (
                            <button onClick={closeSwapModal} className="text-gray-400 hover:text-white"><X size={20}/></button>
                        )}
                    </div>

                    <div className="p-6 space-y-6 relative z-10">
                        {!swapSuccess ? (
                            <>
                                <p className="text-sm text-gray-300 text-center">
                                    {t('wallet.swap.confirm_msg')}
                                </p>
                                
                                <div className="flex items-center justify-between gap-2">
                                    <div className="bg-black/30 p-3 rounded-xl border border-cyan-500/30 text-center flex-1">
                                        <span className="block text-2xl font-bold text-cyan-400 font-mono">{parseFloat(swapGovAmount).toFixed(2)}</span>
                                        <span className="text-[10px] text-gray-500 font-bold">GOV</span>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-500" />
                                    <div className="bg-black/30 p-3 rounded-xl border border-emerald-500/30 text-center flex-1">
                                        <span className="block text-2xl font-bold text-emerald-400 font-mono">{calculatedRun.toFixed(2)}</span>
                                        <span className="text-[10px] text-gray-500 font-bold">RUN</span>
                                    </div>
                                </div>

                                <div className="text-center text-xs text-gray-500">
                                    {t('wallet.swap.rate_used')}: <span className="text-white">1 GOV = {govToRunRate} RUN</span>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={closeSwapModal} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors">{t('market.cancel')}</button>
                                    <button onClick={confirmSwap} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold text-black transition-colors shadow-lg shadow-emerald-500/20">{t('market.confirm')}</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500 mb-4 animate-bounce-slow">
                                        <CheckCircle size={32} className="text-emerald-400" />
                                    </div>
                                    <p className="text-white font-bold text-lg mb-1">{t('wallet.swap.success_msg')}</p>
                                    <p className="text-gray-400 text-xs">Transaction ID: 0x{Date.now().toString(16)}</p>
                                </div>
                                <button onClick={closeSwapModal} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-colors">{t('wallet.swap.close_btn')}</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default WalletActions;