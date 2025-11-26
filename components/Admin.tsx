
import React, { useState } from 'react';
import { Item } from '../types';
import { Settings, Plus, Trash2, Flame, Gift, RefreshCw, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminProps {
  marketItems: Item[];
  onAddItem: (item: Item) => void;
  onRemoveItem: (id: string) => void;
  onTriggerBurn: () => void;
  onDistributeRewards: () => void;
  onResetSeason: () => void;
}

const Admin: React.FC<AdminProps> = ({ 
  marketItems, 
  onAddItem, 
  onRemoveItem, 
  onTriggerBurn, 
  onDistributeRewards,
  onResetSeason 
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'ECONOMY' | 'LEADERBOARD'>('ITEMS');
  
  // Modal States
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // New Item Form State
  const [newItem, setNewItem] = useState<{
    name: string;
    description: string;
    priceGov: string;
    type: 'DEFENSE' | 'BOOST';
    effectValue: string;
  }>({
    name: '',
    description: '',
    priceGov: '100',
    type: 'DEFENSE',
    effectValue: '1'
  });

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.description) return;

    const item: Item = {
      id: `item_${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      priceGov: parseFloat(newItem.priceGov),
      type: newItem.type,
      effectValue: parseFloat(newItem.effectValue),
      icon: newItem.type === 'DEFENSE' ? 'Shield' : 'Zap'
    };

    onAddItem(item);
    setNewItem({
      name: '',
      description: '',
      priceGov: '100',
      type: 'DEFENSE',
      effectValue: '1'
    });
    alert('Item added to Marketplace');
  };

  const handleConfirmBurn = () => {
    onTriggerBurn();
    setShowBurnModal(false);
  };

  const handleConfirmReward = () => {
    onDistributeRewards();
    setShowRewardModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
           <Settings size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Console</h1>
          <p className="text-gray-400">Manage game assets and economy.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-8">
        <button 
          onClick={() => setActiveTab('ITEMS')}
          className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'ITEMS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Marketplace Items
        </button>
        <button 
          onClick={() => setActiveTab('ECONOMY')}
          className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'ECONOMY' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Economy Ops
        </button>
        <button 
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'LEADERBOARD' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Season Management
        </button>
      </div>

      {/* ITEM MANAGER */}
      {activeTab === 'ITEMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={20} className="text-emerald-400" /> Create Item
            </h3>
            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea 
                  required
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-emerald-500 outline-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price (GOV)</label>
                  <input 
                    type="number" 
                    required
                    value={newItem.priceGov}
                    onChange={e => setNewItem({...newItem, priceGov: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Effect Power</label>
                  <input 
                    type="number" 
                    required
                    value={newItem.effectValue}
                    onChange={e => setNewItem({...newItem, effectValue: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select 
                   value={newItem.type}
                   onChange={e => setNewItem({...newItem, type: e.target.value as 'DEFENSE' | 'BOOST'})}
                   className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-emerald-500 outline-none"
                >
                  <option value="DEFENSE">Defense (Shield)</option>
                  <option value="BOOST">Boost (Yield)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                <Save size={18} /> Save Item
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Active Listings</h3>
            {marketItems.length === 0 && <p className="text-gray-500 italic">No items in marketplace.</p>}
            {marketItems.map(item => (
              <div key={item.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center group">
                 <div>
                    <h4 className="font-bold text-white text-lg">{item.name}</h4>
                    <p className="text-xs text-gray-400">{item.description}</p>
                    <div className="mt-2 flex gap-3 text-sm">
                      <span className="text-cyan-400 font-bold">{item.priceGov} GOV</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-emerald-400">{item.type} +{item.effectValue}</span>
                    </div>
                 </div>
                 <button 
                   onClick={() => onRemoveItem(item.id)}
                   className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                   title="Remove from Market"
                 >
                   <Trash2 size={20} />
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ECONOMY OPS */}
      {activeTab === 'ECONOMY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
              <div className="bg-red-500/10 p-4 rounded-full mb-4">
                 <Flame size={48} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Trigger Burn Event</h3>
              <p className="text-gray-400 mb-6">
                Manually trigger the weekly burn. This will remove 5% of circulating RUN tokens to increase scarcity.
              </p>
              <button 
                onClick={() => setShowBurnModal(true)}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Execute Burn Protocol
              </button>
           </div>

           <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center">
              <div className="bg-cyan-500/10 p-4 rounded-full mb-4">
                 <Gift size={48} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Distribute Rewards</h3>
              <p className="text-gray-400 mb-6">
                Calculate and distribute GOV tokens to top 100 users based on their performance in the current cycle.
              </p>
              <button 
                onClick={() => setShowRewardModal(true)}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
              >
                Distribute Airdrop
              </button>
           </div>
        </div>
      )}

      {/* LEADERBOARD / SEASON */}
      {activeTab === 'LEADERBOARD' && (
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
           <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
             <RefreshCw className="text-yellow-400" /> Season Reset
           </h3>
           <div className="bg-yellow-900/20 border border-yellow-700/50 p-6 rounded-lg mb-8">
             <p className="text-yellow-200">
               <strong>Warning:</strong> Resetting the season will set all user <span className="font-mono">Total KM</span> to zero. 
               Zone ownerships will persist, but leaderboards will be wiped.
             </p>
           </div>
           
           <div className="flex justify-end">
             <button 
               onClick={onResetSeason}
               className="px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-colors"
             >
               Reset Leaderboard Stats
             </button>
           </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Burn Protocol Modal */}
      {showBurnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl border border-red-500/50 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Flame className="text-red-500" /> Initiate Burn
               </h3>
               <button onClick={() => setShowBurnModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-200">
                    <strong>Critical Action:</strong> This event is irreversible.
                  </p>
               </div>
               <p className="text-gray-300 leading-relaxed">
                 You are about to execute the <strong>RUN Burn Protocol</strong>. 
                 <strong>5,000,000 RUN</strong> will be burned from circulation. A percentage of this burned value is transformed into <strong>GOV</strong> tokens to reward top runners, while the remainder is permanently destroyed to stabilize the economy.
               </p>
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider pt-2">
                 Impact: Circulation Supply -5% | GOV Pool +2%
               </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
               <button onClick={() => setShowBurnModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors">Cancel</button>
               <button onClick={handleConfirmBurn} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                 <Flame size={18}/> Ignite Burn
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribute Airdrop Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-800 rounded-2xl border border-cyan-500/50 w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Gift className="text-cyan-400" /> Distribute Rewards
               </h3>
               <button onClick={() => setShowRewardModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
               <p className="text-gray-300 leading-relaxed">
                 You are initializing the <strong>Weekly Governance Airdrop</strong>.
               </p>
               <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                     <span className="text-gray-400">Target Audience:</span>
                     <span className="text-white font-bold">Active Runners (Top 100)</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-400">Token:</span>
                     <span className="text-cyan-400 font-bold">GOV</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-400">Amount per User:</span>
                     <span className="text-white font-bold">500.00</span>
                  </div>
               </div>
               <p className="text-sm text-gray-400">
                 Funds will be transferred from the Treasury Wallet to user accounts immediately.
               </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
               <button onClick={() => setShowRewardModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors">Cancel</button>
               <button onClick={handleConfirmReward} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                 <CheckCircle size={18}/> Send Rewards
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
