import React, { useState } from 'react';
import { Item, User } from '../types';
import { Shield, Zap, ShoppingCart, X, AlertTriangle, CheckCircle, Package, Coins, Clock, TrendingUp, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useGlobalUI } from '../contexts/GlobalUIContext';

interface MarketplaceProps {
  user: User;
  items: Item[];
  onBuy: (item: Item) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user, items, onBuy }) => {
  const { t, tRich } = useLanguage();
  const { triggerParticles } = useGlobalUI();
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);

  const handleBuyClick = (item: Item) => {
    setConfirmItem(item);
  };

  const confirmPurchase = (e: React.MouseEvent) => {
    if (confirmItem) {
      triggerParticles(e.clientX, e.clientY, '#10b981');
      onBuy(confirmItem);
      setConfirmItem(null);
    }
  };

  const hasFlashItems = items.some(i => i.type === 'CURRENCY' && i.quantity > 0);

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
             <ShoppingBag size={32} className="text-emerald-400" /> {t('market.title')}
           </h2>
           <p className="text-gray-400 font-medium">{t('market.subtitle')}</p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-lg text-emerald-400 font-mono font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          {user.runBalance.toFixed(2)} RUN
        </div>
      </div>

      {hasFlashItems && (
        <div className="bg-gradient-to-r from-yellow-900/40 to-transparent border-l-4 border-yellow-500 p-6 rounded-r-xl mb-8 relative overflow-hidden group animate-fade-in glass-panel border-y-0 border-r-0">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={100} className="text-yellow-500" />
           </div>
           <div className="relative z-10 flex items-start gap-4">
               <div className="bg-yellow-500/20 p-3 rounded-lg text-yellow-400 shrink-0 animate-pulse">
                   <TrendingUp size={24} />
               </div>
               <div>
                   <h4 className="font-bold text-white text-lg mb-1 uppercase tracking-wide">{t('market.flash_active')}</h4>
                   <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
                       {tRich('market.flash_desc')}
                       <span className="text-yellow-400 font-bold block mt-1">{t('market.flash_warn')}</span>
                   </p>
               </div>
           </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-xl">
          <Package className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white uppercase tracking-wide">{t('market.empty')}</h3>
          <p className="text-gray-400">{tRich('market.empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = item.type === 'DEFENSE' ? Shield : (item.type === 'CURRENCY' ? Coins : Zap);
            const canAfford = user.runBalance >= item.priceRun;
            const hasStock = item.quantity > 0;
            const isLowStock = item.quantity > 0 && item.quantity < 10;

            return (
              <div 
                key={item.id} 
                className={`glass-panel rounded-xl overflow-hidden transition-all group flex flex-col relative ${hasStock ? 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'opacity-60 grayscale'}`}
              >
                {isLowStock && (
                    <div className="absolute top-0 right-0 bg-orange-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                        {t('market.low_stock')}
                    </div>
                )}
                
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg border border-white/5 ${item.type === 'DEFENSE' ? 'bg-blue-500/10 text-blue-400' : (item.type === 'CURRENCY' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-yellow-500/10 text-yellow-400')}`}>
                      <Icon size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-black/40 text-gray-300 tracking-wider border border-white/5">{item.type}</span>
                        <span className={`text-xs font-bold font-mono ${hasStock ? (isLowStock ? 'text-orange-400' : 'text-emerald-400') : 'text-red-500'}`}>
                            {hasStock ? `${item.quantity} ${t('market.left')}` : t('market.sold_out')}
                        </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 min-h-[3rem] font-medium">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold">{t('market.price')}</span>
                        <span className="text-2xl font-bold text-emerald-400 font-mono">{item.priceRun} <span className="text-sm text-gray-500 font-sans">RUN</span></span>
                    </div>
                    <button
                      onClick={() => canAfford && hasStock && handleBuyClick(item)}
                      disabled={!canAfford || !hasStock}
                      data-text={t('market.buy')}
                      className={`btn-glitch px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all uppercase tracking-wide text-sm ${
                        canAfford && hasStock
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 hover:scale-105' 
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {!hasStock ? t('market.sold_out') : (canAfford ? t('market.buy') : t('market.low_funds'))}
                    </button>
                  </div>
                </div>
                {hasStock && <div className="bg-emerald-500/20 h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>}
              </div>
            );
          })}
        </div>
      )}

      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel-heavy rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
               <h3 className="text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
                 {t('market.confirm_title')}
               </h3>
               <button onClick={() => setConfirmItem(null)} className="text-gray-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>

             <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                   <div className={`p-3 rounded-lg ${confirmItem.type === 'DEFENSE' ? 'bg-blue-500/20 text-blue-400' : (confirmItem.type === 'CURRENCY' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400')}`}>
                      {confirmItem.type === 'DEFENSE' ? <Shield size={24}/> : (confirmItem.type === 'CURRENCY' ? <Coins size={24}/> : <Zap size={24}/>)}
                   </div>
                   <div>
                      <div className="text-white font-bold uppercase tracking-wide">{confirmItem.name}</div>
                      <div className="text-emerald-400 font-bold font-mono">{confirmItem.priceRun} RUN</div>
                   </div>
                </div>

                <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                   <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
                   <p className="text-xs text-yellow-200">
                     {t('market.confirm_warn')} <strong>{confirmItem.priceRun} RUN</strong>?
                     <br/>{tRich('market.undo_warning')}
                   </p>
                </div>
                {confirmItem.type === 'CURRENCY' && (
                     <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30 text-center">
                         <p className="text-xs text-cyan-400 font-bold mb-1">
                             {t('market.instant_effect')}
                         </p>
                         <p className="text-sm text-white">
                             {t('market.receive_immediate')} <strong className="text-cyan-400 font-mono">+{confirmItem.effectValue} GOV</strong>
                         </p>
                     </div>
                )}
             </div>

             <div className="p-6 pt-0 flex gap-3">
               <button 
                 onClick={() => setConfirmItem(null)}
                 className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors uppercase tracking-wide text-sm"
               >
                 {t('market.cancel')}
               </button>
               <button 
                 onClick={confirmPurchase}
                 className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase tracking-wide text-sm"
               >
                 <CheckCircle size={18} /> {t('market.confirm')}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;