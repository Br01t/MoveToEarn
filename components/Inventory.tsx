
import React, { useState } from 'react';
import { InventoryItem, User, Zone } from '../types';
import { Shield, Zap, Package, MapPin, X, Info } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface InventoryProps {
  user: User;
  zones: Zone[]; // Need zones to select a target
  onUseItem: (item: InventoryItem, targetZoneId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ user, zones, onUseItem }) => {
  const { t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Package className="text-emerald-400" /> {t('inv.title')}
      </h2>

      {user.inventory.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center text-gray-500">
           <Package size={64} className="mx-auto mb-4 opacity-20" />
           <p className="text-xl">{t('inv.empty_title')}</p>
           <p className="text-sm mt-2">{t('inv.empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.inventory.map((item, idx) => {
            const Icon = item.type === 'DEFENSE' ? Shield : Zap;
            return (
              <div 
                key={`${item.id}-${idx}`} 
                onClick={() => handleItemClick(item)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${item.type === 'DEFENSE' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{item.name}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300">{item.type}</span>
                    </div>
                  </div>
                  {/* Quantity Badge */}
                  {item.quantity > 0 && (
                      <div className="bg-emerald-900/80 border border-emerald-500/50 px-3 py-1 rounded-full text-sm font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        x{item.quantity}
                      </div>
                  )}
                </div>
                
                {/* Truncated description for the card view */}
                <p className="text-sm text-gray-400 mb-4 flex-grow line-clamp-2">{item.description}</p>

                <div className="w-full py-2 bg-gray-700 group-hover:bg-emerald-600 group-hover:text-white text-gray-300 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Info size={16} /> {t('inv.inspect')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail & Usage Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-start bg-gray-900">
              <div className="flex gap-4">
                 <div className={`p-3 rounded-xl h-fit ${selectedItem.type === 'DEFENSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {selectedItem.type === 'DEFENSE' ? <Shield size={32}/> : <Zap size={32}/>}
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {selectedItem.name}
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300">{selectedItem.type}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-400 border border-emerald-500/30">{t('inv.owned')}: {selectedItem.quantity}</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                <X size={20}/>
              </button>
            </div>
            
            {/* Full Description Section */}
            <div className="p-6 bg-gray-800/50 border-b border-gray-700">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('inv.item_desc')}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedItem.description}
                </p>
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 flex items-center gap-2 text-sm text-gray-400">
                    <Info size={16} className="text-emerald-500" />
                    <span>{t('inv.effect_power')}: <strong>{selectedItem.effectValue}</strong></span>
                </div>
            </div>

            {/* Zone Selection List */}
            <div className="flex-1 overflow-y-auto p-6">
               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 sticky top-0 bg-gray-800 z-10 py-2">
                 {t('inv.select_zone')}
               </h4>
               
               {myZones.length === 0 ? (
                 <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                    <p>{t('inv.no_zones')}</p>
                    <p className="text-xs mt-1">{t('inv.conquer_tip')}</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-2">
                  {myZones.map(zone => (
                    <button 
                      key={zone.id}
                      onClick={() => handleZoneSelect(zone.id)}
                      className="flex justify-between items-center p-4 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 hover:border-emerald-500 transition-all group text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" />
                            <span className="font-bold text-white">{zone.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-3">
                          <span>{t('inv.yield')}: {zone.interestRate}%</span>
                          <span>{t('inv.defense')}: Lvl {zone.defenseLevel}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-gray-800 rounded text-xs font-bold text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                          {t('inv.apply')}
                      </div>
                    </button>
                  ))}
                 </div>
               )}
            </div>
            
            <div className="p-4 bg-gray-950 border-t border-gray-800 text-center text-xs text-gray-500">
               {t('inv.consume_warn')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;