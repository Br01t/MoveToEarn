import React, { useState, useEffect } from 'react';
import { Zone, User, Badge, Rarity } from '../../types';
import { X, Crown, Clock, Shield, Medal, Lock, Zap, Flag, Award, Mountain, Globe, Home, Landmark, Swords, Footprints, Rocket, Tent, Timer, Building2, Moon, Sun, ShieldCheck, Gem, Users, AlertTriangle, CheckCircle, Coins, Activity, Info } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { CONQUEST_COST } from '../../constants';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

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
  const { triggerParticles } = useGlobalUI();
  const [now, setNow] = useState(Date.now());
  const [confirmAction, setConfirmAction] = useState<'BOOST' | 'SHIELD' | null>(null);

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
  
  const currentUserStats = zoneLeaderboard.find(u => u.id === user.id);
  const myKmInZone = currentUserStats ? currentUserStats.km : 0;
  
  const kmToTop = topRunner && !isTopRunner ? (topRunner.km - myKmInZone) : 0;

  const renderBadgeIcon = (iconName: string, className: string) => {
      switch(iconName) {
          case 'Flag': return <Flag className={className} />;
          case 'Crown': return <Crown className={className} />;
          case 'Award': return <Award className={className} />;
          case 'Zap': return <Zap className={className} />;
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

  const handleConfirmAction = (e: React.MouseEvent) => {
      if (confirmAction === 'BOOST') {
          onBoost(zone.id);
          triggerParticles(e.clientX, e.clientY, '#fbbf24'); 
      }
      if (confirmAction === 'SHIELD') {
          onDefend(zone.id);
          triggerParticles(e.clientX, e.clientY, '#06b6d4'); 
      }
      setConfirmAction(null);
  };

  const handleClaimClick = (e: React.MouseEvent) => {
      onClaim(zone.id);
      triggerParticles(e.clientX, e.clientY, '#10b981'); 
  };

  return (
    <div className="fixed bottom-[125px] md:bottom-24 md:right-6 md:left-auto left-0 right-0 md:w-80 glass-panel-heavy md:rounded-2xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up z-[60] max-h-[65vh] md:max-h-[75vh] flex flex-col border-t border-white/20 touch-auto pointer-events-auto">
      <div className="relative p-5 flex flex-col h-full overflow-hidden">
        
        {/* CONFIRMATION MODAL OVERLAY */}
        {confirmAction && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className={`p-4 rounded-full mb-4 ${confirmAction === 'BOOST' ? 'bg-amber-900/40 text-amber-400' : 'bg-cyan-900/40 text-cyan-400'}`}>
                    {confirmAction === 'BOOST' ? <Zap size={32} /> : <Shield size={32} />}
                </div>
                <h4 className="text-white font-bold text-lg mb-2 uppercase tracking-wide">
                    {confirmAction === 'BOOST' ? t('zone.modal.boost_title') : t('zone.modal.shield_title')}
                </h4>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {confirmAction === 'BOOST' ? t('zone.modal.boost_desc') : t('zone.modal.shield_desc')}
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-gray-300 font-bold rounded-xl text-sm transition-colors uppercase tracking-wide border border-white/10"
                    >
                        {t('zone.modal.cancel')}
                    </button>
                    <button 
                        onClick={handleConfirmAction}
                        className={`flex-1 py-3 font-bold text-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-wide ${confirmAction === 'BOOST' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}
                    >
                        <CheckCircle size={16} /> {t('zone.modal.confirm')}
                    </button>
                </div>
            </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/30 rounded-full p-1 border border-white/10">
          <X size={18} />
        </button>

        <h3 className="font-bold text-xl text-white mb-4 pr-6 tracking-tight break-words uppercase shrink-0">{zone.name}</h3>
        
        {/* Contenitore scorrevole ottimizzato per mobile */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 overscroll-contain no-scrollbar md:scrollbar-thin">
            
            {/* Owner Card */}
            {ownerDetails && (
                <div className="glass-panel p-3 rounded-xl flex items-center gap-3 shrink-0">
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
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('zone.owner_info')}</div>
                        <div className="flex items-center gap-2">
                           <div className={`font-bold text-base truncate ${zone.ownerId === user.id ? 'text-emerald-400' : 'text-white'}`}>
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

            <div className="grid grid-cols-2 gap-2 shrink-0">
                <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center backdrop-blur-sm">
                     <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('dash.yield')}</div>
                     <div className={`font-bold font-mono text-xl ${isBoostActive ? 'text-amber-400' : 'text-cyan-400'}`}>
                         {zone.interestRate}%
                     </div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5 text-center backdrop-blur-sm">
                     <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('zone.status')}</div>
                     <div className={`font-bold text-xs uppercase pt-1 tracking-wide ${zone.ownerId === user.id ? 'text-emerald-500' : 'text-red-500'}`}>
                         {zone.ownerId === user.id ? t('zone.occupied') : t('zone.hostile')}
                     </div>
                </div>
            </div>

            {/* Interest Pool Display with KM - SWAPPED ORDER */}
            <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-500/30 text-center relative group backdrop-blur-sm shrink-0">
                {/* KM Globali prima */}
                <div className="flex flex-col items-center mb-3">
                    <span className="text-[10px] text-emerald-200/50 uppercase font-bold tracking-tighter">{t('zone.global_dist')}</span>
                    <span className="text-white font-mono font-black text-2xl drop-shadow-md">{(zone.totalKm || 0).toFixed(1)} <span className="text-xs text-emerald-500/70">KM</span></span>
                </div>

                {/* Pool Interessi dopo */}
                <div className="pt-2 border-t border-emerald-500/20">
                    <div className="text-xs text-emerald-200/70 uppercase font-bold tracking-wider">{t('zone.interest_pool')}</div>
                    <div className="font-mono text-emerald-400 font-bold text-lg flex items-center justify-center gap-1">
                        <Coins size={12} /> {(zone.interestPool || 0).toFixed(4)} RUN
                    </div>
                </div>
                
                {/* TOOLTIP HUD */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 glass-panel-heavy rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] transform scale-90 group-hover:scale-100 text-left border border-emerald-500/30">
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Activity size={10} /> {t('zone.pool_tooltip_title')}
                    </p>
                    <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                        {t('zone.pool_tooltip_body')}
                    </p>
                    <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 border-r border-b border-emerald-500/30 transform -translate-x-1/2 rotate-45"></div>
                </div>
            </div>

            {!!isBoostActive && zone.boostExpiresAt && (
             <div className="flex items-center justify-between text-sm bg-amber-500/10 p-2 rounded-lg border border-amber-500/30 backdrop-blur-sm shrink-0">
               <span className="text-amber-400 flex items-center gap-1 text-xs font-bold uppercase tracking-wide"><Clock size={12}/> {t('zone.boosted')}</span>
               <span className="text-amber-100 font-mono text-xs font-bold">
                 {formatTimeRemaining(zone.boostExpiresAt)}
               </span>
             </div>
            )}

            {!!isShieldActive && zone.shieldExpiresAt && (
             <div className="flex items-center justify-between text-sm bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm shrink-0">
               <span className="text-cyan-400 flex items-center gap-1 text-xs font-bold uppercase tracking-wide"><Shield size={12}/> {t('zone.shielded')}</span>
               <span className="text-cyan-100 font-mono text-xs font-bold">
                 {formatTimeRemaining(zone.shieldExpiresAt)}
               </span>
             </div>
            )}

            {/* My Stats Highlight */}
            <div className="glass-panel p-2 rounded-lg flex justify-between items-center border-emerald-500/20 bg-emerald-900/10 shrink-0">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wide">Your Distance:</span>
                <span className="font-mono font-bold text-white text-base">{myKmInZone.toFixed(2)} km</span>
            </div>

            {/* Leaderboard */}
            <div className="bg-black/20 rounded-lg border border-white/5 p-3 shrink-0">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1 tracking-wider">
                    <Medal size={12} className="text-yellow-500"/> {t('zone.top_runners')}
                </h4>
                <div className="space-y-2">
                    {zoneLeaderboard.map((runner, index) => (
                        <div key={runner.id} className={`flex items-center justify-between text-xs p-1.5 rounded transition-colors ${runner.id === user.id ? 'bg-emerald-900/20 border border-emerald-500/20' : 'hover:bg-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`w-4 text-center font-bold font-mono ${index === 0 ? 'text-yellow-400' : (index === 1 ? 'text-gray-300' : (index === 2 ? 'text-amber-600' : 'text-gray-600'))}`}>
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

        {/* Action area kept at the bottom */}
        <div className="pt-4 mt-2 border-t border-white/10 shrink-0">
           {zone.ownerId === user.id ? (
                <div className="flex gap-2">
                      {!isBoostActive ? (
                          <button 
                              onClick={() => setConfirmAction('BOOST')}
                              disabled={!hasBoostItem}
                              className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border text-xs md:text-sm uppercase tracking-wide shadow-lg ${hasBoostItem ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 hover:scale-105' : 'bg-gray-800 opacity-50 border-transparent cursor-not-allowed'}`}
                          >
                              <Zap size={16} /> {t('zone.action.boost')}
                          </button>
                      ) : (
                          <div className="flex-1 py-3 bg-black/40 text-amber-500 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-500/20 text-xs md:text-sm uppercase tracking-wide"><Zap size={16} /> {t('zone.action.active')}</div>
                      )}

                      {!isShieldActive ? (
                          <button 
                              onClick={() => setConfirmAction('SHIELD')}
                              disabled={!hasDefenseItem}
                              className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border text-xs md:text-sm uppercase tracking-wide shadow-lg ${hasDefenseItem ? 'bg-cyan-600/80 hover:bg-cyan-500 border-cyan-500/50 hover:scale-105' : 'bg-gray-800 opacity-50 border-transparent cursor-not-allowed'}`}
                          >
                              <Shield size={16} /> {t('zone.action.shield')}
                          </button>
                      ) : (
                          <div className="flex-1 py-3 bg-black/40 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-cyan-500/20 text-xs md:text-sm uppercase tracking-wide"><Shield size={16} /> {t('zone.action.active')}</div>
                      )}
                </div>
           ) : (
              <>
                 {isTopRunner ? (
                     <button 
                         onClick={handleClaimClick}
                         data-text="CLAIM ZONE"
                         className="btn-glitch w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse uppercase tracking-wide border border-emerald-400/30"
                     >
                         <Swords size={18} /> {t('zone.action.claim')} ({CONQUEST_COST} RUN)
                     </button>
                 ) : (
                     <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center backdrop-blur-sm">
                         <div className="text-red-400 font-bold text-xs uppercase mb-1 flex items-center justify-center gap-2 tracking-wider">
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