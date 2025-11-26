
import React, { useState } from 'react';
import { Item, User } from '../types';
import { MOCK_ITEMS } from '../constants';
import { Shield, Zap, ShoppingCart, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface MarketplaceProps {
  user: User;
  onBuy: (item: Item) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user, onBuy }) => {
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
           <p className="text-gray-400">Use GOV tokens to upgrade your strategy.</p>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 font-mono font-bold flex items-center gap-2">
          <Zap size={16} />
          {user.govBalance} GOV
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ITEMS.map((item) => {
           const Icon = item.type === 'DEFENSE' ? Shield : Zap;
           const canAfford = user.govBalance >= item.priceGov;

           return (
            <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-cyan-500 transition-colors group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${item.type === 'DEFENSE' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    <Icon size={32} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-gray-700 text-gray-300">{item.type}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-6 min-h-[3rem]">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
                  <span className="text-2xl font-bold text-cyan-400">{item.priceGov} <span className="text-sm text-gray-500">GOV</span></span>
                  <button
                    onClick={() => canAfford && handleBuyClick(item)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                      canAfford 
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-black shadow-lg shadow-cyan-500/20' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {canAfford ? 'Buy' : 'Low Funds'}
                  </button>
                </div>
              </div>
              <div className="bg-cyan-500/5 h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>
           );
        })}
      </div>

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
                      <div className="text-cyan-400 font-bold">{confirmItem.priceGov} GOV</div>
                   </div>
                </div>

                <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg">
                   <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
                   <p className="text-xs text-yellow-200">
                     Are you sure you want to spend <strong>{confirmItem.priceGov} GOV</strong>? This action cannot be undone.
                   </p>
                </div>
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
                 className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
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
