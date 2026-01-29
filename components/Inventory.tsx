import React, { useState, useEffect } from 'react';
import { InventoryItem, User, Zone } from '../types';
import { Shield, Zap, Package, MapPin, X, Info, Clock, AlertTriangle, Box } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface InventoryProps {
  user: User;
  zones: Zone[]; // Need zones to select a target
  onUseItem: (item: InventoryItem, targetZoneId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ user, zones, onUseItem }) => {
  const { t, tRich } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [now, setNow] = useState(Date.now());

  // Update timer every minute to keep countdowns relatively fresh without heavy rendering
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const myZones = zones.filter(z => z.ownerId === user.id);

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleZoneSelect = (zoneId: string) => {
    if (selectedItem) {
      onUseItem(selectedItem, zoneId);
      setSelectedItem(null);
    }
  };

  const getRemainingTime = (expiry: number | undefined) => {
      if (!expiry || expiry < now) return null;
      const diff = expiry - now;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
               <Box className="text-emerald-400" size={32} /> {t('inv.title')}
            </h1>
            <p className="text-gray-400 text-sm font-medium">Manage your tactical resources.</p>
         </div>
      </div>

      {user.inventory.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
           <div className="p-6 bg-gray-900/50 rounded-full mb-4 border border-gray-700/50">
               <Package size={48} className="opacity-40" />
           </div>
           <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-2">{t('inv.empty_title')}</h3>
           <p className="text-sm max-w-md">{tRich('inv.empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {user.inventory.map((item, idx) => {
            const Icon = item.type === 'DEFENSE' ? Shield : Zap;
            const isDefense = item.type === 'DEFENSE';
            
            return (
              <div 
                key={`${item.id}-${idx}`} 
                onClick={() => handleItemClick(item)}
                className="glass-panel rounded-xl p-5 flex flex-col justify-between group hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Decorative background glow */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-30 ${isDefense ? 'bg-cyan-500' : 'bg-amber-500'}`}></div>

                <div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg border border-white/5 shadow-lg ${isDefense ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          <Icon size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg leading-tight uppercase tracking-tight">{item.name}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 ${isDefense ? 'bg-cyan-900/40 text-cyan-300' : 'bg-amber-900/40 text-amber-300'}`}>
                              {item.type}
                          </span>
                        </div>
                      </div>
                      {/* Quantity Badge */}
                      {item.quantity > 0 && (
                          <div className="flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur border border-white/10 px-2 py-1 rounded min-w-[3rem]">
                            <span className="text-[9px] text-gray-500 uppercase font-bold">QTY</span>
                            <span className="text-lg font-mono font-bold text-white leading-none">{item.quantity}</span>
                          </div>
                      )}
                    </div>
                    
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3"></div>

                    {/* Description */}
                    <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed min-h-[2.5rem] line-clamp-2">
                        {item.description}
                    </p>
                </div>

                <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 text-gray-300 group-hover:text-emerald-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-xs">
                  <Info size={14} /> {t('inv.inspect')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail & Usage Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel-heavy rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
              <div className="flex gap-4 items-center">
                 <div className={`p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-white/10 ${selectedItem.type === 'DEFENSE' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {selectedItem.type === 'DEFENSE' ? <Shield size={36}/> : <Zap size={36}/>}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white leading-none uppercase tracking-wide">
                      {selectedItem.name}
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-white/10 uppercase tracking-wider">{selectedItem.type}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">{t('inv.owned')}: {selectedItem.quantity}</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <X size={24}/>
              </button>
            </div>
            
            {/* Full Description Section */}
            <div className="p-6 bg-black/10 border-b border-white/5 space-y-4">
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('inv.item_desc')}</h4>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">
                        {selectedItem.description}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-1.5 rounded text-emerald-400"><Info size={16}/></div>
                        <div>
                            <span className="block text-[9px] text-gray-500 uppercase font-bold">{t('inv.effect_power')}</span>
                            <span className="text-white font-mono font-bold text-lg">{selectedItem.effectValue}x</span>
                        </div>
                    </div> */}
                    <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center gap-3">
                        <div className="bg-orange-500/20 p-1.5 rounded text-orange-400"><AlertTriangle size={16}/></div>
                        <div>
                            <span className="block text-[9px] text-gray-500 uppercase font-bold">{t('inv.restriction')}</span>
                            <span className="text-orange-300 text-[10px] leading-tight">{t('inv.restriction_single')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone Selection List */}
            <div className="flex-1 overflow-y-auto p-6 bg-black/5">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <MapPin size={14} className="text-emerald-500"/> {t('inv.select_zone')}
               </h4>
               
               {myZones.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold">{t('inv.no_zones')}</p>
                    <p className="text-xs mt-1 opacity-70">{t('inv.conquer_tip')}</p>
                 </div>
               ) : (
                 <div className="flex flex-col gap-2">
                  {myZones.map(zone => {
                    const boostTime = getRemainingTime(zone.boostExpiresAt);
                    const shieldTime = getRemainingTime(zone.shieldExpiresAt);
                    
                    // Logic to check if we can apply the item
                    const canApply = 
                        (selectedItem.type === 'BOOST' && !boostTime) ||
                        (selectedItem.type === 'DEFENSE' && !shieldTime);

                    return (
                      <button 
                        key={zone.id}
                        onClick={() => canApply && handleZoneSelect(zone.id)}
                        disabled={!canApply}
                        className={`flex justify-between items-center p-3 rounded-lg border transition-all group text-left ${
                            canApply 
                            ? 'bg-black/40 border-white/5 hover:border-emerald-500/50 hover:bg-emerald-900/10 cursor-pointer' 
                            : 'bg-black/20 border-transparent opacity-50 cursor-not-allowed grayscale'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-sm truncate ${canApply ? 'text-white' : 'text-gray-500'}`}>{zone.name}</span>
                          </div>
                          
                          <div className="text-[10px] text-gray-500 flex items-center gap-3">
                            <span className="font-mono">YIELD: {zone.interestRate}%</span>
                            <span className="w-px h-3 bg-gray-700"></span>
                            <span className="font-mono">DEF: {zone.defenseLevel}</span>
                          </div>

                          {/* Active Effects Display */}
                          {(boostTime || shieldTime) && (
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                  {boostTime && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-900/30 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">
                                          <Zap size={8} className="fill-amber-500" /> {boostTime}
                                      </span>
                                  )}
                                  {shieldTime && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold bg-cyan-900/30 text-cyan-500 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                          <Shield size={8} className="fill-cyan-500" /> {shieldTime}
                                      </span>
                                  )}
                              </div>
                          )}
                        </div>
                        
                        {canApply && (
                            <div className="px-4 py-2 bg-emerald-600 group-hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg transition-colors">
                                {t('inv.apply')}
                            </div>
                        )}
                      </button>
                    );
                  })}
                 </div>
               )}
            </div>
            
            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
               <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                   <span className="text-red-400 font-bold">Warning:</span> {tRich('inv.consume_warn')}
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;