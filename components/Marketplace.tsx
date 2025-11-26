

import React, { useState } from 'react';
import { Item, User } from '../types';
import { Shield, Zap, ShoppingCart, X, AlertTriangle, CheckCircle, Package, Coins } from 'lucide-react';

interface MarketplaceProps {
  user: User;
  items: Item[];
  onBuy: (item: Item) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user, items, onBuy }) => {
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);

  const handleBuyClick = (item: Item) => {
    setConfirmItem(item);
  };

  const confirmPurchase = () => {
    if (confirmItem) {
      onBuy(confirmItem);
      setConfirmItem(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white">Marketplace</h2>
           <p className="text-gray-400">Spend RUN tokens to upgrade gear or buy GOV packs.</p>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          {user.runBalance.toFixed(2)} RUN
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Package className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white">Market Empty</h3>
          <p className="text-gray-400">No items available currently. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = item.type === 'DEFENSE' ? Shield : (item.type === 'CURRENCY' ? Coins : Zap);
            const canAfford = user.runBalance >= item.priceRun;
            const hasStock = item.quantity > 0;

            return (
              <div key={item.id} className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden transition-colors group flex flex-col ${hasStock ? 'hover:border-emerald-500' : 'opacity-70'}`}>
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${item.type === 'DEFENSE' ? 'bg-blue-500/10 text-blue-400' : (item.type === 'CURRENCY' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-yellow-500/10 text-yellow-400')}`}>
                      <Icon size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-gray-700 text-gray-300">{item.type}</span>
                        <span className={`text-xs font-bold ${hasStock ? (item.quantity < 10 ? 'text-orange-400' : 'text-emerald-400') : 'text-red-500'}`}>
                            {hasStock ? `${item.quantity} Left` : 'Sold Out'}
                        </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 min-h-[3rem]">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
                    <span className="text-2xl font-bold text-emerald-400">{item.priceRun} <span className="text-sm text-gray-500">RUN</span></span>
                    <button
                      onClick={() => canAfford && hasStock && handleBuyClick(item)}
                      disabled={!canAfford || !hasStock}
                      className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                        canAfford && hasStock
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {!hasStock ? 'Sold Out' : (canAfford ? 'Buy' : 'Low Funds')}
                    </button>
                  </div>
                </div>
                {hasStock && <div className="bg-emerald-500/5 h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
             <div className="p-6 border-b border-gray-700 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 Confirm Purchase
               </h3>
               <button onClick={() => setConfirmItem(null)} className="text-gray-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>

             <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700">
                   <div className={`p-3 rounded-lg ${confirmItem.type === 'DEFENSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {confirmItem.type === 'DEFENSE' ? <Shield size={24}/> : <Zap size={24}/>}
                   </div>
                   <div>
                      <div className="text-white font-bold">{confirmItem.name}</div>
                      <div className="text-emerald-400 font-bold">{confirmItem.priceRun} RUN</div>
                   </div>
                </div>

                <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg">
                   <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
                   <p className="text-xs text-yellow-200">
                     Are you sure you want to spend <strong>{confirmItem.priceRun} RUN</strong>?
                   </p>
                </div>
                {confirmItem.type === 'CURRENCY' && (
                     <p className="text-xs text-center text-cyan-400">
                         You will immediately receive {confirmItem.effectValue} GOV.
                     </p>
                )}
             </div>

             <div className="p-6 pt-0 flex gap-3">
               <button 
                 onClick={() => setConfirmItem(null)}
                 className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={confirmPurchase}
                 className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
               >
                 <CheckCircle size={18} /> Confirm
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;