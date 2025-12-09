
import React, { useState, useEffect } from 'react';
import { Zone, User, Badge, Rarity } from '../../types';
import { X, Crown, Clock, Shield, Medal, Lock, Zap, Swords, Flag, Award, Mountain, Globe, Home, Landmark, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ZoneDetailsProps {
  zone: Zone;
  user: User;
  onClose: () => void;
  ownerDetails: { name: string; avatar: string | null; badge: Badge | null | undefined } | null;
  zoneLeaderboard: any[];
  onClaim: (id: string) => void;
  onBoost: (id: string) => void;
  onDefend: (id: string) => void;
  hasBoostItem: boolean;
  hasDefenseItem: boolean;
}

const ZoneDetails: React.FC<ZoneDetailsProps> = ({ 
    zone, user, onClose, ownerDetails, zoneLeaderboard, 
    onClaim, onBoost, onDefend, hasBoostItem, hasDefenseItem 
}) => {
  const { t } = useLanguage();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (expiry: number) => {
    const diff = expiry - now;
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isBoostActive = zone.boostExpiresAt && zone.boostExpiresAt > now;
  const isShieldActive = zone.shieldExpiresAt && zone.shieldExpiresAt > now;
  
  const topRunner = zoneLeaderboard.length > 0 ? zoneLeaderboard[0] : null;
  const isTopRunner = topRunner ? topRunner.id === user.id : false;
  const kmToTop = topRunner && !isTopRunner ? (topRunner.km - (zoneLeaderboard.find(u => u.id === user.id)?.km || 0)) : 0;

  const renderBadgeIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Flag': return <Flag className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Award': return <Award className={className} />;
          case 'Zap': return <Zap className={className} />;
          case 'Mountain': return <Mountain className={className} />;
          case 'Globe': return <Globe className={className} />;
          case 'Home': return <Home className={className} />;
          case 'Landmark': return <Landmark className={className} />;
          case 'Swords': return <Swords className={className} />;
          case 'Footprints': return <Footprints className={className} />;
          case 'Rocket': return <Rocket className={className} />;
          case 'Tent': return <Tent className={className} />;
          case 'Timer': return <Timer className={className} />;
          case 'Building2': return <Building2 className={className} />;
          case 'Moon': return <Moon className={className} />;
          case 'Sun': return <Sun className={className} />;
          case 'ShieldCheck': return <ShieldCheck className={className} />;
          case 'Gem': return <Gem className={className} />;
          case 'Users': return <Users className={className} />;
          default: return <Award className={className} />;
      }
  };

  const getRarityColor = (rarity: Rarity) => {
      switch(rarity) {
          case 'LEGENDARY': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
          case 'EPIC': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
          case 'RARE': return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
          default: return 'text-gray-300 border-gray-600 bg-gray-800';
      }
  };

  return (
    <div className="fixed bottom-[56px] md:bottom-24 md:right-6 md:left-auto left-0 right-0 md:w-80 bg-gray-900/95 md:rounded-2xl rounded-t-2xl border-t md:border border-emerald-500/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up z-40 max-h-[70vh] flex flex-col">
      <div className="relative p-5 flex flex-col h-full overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X size={20} />
        </button>

        <h3 className="font-bold text-lg md:text-xl text-white mb-4 pr-6 tracking-tight break-words">{zone.name}</h3>
        
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-hide">
            
            {/* Owner Card */}
            {ownerDetails && (
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                    <div className="relative shrink-0">
                        <img 
                            src={ownerDetails.avatar || `https://ui-avatars.com/api/?name=${ownerDetails.name}&background=10b981&color=fff`} 
                            className="w-10 h-10 rounded-full border border-gray-600 object-cover" 
                            alt="Owner"
                        />
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-0.5 rounded-full">
                            <Crown size={8} />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">{t('zone.owner_info')}</div>
                        <div className="flex items-center gap-2">
                           <div className={`font-bold text-sm truncate ${zone.ownerId === user.id ? 'text-emerald-400' : 'text-white'}`}>
                                {ownerDetails.name} {zone.ownerId === user.id && t('zone.you')}
                           </div>
                           {ownerDetails.badge && (
                               <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] ${getRarityColor(ownerDetails.badge.rarity)}`} title={ownerDetails.badge.name}>
                                   {renderBadgeIcon(ownerDetails.badge.icon, "w-3 h-3")}
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-center">
                     <div className="text-xs text-gray-400">{t('dash.yield')}</div>
                     <div className={`font-bold ${isBoostActive ? 'text-amber-400' : 'text-cyan-400'}`}>
                         {zone.interestRate}%
                     </div>
                </div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-center">
                     <div className="text-xs text-gray-400">{t('zone.status')}</div>
                     <div className={`font-bold text-xs uppercase pt-1 ${zone.ownerId === user.id ? 'text-emerald-500' : 'text-red-500'}`}>
                         {zone.ownerId === user.id ? t('zone.occupied') : t('zone.hostile')}
                     </div>
                </div>
            </div>

            {isBoostActive && zone.boostExpiresAt && (
             <div className="flex items-center justify-between text-sm bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
               <span className="text-amber-400 flex items-center gap-1 text-xs"><Clock size={12}/> {t('zone.boosted')}</span>
               <span className="text-amber-100 font-mono text-xs font-bold">
                 {formatTimeRemaining(zone.boostExpiresAt)}
               </span>
             </div>
            )}

            {isShieldActive && zone.shieldExpiresAt && (
             <div className="flex items-center justify-between text-sm bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
               <span className="text-cyan-400 flex items-center gap-1 text-xs"><Shield size={12}/> {t('zone.shielded')}</span>
               <span className="text-cyan-100 font-mono text-xs font-bold">
                 {formatTimeRemaining(zone.shieldExpiresAt)}
               </span>
             </div>
            )}

            {/* Leaderboard */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                    <Medal size={12} className="text-yellow-500"/> {t('zone.top_runners')}
                </h4>
                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {zoneLeaderboard.map((runner, index) => (
                        <div key={runner.id} className={`flex items-center justify-between text-xs p-1 rounded transition-colors ${runner.id === user.id ? 'bg-emerald-900/20' : 'hover:bg-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`w-4 text-center font-bold ${index === 0 ? 'text-yellow-400' : (index === 1 ? 'text-gray-300' : (index === 2 ? 'text-amber-600' : 'text-gray-600'))}`}>
                                    {index + 1}
                                </span>
                                <img src={runner.avatar} className="w-5 h-5 rounded-full bg-gray-700 object-cover" alt={runner.name}/>
                                <span className={`${runner.id === user.id ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                                    {runner.name}
                                </span>
                            </div>
                            <div className="font-mono text-gray-400">
                                {runner.km.toFixed(1)} km
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="pt-4 mt-2 border-t border-gray-800 shrink-0">
           {zone.ownerId === user.id ? (
                <div className="flex gap-2">
                      {!isBoostActive ? (
                          <button 
                              onClick={() => onBoost(zone.id)}
                              disabled={!hasBoostItem}
                              className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border text-xs md:text-sm ${hasBoostItem ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gray-800 opacity-50'}`}
                          >
                              <Zap size={16} /> {t('zone.action.boost')}
                          </button>
                      ) : (
                          <div className="flex-1 py-3 bg-gray-800 text-amber-500 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-500/20 text-xs md:text-sm"><Zap size={16} /> {t('zone.action.active')}</div>
                      )}

                      {!isShieldActive ? (
                          <button 
                              onClick={() => onDefend(zone.id)}
                              disabled={!hasDefenseItem}
                              className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border text-xs md:text-sm ${hasDefenseItem ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-800 opacity-50'}`}
                          >
                              <Shield size={16} /> {t('zone.action.shield')}
                          </button>
                      ) : (
                          <div className="flex-1 py-3 bg-gray-800 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-cyan-500/20 text-xs md:text-sm"><Shield size={16} /> {t('zone.action.active')}</div>
                      )}
                </div>
           ) : (
              <>
                 {isTopRunner ? (
                     <button 
                         onClick={() => onClaim(zone.id)}
                         className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                     >
                         <Swords size={18} /> {t('zone.action.claim')} (50 RUN)
                     </button>
                 ) : (
                     <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center">
                         <div className="text-red-400 font-bold text-xs uppercase mb-1 flex items-center justify-center gap-2">
                            <Lock size={12}/> {t('zone.locked')}
                         </div>
                         <p className="text-gray-400 text-xs leading-tight">
                            {t('zone.locked_desc')} ({kmToTop > 0 ? kmToTop.toFixed(1) : 0.1} km)
                         </p>
                     </div>
                 )}
              </>
           )}
        </div>
      </div>
    </div>
  );
};

export default ZoneDetails;