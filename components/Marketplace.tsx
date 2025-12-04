import React, { useState } from "react";
import { Item, User } from "../types";
import { Shield, Zap, ShoppingCart, X, AlertTriangle, CheckCircle, Package, Coins, Clock, TrendingUp, ShoppingBag } from "lucide-react";

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingBag size={32} className="text-emerald-400" /> Marketplace
          </h2>
          <p className="text-gray-400">Acquire gear and currency. Stock rotates weekly.</p>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle size={16} />
          {user.runBalance.toFixed(2)} RUN
        </div>
      </div>

      {/* FLASH DROP INFO BANNER */}
      <div className="bg-gradient-to-r from-yellow-900/40 to-transparent border-l-4 border-yellow-500 p-6 rounded-r-xl mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Clock size={100} className="text-yellow-500" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg text-yellow-400 shrink-0 animate-pulse">
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg mb-1">Flash Drops Active</h4>
            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              <strong>GOV Supply Crate</strong> and high-tier items are scarce resources. Market stock is not permanent: items are released in "Flash
              Drops" and sold on a first-come, first-served basis.
              <span className="text-yellow-400 font-bold block mt-1">Once stock hits 0, you must wait for the next seasonal restock.</span>
            </p>
          </div>
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
            const Icon = item.type === "DEFENSE" ? Shield : item.type === "CURRENCY" ? Coins : Zap;
            const canAfford = user.runBalance >= item.priceRun;
            const hasStock = item.quantity > 0;
            const isLowStock = item.quantity > 0 && item.quantity < 10;

            return (
              <div
                key={item.id}
                className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden transition-all group flex flex-col relative ${
                  hasStock ? "hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20" : "opacity-60 grayscale"
                }`}
              >
                {isLowStock && (
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">LOW STOCK</div>
                )}

                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg ${
                        item.type === "DEFENSE"
                          ? "bg-blue-500/10 text-blue-400"
                          : item.type === "CURRENCY"
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      <Icon size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-gray-700 text-gray-300 tracking-wider">{item.type}</span>
                      <span
                        className={`text-xs font-bold font-mono ${hasStock ? (isLowStock ? "text-orange-400" : "text-emerald-400") : "text-red-500"}`}
                      >
                        {hasStock ? `${item.quantity} LEFT` : "SOLD OUT"}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 min-h-[3rem]">{item.description}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-bold">Price</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        {item.priceRun} <span className="text-sm text-gray-500">RUN</span>
                      </span>
                    </div>
                    <button
                      onClick={() => canAfford && hasStock && handleBuyClick(item)}
                      disabled={!canAfford || !hasStock}
                      className={`px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
                        canAfford && hasStock
                          ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 hover:scale-105"
                          : "bg-gray-700 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {!hasStock ? "Sold Out" : canAfford ? "Buy" : "Low Funds"}
                    </button>
                  </div>
                </div>
                {hasStock && (
                  <div className="bg-emerald-500/20 h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Confirm Purchase</h3>
              <button onClick={() => setConfirmItem(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700">
                <div
                  className={`p-3 rounded-lg ${confirmItem.type === "DEFENSE" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}
                >
                  {confirmItem.type === "DEFENSE" ? <Shield size={24} /> : <Zap size={24} />}
                </div>
                <div>
                  <div className="text-white font-bold">{confirmItem.name}</div>
                  <div className="text-emerald-400 font-bold">{confirmItem.priceRun} RUN</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
                <p className="text-xs text-yellow-200">
                  Are you sure you want to spend <strong>{confirmItem.priceRun} RUN</strong>?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              {confirmItem.type === "CURRENCY" && (
                <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30 text-center">
                  <p className="text-xs text-cyan-400 font-bold">INSTANT EFFECT</p>
                  <p className="text-sm text-white">
                    You will receive <strong>{confirmItem.effectValue} GOV</strong> immediately.
                  </p>
                </div>
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
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
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